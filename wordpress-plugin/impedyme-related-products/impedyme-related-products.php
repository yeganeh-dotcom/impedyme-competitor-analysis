<?php
/**
 * Plugin Name:       Impedyme Related Products
 * Plugin URI:        https://impedyme.com/
 * Description:        Adds a sticky "Related Products" sidebar card via the [related_products] shortcode. The card follows the scroll and stops at the element marked with the data-rp-stop attribute (e.g. the "Request a Demo" button).
 * Version:           1.0.0
 * Author:            Impedyme
 * Author URI:        https://impedyme.com/
 * License:           GPL-2.0+
 * Text Domain:       impedyme-related-products
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // No direct access.
}

/**
 * Register front-end assets (only loaded; printed on demand by the shortcode).
 */
function imp_rp_register_assets() {
    $base = plugin_dir_url( __FILE__ );

    wp_register_style(
        'imp-related-products',
        $base . 'assets/related-products.css',
        array(),
        '1.0.0'
    );

    wp_register_script(
        'imp-related-products',
        $base . 'assets/related-products.js',
        array(),
        '1.0.0',
        true // load in footer
    );
}
add_action( 'wp_enqueue_scripts', 'imp_rp_register_assets' );

/**
 * [related_products] shortcode.
 *
 * Optional attributes:
 *   header_url   - URL for the "Related Products" header link.
 *   top_gap      - px gap from top while sticky (set to your menu height + ~20).
 *
 * Example: [related_products top_gap="140"]
 */
function imp_rp_shortcode( $atts ) {

    $atts = shortcode_atts(
        array(
            'header_url' => 'https://impedyme.com/products',
            'top_gap'    => '120',
        ),
        $atts,
        'related_products'
    );

    // Make sure CSS/JS are queued for this page.
    wp_enqueue_style( 'imp-related-products' );
    wp_enqueue_script( 'imp-related-products' );

    // Pass the top_gap value to the JS.
    wp_add_inline_script(
        'imp-related-products',
        'window.IMP_RP_TOP_GAP = ' . absint( $atts['top_gap'] ) . ';',
        'before'
    );

    // Product list: edit here to change products / images / links.
    $products = array(
        array(
            'url'   => 'https://impedyme.com/chp-series/',
            'img'   => 'https://impedyme.com/wp-content/uploads/2025/02/chp150.png',
            'title' => 'CHP 150',
        ),
        array(
            'url'   => 'https://impedyme.com/rcp-box/',
            'img'   => 'https://impedyme.com/wp-content/uploads/2025/11/rcp-card.webp',
            'title' => 'HIL/RCP-Box',
        ),
        array(
            'url'   => 'https://impedyme.com/chp-series/',
            'img'   => 'https://impedyme.com/wp-content/uploads/2026/02/PHIL-300-monitor.webp',
            'title' => 'CHP 300',
        ),
    );

    ob_start();
    ?>
    <div class="rp-affix">
        <div class="rp-card">
            <a class="rp-card__header" href="<?php echo esc_url( $atts['header_url'] ); ?>">Related Products</a>
            <?php foreach ( $products as $p ) : ?>
                <a class="rp-item" href="<?php echo esc_url( $p['url'] ); ?>">
                    <img class="rp-item__img" src="<?php echo esc_url( $p['img'] ); ?>" alt="<?php echo esc_attr( $p['title'] ); ?>" loading="lazy">
                    <div class="rp-item__title"><?php echo esc_html( $p['title'] ); ?></div>
                </a>
            <?php endforeach; ?>
        </div>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode( 'related_products', 'imp_rp_shortcode' );
