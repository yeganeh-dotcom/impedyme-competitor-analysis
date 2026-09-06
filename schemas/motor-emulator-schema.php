<?php
/**
 * JSON-LD structured data for the Impedyme Motor Emulator page.
 * Mirrors the structure used by the Grid Emulator schema.
 *
 * BEFORE GOING LIVE, REPLACE:
 *   1. Every image URL containing "REPLACE-" with the real
 *      https://impedyme.com/wp-content/uploads/... URL from the page.
 *   2. "datePublished" with the page's actual original publish date.
 *   3. Confirm the page slug in is_page() below is 'motor-emulator'.
 *   4. Confirm the RCP-Box specs (FPGA, 250 kHz, interfaces) match the datasheet.
 *   5. Keep only the FAQ entries whose question AND answer text is visibly
 *      present on the page - Google requires FAQPage markup to match
 *      on-page content. Delete or add visible copy for the rest.
 */

add_action('wp_footer', function() {
    // Only output schema on the Motor Emulator page
    if (is_page('motor-emulator')) :
?>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "TechArticle",
      "@id": "https://impedyme.com/motor-emulator/#techarticle-overview",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "https://impedyme.com/motor-emulator/"
      },
      "headline": "Impedyme Motor Emulator (CHP and RCP Series) – Real-Time Motor Emulation for Inverter Hardware Development",
      "alternativeHeadline": "CHP and RCP Series: Motor Emulation from Signal Level to Full Power.",
      "description": "The Impedyme Motor Emulator is an active, programmable motor emulation platform built for inverter hardware development and traction inverter validation. Unlike passive R-L load banks, which apply only reactive power and cannot return energy to the inverter DC side, it reproduces the real voltage, current, and active power behaviour of an electrical machine across all four quadrants. Signal-level validation with the Impedyme RCP box and power-level validation with the CHP Series run within one unified platform, from early controller development through to production release.",
      "author": {
        "@type": "Organization",
        "name": "Impedyme",
        "url": "https://impedyme.com"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Impedyme"
      },
      "image": [
        {
          "@type": "ImageObject",
          "url": "https://impedyme.com/wp-content/uploads/REPLACE-motor-emulator-header.webp",
          "caption": "Impedyme Motor Emulator for inverter hardware development. The platform reproduces real machine behaviour so engineers can validate traction inverters and power electronics under realistic torque, speed, and power-flow conditions."
        },
        {
          "@type": "ImageObject",
          "url": "https://impedyme.com/wp-content/uploads/REPLACE-passive-rl-load-limitations.webp",
          "caption": "Why passive R-L load testing falls short. Passive loads apply only reactive power to the inverter and cannot return power to the DC side, leaving switches, diodes, and the DC path untested under realistic active-power stress."
        },
        {
          "@type": "ImageObject",
          "url": "https://impedyme.com/wp-content/uploads/REPLACE-chp-motor-emulator-power-level.webp",
          "caption": "Power-level testing with the Impedyme CHP Motor Emulator. The active, programmable system delivers functional inverter validation under real-world voltage and current conditions, offering a more realistic test environment than conventional inductive setups."
        },
        {
          "@type": "ImageObject",
          "url": "https://impedyme.com/wp-content/uploads/REPLACE-signal-level-inverter-validation-rcp-box.webp",
          "caption": "Signal-level inverter validation with the Impedyme RCP box. Unmodified controller hardware is tested against high-fidelity real-time motor models, removing the risk to physical components during early-stage inverter development."
        },
        {
          "@type": "ImageObject",
          "url": "https://impedyme.com/wp-content/uploads/REPLACE-motor-emulator-signal-to-power.webp",
          "caption": "Motor emulator testing platform from signal to power. Impedyme integrated RCP and CHP systems let engineers validate control logic at the signal level and scale seamlessly to high-power testing within one unified platform, with full traceability across the development cycle."
        },
        {
          "@type": "ImageObject",
          "url": "https://impedyme.com/wp-content/uploads/REPLACE-fpga-high-fidelity-hil-motor-emulator.webp",
          "caption": "Enabling ultra-fast, high-fidelity HIL with FPGA technology. FPGA-based real-time simulation delivers the low-latency, high-bandwidth motor models required for closed-loop emulation of fast-switching traction inverters."
        }
      ],
      "url": "https://impedyme.com/motor-emulator/",
      "hasPart": [
        {
          "@type": "SoftwareApplication",
          "name": "MotorSim Studio",
          "applicationCategory": "Testing Software",
          "description": "MotorSim Studio is Impedyme electric motor simulation software for configuring, monitoring, automating, and optimizing real-time motor emulation. It supplies the high-fidelity machine and drive models – PMSM, BLDC, and induction machine – that let the CHP Series stand in for a physical motor as a true electrical load across all four quadrants. Machine parameters such as resistance and inductance can be adjusted during operation, UUT commissioning requires only four parameters to be defined, and the same models built in software are the models that run on the emulator during physical testing. Test campaigns can be automated and results captured for repeatable, traceable inverter validation.",
          "brand": {
            "@type": "Brand",
            "name": "Impedyme"
          },
          "offers": {
            "@type": "Offer",
            "url": "https://impedyme.com/electric-motor-simulation-software/",
            "availability": "https://schema.org/InStock",
            "seller": {
              "@type": "Organization",
              "name": "Impedyme Inc."
            }
          }
        },
        {
          "@type": "SoftwareApplication",
          "name": "PowerHIL Studio",
          "applicationCategory": "Testing Software",
          "description": "PowerHIL Studio is the real-time simulation environment that hosts Impedyme emulation applications, including the Motor Emulator app mode alongside Grid Emulator, Battery Emulator, and Impedance Analyzer. It configures the hardware, selects how and where models execute, launches the purpose-built emulation application, automates entire test campaigns, and captures the measurement data that proves a design works.",
          "brand": {
            "@type": "Brand",
            "name": "Impedyme"
          },
          "offers": {
            "@type": "Offer",
            "url": "https://impedyme.com/powerhil-studio/",
            "availability": "https://schema.org/InStock",
            "seller": {
              "@type": "Organization",
              "name": "Impedyme Inc."
            }
          }
        }
      ]
    },
    {
      "@type": "TechArticle",
      "@id": "https://impedyme.com/motor-emulator/#techarticle-details",
      "headline": "Impedyme Motor Emulator (CHP and RCP Series): Four-Quadrant Motor Emulation for Traction Inverter Testing",
      "alternativeHeadline": "Signal-Level and Power-Level Motor Emulation with FPGA-Based HIL",
      "image": "https://impedyme.com/wp-content/uploads/REPLACE-motor-emulator-header.webp",
      "url": "https://impedyme.com/motor-emulator/",
      "publisher": {
        "@type": "Organization",
        "name": "Impedyme"
      },
      "datePublished": "2026-09-06",
      "dateModified": "2026-09-06",
      "about": [
        "Motor Emulator",
        "Motor Emulation",
        "Motor Simulator",
        "MotorSim Studio",
        "Impedyme Motor Emulator",
        "Inverter Hardware Development",
        "Traction Inverter Testing",
        "Power Hardware in the Loop",
        "Hardware in the Loop",
        "Rapid Control Prototyping",
        "Four-Quadrant Motor Emulation",
        "PMSM and BLDC Emulation",
        "EV Powertrain Validation"
      ],
      "articleSection": [
        "Why Early-Stage Inverter Hardware Design Needs Motor Emulation",
        "Power-Level Testing with the Impedyme CHP Motor Emulator",
        "Low-Power Signal-Level Motor Emulation Using the RCP Box",
        "Key Features",
        "Motor Emulator Testing Platform from Signal to Power",
        "FPGA-Based Ultra-Fast, High-Fidelity HIL",
        "Key Benefits Table",
        "Applications"
      ],
      "keywords": [
        "motor emulator",
        "motor emulation",
        "motor simulator",
        "MotorSim Studio",
        "Impedyme motor emulator",
        "inverter hardware development",
        "traction inverter testing",
        "power hardware in the loop",
        "hardware in the loop",
        "rapid control prototyping",
        "four-quadrant motor emulation",
        "PMSM emulation",
        "BLDC motor emulator",
        "EV powertrain validation"
      ],
      "hasPart": [
        {
          "@type": "ItemList",
          "name": "Key Features of the Impedyme Motor Emulator",
          "description": "Core capabilities of the Impedyme motor emulation platform across the RCP signal-level box and the CHP power-level system.",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Fast UUT Commissioning",
              "description": "Easy test setup with only four parameters needing definition to begin the testing process, so a unit under test can be brought online quickly without lengthy configuration."
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Rapid Parameter Adjustment",
              "description": "Easily and quickly adjust several machine parameters, such as R and L, via a simple mouse click during operation, enabling sweeps and what-if studies without stopping the test."
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": "Minimum Facility Requirements",
              "description": "Only a 5 kW AC connection is needed for power and no water connection is required for cooling, as the system is stand-alone liquid cooled without an external chiller."
            },
            {
              "@type": "ListItem",
              "position": 4,
              "name": "Realistic Power Emulation",
              "description": "Four-quadrant mode enables full torque and speed operation, allowing active power testing under true-to-life conditions rather than the reactive-only loading of a passive R-L bank."
            },
            {
              "@type": "ListItem",
              "position": 5,
              "name": "Signal-Level Emulation with the RCP Box",
              "description": "The Impedyme RCP box offers motor emulation at the signal level, allowing unmodified controller hardware to be tested using high-fidelity real-time simulation without risking physical components."
            },
            {
              "@type": "ListItem",
              "position": 6,
              "name": "Motor Emulator Testing Platform from Signal to Power",
              "description": "With Impedyme integrated RCP and CHP systems, engineers can validate control logic at the signal level and scale seamlessly to high-power testing, all within one unified platform, ensuring full traceability and uncompromised performance throughout the development cycle."
            },
            {
              "@type": "ListItem",
              "position": 7,
              "name": "Ultra-Fast, High-Fidelity HIL with FPGA Technology",
              "description": "FPGA-based real-time simulation provides the low latency and high update rates required to close the loop around fast-switching traction inverters with high model fidelity."
            }
          ]
        },
        {
          "@type": "Product",
          "name": "Impedyme CHP Series Motor Emulator",
          "category": "Power-Level Motor Emulation System",
          "description": "The Impedyme CHP motor emulator is an active, programmable system built for accurate inverter hardware testing. It delivers functional validation under real-world voltage and current conditions, offering a more realistic and detailed testing environment than conventional inductive setups. Four-quadrant operation covers the full torque and speed envelope, and the regenerative power stage returns energy to the inverter DC side so that switches, diodes, and the DC path are stressed as they would be by a real machine.",
          "brand": {
            "@type": "Brand",
            "name": "Impedyme"
          },
          "offers": {
            "@type": "Offer",
            "url": "https://impedyme.com/motor-emulator/",
            "availability": "https://schema.org/InStock",
            "seller": {
              "@type": "Organization",
              "name": "Impedyme Inc."
            }
          }
        },
        {
          "@type": "Product",
          "name": "Impedyme HIL/RCP-Box",
          "category": "Signal-Level Motor Emulation and Rapid Control Prototyping Platform",
          "description": "The Impedyme HIL/RCP-Box is a compact rapid control prototyping platform with a user-programmable UltraScale+ FPGA and dual-core ARM processor, closed-loop control rates up to 250 kHz, resolver and encoder interfaces, and CAN and CAN-FD connectivity. It is intended for early-stage controller development and signal-level motor emulation, letting engineers test unmodified controller hardware against high-fidelity real-time motor models before any power hardware is committed.",
          "brand": {
            "@type": "Brand",
            "name": "Impedyme"
          },
          "offers": {
            "@type": "Offer",
            "url": "https://impedyme.com/motor-emulator/",
            "availability": "https://schema.org/InStock",
            "seller": {
              "@type": "Organization",
              "name": "Impedyme Inc."
            }
          }
        },
        {
          "@type": "Table",
          "name": "Key Benefits of the Impedyme Motor Emulator",
          "about": "Feature-benefit comparison table showing how the Impedyme Motor Emulator, the RCP box, and MotorSim Studio improve inverter hardware validation compared with passive R-L load testing.",
          "tableRows": [
            { "@type": "TableRow", "name": "Active, Programmable Emulation", "row": ["Reproduce real motor voltage, current, and active power instead of reactive-only R-L loading"] },
            { "@type": "TableRow", "name": "Four-Quadrant Operation", "row": ["Exercise the full motoring and regenerating torque and speed envelope for true-to-life inverter stress"] },
            { "@type": "TableRow", "name": "Active DC Path", "row": ["Return power to the inverter DC side to replicate realistic power-flow behaviour and expose component vulnerabilities"] },
            { "@type": "TableRow", "name": "Signal-Level RCP Testing", "row": ["Validate unmodified controller hardware early with no risk to physical components"] },
            { "@type": "TableRow", "name": "Fast UUT Commissioning", "row": ["Only four parameters to define before testing begins"] },
            { "@type": "TableRow", "name": "On-the-Fly Parameter Changes", "row": ["Adjust R, L, and other machine parameters with a mouse click during operation"] },
            { "@type": "TableRow", "name": "Minimum Facility Requirements", "row": ["5 kW AC connection, stand-alone liquid cooling, no external chiller or water hookup"] },
            { "@type": "TableRow", "name": "Unified Signal-to-Power Platform", "row": ["One toolchain from control-logic validation to full-power validation, with full traceability"] }
          ]
        }
      ],
      "mainEntity": {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Can the Impedyme motor emulator be used for both low and high-power testing?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. The Impedyme motor emulator supports both signal-level testing, using the Real-Time Control Prototyping (RCP) box, and high-power hardware emulation with the CHP system. This flexible architecture allows engineers to streamline development from concept to production, using one unified motor emulation platform."
            }
          },
          {
            "@type": "Question",
            "name": "What is a motor emulator?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "A motor emulator is an active, programmable power system that behaves electrically like a real electric machine, so an inverter can be tested without a physical motor, dynamometer, or test cell. Instead of the fixed reactive impedance of a passive R-L load bank, it draws and supplies the currents a real machine would draw at a given torque and speed, including the active power component. The Impedyme Motor Emulator does this across all four quadrants, which means it can emulate both motoring and regenerating operation and return power to the inverter DC side. Because the machine exists only as a real-time model, parameters such as resistance, inductance, pole count, and load profile can be changed in software rather than by swapping hardware, and fault or corner-case conditions that would damage a physical motor can be exercised safely."
            }
          },
          {
            "@type": "Question",
            "name": "Why is passive R-L load testing not enough for inverter hardware validation?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Early-stage inverter testing often depends on passive R-L loads, which introduce two key limitations when motor emulation is not used. The first is limited component stress: passive loads apply only reactive power to the inverter and fail to mimic real-world active power conditions, which prevents accurate testing of components such as diodes and switches and risks leaving vulnerabilities undetected. The second is an inactive DC path: passive R-L setups cannot return power to the inverter DC side, which limits the ability to replicate realistic power-flow behaviour. An active motor emulator removes both limitations by reproducing the real voltage, current, and bi-directional power flow of an electric machine, so the inverter hardware is exercised the way it will be in the vehicle."
            }
          },
          {
            "@type": "Question",
            "name": "What is the Impedyme RCP box used for?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Early-stage inverter development often involves high uncertainty. The Impedyme RCP box offers motor emulation at the signal level, allowing engineers to test unmodified controller hardware using high-fidelity real-time simulation without risking physical components. It is a compact rapid control prototyping platform built around a user-programmable UltraScale+ FPGA and a dual-core ARM processor, with closed-loop control rates up to 250 kHz, resolver and encoder interfaces, and CAN and CAN-FD connectivity. Because the controller under test is exercised through its real feedback and communication interfaces, control logic, position sensing, and fault handling can be validated long before any power hardware is committed, and the same models later scale to the CHP system for power-level testing."
            }
          },
          {
            "@type": "Question",
            "name": "How does the Impedyme CHP motor emulator support power-level inverter testing?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The Impedyme CHP motor emulator is an active, programmable system built for accurate inverter hardware testing. It delivers functional validation under real-world voltage and current conditions, offering a more realistic and detailed testing environment than conventional inductive setups. Four-quadrant mode enables full torque and speed operation, allowing active power testing under true-to-life conditions, and the regenerative power stage keeps the inverter DC path active so that switches, diodes, and DC-link components see representative stress. Commissioning a unit under test requires only four parameters to be defined, machine parameters such as R and L can be adjusted with a mouse click during operation, and facility requirements stay modest: only a 5 kW AC connection is needed for power, with no water connection for cooling, because the system is stand-alone liquid cooled without an external chiller."
            }
          },
          {
            "@type": "Question",
            "name": "What is MotorSim Studio?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "MotorSim Studio is Impedyme electric motor simulation software, built specifically to configure, monitor, automate, and optimize real-time motor emulation. It is tightly integrated with Impedyme motor emulator hardware, which means the same models built in software are the models that run on the emulator during physical testing. MotorSim Studio delivers the high-fidelity motor and drive models that let the CHP Series stand in for the machine as a true electrical load, across machine types including permanent magnet synchronous machines, brushless DC motors, and induction machines, and across all four quadrants. Engineers use it to define machine and load parameters, adjust values such as resistance and inductance during operation, automate full test campaigns, and capture the measurement data that documents inverter performance."
            }
          },
          {
            "@type": "Question",
            "name": "Why does motor emulation use FPGA-based real-time simulation?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Modern traction inverters switch fast, so the emulated machine has to respond on the same timescale for the closed loop to stay stable and representative. FPGA technology enables ultra-fast, high-fidelity Hardware-in-the-Loop simulation by executing the motor model in hardware with deterministic, sub-microsecond-class latency rather than on a general-purpose processor. In the Impedyme platform, a user-programmable UltraScale+ FPGA supports closed-loop control rates up to 250 kHz, which allows the emulator to reproduce current ripple, switching-frequency effects, and fast transient behaviour that a slower simulation would smooth away. The result is a test environment where inverter control performance, current regulation, and protection behaviour can be trusted to match what the hardware will do when driving a real machine."
            }
          }
        ]
      }
    }
  ]
}
</script>
<?php
    endif;
});
