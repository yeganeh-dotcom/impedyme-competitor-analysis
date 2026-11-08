/**
 * Impedyme: JSON-LD schema for the Motor Emulator page only
 * https://impedyme.com/motor-emulator/
 *
 * Paste into a PHP snippet (Code Snippets or WPCode plugin) or at the end of the
 * child theme's functions.php. Do not add an opening <?php tag.
 */
add_action( 'wp_head', function () {
	// Only on the motor emulator page (works whether it is a page or a post).
	if ( ! is_page( 'motor-emulator' ) && ! is_single( 'motor-emulator' ) ) {
		return;
	}

	$schema = <<<'IMPEDYME_SCHEMA'
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://impedyme.com/#organization",
      "name": "Impedyme",
      "url": "https://impedyme.com/",
      "description": "Impedyme develops scalable hardware-in-the-loop (HIL), power hardware-in-the-loop (PHIL), real-time simulation, motor emulation and grid emulation systems for power electronics testing.",
      "knowsAbout": [
        "Motor emulation",
        "Inverter hardware testing",
        "Hardware-in-the-loop (HIL) simulation",
        "Power hardware-in-the-loop (PHIL) testing",
        "FPGA-based real-time simulation",
        "Real-Time Control Prototyping (RCP)",
        "Electric drivetrain testing"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://impedyme.com/#website",
      "url": "https://impedyme.com/",
      "name": "Impedyme",
      "inLanguage": "en-US",
      "publisher": { "@id": "https://impedyme.com/#organization" }
    },
    {
      "@type": "ItemPage",
      "@id": "https://impedyme.com/motor-emulator/",
      "url": "https://impedyme.com/motor-emulator/",
      "name": "Motor Emulator for Inverter Hardware Development",
      "description": "Impedyme's motor emulator replaces prototype motors and dynamometers in inverter testing, from signal-level tests with the RCP Box to power-level validation with the CHP Motor Emulator.",
      "inLanguage": "en-US",
      "isPartOf": { "@id": "https://impedyme.com/#website" },
      "publisher": { "@id": "https://impedyme.com/#organization" },
      "breadcrumb": { "@id": "https://impedyme.com/motor-emulator/#breadcrumb" },
      "mainEntity": { "@id": "https://impedyme.com/motor-emulator/#product" },
      "primaryImageOfPage": { "@id": "https://impedyme.com/wp-content/uploads/2025/08/motor-emulation-inverter-testing-impedyme.webp" },
      "image": [
        { "@id": "https://impedyme.com/wp-content/uploads/2025/08/motor-emulation-inverter-testing-impedyme.webp" },
        { "@id": "https://impedyme.com/wp-content/uploads/2025/06/signal-level-inverter-validation-with-impedyme-rcp-box-scaled.webp" },
        { "@id": "https://impedyme.com/wp-content/uploads/2025/06/Enabling-Ultra-Fast-High-Fidelity-HIL-with-FPGA-Technology-motor-emulator.webp" }
      ],
      "hasPart": { "@id": "https://impedyme.com/motor-emulator/#faq" },
      "about": [
        { "@id": "https://impedyme.com/motor-emulator/#product" },
        {
          "@type": "Thing",
          "name": "Power inverter",
          "description": "Inverter hardware is the core of an electric vehicle, handling DC/AC conversion, motor control and energy optimization."
        },
        { "@type": "Thing", "name": "Hardware-in-the-loop simulation" }
      ],
      "mentions": [
        { "@type": "Thing", "name": "Electric motor" },
        { "@type": "Thing", "name": "Dynamometer" },
        { "@type": "Thing", "name": "Regenerative braking" },
        { "@type": "Thing", "name": "Field-programmable gate array (FPGA)" },
        { "@type": "Thing", "name": "Electric vehicle" },
        { "@type": "Thing", "name": "eVTOL aircraft" },
        { "@id": "https://impedyme.com/#customer-nasa" },
        { "@id": "https://impedyme.com/#customer-jlg" },
        { "@id": "https://impedyme.com/#customer-duke-energy" },
        { "@id": "https://impedyme.com/#customer-exowatt" },
        { "@id": "https://impedyme.com/#customer-flex" },
        { "@id": "https://impedyme.com/#customer-lucid" },
        { "@id": "https://impedyme.com/#customer-unbox-robotics" }
      ],
      "significantLink": [
        "https://impedyme.com/hardware-in-the-loop/",
        "https://impedyme.com/resource-center/inverter-test/"
      ],
      "relatedLink": "https://impedyme.com/motor-emulator-video/",
      "keywords": "motor emulator, motor emulation, inverter hardware development, motor simulator, motor simulation, electric motor emulator, e-motor emulator, e motor emulator"
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://impedyme.com/motor-emulator/#breadcrumb",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://impedyme.com/" },
        { "@type": "ListItem", "position": 2, "name": "Motor Emulator", "item": "https://impedyme.com/motor-emulator/" }
      ]
    },
    {
      "@type": "ImageObject",
      "@id": "https://impedyme.com/wp-content/uploads/2025/08/motor-emulation-inverter-testing-impedyme.webp",
      "url": "https://impedyme.com/wp-content/uploads/2025/08/motor-emulation-inverter-testing-impedyme.webp",
      "contentUrl": "https://impedyme.com/wp-content/uploads/2025/08/motor-emulation-inverter-testing-impedyme.webp",
      "caption": "Motor emulation for inverter testing with the Impedyme Motor Emulator",
      "encodingFormat": "image/webp",
      "representativeOfPage": true,
      "creator": { "@id": "https://impedyme.com/#organization" },
      "creditText": "Impedyme",
      "copyrightNotice": "© Impedyme"
    },
    {
      "@type": "ImageObject",
      "@id": "https://impedyme.com/wp-content/uploads/2025/06/signal-level-inverter-validation-with-impedyme-rcp-box-scaled.webp",
      "url": "https://impedyme.com/wp-content/uploads/2025/06/signal-level-inverter-validation-with-impedyme-rcp-box-scaled.webp",
      "contentUrl": "https://impedyme.com/wp-content/uploads/2025/06/signal-level-inverter-validation-with-impedyme-rcp-box-scaled.webp",
      "caption": "Signal-level inverter validation with the Impedyme RCP Box",
      "encodingFormat": "image/webp",
      "creator": { "@id": "https://impedyme.com/#organization" },
      "creditText": "Impedyme",
      "copyrightNotice": "© Impedyme"
    },
    {
      "@type": "ImageObject",
      "@id": "https://impedyme.com/wp-content/uploads/2025/06/Enabling-Ultra-Fast-High-Fidelity-HIL-with-FPGA-Technology-motor-emulator.webp",
      "url": "https://impedyme.com/wp-content/uploads/2025/06/Enabling-Ultra-Fast-High-Fidelity-HIL-with-FPGA-Technology-motor-emulator.webp",
      "contentUrl": "https://impedyme.com/wp-content/uploads/2025/06/Enabling-Ultra-Fast-High-Fidelity-HIL-with-FPGA-Technology-motor-emulator.webp",
      "caption": "Enabling ultra-fast, high-fidelity HIL with FPGA technology: the Impedyme Motor Emulator",
      "encodingFormat": "image/webp",
      "creator": { "@id": "https://impedyme.com/#organization" },
      "creditText": "Impedyme",
      "copyrightNotice": "© Impedyme"
    },
    {
      "@type": "Brand",
      "@id": "https://impedyme.com/#brand",
      "name": "Impedyme"
    },
    {
      "@type": "Product",
      "@id": "https://impedyme.com/motor-emulator/#product",
      "name": "Impedyme Motor Emulator",
      "alternateName": "Impedyme Motor Emulation Platform",
      "url": "https://impedyme.com/motor-emulator/",
      "mainEntityOfPage": { "@id": "https://impedyme.com/motor-emulator/" },
      "disambiguatingDescription": "Motor emulator that replaces prototype motors and dynamometers in inverter testing for electric vehicles and electrified mobility, from signal level (Impedyme RCP Box) to power level (Impedyme CHP Motor Emulator).",
      "description": "The Impedyme Motor Emulator is a hardware-in-the-loop (HIL) and power hardware-in-the-loop (PHIL) motor emulator for testing and validating inverter hardware for electric vehicles and electrified mobility. Impedyme designed it to replace prototype motors and dynamometers during inverter development, so engineers can validate inverter hardware earlier, more safely and at lower cost. The Impedyme Motor Emulator reproduces the electrical behavior of an electric motor at the inverter's terminals: an FPGA-based real-time motor model calculates the current a real motor would draw at each instant, and a power stage forces that current. The inverter under test runs as if it were driving a real motor, with back-EMF, inductance, and changing speed and load, but nothing on the test bench rotates. The platform supports two test levels. At signal level, the Impedyme RCP Box tests unmodified controller hardware against a real-time motor model without any high voltage on the bench. At power level, the Impedyme CHP Motor Emulator validates inverter hardware under real-world voltage and current. Motor models and test cases carry over from one level to the next, so the test history stays connected from concept to production. Unlike passive R-L loads, which apply only reactive power and cannot return power to the inverter's DC side, the Impedyme Motor Emulator runs in four quadrants across the full torque-speed range. It applies active power to the inverter, returns power to the inverter's DC side for regenerative braking tests, and stresses diodes and switches the way they will be stressed in service, so weak points show up long before the hardware reaches a vehicle. Testing starts once four parameters are defined, values such as R and L can be changed while the system is running, and the system needs only a 5 kW AC supply and no water connection because it is stand-alone and liquid cooled with no external chiller. By replacing passive loads and reducing reliance on dynamometers, teams can start testing earlier, test more scenarios and find problems while they are still easy to fix.",
      "category": "Test & Measurement > Hardware-in-the-Loop (HIL) Test Systems > Motor Emulators",
      "brand": { "@id": "https://impedyme.com/#brand" },
      "manufacturer": { "@id": "https://impedyme.com/#organization" },
      "image": [
        { "@id": "https://impedyme.com/wp-content/uploads/2025/08/motor-emulation-inverter-testing-impedyme.webp" },
        { "@id": "https://impedyme.com/wp-content/uploads/2025/06/Enabling-Ultra-Fast-High-Fidelity-HIL-with-FPGA-Technology-motor-emulator.webp" },
        { "@id": "https://impedyme.com/wp-content/uploads/2025/06/signal-level-inverter-validation-with-impedyme-rcp-box-scaled.webp" }
      ],
      "audience": [
        { "@type": "BusinessAudience", "audienceType": "EV traction inverter developers", "description": "Validating drive inverters across the full vehicle operating range" },
        { "@type": "BusinessAudience", "audienceType": "Industrial drive manufacturers", "description": "Testing variable-speed drives against different motor designs" },
        { "@type": "BusinessAudience", "audienceType": "eVTOL and electric aircraft teams", "description": "Validating propulsion inverters where safety margins are critical" },
        { "@type": "BusinessAudience", "audienceType": "Tier-1 suppliers and test labs", "description": "Repeatable, high-throughput validation for multiple customer programs" }
      ],
      "additionalProperty": [
        { "@type": "PropertyValue", "name": "Test levels", "value": "Signal level with the Impedyme RCP Box (no high voltage on the bench) and power level with the Impedyme CHP Motor Emulator, on one platform" },
        { "@type": "PropertyValue", "name": "Real-time motor model", "value": "FPGA-based model that calculates the current a real motor would draw at each instant; a power stage forces that current" },
        { "@type": "PropertyValue", "name": "Emulated motor behavior", "value": "Back-EMF, inductance, and changing speed and load, with no rotating parts on the test bench" },
        { "@type": "PropertyValue", "name": "Operating mode", "value": "Four-quadrant operation (motoring and generating) across the full torque-speed range" },
        { "@type": "PropertyValue", "name": "Regenerative braking testing", "value": "Power flows back to the inverter's DC side, as during regenerative braking in a real vehicle" },
        { "@type": "PropertyValue", "name": "Device under test", "value": "Unmodified controller and inverter hardware; the emulator supplies the electrical behavior and feedback signals of a real motor" },
        { "@type": "PropertyValue", "name": "Fault testing", "value": "Faults can be introduced with no risk to a motor or dynamometer; fault handling can be tested first at signal level with no high voltage present" },
        { "@type": "PropertyValue", "name": "UUT commissioning", "value": "Testing starts once four parameters are defined" },
        { "@type": "PropertyValue", "name": "Live parameter adjustment", "value": "Values such as R and L can be changed with a mouse click while the system is running" },
        { "@type": "PropertyValue", "name": "Facility power connection", "value": 5, "unitCode": "KWT", "unitText": "kW AC" },
        { "@type": "PropertyValue", "name": "Cooling", "value": "Stand-alone liquid cooling; no water connection or external chiller required" },
        { "@type": "PropertyValue", "name": "Test continuity", "value": "Motor models and test cases carry over from signal level to power level, keeping test history connected from concept to production" },
        { "@type": "PropertyValue", "name": "Advantage over passive R-L loads", "value": "Passive R-L loads cause limited component stress (reactive power only, so diodes and switches are not tested under real active power) and an inactive DC path (no power returned to the inverter's DC side); the motor emulator applies active power and returns power to the DC side" },
        { "@type": "PropertyValue", "name": "Replaces", "value": "Prototype motors, dynamometers and passive R-L loads during inverter development" }
      ],
      "isRelatedTo": [
        {
          "@type": "Product",
          "@id": "https://impedyme.com/motor-emulator/#chp-motor-emulator",
          "name": "Impedyme CHP Motor Emulator",
          "description": "The Impedyme CHP Motor Emulator is an active, programmable power-level motor emulator for inverter hardware testing. It validates inverter hardware under real-world voltage and current, giving a more realistic and detailed test environment than conventional inductive (passive R-L) setups for modern electric drivetrains. It operates in four quadrants, emulating both motoring and generating conditions, so power flows back to the inverter's DC side as it would during regenerative braking. It needs only a 5 kW AC connection and no water connection, because it is a stand-alone liquid-cooled system with no external chiller.",
          "category": "Power-level motor emulator",
          "brand": { "@id": "https://impedyme.com/#brand" },
          "manufacturer": { "@id": "https://impedyme.com/#organization" }
        },
        {
          "@type": "Product",
          "@id": "https://impedyme.com/motor-emulator/#rcp-box",
          "name": "Impedyme RCP Box",
          "alternateName": "Impedyme Real-Time Control Prototyping (RCP) Box",
          "description": "The Impedyme RCP Box provides low-power, signal-level motor emulation for early-stage inverter development. It tests unmodified controller hardware against a high-fidelity real-time motor model with no high voltage on the bench, so testing can start as soon as controller hardware is available, long before the power stage or a prototype motor exists. Fault handling can be tested safely at signal level before moving to power-level tests with the Impedyme CHP Motor Emulator.",
          "category": "Signal-level motor emulator / Real-Time Control Prototyping (RCP)",
          "image": { "@id": "https://impedyme.com/wp-content/uploads/2025/06/signal-level-inverter-validation-with-impedyme-rcp-box-scaled.webp" },
          "brand": { "@id": "https://impedyme.com/#brand" },
          "manufacturer": { "@id": "https://impedyme.com/#organization" }
        }
      ],
      "subjectOf": { "@id": "https://impedyme.com/motor-emulator/#faq" }
    },
    {
      "@type": "FAQPage",
      "@id": "https://impedyme.com/motor-emulator/#faq",
      "isPartOf": { "@id": "https://impedyme.com/motor-emulator/" },
      "about": { "@id": "https://impedyme.com/motor-emulator/#product" },
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is a motor emulator?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A motor emulator is a power electronics system that reproduces the electrical behavior of an electric motor at the inverter's terminals. A real-time motor model calculates the current a real motor would draw, and the emulator's power stage forces that current, so the inverter behaves as if it were driving a real machine with no rotating parts on the bench."
          }
        },
        {
          "@type": "Question",
          "name": "How is a motor emulator different from a dynamometer?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A dynamometer tests the inverter with a real motor connected to a mechanical load. A motor emulator reproduces the motor electrically, so no prototype motor, shaft or mechanical load is needed. This makes it faster to set up, safer for fault testing, and much easier to switch between different motor designs."
          }
        },
        {
          "@type": "Question",
          "name": "Can the Impedyme motor emulator be used for both low and high-power testing?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. The Impedyme motor emulator supports both signal-level testing, using the RCP box, and high-power hardware emulation with the CHP system. This flexible architecture allows engineers to streamline development from concept to production on one unified motor emulation platform."
          }
        },
        {
          "@type": "Question",
          "name": "Do I need to modify my inverter or controller to use the motor emulator?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. The motor emulator is designed to test unmodified controller and inverter hardware. The emulator provides the electrical behavior and feedback signals a real motor would, so your hardware and control software run exactly as they would in the final application."
          }
        },
        {
          "@type": "Question",
          "name": "What facilities are needed to install the CHP motor emulator?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Facility requirements are minimal. The CHP motor emulator needs only a 5 kW AC connection for power and no water connection, because it is a stand-alone liquid-cooled system that does not require an external chiller."
          }
        },
        {
          "@type": "Question",
          "name": "Can a motor emulator test regenerative braking?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. The CHP motor emulator operates in four quadrants, so it can emulate both motoring and generating conditions. Power flows back to the inverter's DC side just as it would during regenerative braking in a real vehicle."
          }
        },
        {
          "@type": "Question",
          "name": "Is it safe to test fault conditions with a motor emulator?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Because there are no rotating parts, faults can be introduced without the risk of damaging a motor or a dynamometer. You can also test fault handling first at signal level with the RCP box, where no high voltage is present, before moving to power-level tests."
          }
        },
        {
          "@type": "Question",
          "name": "When should motor emulation start in the development cycle?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "As early as possible. Signal-level emulation with the RCP box can begin as soon as controller hardware is available, long before the power stage or a prototype motor exists. Testing can then scale to power level with the CHP motor emulator once the inverter hardware is ready."
          }
        }
      ]
    },
    {
      "@type": "ItemList",
      "@id": "https://impedyme.com/motor-emulator/#customers",
      "name": "Organizations that have used the Impedyme Motor Emulator",
      "description": "Engineering teams at NASA, JLG Industries, Duke Energy, Exowatt, Flex, Lucid Motors and Unbox Robotics use Impedyme real-time test platforms, including the Impedyme Motor Emulator. They span aerospace, automotive, energy, industrial equipment, manufacturing and robotics.",
      "numberOfItems": 7,
      "itemListOrder": "https://schema.org/ItemListUnordered",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "NASA",
          "item": {
            "@type": "GovernmentOrganization",
            "@id": "https://impedyme.com/#customer-nasa",
            "name": "NASA",
            "alternateName": "National Aeronautics and Space Administration",
            "url": "https://www.nasa.gov/"
          }
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "JLG Industries",
          "item": {
            "@type": "Organization",
            "@id": "https://impedyme.com/#customer-jlg",
            "name": "JLG Industries",
            "alternateName": "JLG",
            "url": "https://www.jlg.com/"
          }
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Duke Energy",
          "item": {
            "@type": "Organization",
            "@id": "https://impedyme.com/#customer-duke-energy",
            "name": "Duke Energy",
            "url": "https://www.duke-energy.com/"
          }
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": "Exowatt",
          "item": {
            "@type": "Organization",
            "@id": "https://impedyme.com/#customer-exowatt",
            "name": "Exowatt",
            "url": "https://exowatt.com/"
          }
        },
        {
          "@type": "ListItem",
          "position": 5,
          "name": "Flex",
          "item": {
            "@type": "Organization",
            "@id": "https://impedyme.com/#customer-flex",
            "name": "Flex",
            "legalName": "Flex Ltd.",
            "url": "https://flex.com/"
          }
        },
        {
          "@type": "ListItem",
          "position": 6,
          "name": "Lucid Motors",
          "item": {
            "@type": "Organization",
            "@id": "https://impedyme.com/#customer-lucid",
            "name": "Lucid Motors",
            "alternateName": ["Lucid", "Lucid Group"],
            "url": "https://www.lucidmotors.com/"
          }
        },
        {
          "@type": "ListItem",
          "position": 7,
          "name": "Unbox Robotics",
          "item": {
            "@type": "Organization",
            "@id": "https://impedyme.com/#customer-unbox-robotics",
            "name": "Unbox Robotics",
            "url": "https://unboxrobotics.com/"
          }
        }
      ]
    }
  ]
}
IMPEDYME_SCHEMA;

	// If an edit breaks the JSON, print nothing but this comment, so Google never sees invalid markup.
	if ( null === json_decode( $schema ) ) {
		echo "\n<!-- Motor emulator schema skipped: the JSON is invalid. -->\n";
		return;
	}

	echo "\n<script type=\"application/ld+json\">\n" . $schema . "\n</script>\n";
} );
