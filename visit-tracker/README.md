# Impedyme Visit Tracker

Track **specific, known people** on your own website(s): how many times they
visited, how long they stayed, and which pages they opened — all logged into a
Google Sheet you own. Works even when their IP address changes, because it
identifies the **browser**, not the network.

No paid service and no server needed. Two pieces:

| File | Where it goes |
|---|---|
| `apps-script.gs` | Into a Google Sheet (Extensions → Apps Script) |
| `tracker.js` | Into your website, before `</body>` |

## Setup (about 15 minutes)

### 1. Create the Google Sheet
Create a new, empty Google Sheet (this is where all data will appear).

### 2. Install the backend script
1. In the Sheet: **Extensions → Apps Script**.
2. Delete the sample code and paste the full content of `apps-script.gs`.
3. Click **Deploy → New deployment → Web app**:
   - *Execute as:* **Me**
   - *Who has access:* **Anyone** (required so your website can send data)
4. Authorize when asked, then **copy the Web App URL** (ends with `/exec`).

### 3. Install the tracker on your website
1. Open `tracker.js` and paste your Web App URL into the `ENDPOINT` line.
2. Add the whole script to every page of your site, before `</body>`:

```html
<script>
  /* paste the content of tracker.js here */
</script>
```

Repeat on every website you want to track — they can all report to the same
Sheet (the Sheet records which site each visit came from).

### 4. (Optional) Auto-update the Summary tab
In the Apps Script editor: **Triggers (clock icon) → Add Trigger** →
function `updateSummary`, event source *Time-driven*, every hour.
Otherwise, update it manually from the Sheet menu: **Visit Tracker → Update Summary**.

### 5. Give each person their personal link
Send each user a link with their ID, for example:

```
https://www.impedyme.com/?uid=sara
https://www.impedyme.com/?uid=mohammad
```

They only need to click it **once**. After that, their browser is remembered
and every future visit is counted under their name — even from a different IP.

## Reading the results

- **Summary tab** — one row per person: total visits, total time in minutes,
  first/last seen, and which of your sites they used. This answers
  *"how many times did they check the website?"*
- **Log tab** — the raw data: every page view and a heartbeat every minute
  while they keep the page open (that's how time-on-site is calculated).

A "visit" = activity with no gap longer than 30 minutes. If someone comes in
the morning and again in the evening, that counts as 2 visits.

## Limitations (good to know)

- Works only on websites **you control** (where you can add the script). It
  cannot see visits to other companies' websites.
- If a user clears browser data, uses incognito mode, or switches to a new
  device, they become anonymous again — just have them click their personal
  link once more.
- IP address is deliberately **not** used: it changes too often to identify
  anyone, which is exactly the problem this tool solves.
- Even with users' agreement, if any visitors are in the EU/UK, show a short
  notice on the site that visits are recorded.
