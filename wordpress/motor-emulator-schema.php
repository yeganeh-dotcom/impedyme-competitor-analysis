<?php
/**
 * Motor Emulator page - JSON-LD structured data.
 *
 * Outputs the schema.org @graph for https://impedyme.com/motor-emulator/.
 *
 * The schema content is identical to the original snippet. Only the way it is
 * produced changed: the graph is now built as a PHP array and encoded with
 * wp_json_encode(), so the emitted JSON is always syntactically valid (the
 * hand-written version had a trailing comma in the "image" array and raw line
 * breaks inside the "description" string, both of which make the JSON
 * unparseable).
 *
 * @package Impedyme
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Direct access not allowed.
}

/**
 * Slug of the page the schema belongs to.
 */
const IMPEDYME_MOTOR_EMULATOR_SLUG = 'motor-emulator';

/**
 * Build the JSON-LD graph for the Motor Emulator page.
 *
 * @return array<int, array<string, mixed>> The @graph nodes.
 */
function impedyme_motor_emulator_schema_graph() {
	$page_url    = 'https://impedyme.com/motor-emulator/';
	$uploads_url = 'https://impedyme.com/wp-content/uploads/';

	$publisher = array(
		'@type' => 'Organization',
		'name'  => 'Impedyme',
	);

	$brand = array(
		'@type' => 'Brand',
		'name'  => 'Impedyme',
	);

	/**
	 * Build an Offer node.
	 *
	 * @param string $url Offer URL.
	 * @return array<string, mixed>
	 */
	$offer = static function ( $url ) {
		return array(
			'@type'        => 'Offer',
			'url'          => $url,
			'availability' => 'https://schema.org/InStock',
			'seller'       => array(
				'@type' => 'Organization',
				'name'  => 'Impedyme Inc.',
			),
		);
	};

	/**
	 * Build an ImageObject node.
	 *
	 * @param string $url     Image URL.
	 * @param string $caption Image caption.
	 * @return array<string, mixed>
	 */
	$image = static function ( $url, $caption ) {
		return array(
			'@type'   => 'ImageObject',
			'url'     => $url,
			'caption' => $caption,
		);
	};

	/**
	 * Build a TableRow node.
	 *
	 * @param string $name  Row label.
	 * @param string $value Row value.
	 * @return array<string, mixed>
	 */
	$table_row = static function ( $name, $value ) {
		return array(
			'@type' => 'TableRow',
			'name'  => $name,
			'row'   => array( $value ),
		);
	};

	/**
	 * Build a Question node with its accepted answer.
	 *
	 * @param string $question Question text.
	 * @param string $answer   Answer text.
	 * @return array<string, mixed>
	 */
	$question = static function ( $question, $answer ) {
		return array(
			'@type'          => 'Question',
			'name'           => $question,
			'acceptedAnswer' => array(
				'@type' => 'Answer',
				'text'  => $answer,
			),
		);
	};

	$article_description = <<<'DESCRIPTION'
Developing high-performance inverter hardware for electrified mobility requires rigorous validation in realistic environments. At Impedyme, we offer world-leading, state-of-the-art motor emulation tools that help engineers simulate real-world conditions and accelerate their development cycle. Our motor emulator systems provide best-in-class accuracy, performance, and efficiency for testing during all R&D phases, making Impedyme a leading choice for advanced motor emulation worldwide.
Trusted by Leading Automotive, Energy, and Aerospace Companies: Impedyme’s motor emulation and power electronics testing solutions have been successfully delivered to and used by leading organizations including Litens Automotive, Flex Automotive, KEMA Labs, Duke Energy, and Liebherr Aerospace. These deployments demonstrate the reliability, performance, and flexibility of Impedyme’s solutions in demanding real-world R&D and validation environments. 
Why Early-Stage Inverter Hardware Design Needs Motor Emulation
Inverter hardware is the core of electric vehicles, handling DC/AC conversion,motor control, and energy optimization. However, early-stage testing often depends on passive R-L loads, which introduce key limitations when motor emulation is not used:
Limited Component Stress: Passive loads apply only reactive power to the inverter, failing to mimic real-world active power conditions. This prevents accurate testing of components like diodes and switches, risking undetected vulnerabilities.
Inactive DC Path: Passive R-L setups can’t return power to the inverter’s DC side, limiting the ability to replicate realistic power flow behavior.
Power-Level Testing with the Impedyme CHP Motor Emulator
The Impedyme CHP motor emulator is an active, programmable, world-class motor emulation system built for accurate inverter hardware testing. It delivers functional validation under real-world voltage and current conditions—offering a more realistic, detailed testing environment than conventional inductive setups. Designed for modern electric drivetrains, our best-in-class motor emulation platform ensures precise, reliable results.
Low-Power Signal-Level Motor Emulation Using the RCP Box
Early-stage inverter development often involves high uncertainty. The Impedyme HIL/RCP Box offers motor emulation at the signal level, allowing you to test unmodified controller hardware using high-fidelity real-time simulation—without risking physical components.
Fast UUT Commissioning: Enjoy easy test setup with only four parameters needing definition to begin the testing process.
Rapid Parameter Adjustment: Easily and quickly adjust several parameters, such as R and L, via a simple mouse click during operation.
Minimum Facility Requirements: Only a 5kW AC connection for power and no water connection for cooling is needed as the system is stand-alone liquid cooled without external chiller.
Realistic Power Emulation: Four-quadrant mode enables full torque/speed operation, allowing active power testing under true-to-life conditions.
Motor Emulator Testing Platform from Signal to Power: With Impedyme’s integrated RCP and CHP systems, engineers can validate control logic at the signal level and scale seamlessly to high-power testing—all within one unified platform. Ensure full traceability and uncompromised performance throughout the development cycle with one of the world’s most advanced motor emulation platforms.
DESCRIPTION;

	// Key features: name => description, rendered as a positioned ItemList.
	$key_features = array(
		array(
			'Fast UUT Commissioning',
			'Easy test setup with only four parameters needing definition to begin the testing process, so a unit under test can be brought online quickly without lengthy configuration.',
		),
		array(
			'Rapid Parameter Adjustment',
			'Easily and quickly adjust several machine parameters, such as R and L, via a simple mouse click during operation, enabling sweeps and what-if studies without stopping the test.',
		),
		array(
			'Minimum Facility Requirements',
			'Only a 5 kW AC connection is needed for power and no water connection is required for cooling, as the system is stand-alone liquid cooled without an external chiller.',
		),
		array(
			'Realistic Power Emulation',
			'Four-quadrant mode enables full torque and speed operation, allowing active power testing under true-to-life conditions rather than the reactive-only loading of a passive R-L bank.',
		),
		array(
			'Signal-Level Emulation with the RCP Box',
			'The Impedyme RCP box offers motor emulation at the signal level, allowing unmodified controller hardware to be tested using high-fidelity real-time simulation without risking physical components.',
		),
		array(
			'Motor Emulator Testing Platform from Signal to Power',
			'With Impedyme integrated RCP and CHP systems, engineers can validate control logic at the signal level and scale seamlessly to high-power testing, all within one unified platform, ensuring full traceability and uncompromised performance throughout the development cycle.',
		),
		array(
			'Ultra-Fast, High-Fidelity HIL with FPGA Technology',
			'FPGA-based real-time simulation provides the low latency and high update rates required to close the loop around fast-switching traction inverters with high model fidelity.',
		),
	);

	$key_feature_items = array();

	foreach ( $key_features as $index => $key_feature ) {
		list( $feature_name, $feature_description ) = $key_feature;

		$key_feature_items[] = array(
			'@type'       => 'ListItem',
			'position'    => $index + 1,
			'name'        => $feature_name,
			'description' => $feature_description,
		);
	}

	$overview_article = array(
		'@type'            => 'TechArticle',
		'@id'              => $page_url,
		'mainEntityOfPage' => array(
			'@type' => 'WebPage',
			'@id'   => $page_url,
		),
		'headline'         => 'Impedyme Motor Emulator (CHP and RCP Series) – Real-Time Motor Emulation for Inverter Hardware Development',
		'alternativeHeadline' => 'CHP and RCP Series: Motor Emulation from Signal Level to Full Power.',
		'description'      => $article_description,
		'author'           => array(
			'@type' => 'Organization',
			'name'  => 'Impedyme',
			'url'   => 'https://impedyme.com',
		),
		'publisher'        => $publisher,
		'image'            => array(
			$image(
				$uploads_url . '2025/08/header-Hardware-in-the-loop-simulation-lab-cabinet2.webp',
				'Impedyme Motor Emulator for inverter hardware development. The platform reproduces real machine behaviour so engineers can validate traction inverters and power electronics under realistic torque, speed, and power-flow conditions.'
			),
			$image(
				$uploads_url . '2025/06/signal-level-inverter-validation-with-impedyme-rcp-box-scaled.webp',
				'Why passive R-L load testing falls short. Passive loads apply only reactive power to the inverter and cannot return power to the DC side, leaving switches, diodes, and the DC path untested under realistic active-power stress.'
			),
			$image(
				$uploads_url . '2025/06/Enabling-Ultra-Fast-High-Fidelity-HIL-with-FPGA-Technology-motor-emulator.webp',
				'Power-level testing with the Impedyme CHP Motor Emulator. The active, programmable system delivers functional inverter validation under real-world voltage and current conditions, offering a more realistic test environment than conventional inductive setups.'
			),
			$image(
				$uploads_url . '2025/08/motor-emulation-inverter-testing-impedyme.webp',
				'Signal-level inverter validation with the Impedyme RCP box. Unmodified controller hardware is tested against high-fidelity real-time motor models, removing the risk to physical components during early-stage inverter development.'
			),
		),
		'url'              => $page_url,
		'hasPart'          => array(
			array(
				'@type'               => 'SoftwareApplication',
				'name'                => 'MotorSim Studio',
				'applicationCategory' => 'Testing Software',
				'description'         => 'MotorSim Studio is Impedyme electric motor simulation software for configuring, monitoring, automating, and optimizing real-time motor emulation. It supplies the high-fidelity machine and drive models – PMSM, BLDC, and induction machine – that let the CHP Series stand in for a physical motor as a true electrical load across all four quadrants. Machine parameters such as resistance and inductance can be adjusted during operation, UUT commissioning requires only four parameters to be defined, and the same models built in software are the models that run on the emulator during physical testing. Test campaigns can be automated and results captured for repeatable, traceable inverter validation.',
				'brand'               => $brand,
				'offers'              => $offer( 'https://impedyme.com/electric-motor-simulation-software/' ),
			),
			array(
				'@type'               => 'SoftwareApplication',
				'name'                => 'PowerHIL Studio',
				'applicationCategory' => 'Testing Software',
				'description'         => 'PowerHIL Studio is the real-time simulation environment that hosts Impedyme emulation applications, including the Motor Emulator app mode alongside Grid Emulator, Battery Emulator, and Impedance Analyzer. It configures the hardware, selects how and where models execute, launches the purpose-built emulation application, automates entire test campaigns, and captures the measurement data that proves a design works.',
				'brand'               => $brand,
				'offers'              => $offer( 'https://impedyme.com/powerhil-studio/' ),
			),
		),
	);

	$detail_article = array(
		'@type'               => 'TechArticle',
		'@id'                 => $page_url,
		'headline'            => 'Impedyme Motor Emulator (CHP and RCP Series): Four-Quadrant Motor Emulation for Traction Inverter Testing',
		'alternativeHeadline' => 'Signal-Level and Power-Level Motor Emulation with FPGA-Based HIL',
		'image'               => $uploads_url . 'REPLACE-motor-emulator-header.webp',
		'url'                 => $page_url,
		'publisher'           => $publisher,
		'datePublished'       => '2026-09-06',
		'dateModified'        => '2026-09-06',
		'about'               => array(
			'Motor Emulator',
			'Motor Emulation',
			'Motor Simulator',
			'MotorSim Studio',
			'Impedyme Motor Emulator',
			'Inverter Hardware Development',
			'Traction Inverter Testing',
			'Power Hardware in the Loop',
			'Hardware in the Loop',
			'Rapid Control Prototyping',
			'Four-Quadrant Motor Emulation',
			'PMSM and BLDC Emulation',
			'EV Powertrain Validation',
		),
		'articleSection'      => array(
			'Why Early-Stage Inverter Hardware Design Needs Motor Emulation',
			'Power-Level Testing with the Impedyme CHP Motor Emulator',
			'Low-Power Signal-Level Motor Emulation Using the RCP Box',
			'Key Features',
			'Motor Emulator Testing Platform from Signal to Power',
			'FPGA-Based Ultra-Fast, High-Fidelity HIL',
			'Key Benefits Table',
			'Applications',
		),
		'keywords'            => array(
			'motor emulator',
			'motor emulation',
			'motor simulator',
			'MotorSim Studio',
			'Impedyme motor emulator',
			'inverter hardware development',
			'traction inverter testing',
			'power hardware in the loop',
			'hardware in the loop',
			'rapid control prototyping',
			'four-quadrant motor emulation',
			'PMSM emulation',
			'BLDC motor emulator',
			'EV powertrain validation',
		),
		'hasPart'             => array(
			array(
				'@type'           => 'ItemList',
				'name'            => 'Key Features of the Impedyme Motor Emulator',
				'description'     => 'Core capabilities of the Impedyme motor emulation platform across the RCP signal-level box and the CHP power-level system.',
				'itemListElement' => $key_feature_items,
			),
			array(
				'@type'       => 'Product',
				'name'        => 'Impedyme CHP Series Motor Emulator',
				'category'    => 'Power-Level Motor Emulation System',
				'description' => 'The Impedyme CHP motor emulator is an active, programmable system built for accurate inverter hardware testing. It delivers functional validation under real-world voltage and current conditions, offering a more realistic and detailed testing environment than conventional inductive setups. Four-quadrant operation covers the full torque and speed envelope, and the regenerative power stage returns energy to the inverter DC side so that switches, diodes, and the DC path are stressed as they would be by a real machine.',
				'brand'       => $brand,
				'offers'      => $offer( $page_url ),
			),
			array(
				'@type'       => 'Product',
				'name'        => 'Impedyme HIL/RCP-Box',
				'category'    => 'Signal-Level Motor Emulation and Rapid Control Prototyping Platform',
				'description' => 'The Impedyme HIL/RCP-Box is a compact rapid control prototyping platform with a user-programmable UltraScale+ FPGA and dual-core ARM processor, closed-loop control rates up to 250 kHz, resolver and encoder interfaces, and CAN and CAN-FD connectivity. It is intended for early-stage controller development and signal-level motor emulation, letting engineers test unmodified controller hardware against high-fidelity real-time motor models before any power hardware is committed.',
				'brand'       => $brand,
				'offers'      => $offer( $page_url ),
			),
			array(
				'@type'     => 'Table',
				'name'      => 'Key Benefits of the Impedyme Motor Emulator',
				'about'     => 'Feature-benefit comparison table showing how the Impedyme Motor Emulator, the RCP box, and MotorSim Studio improve inverter hardware validation compared with passive R-L load testing.',
				'tableRows' => array(
					$table_row( 'Active, Programmable Emulation', 'Reproduce real motor voltage, current, and active power instead of reactive-only R-L loading' ),
					$table_row( 'Four-Quadrant Operation', 'Exercise the full motoring and regenerating torque and speed envelope for true-to-life inverter stress' ),
					$table_row( 'Active DC Path', 'Return power to the inverter DC side to replicate realistic power-flow behaviour and expose component vulnerabilities' ),
					$table_row( 'Signal-Level RCP Testing', 'Validate unmodified controller hardware early with no risk to physical components' ),
					$table_row( 'Fast UUT Commissioning', 'Only four parameters to define before testing begins' ),
					$table_row( 'On-the-Fly Parameter Changes', 'Adjust R, L, and other machine parameters with a mouse click during operation' ),
					$table_row( 'Minimum Facility Requirements', '5 kW AC connection, stand-alone liquid cooling, no external chiller or water hookup' ),
					$table_row( 'Unified Signal-to-Power Platform', 'One toolchain from control-logic validation to full-power validation, with full traceability' ),
				),
			),
		),
		'mainEntity'          => array(
			'@type'      => 'FAQPage',
			'mainEntity' => array(
				$question(
					'Can the Impedyme motor emulator be used for both low and high-power testing?',
					'Yes. The Impedyme motor emulator supports both signal-level testing, using the Real-Time Control Prototyping (RCP) box, and high-power hardware emulation with the CHP system. This flexible architecture allows engineers to streamline development from concept to production, using one unified motor emulation platform.'
				),
				$question(
					'What is a motor emulator?',
					'A motor emulator is an active, programmable power system that behaves electrically like a real electric machine, so an inverter can be tested without a physical motor, dynamometer, or test cell. Instead of the fixed reactive impedance of a passive R-L load bank, it draws and supplies the currents a real machine would draw at a given torque and speed, including the active power component. The Impedyme Motor Emulator does this across all four quadrants, which means it can emulate both motoring and regenerating operation and return power to the inverter DC side. Because the machine exists only as a real-time model, parameters such as resistance, inductance, pole count, and load profile can be changed in software rather than by swapping hardware, and fault or corner-case conditions that would damage a physical motor can be exercised safely.'
				),
				$question(
					'Why is passive R-L load testing not enough for inverter hardware validation?',
					'Early-stage inverter testing often depends on passive R-L loads, which introduce two key limitations when motor emulation is not used. The first is limited component stress: passive loads apply only reactive power to the inverter and fail to mimic real-world active power conditions, which prevents accurate testing of components such as diodes and switches and risks leaving vulnerabilities undetected. The second is an inactive DC path: passive R-L setups cannot return power to the inverter DC side, which limits the ability to replicate realistic power-flow behaviour. An active motor emulator removes both limitations by reproducing the real voltage, current, and bi-directional power flow of an electric machine, so the inverter hardware is exercised the way it will be in the vehicle.'
				),
				$question(
					'What is the Impedyme RCP box used for?',
					'Early-stage inverter development often involves high uncertainty. The Impedyme RCP box offers motor emulation at the signal level, allowing engineers to test unmodified controller hardware using high-fidelity real-time simulation without risking physical components. It is a compact rapid control prototyping platform built around a user-programmable UltraScale+ FPGA and a dual-core ARM processor, with closed-loop control rates up to 250 kHz, resolver and encoder interfaces, and CAN and CAN-FD connectivity. Because the controller under test is exercised through its real feedback and communication interfaces, control logic, position sensing, and fault handling can be validated long before any power hardware is committed, and the same models later scale to the CHP system for power-level testing.'
				),
				$question(
					'How does the Impedyme CHP motor emulator support power-level inverter testing?',
					'The Impedyme CHP motor emulator is an active, programmable system built for accurate inverter hardware testing. It delivers functional validation under real-world voltage and current conditions, offering a more realistic and detailed testing environment than conventional inductive setups. Four-quadrant mode enables full torque and speed operation, allowing active power testing under true-to-life conditions, and the regenerative power stage keeps the inverter DC path active so that switches, diodes, and DC-link components see representative stress. Commissioning a unit under test requires only four parameters to be defined, machine parameters such as R and L can be adjusted with a mouse click during operation, and facility requirements stay modest: only a 5 kW AC connection is needed for power, with no water connection for cooling, because the system is stand-alone liquid cooled without an external chiller.'
				),
				$question(
					'What is MotorSim Studio?',
					'MotorSim Studio is Impedyme electric motor simulation software, built specifically to configure, monitor, automate, and optimize real-time motor emulation. It is tightly integrated with Impedyme motor emulator hardware, which means the same models built in software are the models that run on the emulator during physical testing. MotorSim Studio delivers the high-fidelity motor and drive models that let the CHP Series stand in for the machine as a true electrical load, across machine types including permanent magnet synchronous machines, brushless DC motors, and induction machines, and across all four quadrants. Engineers use it to define machine and load parameters, adjust values such as resistance and inductance during operation, automate full test campaigns, and capture the measurement data that documents inverter performance.'
				),
				$question(
					'Why does motor emulation use FPGA-based real-time simulation?',
					'Modern traction inverters switch fast, so the emulated machine has to respond on the same timescale for the closed loop to stay stable and representative. FPGA technology enables ultra-fast, high-fidelity Hardware-in-the-Loop simulation by executing the motor model in hardware with deterministic, sub-microsecond-class latency rather than on a general-purpose processor. In the Impedyme platform, a user-programmable UltraScale+ FPGA supports closed-loop control rates up to 250 kHz, which allows the emulator to reproduce current ripple, switching-frequency effects, and fast transient behaviour that a slower simulation would smooth away. The result is a test environment where inverter control performance, current regulation, and protection behaviour can be trusted to match what the hardware will do when driving a real machine.'
				),
			),
		),
	);

	return array( $overview_article, $detail_article );
}

/**
 * Print the Motor Emulator JSON-LD in the site footer.
 *
 * @return void
 */
function impedyme_print_motor_emulator_schema() {
	static $printed = false;

	if ( $printed || ! is_page( IMPEDYME_MOTOR_EMULATOR_SLUG ) ) {
		return;
	}

	$printed = true;

	$json = wp_json_encode(
		array(
			'@context' => 'https://schema.org',
			'@graph'   => impedyme_motor_emulator_schema_graph(),
		),
		// UNESCAPED_SLASHES and UNESCAPED_UNICODE keep URLs and typography
		// readable; HEX_TAG keeps the payload from ever closing the
		// surrounding <script> element.
		JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG
	);

	if ( false === $json ) {
		return;
	}

	// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- wp_json_encode() output, escaped above.
	echo '<script type="application/ld+json">' . "\n" . $json . "\n" . '</script>' . "\n";
}
add_action( 'wp_footer', 'impedyme_print_motor_emulator_schema' );
