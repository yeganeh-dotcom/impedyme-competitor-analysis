"""
Cabinet Layout Form Automation with Video Recording
====================================================
Automates the Cabinet Layout multi-step form on the Impedyme portal.
Records the entire session as an MP4 video.

Requirements:
    pip install playwright
    playwright install chromium
    # ffmpeg must be installed: sudo apt install ffmpeg  (Linux)
    #                           brew install ffmpeg      (macOS)

Usage:
    python cabinet_layout_automation.py \
        --url http://impedyme.com/portal \
        --username YOUR_EMAIL \
        --password YOUR_PASSWORD \
        --modules 5          # number of modules to add (default: 3)
        --output recording.mp4
"""

import argparse
import asyncio
import subprocess
import sys
import time
from pathlib import Path

from playwright.async_api import async_playwright, Page, TimeoutError as PWTimeout


# ---------------------------------------------------------------------------
# Configuration defaults
# ---------------------------------------------------------------------------
PORTAL_URL = "http://impedyme.com/portal"
DEFAULT_MODULES = 3
VIDEO_OUTPUT = "cabinet_layout_recording.mp4"
STEP_DELAY = 1.0   # seconds to wait after each UI action (for animations)
TIMEOUT_MS = 15_000


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def slow_fill(page: Page, selector: str, value: str, delay: float = 0.05):
    """Fill a field character-by-character so it looks human in the video."""
    await page.click(selector)
    await page.fill(selector, "")
    for ch in value:
        await page.type(selector, ch)
        await asyncio.sleep(delay)


async def wait_and_click(page: Page, selector: str, label: str = ""):
    """Wait for an element, scroll it into view, then click."""
    await page.wait_for_selector(selector, timeout=TIMEOUT_MS)
    element = page.locator(selector).first
    await element.scroll_into_view_if_needed()
    await asyncio.sleep(0.3)
    await element.click()
    if label:
        print(f"  [click] {label}")
    await asyncio.sleep(STEP_DELAY)


async def select_option(page: Page, selector: str, value_or_label: str):
    """Select a <select> dropdown by value or visible text."""
    await page.wait_for_selector(selector, timeout=TIMEOUT_MS)
    try:
        await page.select_option(selector, value=value_or_label)
    except Exception:
        await page.select_option(selector, label=value_or_label)
    await asyncio.sleep(STEP_DELAY)


async def resolve_validation_errors(page: Page) -> list[str]:
    """Return a list of visible validation error messages."""
    errors = await page.locator(
        ".error, .validation-error, [class*='error'], [class*='invalid']"
    ).all_text_contents()
    return [e.strip() for e in errors if e.strip()]


# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------

async def login(page: Page, username: str, password: str):
    print("[login] Navigating to portal …")
    await page.goto(PORTAL_URL, wait_until="domcontentloaded", timeout=30_000)

    # Detect a login form – try common selectors
    login_selectors = [
        "input[type='email']",
        "input[name='email']",
        "input[name='username']",
        "input[id*='email']",
        "input[id*='user']",
    ]
    password_selectors = [
        "input[type='password']",
        "input[name='password']",
    ]

    email_field = None
    for sel in login_selectors:
        if await page.locator(sel).count() > 0:
            email_field = sel
            break

    if email_field is None:
        print("[login] No login form detected – assuming already authenticated.")
        return

    print(f"[login] Filling credentials using selector: {email_field}")
    await slow_fill(page, email_field, username)

    for sel in password_selectors:
        if await page.locator(sel).count() > 0:
            await slow_fill(page, sel, password)
            break

    # Submit
    submit_selectors = [
        "button[type='submit']",
        "input[type='submit']",
        "button:has-text('Login')",
        "button:has-text('Sign in')",
        "button:has-text('Log in')",
    ]
    for sel in submit_selectors:
        if await page.locator(sel).count() > 0:
            await wait_and_click(page, sel, "submit login")
            break

    await page.wait_for_load_state("networkidle", timeout=20_000)
    print("[login] Done.")


# ---------------------------------------------------------------------------
# Navigate to Cabinet Layout
# ---------------------------------------------------------------------------

