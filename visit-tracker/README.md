# Visit Tracker (Google Sheets + Apps Script)

Tracks website visits per user (`uid`) into a Google Sheet.

## Files

- `Code.gs` — the Google Apps Script bound to the spreadsheet. Deployed as a Web App (`doPost` receives tracking beacons).
- `footer-snippet.html` — the tracking snippet embedded in the website footer. Users are identified by a `?uid=...` URL parameter, persisted in `localStorage`.

## Sheet tabs

- **Log** — every event (pageview / heartbeat) from every user, one row per event.
- **User - `<uid>`** — a personal tab per user, created automatically the first time a new `uid` sends an event. Contains only that user's rows, same columns as Log.
- **Summary** — per-user totals (visits, minutes, first/last seen, sites). Refreshed via the menu.

## Menu (Visit Tracker)

- **Update Summary** — rebuilds the Summary tab from the Log.
- **Create/Refresh User Tabs** — backfills a personal tab for every user already present in the Log (use once after installing this version, or any time to rebuild user tabs from the Log).

## Updating the deployed script

After editing `Code.gs` in the Apps Script editor, redeploy: **Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy**. The Web App URL stays the same.
