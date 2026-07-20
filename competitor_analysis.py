import os
import json
import requests
from bs4 import BeautifulSoup
from datetime import datetime
import anthropic
import gspread
from google.oauth2.service_account import Credentials

COMPETITORS = {
    "Speedgoat": {
        "base_url": "https://www.speedgoat.com",
        "paths": ["/news", "/blog", "/products", "/solutions", "/what-we-offer"],
        "exclude_url_keywords": ["video"],
    },
    "Typhoon HIL": {
        "base_url": "https://www.typhoon-hil.com",
        "paths": ["/news", "/blog", "/products", "/changelog", "/resources"],
    },
    "OPAL-RT": {
        "base_url": "https://www.opal-rt.com",
        "paths": ["/news", "/blog", "/products", "/press-releases", "/resources"],
    },
}

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    )
}


def scrape_page(url: str, char_limit: int = 6000) -> str:
    try:
        resp = requests.get(url, headers=HEADERS, timeout=20)
        if resp.status_code != 200:
            return ""
        soup = BeautifulSoup(resp.text, "html.parser")
        for tag in soup(["script", "style", "nav", "footer", "header", "aside"]):
            tag.decompose()
        text = soup.get_text(separator="\n", strip=True)
        # Collapse excessive blank lines
        lines = [l for l in text.splitlines() if l.strip()]
        return "\n".join(lines)[:char_limit]
    except Exception as exc:
        print(f"  [warn] Could not scrape {url}: {exc}")
        return ""


def scrape_competitor(name: str, config: dict) -> str:
    parts = []
    base = config["base_url"]
    exclude_keywords = config.get("exclude_url_keywords", [])

    homepage = scrape_page(base)
    if homepage:
        parts.append(f"=== Homepage ({base}) ===\n{homepage}")

    for path in config["paths"]:
        url = base + path
        if any(kw in url.lower() for kw in exclude_keywords):
            print(f"  [skip] Excluded URL: {url}")
            continue
        text = scrape_page(url)
        if text:
            parts.append(f"=== {path} ===\n{text}")

    combined = "\n\n".join(parts)
    print(f"  Scraped {len(combined):,} chars from {name}")
    return combined


def analyze_with_claude(competitor_name: str, content: str) -> dict:
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

    prompt = f"""You are a competitive intelligence analyst for impedyme, a company operating in the real-time simulation and HIL (Hardware-in-the-Loop) testing space.

Competitor being analyzed: {competitor_name}
Analysis date: {datetime.now().strftime("%Y-%m-%d")}

--- SCRAPED WEBSITE CONTENT ---
{content[:10000]}
--- END OF CONTENT ---

Extract and analyze the following from the content above:

1. **New Features / Product Updates** — hardware launches, software releases, firmware updates, new product lines, major upgrades, partnerships that expand capabilities.
2. **Blog Posts / Content** — recent articles, white papers, case studies, technical guides, webinars, or any published content.

Return ONLY valid JSON in this exact structure (no markdown, no explanation):
{{
  "new_features_and_updates": [
    {{
      "title": "short descriptive title",
      "description": "1-2 sentence summary",
      "significance": "high | medium | low"
    }}
  ],
  "blog_posts_and_content": [
    {{
      "title": "article/post title",
      "description": "1-2 sentence summary",
      "date": "date if found, else empty string"
    }}
  ],
  "key_insights": "2-3 sentence strategic summary of the most important competitive intelligence for impedyme"
}}

If nothing relevant is found for a category, return an empty array for that key."""

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2500,
        messages=[{"role": "user", "content": prompt}],
    )

    raw = response.content[0].text.strip()
    # Strip markdown code fences if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        print(f"  [warn] Could not parse JSON for {competitor_name}, storing raw text")
        return {
            "new_features_and_updates": [],
            "blog_posts_and_content": [],
            "key_insights": raw,
        }


def write_to_google_sheets(analyses: dict) -> None:
    creds_data = json.loads(os.environ["GOOGLE_SHEETS_CREDENTIALS"])
    creds = Credentials.from_service_account_info(
        creds_data,
        scopes=["https://www.googleapis.com/auth/spreadsheets"],
    )
    gc = gspread.authorize(creds)
    spreadsheet = gc.open_by_key(os.environ["GOOGLE_SHEET_ID"])

    today = datetime.now().strftime("%Y-%m-%d")

    # --- Build all rows ---
    col_headers = ["Competitor", "Category", "Title", "Description", "Significance / Date"]
    rows: list[list] = []

    for competitor, data in analyses.items():
        for item in data.get("new_features_and_updates", []):
            rows.append([
                competitor,
                "New Feature / Product Update",
                item.get("title", ""),
                item.get("description", ""),
                item.get("significance", ""),
            ])
        for item in data.get("blog_posts_and_content", []):
            rows.append([
                competitor,
                "Blog Post / Content",
                item.get("title", ""),
                item.get("description", ""),
                item.get("date", ""),
            ])
        if data.get("key_insights"):
            rows.append([
                competitor,
                "KEY INSIGHTS",
                "",
                data["key_insights"],
                "",
            ])

    # --- Write to a date-named tab ---
    try:
        ws = spreadsheet.add_worksheet(title=today, rows=300, cols=6)
    except Exception:
        ws = spreadsheet.worksheet(today)
        ws.clear()

    ws.append_row([f"Impedyme Competitor Analysis — {today}"])
    ws.append_row(col_headers)
    if rows:
        ws.append_rows(rows)

    # Style header rows
    ws.format("A1:E1", {
        "textFormat": {"bold": True, "fontSize": 13},
    })
    ws.format("A2:E2", {
        "backgroundColor": {"red": 0.18, "green": 0.38, "blue": 0.78},
        "textFormat": {"bold": True, "foregroundColor": {"red": 1, "green": 1, "blue": 1}},
    })

    # --- Also refresh a permanent "Latest Report" tab ---
    try:
        latest = spreadsheet.worksheet("Latest Report")
        latest.clear()
    except Exception:
        latest = spreadsheet.add_worksheet(title="Latest Report", rows=300, cols=6)

    latest.append_row([f"Impedyme Competitor Analysis — {today}"])
    latest.append_row(col_headers)
    if rows:
        latest.append_rows(rows)

    latest.format("A1:E1", {"textFormat": {"bold": True, "fontSize": 13}})
    latest.format("A2:E2", {
        "backgroundColor": {"red": 0.18, "green": 0.38, "blue": 0.78},
        "textFormat": {"bold": True, "foregroundColor": {"red": 1, "green": 1, "blue": 1}},
    })

    print(f"Report written — tab '{today}' + 'Latest Report' updated.")


def main() -> None:
    print(f"=== Impedyme Competitor Analysis — {datetime.now().strftime('%Y-%m-%d %H:%M UTC')} ===\n")

    analyses: dict = {}
    for name, config in COMPETITORS.items():
        print(f"[{name}] Scraping...")
        content = scrape_competitor(name, config)
        print(f"[{name}] Analyzing with Claude...")
        analyses[name] = analyze_with_claude(name, content)
        print(f"[{name}] Done.\n")

    print("Writing report to Google Sheets...")
    write_to_google_sheets(analyses)
    print("\nAll done!")


if __name__ == "__main__":
    main()