async def navigate_to_cabinet_layout(page: Page):
    print("[nav] Looking for Cabinet Layout section …")
    nav_selectors = [
        "a:has-text('Cabinet Layout')",
        "button:has-text('Cabinet Layout')",
        "[href*='cabinet']",
        "[data-section*='cabinet']",
        "li:has-text('Cabinet Layout')",
        "nav a:has-text('Cabinet')",
    ]
    for sel in nav_selectors:
        if await page.locator(sel).count() > 0:
            await wait_and_click(page, sel, "Cabinet Layout nav link")
            await page.wait_for_load_state("networkidle", timeout=15_000)
            print("[nav] Reached Cabinet Layout section.")
            return

    # Fallback: look for a sidebar / menu item
    all_links = await page.locator("a, button").all_text_contents()
    cabinet_texts = [t for t in all_links if "cabinet" in t.lower() or "layout" in t.lower()]
    if cabinet_texts:
        await page.get_by_text(cabinet_texts[0], exact=False).first.click()
        await asyncio.sleep(STEP_DELAY)
        print(f"[nav] Clicked: {cabinet_texts[0]}")
    else:
        print("[nav] WARNING: Could not find Cabinet Layout navigation. Proceeding on current page.")


# ---------------------------------------------------------------------------
# Detect form fields for a module section
# ---------------------------------------------------------------------------

async def fill_module_section(page: Page, module_index: int):
    """
    Fill all visible fields belonging to Module `module_index`.
    The script tries several common selector patterns.
    """
    print(f"  [module {module_index}] Filling fields …")

    # Common container patterns per module
    container_selectors = [
        f"[data-module='{module_index}']",
        f"[id*='module-{module_index}']",
        f"[id*='module_{module_index}']",
        f".module-{module_index}",
        f".module:nth-of-type({module_index})",
        f"[aria-label*='Module {module_index}']",
    ]

    container = None
    for sel in container_selectors:
        if await page.locator(sel).count() > 0:
            container = page.locator(sel).first
            break

    # Locate inputs within container (or page if no container found)
    scope = container if container else page

    # Text / number inputs
    inputs = await scope.locator("input:not([type='hidden']):not([type='checkbox']):not([type='radio'])").all()
    for inp in inputs:
        input_type = await inp.get_attribute("type") or "text"
        name = (await inp.get_attribute("name") or await inp.get_attribute("id") or "field").lower()
        label_text = name.replace("_", " ").replace("-", " ")

        if input_type == "number":
            value = str(module_index * 10)  # sensible placeholder
        elif "width" in name:
            value = "600"
        elif "height" in name:
            value = "800"
        elif "depth" in name:
            value = "300"
        elif "name" in name or "label" in name:
            value = f"Module {module_index}"
        elif "qty" in name or "quantity" in name or "count" in name:
            value = str(module_index)
        elif "price" in name or "cost" in name:
            value = "0"
        else:
            value = f"Module{module_index}"

        try:
            await inp.scroll_into_view_if_needed()
            await inp.fill(value)
            print(f"    filled '{label_text}' = '{value}'")
            await asyncio.sleep(0.2)
        except Exception as e:
            print(f"    skipped '{label_text}': {e}")

    # Checkboxes – leave as-is unless required
    checkboxes = await scope.locator("input[type='checkbox']").all()
    for cb in checkboxes:
        is_required = await cb.get_attribute("required")
        is_checked = await cb.is_checked()
        if is_required and not is_checked:
            await cb.check()
            await asyncio.sleep(0.2)

    # Selects (dropdowns)
    selects = await scope.locator("select").all()
    for sel_el in selects:
        options = await sel_el.locator("option").all()
        if len(options) > 1:
            # Pick the first non-empty/placeholder option
            for opt in options[1:]:
                val = await opt.get_attribute("value") or ""
                if val:
                    await sel_el.select_option(value=val)
                    await asyncio.sleep(0.2)
                    break

    await asyncio.sleep(STEP_DELAY)


