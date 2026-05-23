# Impedyme Competitor Analysis

An automated competitive intelligence tool that scrapes the websites of key HIL (Hardware-in-the-Loop) simulation competitors, analyzes the content using Claude AI, and publishes a structured daily report to Google Sheets.

## What It Does

Every day at **7:00 AM UTC**, a GitHub Actions workflow:

1. Scrapes public pages (homepage, news, blog, products, changelog, resources) from three competitors:
   - **Speedgoat** — real-time target machines for Simulink
   - **Typhoon HIL** — compact HIL simulators and grid emulators
   - **OPAL-RT** — real-time digital simulators and power systems testing
2. Sends the scraped content to **Claude** (Anthropic API) for structured analysis.
3. Extracts:
   - New features and product updates (with significance rating)
   - Recent blog posts and published content
   - Key strategic insights for Impedyme
4. Writes the results to a **Google Sheet** — one tab per day (named `YYYY-MM-DD`) plus a permanent **"Latest Report"** tab that always shows the most recent run.

## Repository Structure

```
competitor_analysis.py   # Main script — scrape → analyze → write to Sheets
requirements.txt         # Python dependencies
.github/
  workflows/
    competitor-analysis.yml  # Daily 7AM UTC scheduled workflow
    keepalive.yml            # Monthly workflow to prevent Actions from pausing
```

## Setup

### Secrets Required (GitHub → Settings → Secrets)

| Secret | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude access |
| `GOOGLE_SHEETS_CREDENTIALS` | Google service account JSON (stringified) |
| `GOOGLE_SHEET_ID` | ID of the target Google Spreadsheet |

### Local Development

```bash
pip install -r requirements.txt
export ANTHROPIC_API_KEY=...
export GOOGLE_SHEETS_CREDENTIALS='{"type":"service_account",...}'
export GOOGLE_SHEET_ID=...
python competitor_analysis.py
```

## Output Format

Each row in the Google Sheet contains:

| Competitor | Category | Title | Description | Significance / Date |
|---|---|---|---|---|
| Speedgoat | New Feature / Product Update | ... | ... | high / medium / low |
| Typhoon HIL | Blog Post / Content | ... | ... | 2026-05-01 |
| OPAL-RT | KEY INSIGHTS | | Strategic summary... | |

## Schedule

- **Daily analysis**: `0 7 * * *` (7:00 AM UTC)
- **Keepalive ping**: First day of each month — prevents GitHub from pausing scheduled workflows after 60 days of inactivity.
