<?php
/**
 * IMPEDYME — "How It Works" Phases shortcode.
 *
 * HOW TO USE
 * ----------
 * 1. Copy this whole file's contents into your (child) theme's functions.php,
 *    OR install it as a tiny plugin (see header note at bottom).
 * 2. Make sure phases.css and phases.js live in your theme folder, e.g.
 *        wp-content/themes/your-theme/impedyme/phases.css
 *        wp-content/themes/your-theme/impedyme/phases.js
 *    (adjust the paths in imp_phases_assets() below if you put them elsewhere).
 * 3. On any page/post add the shortcode:   [impedyme_phases]
 *
 * Colors / font are all in phases.css. Background #000000, cards #f5f5f5
 * (low-opacity overlay), accent #ed9a09, white text, Roboto.
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

/* ---- 1. Register CSS/JS + Roboto, only loaded when shortcode is used ---- */
function imp_phases_assets() {
	$base = get_stylesheet_directory_uri() . '/impedyme';

	wp_register_style(
		'imp-roboto',
		'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&family=Roboto+Mono:wght@400;500&display=swap',
		array(),
		null
	);
	wp_register_style( 'imp-phases', $base . '/phases.css', array( 'imp-roboto' ), '1.0.0' );
	wp_register_script( 'imp-phases', $base . '/phases.js', array(), '1.0.0', true );
}
add_action( 'wp_enqueue_scripts', 'imp_phases_assets' );

/* ---- 2. The phases data ------------------------------------------------- */
function imp_phases_data() {
	return array(
		array(
			'num'   => '1',
			'title' => 'Powering up &amp; starting the motor',
			'rows'  => array(
				array( 'Fake flight', 'The autopilot is fed simulated flight data, making it think the drone is mid-air.' ),
				array( 'Commands', 'It calculates how fast the motors must spin and sends that command to the ESC.' ),
				array( 'The trick', 'The ESC sends out power; the cabinet measures it and the real-time brain instantly computes how a real motor would respond — a perfect feedback loop.' ),
			),
		),
		array(
			'num'   => '2',
			'title' => 'Simulating heavy wind &amp; acceleration',
			'rows'  => array(
				array( 'Action', 'The autopilot commands a sudden burst of throttle to simulate a rapid climb.' ),
				array( 'Reaction', 'The simulator instantly calculates the heavy propeller drag a real drone would experience.' ),
				array( 'The test', 'Engineers watch live graphs to ensure the ESC handles the power spike without overheating or shutting down.' ),
			),
		),
		array(
			'num'   => '3',
			'title' => 'Trapping &amp; reusing braking energy',
			'rows'  => array(
				array( 'Why', 'When a drone slows quickly, the motors become generators, pushing electricity backward into the system.' ),
				array( 'Recycle', 'Instead of turning that into dangerous heat, the emulator safely returns the energy to the main power source.' ),
				array( 'Result', 'Engineers can safely test aggressive braking algorithms with full 4-quadrant recirculation.' ),
			),
		),
		array(
			'num'   => '4',
			'title' => 'Simulating broken wires — fault injection',
			'rows'  => array(
				array( 'Cut', 'Using software, engineers instantly cut power to one motor phase; the emulator drops it to zero.' ),
				array( 'Goal', 'The ESC\'s internal brain must recognize the error and shut down within milliseconds.' ),
				array( 'Safe', 'Because it\'s entirely simulated, there\'s zero risk of hardware exploding if the test fails.' ),
			),
		),
	);
}

/* ---- 3. The shortcode --------------------------------------------------- */
function imp_phases_shortcode() {
	wp_enqueue_style( 'imp-phases' );
	wp_enqueue_script( 'imp-phases' );

	ob_start();
	?>
	<section class="imp-phases">
		<div class="imp-phases__inner">
			<?php foreach ( imp_phases_data() as $phase ) : ?>
				<article class="imp-phase">
					<div class="imp-phase__num">
						<span class="imp-phase__label">PHASE</span>
						<span class="imp-phase__digit"><?php echo esc_html( $phase['num'] ); ?></span>
					</div>
					<div class="imp-phase__body">
						<h2 class="imp-phase__title"><?php echo wp_kses_post( $phase['title'] ); ?></h2>
						<div class="imp-phase__rows">
							<?php foreach ( $phase['rows'] as $row ) : ?>
								<div class="imp-row">
									<span class="imp-row__key"><?php echo esc_html( $row[0] ); ?></span>
									<p class="imp-row__text"><?php echo esc_html( $row[1] ); ?></p>
								</div>
							<?php endforeach; ?>
						</div>
					</div>
				</article>
			<?php endforeach; ?>
		</div>
	</section>
	<?php
	return ob_get_clean();
}
add_shortcode( 'impedyme_phases', 'imp_phases_shortcode' );

/*
 * ---- OPTIONAL: turn this file into a standalone plugin ----
 * Create wp-content/plugins/impedyme-phases/impedyme-phases.php, paste a
 * plugin header above the code, and put phases.css / phases.js next to it
 * (then change get_stylesheet_directory_uri() to plugins_url() accordingly):
 *
 *   Plugin Name: Impedyme Phases
 *   Description: "How It Works" phases section shortcode [impedyme_phases].
 *   Version: 1.0.0
 */