# ---------------------------------------------------------------------------
# Add module and fill form – main loop
# ---------------------------------------------------------------------------

async def run_cabinet_layout_workflow(page: Page, num_modules: int) -> dict:
    summary = {
        "modules_added": 0,
        "steps_completed": [],
        "validation_issues": [],
    }

    # Selectors for "Add Module" type buttons
    add_module_selectors = [
        "button:has-text('Add Module')",
        "button:has-text('Add Cabinet')",
        "button:has-text('+ Module')",
        "button:has-text('Add')",
        "[data-action='add-module']",
        "[aria-label*='add module' i]",
    ]

    # Selectors for Next/Continue/Save
    next_selectors = [
        "button:has-text('Next')",
        "button:has-text('Continue')",
        "button:has-text('Save')",
        "button:has-text('Proceed')",
        "button[type='submit']",
    ]

    for module_num in range(1, num_modules + 1):
        print(f"\n--- Adding Module {module_num} ---")

        # Click "Add Module" if not the first iteration
        if module_num > 1:
            added = False
            for sel in add_module_selectors:
                if await page.locator(sel).count() > 0:
                    await wait_and_click(page, sel, f"Add Module {module_num}")
                    added = True
                    break
            if not added:
                print(f"  WARNING: Could not find 'Add Module' button for module {module_num}. Stopping.")
                break

        # Wait for the new module section to appear
        await asyncio.sleep(1.5)

        # Fill the module
        await fill_module_section(page, module_num)
        summary["modules_added"] = module_num

        # Check for validation errors
        errors = await resolve_validation_errors(page)
        if errors:
            print(f"  VALIDATION ERRORS after module {module_num}: {errors}")
            summary["validation_issues"].extend(errors)

        summary["steps_completed"].append(f"Module {module_num} filled")

    # Final submission
    print("\n--- Final Submission ---")
    submitted = False
    submit_selectors = [
        "button:has-text('Submit')",
        "button:has-text('Finish')",
        "button:has-text('Complete')",
        "button:has-text('Save')",
        "button[type='submit']",
    ]
    for sel in submit_selectors:
        if await page.locator(sel).count() > 0:
            await wait_and_click(page, sel, "Submit / Finish")
            submitted = True
            break

    if submitted:
        await page.wait_for_load_state("networkidle", timeout=15_000)
        summary["steps_completed"].append("Final submission")

    # Check for success confirmation
    success_selectors = [
        ":has-text('success')",
        ":has-text('submitted')",
        ":has-text('Thank you')",
        ":has-text('Complete')",
        ".success",
        ".confirmation",
    ]
    for sel in success_selectors:
        if await page.locator(sel).count() > 0:
            summary["steps_completed"].append("Success confirmation detected")
            break

    return summary


# ---------------------------------------------------------------------------
# ffmpeg recording wrapper
# ---------------------------------------------------------------------------

