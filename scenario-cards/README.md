# Type-Test Programme — 28 Scenario Cards

An interactive card layout for the full type-test programme: 28 scenarios,
grouped into 5 families, with a detail panel that shows each scenario's
**Applied / Measured / Criterion / Bench note** breakdown.

Built with plain HTML, CSS and JavaScript — no libraries, no build step,
no external assets.

## Files

| File | What it is |
|---|---|
| `embed.html` | **The source of truth.** Paste this whole file into a WordPress *Custom HTML* block. |
| `index.html` | Generated standalone preview page — open it in a browser to see the block on its own. |
| `build.sh` | Regenerates `index.html` from `embed.html`. Run it after every edit. |

```sh
./build.sh          # rebuild index.html from embed.html
```

## Putting it on the site

1. Edit the page in WordPress and add a **Custom HTML** block (not a Paragraph
   block — the classic editor wraps loose markup in `<p>` tags).
2. Paste the entire contents of `embed.html`.
3. Preview. Everything is scoped to `.layout`, so the header, footer and the
   rest of the page are untouched.

## What it does

- **28 cards** in a responsive grid — 4 across on desktop, a swipeable
  scroll-snap strip on phones.
- **Family filters** across the top (All / Family 1–5). Selecting a family
  narrows the cards and swaps in that family's description.
- **Detail panel** with the family chip, clause number, the summary line, the
  three specification blocks side by side, and the bench note called out in an
  accent box.
- **Previous / Next** buttons and arrow-key navigation, both scoped to the
  scenarios currently visible under the active filter.
- Accessible markup: cards are real `<button>` elements in a `tablist`, with
  `aria-selected` kept in sync and visible focus rings.

## Customising

### Colours

Every colour is a variable at the top of the `<style>` block:

```css
.layout{
  --accent:#D18100;                    /* Impedyme orange              */
  --accent-soft:rgba(209,129,0,.10);   /* selected-card / note tint    */
  --card-bg:#f5f5f5;                   /* card + panel background      */
  --text-main:#1c1c1c;
  --text-body:#3d3d3d;
  --text-muted:#7a7a7a;
  --line:rgba(0,0,0,.09);              /* card borders                 */
}
```

Change `--card-bg` alone to restyle every card and the panel at once.

### Icons

The icons are **sample inline SVGs** defined in the `ICONS` object near the top
of the `<script>` — they ship inside the file, so nothing needs uploading and
nothing can 404. They inherit the tile colour, so they follow `--accent`
automatically.

To use your own artwork instead, replace the value with an `<img>` tag — the
`.icon` / `.panel-icon` rules already size and crop images:

```js
var ICONS = {
  pf: '<img src="https://impedyme.com/wp-content/uploads/2025/12/your-icon.webp" alt="">',
  ...
};
```

Each scenario picks its icon by key (`icon:"pf"`), so several scenarios can
share one image, and swapping a key re-points a card without touching markup.

### Scenario text

All 28 scenarios live in the `DATA` array in reading order. Each entry is:

```js
{
  family:1,                  /* 1–5, drives the filter and the chip */
  icon:"pf",                 /* key from the ICONS object           */
  title:"Constant Power Factor Mode",
  clause:"Clause 5.14.3",
  lede:"Verifies that …",    /* the summary line under the heading  */
  applied:"…",
  measured:"…",
  criterion:"…",
  note:"…"                   /* the bench note                      */
}
```

Card numbers (01–28) are generated from array position, and the filter counts
are derived from `family`, so adding, removing or reordering a scenario needs
no other change. Family names and blurbs live in the `FAMILIES` array just
above.
