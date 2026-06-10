=== Impedyme Related Products ===
Contributors: impedyme
Tags: shortcode, sticky, sidebar, related products
Requires at least: 5.0
Tested up to: 6.7
Stable tag: 1.0.0
License: GPLv2 or later

Sticky "Related Products" sidebar card via the [related_products] shortcode.

== Description ==

Adds a sticky "Related Products" card. The card follows the scroll and stops
at the element marked with the data-rp-stop attribute (e.g. your "Request a
Demo" button). Fully responsive — sticky behavior turns off below 1024px.

== Installation ==

1. Go to Plugins > Add New > Upload Plugin.
2. Upload impedyme-related-products.zip and activate it.
3. Place the shortcode where you want the card:

   [related_products]

4. Mark the stop point: on your "Request a Demo" button add the custom
   attribute (Elementor: Advanced > Attributes):

   data-rp-stop|true

== Shortcode options ==

[related_products top_gap="140"]
   top_gap     - px gap from the top while sticky. Set this to your fixed
                 menu height + ~20 so the card sits below the menu. Default 120.
   header_url  - URL for the "Related Products" header link.
                 Default https://impedyme.com/products

== Customizing ==

* Products / images / links: edit the $products array in
  impedyme-related-products.php.
* Colors, fonts, image size, shadow: edit assets/related-products.css.
* Stop offsets / mobile breakpoint: edit assets/related-products.js.

== Changelog ==

= 1.0.0 =
* Initial release.