def start_ffmpeg_recording(output_path: str) -> subprocess.Popen:
    """Start ffmpeg screen capture. Requires a display (DISPLAY env var)."""
    import os
    display = os.environ.get("DISPLAY", ":0")
    cmd = [
        "ffmpeg", "-y",
        "-f", "x11grab",
        "-r", "25",
        "-s", "1280x800",
        "-i", display,
        "-codec:v", "libx264",
        "-preset", "fast",
        "-pix_fmt", "yuv420p",
        output_path,
    ]
    proc = subprocess.Popen(
        cmd,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    time.sleep(1)  # let ffmpeg initialise
    return proc


def stop_ffmpeg_recording(proc: subprocess.Popen):
    proc.terminate()
    try:
        proc.wait(timeout=10)
    except subprocess.TimeoutExpired:
        proc.kill()


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

async def main(args):
    recorder = None
    video_recorded = False

    async with async_playwright() as pw:
        # Launch browser with Playwright's built-in video recording as fallback
        browser = await pw.chromium.launch(
            headless=False,        # headful so the video is meaningful
            args=["--start-maximized"],
        )
        context = await browser.new_context(
            viewport={"width": 1280, "height": 800},
            record_video_dir="./video_frames" if args.use_playwright_video else None,
            record_video_size={"width": 1280, "height": 800} if args.use_playwright_video else None,
        )
        page = await context.new_page()

        try:
            # ------------------------------------------------------------------
            # 0. Login (navigates to portal as side effect)
            # ------------------------------------------------------------------
            await login(page, args.username, args.password)

            # ------------------------------------------------------------------
            # 1. Navigate to Cabinet Layout
            # ------------------------------------------------------------------
            await navigate_to_cabinet_layout(page)

            # ------------------------------------------------------------------
            # 2. Start recording (first form interaction is about to begin)
            # ------------------------------------------------------------------
            if not args.use_playwright_video:
                try:
                    recorder = start_ffmpeg_recording(args.output)
                    print(f"[recording] ffmpeg started → {args.output}")
                    video_recorded = True
                except FileNotFoundError:
                    print("[recording] ffmpeg not found. Falling back to Playwright video.")
                    args.use_playwright_video = True

            # ------------------------------------------------------------------
            # 3. Run the Cabinet Layout workflow
            # ------------------------------------------------------------------
            summary = await run_cabinet_layout_workflow(page, args.modules)

            # ------------------------------------------------------------------
            # 4. Stop recording
            # ------------------------------------------------------------------
            if recorder:
                stop_ffmpeg_recording(recorder)
                recorder = None
                print(f"[recording] Saved → {args.output}")

        except Exception as exc:
            print(f"\n[ERROR] {exc}")
            import traceback; traceback.print_exc()
            summary = {"modules_added": 0, "steps_completed": [], "validation_issues": [str(exc)]}
        finally:
            if recorder:
                stop_ffmpeg_recording(recorder)

        await context.close()
        await browser.close()

        # Playwright video: rename the auto-generated file
        if args.use_playwright_video:
            video_dir = Path("./video_frames")
            videos = list(video_dir.glob("*.webm")) if video_dir.exists() else []
            if videos:
                latest = max(videos, key=lambda p: p.stat().st_mtime)
                # Convert webm → mp4
                mp4_path = args.output
                result = subprocess.run(
                    ["ffmpeg", "-y", "-i", str(latest), "-codec:v", "libx264", "-preset", "fast", mp4_path],
                    capture_output=True,
                )
                if result.returncode == 0:
                    latest.unlink()
                    video_recorded = True
                    print(f"[recording] Playwright video converted → {mp4_path}")
                else:
                    # Keep webm
                    webm_out = Path(args.output).with_suffix(".webm")
                    latest.rename(webm_out)
                    video_recorded = True
                    print(f"[recording] Saved as WebM (ffmpeg conversion failed) → {webm_out}")

    # ------------------------------------------------------------------
    # 5. Print completion summary
    # ------------------------------------------------------------------
    print("\n" + "=" * 60)
    print("COMPLETION SUMMARY")
    print("=" * 60)
    print(f"  Modules added          : {summary.get('modules_added', 0)}")
    print(f"  Steps completed        : {', '.join(summary.get('steps_completed', [])) or 'none'}")
    val = summary.get("validation_issues", [])
    print(f"  Validation issues      : {len(val)}")
    for v in val:
        print(f"    - {v}")
    print(f"  Video recorded         : {'Yes → ' + args.output if video_recorded else 'No'}")
    print("=" * 60)


def parse_args():
    p = argparse.ArgumentParser(description="Cabinet Layout form automation with video recording")
    p.add_argument("--url", default=PORTAL_URL, help="Portal URL")
    p.add_argument("--username", required=True, help="Login email / username")
    p.add_argument("--password", required=True, help="Login password")
    p.add_argument("--modules", type=int, default=DEFAULT_MODULES, help="Number of modules to add")
    p.add_argument("--output", default=VIDEO_OUTPUT, help="Output video file (MP4)")
    p.add_argument("--playwright-video", dest="use_playwright_video", action="store_true",
                   help="Use Playwright built-in video instead of ffmpeg (headless-friendly)")
    return p.parse_args()


if __name__ == "__main__":
    args = parse_args()
    asyncio.run(main(args))
