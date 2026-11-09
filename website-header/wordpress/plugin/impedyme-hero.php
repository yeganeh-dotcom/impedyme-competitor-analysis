<?php
/**
 * Plugin Name:       Impedyme Hero Slider
 * Description:       Responsive two-slide homepage header: product video with animated headline, button and solutions table, then the inverter-testing video. Add it to a page with the shortcode [impedyme_hero].
 * Version:           1.0.0
 * Requires at least: 5.8
 * Requires PHP:      7.4
 * Author:            Impedyme
 * License:           GPL-2.0-or-later
 * Text Domain:       impedyme-hero
 *
 * @package ImpedymeHero
 */

defined( 'ABSPATH' ) || exit;

/**
 * Removes blank lines so WordPress auto-paragraphs (wpautop) can never split the inline CSS/JS.
 *
 * @param string $code CSS or JavaScript.
 * @return string
 */
function impedyme_hero_compact( $code ) {
	return (string) preg_replace( "/\n\s*\n/", "\n", str_replace( "\r", '', $code ) );
}

/**
 * Shortcode [impedyme_hero].
 *
 * The CSS and JS are printed inline with the first hero on the page, so the opening
 * animation never flashes unstyled and nothing is loaded on pages without the hero.
 *
 * @return string
 */
function impedyme_hero_render() {
	static $assets_printed = false;

	$dir      = plugin_dir_path( __FILE__ );
	$template = $dir . 'templates/impedyme-hero.html';
	if ( ! is_readable( $template ) ) {
		return '';
	}
	$markup = (string) file_get_contents( $template ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents

	$media = array(
		'{{HEADER_VIDEO}}'    => 'media/impedyme-header.mp4',
		'{{HEADER_POSTER}}'   => 'media/impedyme-header-end.jpg',
		'{{INVERTER_VIDEO}}'  => 'media/header-inverter-testing.mp4',
		'{{INVERTER_POSTER}}' => 'media/header-inverter-testing.jpg',
		'{{SIMULINK_IMAGE}}'  => 'media/Impedyme-Simulink-Blockset.png',
	);

	$replace = array(
		'{{STYLE}}'  => '',
		'{{SCRIPT}}' => '',
	);
	foreach ( $media as $token => $file ) {
		$replace[ $token ] = esc_url( plugins_url( $file, __FILE__ ) );
	}

	if ( ! $assets_printed ) {
		$assets_printed = true;
		$css = (string) file_get_contents( $dir . 'assets/impedyme-hero.css' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		$js  = (string) file_get_contents( $dir . 'assets/impedyme-hero.js' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents

		$replace['{{STYLE}}']  = '<style id="impedyme-hero-css">' . impedyme_hero_compact( $css ) . '</style>';
		$replace['{{SCRIPT}}'] = '<script id="impedyme-hero-js">' . impedyme_hero_compact( $js ) . '</script>';
	}

	return strtr( $markup, $replace );
}
add_shortcode( 'impedyme_hero', 'impedyme_hero_render' );
