# Related Products — Sticky-until-stop sidebar

A "Related Products" card that **follows the scroll** down the page and then
**stops at the "Request a Demo" button**, fully responsive, in plain HTML/CSS/JS.

## Files
- `index.html` — standalone demo. Open it in a browser and scroll to see the behavior.
- `related-products-widget.html` — the clean widget (HTML + CSS + JS) to paste into Elementor.

## How the stop works
The JS makes the card `position: fixed` while you scroll, then "parks" it the
moment its bottom reaches the element marked with `data-rp-stop`. Below 1024px
it turns sticky off and the card just stacks normally.

## Using it in WordPress / Elementor

1. **Two-column layout.** Build your post with the article in the left column
   and a narrower right column (~300px) for the sidebar. (Elementor: a Section
   with two Columns, or a Container set to flex-row.)

2. **Add the card.** Drag an **HTML** widget into the right column and paste the
   entire contents of `related-products-widget.html`.

3. **Mark the stop point.** Select your **"Request a Demo" Button** widget →
   **Advanced → Attributes (Custom Attributes)** and add:

   ```
   data-rp-stop|true
   ```

   That's the only wiring needed — the card will stop right above that button.
   (To stop at a different element instead, put the same attribute there, or
   change `STOP_SEL` in the script.)

4. **Tune spacing (optional).** At the top of the `<script>`:
   - `TOP_GAP` — distance from the top of the screen while following.
     Increase it if you have a sticky header (e.g. set to your header height + 20).
   - `BOTTOM_GAP` — gap left above the Request a Demo button.
   - `MOBILE_BP` — width below which sticky is disabled (default 1024px).

5. **Edit products.** Change the `href`, `src`, `alt`, and titles inside each
   `.rp-item` block. Colors live in the `<style>` (`#F5A623` is the orange).

## Notes
- If your theme has a fixed/sticky top menu, set `TOP_GAP` to roughly that
  menu's height so the card doesn't hide behind it.
- Works with one widget instance per page. For multiple, the selectors would
  need to be scoped per instance.
