# Impedyme — "How It Works" Phases Section

A black, fully-responsive phases/timeline section built with plain HTML, CSS and JS,
ready to drop into WordPress.

## Design tokens

| Element                         | Color                                   |
|---------------------------------|-----------------------------------------|
| Page background                 | `#000000`                               |
| Cards                           | `#f5f5f5` applied as a low-opacity overlay (so white text stays readable) |
| Phase numbers + small labels    | `#ed9a09`                               |
| All other text                  | `#ffffff`                               |
| Font                            | Roboto (+ Roboto Mono for the labels)   |

> **Why the card overlay?** Pure white text on a solid `#f5f5f5` card is unreadable.
> Your screenshots show cards only *slightly* lighter than the black background, so
> `#f5f5f5` is applied at ~4% opacity. Adjust it via the `--imp-card-opacity` variable
> at the top of `phases.css` (try `0.02`–`0.08`).

## Files

- `index.html` — standalone preview (open it directly in a browser).
- `phases.css` — all styling + responsive breakpoints (768px, 520px).
- `phases.js` — scroll-reveal animation (degrades gracefully, respects reduced-motion).
- `wordpress-shortcode.php` — registers the `[impedyme_phases]` shortcode.

## Quick preview

Open `web/index.html` in any browser. No build step.

## Add it to WordPress

### Option A — Shortcode (recommended)

1. Copy `phases.css` and `phases.js` into your **child theme**:
   `wp-content/themes/your-theme/impedyme/`
2. Paste the contents of `wordpress-shortcode.php` into your child theme's
   `functions.php` (or use it as a small plugin — see the note at the bottom of that file).
3. Edit any page/post and add the shortcode:

   ```
   [impedyme_phases]
   ```

CSS/JS load **only** on pages where the shortcode is used.

### Option B — Custom HTML block (no PHP)

1. In the block editor add a **Custom HTML** block and paste the `<section class="imp-phases">…</section>`
   markup from `index.html`.
2. Add the CSS: **Appearance → Customize → Additional CSS**, paste all of `phases.css`,
   and add this line at the very top so Roboto loads:

   ```css
   @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&family=Roboto+Mono:wght@400;500&display=swap');
   ```
3. (Optional animation) paste the contents of `phases.js` into a footer-scripts plugin,
   or just delete the `opacity:0` / `transform` lines in the `.imp-phase` rule to show
   cards without JS.

## Responsive behavior

- **> 768px** — number column beside the content, label/description in two columns.
- **≤ 768px** — narrower number column; each label sits above its description.
- **≤ 520px** — single column; "PHASE" + number sit side-by-side.
