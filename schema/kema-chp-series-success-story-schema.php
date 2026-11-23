<?php
/**
 * KEMA Labs (CHP Series grid emulation) success story — JSON-LD schema.
 * Prints only on the page set in $page_url below (no other URL).
 * Install: add to the child theme's functions.php or the Code Snippets plugin
 * (run everywhere / front-end). Do not include the opening "<?php" twice.
 */
add_action( 'wp_head', 'impedyme_kema_chp_series_success_story_schema', 5 );

function impedyme_kema_chp_series_success_story_schema() {
	// ---- Edit these if the live page or image addresses differ. ----
	$page_url       = 'https://impedyme.com/success-stories/kema-lab-chp-series/';
	$img_story      = 'https://impedyme.com/wp-content/uploads/2026/11/success-story-kema-lab.webp';
	$img_desktop    = 'https://impedyme.com/wp-content/uploads/2026/11/kema-lab-header-desktop.webp';
	$img_mobile     = 'https://impedyme.com/wp-content/uploads/2026/11/kema-lab-header-mobile.webp';
	$date_published = '2026-11-19';
	// -----------------------------------------------------------------

	if ( is_admin() || is_feed() || is_404() ) {
		return;
	}

	// Only the page above (with or without trailing slash, any query string).
	$want_path = untrailingslashit( strtolower( (string) wp_parse_url( $page_url, PHP_URL_PATH ) ) );
	$path      = isset( $_SERVER['REQUEST_URI'] ) ? wp_parse_url( wp_unslash( $_SERVER['REQUEST_URI'] ), PHP_URL_PATH ) : '';
	$host      = isset( $_SERVER['HTTP_HOST'] ) ? strtolower( preg_replace( '/^www\./', '', wp_unslash( $_SERVER['HTTP_HOST'] ) ) ) : '';
	if ( 'impedyme.com' !== $host || $want_path !== untrailingslashit( strtolower( (string) $path ) ) ) {
		return;
	}

	$schema = <<<'JSONLD'
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://impedyme.com/#organization",
      "name": "Impedyme",
      "legalName": "Impedyme Inc.",
      "url": "https://impedyme.com/",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Vienna",
        "addressRegion": "VA",
        "addressCountry": "US"
      },
      "description": "Impedyme builds regenerative Power Hardware-in-the-Loop (Power HIL) testbenches, motor emulators, grid emulators and real-time load emulators for power-electronics development and validation."
    },
    {
      "@type": "WebSite",
      "@id": "https://impedyme.com/#website",
      "url": "https://impedyme.com/",
      "name": "Impedyme",
      "publisher": {
        "@id": "https://impedyme.com/#organization"
      }
    },
    {
      "@type": "WebPage",
      "@id": "{{URL}}#webpage",
      "url": "{{URL}}",
      "name": "A Programmable Grid in a Cabinet: Regenerative Grid Emulation at KEMA Labs — Customer Success Story",
      "description": "How KEMA Labs brings regenerative, high-power grid emulation into the lab with Impedyme's CHP Series Power HIL testbench — programmable grid conditions, four-quadrant power exchange, and IEEE 1547 / UL 1741 scenarios in one liquid-cooled cabinet that scales to 5 MW.",
      "inLanguage": "en",
      "isPartOf": {
        "@id": "https://impedyme.com/#website"
      },
      "breadcrumb": {
        "@id": "{{URL}}#breadcrumb"
      },
      "mainEntity": {
        "@id": "{{URL}}#article"
      },
      "primaryImageOfPage": {
        "@id": "{{URL}}#image-success-story"
      },
      "image": [
        {
          "@id": "{{URL}}#image-success-story"
        },
        {
          "@id": "{{URL}}#image-header-desktop"
        },
        {
          "@id": "{{URL}}#image-header-mobile"
        }
      ],
      "about": [
        {
          "@id": "https://www.kema.com/#organization"
        },
        {
          "@id": "{{URL}}#chp-power-hil-testbench"
        }
      ],
      "mentions": {
        "@id": "{{URL}}#customers-and-partners"
      }
    },
    {
      "@type": "ItemList",
      "@id": "{{URL}}#customers-and-partners",
      "name": "Customers and Partners",
      "description": "Impedyme customers and partners featured in this customer success story.",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "KEMA Labs",
          "item": {
            "@id": "https://www.kema.com/#organization"
          }
        }
      ]
    },
    {
      "@type": "Organization",
      "@id": "https://www.kema.com/#organization",
      "name": "KEMA Labs",
      "url": "https://www.kema.com/",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Arnhem",
        "addressCountry": "NL"
      },
      "description": "KEMA Labs in Arnhem, The Netherlands, operates some of the world's foremost independent testing, inspection, and certification facilities for the electric power industry.",
      "knowsAbout": [
        "Independent testing, inspection and certification",
        "Electric power industry",
        "Grid-connected power electronics",
        "Distributed energy resources",
        "Hardware-in-the-Loop testing of protection systems"
      ],
      "subOrganization": {
        "@id": "https://www.kema.com/#flex-power-grid-lab"
      }
    },
    {
      "@type": "Organization",
      "@id": "https://www.kema.com/#flex-power-grid-lab",
      "name": "Flex Power Grid Lab",
      "parentOrganization": {
        "@id": "https://www.kema.com/#organization"
      },
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Arnhem",
        "addressCountry": "NL"
      },
      "description": "KEMA Labs' Flex Power Grid Lab offers world-class HIL testing of protection systems and power-electronic equipment for a grid reshaped by inverter-based resources and distributed energy systems.",
      "employee": {
        "@id": "{{URL}}#renzo-fabian"
      }
    },
    {
      "@type": "Person",
      "@id": "{{URL}}#renzo-fabian",
      "name": "Renzo Fabian (customer)",
      "honorificPrefix": "Dr.",
      "jobTitle": "Head of the Flex Power Grid Lab",
      "worksFor": {
        "@id": "https://www.kema.com/#flex-power-grid-lab"
      },
      "workLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Arnhem",
          "addressCountry": "NL"
        }
      },
      "description": "Dr. Renzo Fabian leads the Flex Power Grid Lab at KEMA Labs in Arnhem, The Netherlands, where he and his team offer world-class HIL testing of protection systems and power-electronic equipment — a holistic approach that grows increasingly relevant as inverter-based resources and distributed energy systems reshape the modern power grid.",
      "knowsAbout": [
        "Hardware-in-the-Loop testing",
        "Protection systems",
        "Power-electronic equipment",
        "Inverter-based resources",
        "Distributed energy systems",
        "Grid emulation"
      ]
    },
    {
      "@type": "Thing",
      "@id": "{{URL}}#chp-power-hil-testbench",
      "name": "Impedyme CHP Series Power HIL Testbench (grid emulation)",
      "description": "A CHP Series Power HIL testbench, scalable to 5 MW, that brings regenerative, high-power grid emulation into one liquid-cooled cabinet. Four-quadrant PHIL modules — offered from 5 kW to 50 kW — have channels reconfigurable in software as independent single-phase channels, three-phase groups, or a paralleled higher-power three-phase group. Devices under test connect their AC or DC bus directly to the CHP hardware over the front-panel busbar for realistic power exchange, grid synchronization, and interoperability testing, including IEEE 1547 and UL 1741 compliance scenarios. Each module carries its own AMD/Xilinx Zynq UltraScale+ real-time engine (quad-core Arm + 600K-cell FPGA) under IMPEDYME-RT.",
      "image": {
        "@id": "{{URL}}#image-success-story"
      }
    },
    {
      "@type": "SoftwareApplication",
      "@id": "{{URL}}#sw-gridsim-studio",
      "name": "GridSim Studio",
      "applicationCategory": "Grid emulation software",
      "publisher": {
        "@id": "https://impedyme.com/#organization"
      },
      "description": "Grid definition: voltage, frequency, and impedance parameters, LUT management, FPGA-emulated grid impedance, harmonic and fault injection — the programmable grid the device under test sees."
    },
    {
      "@type": "SoftwareApplication",
      "@id": "{{URL}}#sw-powerhil-studio",
      "name": "PowerHIL Studio",
      "applicationCategory": "Power HIL testbench operation software",
      "publisher": {
        "@id": "https://impedyme.com/#organization"
      },
      "description": "Testbench operation: cabinet-level control, signal routing, safety monitoring, FPGA/CPU model management, dynamic test sequencing, failure emulation (phase loss, short circuit, thermal faults), and device-level protection configuration."
    },
    {
      "@type": "SoftwareApplication",
      "@id": "{{URL}}#sw-impedyme-rt",
      "name": "IMPEDYME-RT",
      "applicationCategory": "Real-time operating system",
      "operatingSystem": "Linux with proprietary real-time kernel",
      "publisher": {
        "@id": "https://impedyme.com/#organization"
      },
      "description": "Linux with Impedyme's proprietary real-time kernel; runs MATLAB/Simulink models on the Arm cores and FPGA (200 ns update); real-time monitoring, control, and parameter tuning from MATLAB."
    },
    {
      "@type": "SoftwareApplication",
      "@id": "{{URL}}#sw-fpga-scope",
      "name": "FPGA Scope",
      "applicationCategory": "Real-time data acquisition",
      "publisher": {
        "@id": "https://impedyme.com/#organization"
      },
      "description": "Real-time FPGA-based signal monitoring with trigger-based capture of converter responses during ride-through, fault, and reconnection scenarios."
    },
    {
      "@type": "ImageObject",
      "@id": "{{URL}}#image-success-story",
      "contentUrl": "{{IMG_STORY}}",
      "url": "{{IMG_STORY}}",
      "encodingFormat": "image/webp",
      "name": "KEMA Labs customer success story — regenerative grid emulation on the Impedyme CHP Series",
      "caption": "Impedyme customer success story: KEMA Labs brings regenerative, high-power grid emulation into the lab with Impedyme's CHP Series Power HIL testbench — programmable grid conditions, four-quadrant power exchange, and IEEE 1547 / UL 1741 scenarios, scalable to 5 MW.",
      "creator": {
        "@id": "https://impedyme.com/#organization"
      },
      "copyrightHolder": {
        "@id": "https://impedyme.com/#organization"
      }
    },
    {
      "@type": "ImageObject",
      "@id": "{{URL}}#image-header-desktop",
      "contentUrl": "{{IMG_DESKTOP}}",
      "url": "{{IMG_DESKTOP}}",
      "encodingFormat": "image/webp",
      "name": "KEMA Labs CHP Series success story header (desktop)",
      "caption": "KEMA Labs grid emulation on Impedyme's CHP Series Power HIL testbench — a programmable grid in one liquid-cooled cabinet.",
      "creator": {
        "@id": "https://impedyme.com/#organization"
      }
    },
    {
      "@type": "ImageObject",
      "@id": "{{URL}}#image-header-mobile",
      "contentUrl": "{{IMG_MOBILE}}",
      "url": "{{IMG_MOBILE}}",
      "encodingFormat": "image/webp",
      "name": "KEMA Labs CHP Series success story header (mobile)",
      "caption": "KEMA Labs grid emulation on Impedyme's CHP Series Power HIL testbench — a programmable grid in one liquid-cooled cabinet.",
      "creator": {
        "@id": "https://impedyme.com/#organization"
      }
    },
    {
      "@type": "TechArticle",
      "@id": "{{URL}}#article",
      "headline": "A Programmable Grid in a Cabinet: Regenerative Grid Emulation at KEMA Labs",
      "alternativeHeadline": "How KEMA Labs brings regenerative, high-power grid emulation and IEEE 1547 / UL 1741 scenarios into the lab with Impedyme's CHP Series Power HIL testbench",
      "description": "See how KEMA Labs brings regenerative, high-power grid emulation into the lab with Impedyme's CHP Series Power HIL testbench — programmable grid conditions, four-quadrant power exchange, and IEEE 1547 / UL 1741 scenarios, in one liquid-cooled cabinet that scales to 5 MW. Learn how GridSim Studio and PowerHIL Studio turn grid conditions into configuration: voltage, frequency, impedance, harmonics, and faults defined in software, with converter responses monitored in real time.",
      "genre": "Customer success story",
      "articleSection": [
        "The Challenge",
        "The Solution",
        "In Practice",
        "Architecture",
        "The Result",
        "At a Glance",
        "The Added Value",
        "Why It Works"
      ],
      "inLanguage": "en",
      "datePublished": "{{DATE}}",
      "dateModified": "{{DATE}}",
      "image": [
        {
          "@id": "{{URL}}#image-success-story"
        },
        {
          "@id": "{{URL}}#image-header-desktop"
        },
        {
          "@id": "{{URL}}#image-header-mobile"
        }
      ],
      "author": {
        "@id": "https://impedyme.com/#organization"
      },
      "publisher": {
        "@id": "https://impedyme.com/#organization"
      },
      "mainEntityOfPage": {
        "@id": "{{URL}}#webpage"
      },
      "about": [
        {
          "@id": "https://www.kema.com/#organization"
        },
        {
          "@id": "{{URL}}#chp-power-hil-testbench"
        },
        {
          "@type": "Thing",
          "name": "Grid emulation"
        },
        {
          "@type": "Thing",
          "name": "Power Hardware-in-the-Loop (PHIL)"
        },
        {
          "@type": "Thing",
          "name": "Distributed energy resources validation"
        },
        {
          "@type": "Thing",
          "name": "IEEE 1547"
        },
        {
          "@type": "Thing",
          "name": "UL 1741"
        },
        {
          "@type": "Thing",
          "name": "Regenerative power testing"
        }
      ],
      "mentions": [
        {
          "@id": "https://www.kema.com/#organization"
        },
        {
          "@id": "https://www.kema.com/#flex-power-grid-lab"
        },
        {
          "@id": "{{URL}}#renzo-fabian"
        },
        {
          "@id": "{{URL}}#customers-and-partners"
        },
        {
          "@type": "SoftwareApplication",
          "name": "MATLAB/Simulink",
          "publisher": {
            "@type": "Organization",
            "name": "MathWorks"
          }
        },
        {
          "@type": "Organization",
          "name": "AMD/Xilinx"
        }
      ],
      "keywords": "KEMA Labs, Flex Power Grid Lab, Arnhem, Impedyme, CHP Series, Power HIL, PHIL, grid emulator, grid simulator, GridSim Studio, PowerHIL Studio, IEEE 1547, UL 1741, ride-through, islanding detection, grid impedance, harmonic injection, four-quadrant, regenerative, Active Front End, 5 MW, distributed energy resources, inverter-based resources, MATLAB/Simulink",
      "hasPart": [
        {
          "@type": "WebPageElement",
          "@id": "{{URL}}#the-challenge",
          "name": "The Challenge — The grid you need is never the grid you have",
          "text": "KEMA Labs in Arnhem, The Netherlands, operates some of the world's foremost independent testing, inspection, and certification facilities for the electric power industry. Within it, the Flex Power Grid Lab, headed by Dr. Renzo Fabian, embodies where that mission is going: Dr. Fabian and his team offer world-class HIL testing of protection systems and power-electronic equipment — a holistic approach that is becoming increasingly relevant as inverter-based resources and distributed energy systems reshape the modern power grid. Testing that new grid demands something the real grid will not provide on request: precisely controlled voltage and frequency excursions, programmable impedance, harmonic content, and fault conditions — delivered at real power, repeatably, and safely. Conventional approaches strain at this power class. Fixed grid simulators bind the lab to one rating and one topology; dissipative load banks burn every kilowatt of test power as heat; and stitching together a separate real-time simulator, amplifier, and protection chain multiplies vendors, toolchains, and integration risk. A certification-grade laboratory needs the opposite: one platform whose grid conditions, channel configuration, and power level are all defined in software — and whose energy is recirculated rather than wasted. The requirement, in short: a high-fidelity Power HIL platform for validation of distributed energy systems — programmable from the first volt, scalable with the program, and efficient enough to run long campaigns without dominating the facility's power budget."
        },
        {
          "@type": "WebPageElement",
          "@id": "{{URL}}#the-solution",
          "name": "The Solution — A programmable grid in a cabinet",
          "text": "Impedyme configured a CHP Series Power HIL Testbench, scalable to 5 MW: four-quadrant PHIL modules — offered from 5 kW to 50 kW — whose channels are reconfigurable in software as independent single-phase channels, three-phase groups, or a paralleled higher-power three-phase group. Devices under test connect their AC or DC bus directly to the CHP hardware over the front-panel busbar — enabling realistic power exchange, grid synchronization, and interoperability testing under fully controllable conditions. Each PHIL module carries its own real-time engine — AMD/Xilinx Zynq UltraScale+ (quad-core Arm + 600K-cell FPGA) under IMPEDYME-RT — running MATLAB/Simulink models with a 200 ns FPGA update rate. GridSim Studio defines the grid: voltage, frequency, and impedance parameters, LUT management, harmonic injection, and fault scenarios emulated directly in the FPGA. PowerHIL Studio runs the testbench: cabinet-level control, signal routing, safety monitoring, dynamic test sequencing, and failure emulation such as phase loss, short circuit, and thermal faults. The platform supports PHIL compliance scenarios in accordance with IEEE 1547 and UL 1741 — voltage and frequency ride-through, grid impedance variation, islanding detection, and dynamic reconnection. An optional regenerative Active Front End closes the loop at 94 %+ system efficiency, so long-duration campaigns recirculate their test power and the facility supplies only the losses. Integrated liquid cooling removes the external chiller, and layered protection — over-voltage, over-current, over-power, over-temperature, short-circuit, desaturation detection, device-level monitoring, and soft start/stop — keeps aggressive scenarios contained."
        },
        {
          "@type": "WebPageElement",
          "@id": "{{URL}}#in-practice",
          "name": "In Practice — Compliance scenarios as configuration",
          "text": "A ride-through campaign runs as software: GridSim Studio sweeps voltage and frequency against the profile, varies the emulated grid impedance, and injects harmonics and faults at the programmed instants; PowerHIL Studio sequences the cases and enforces safety limits; and converter responses are monitored in real time through FPGA Scope, with closed-loop Simulink models in the loop where the scenario demands them. Because channel modes and power levels are software-assigned, the same cabinet serves single-phase device testing in the morning and a paralleled higher-power three-phase campaign in the afternoon — and as programs grow, additional CHP capacity extends the same architecture toward 5 MW without changing models, tools, or workflow."
        },
        {
          "@type": "WebPageElement",
          "@id": "{{URL}}#architecture",
          "name": "Architecture — Testbed configuration",
          "text": "Figure 1 — The KEMA Labs testbed: CHP PHIL modules emulate the grid under GridSim Studio control, the device under test exchanges real power over the busbar, and the optional Active Front End closes the regenerative loop — with sequencing, safety, and models managed in PowerHIL Studio. Channel configuration is a software decision, not a rewiring exercise: modules and phases parallel freely across single-phase, three-phase, and paralleled three-phase modes, four SFP+ Aurora ports per module (≥ 12.5 Gbps) daisy-chain control and measurement for parallel and multiphase operation, and eight standard analog inputs per module (up to 2.5 MS/s, resolver IP supported) bring external measurements into the loop."
        },
        {
          "@type": "Table",
          "@id": "{{URL}}#table-1",
          "name": "Table 1 — The software suite delivered with the CHP Series testbench",
          "about": [
            {
              "@id": "{{URL}}#sw-gridsim-studio"
            },
            {
              "@id": "{{URL}}#sw-powerhil-studio"
            },
            {
              "@id": "{{URL}}#sw-impedyme-rt"
            },
            {
              "@id": "{{URL}}#sw-fpga-scope"
            }
          ],
          "text": "GridSim Studio: grid definition — voltage, frequency, and impedance parameters, LUT management, FPGA-emulated grid impedance, harmonic and fault injection; the programmable grid the DUT sees. PowerHIL Studio: testbench operation — cabinet-level control, signal routing, safety monitoring, FPGA/CPU model management, dynamic test sequencing, failure emulation, and device-level protection configuration. IMPEDYME-RT: Linux with Impedyme's proprietary real-time kernel; runs MATLAB/Simulink models on the Arm cores and FPGA (200 ns update); real-time monitoring, control, and parameter tuning from MATLAB. FPGA Scope: real-time FPGA-based signal monitoring with trigger-based capture of converter responses during ride-through, fault, and reconnection scenarios."
        },
        {
          "@type": "WebPageElement",
          "@id": "{{URL}}#the-result",
          "name": "The Result — Certification-grade conditions, on demand",
          "text": "Grid conditions that once depended on fixed simulators — or could not be produced at all — are now a configuration: any voltage and frequency excursion, any programmed impedance, any harmonic spectrum or fault sequence, reproduced identically run after run at real power. IEEE 1547 / UL 1741 scenario families run as stored profiles and sequences, and every converter response is captured in real time with the waveforms to support it. The economics follow the physics: with the regenerative Active Front End closing the loop at 94 %+ system efficiency, long-duration and high-power campaigns recirculate their energy instead of dissipating it, and the liquid-cooled cabinet asks nothing of facility chilled-water infrastructure. And because the architecture scales — modules paralleling freely toward 5 MW — the testbench grows with the certification programs it serves, on the same software and the same models. For a laboratory whose product is trust, the platform delivers the essential property: the same test, the same conditions, the same evidence — every time."
        },
        {
          "@type": "ItemList",
          "@id": "{{URL}}#at-a-glance",
          "name": "At a Glance — Key facts",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "5 kW to 50 kW modules — scalable to 5 MW, same architecture"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Four-quadrant modules — regenerative source/sink, software-assigned channels"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": "Software-assigned channels — single-phase · three-phase · paralleled 3-ph groups"
            },
            {
              "@type": "ListItem",
              "position": 4,
              "name": "94 %+ efficiency — regenerative loop via optional AFE"
            },
            {
              "@type": "ListItem",
              "position": 5,
              "name": "200 ns — FPGA real-time update rate"
            },
            {
              "@type": "ListItem",
              "position": 6,
              "name": "IEEE 1547 · UL 1741 — ride-through, impedance, islanding, reconnection"
            },
            {
              "@type": "ListItem",
              "position": 7,
              "name": "Zynq UltraScale+ — quad-core Arm + 600K-cell FPGA per module"
            },
            {
              "@type": "ListItem",
              "position": 8,
              "name": "4 × SFP+ ≥ 12.5 Gbps — daisy-chain parallel & multiphase operation"
            },
            {
              "@type": "ListItem",
              "position": 9,
              "name": "Liquid-cooled — 19″ cabinet, no external chiller"
            }
          ]
        },
        {
          "@type": "WebPageElement",
          "@id": "{{URL}}#the-added-value",
          "name": "The Added Value — One platform for a decade of programs",
          "text": "The CHP Series replaces a procession of fixed-rating grid simulators, load banks, and bolt-on real-time equipment with one modular platform: grid emulation, four-quadrant power exchange, real-time simulation, protection, and measurement in a single toolchain. MATLAB/Simulink integration means converter validation and control development share models with the testbench, and the software-assigned channel modes mean one cabinet serves programs that would otherwise each demand their own rig. Delivered with the software suite and the Standard Maintenance Plan included — software and hardware maintenance, firmware updates, technical assistance, remote access and testing, module replacement, and loaner availability — and with the Ultimate Maintenance Plan available for mission-critical programs, the platform is built to grow: additional PHIL modules extend power toward 5 MW, and future test standards arrive as software, not new hardware."
        },
        {
          "@type": "ItemList",
          "@id": "{{URL}}#why-it-works",
          "name": "Why It Works — The advantages",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Programmable grid: voltage, frequency, impedance, harmonics, and faults in software"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "IEEE 1547 / UL 1741 compliance scenarios as stored, repeatable sequences"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": "Four-quadrant, regenerative power exchange — 94 %+ system efficiency with the AFE"
            },
            {
              "@type": "ListItem",
              "position": 4,
              "name": "Channel modes reconfigure in software: 1-phase, 3-phase, and paralleled operation"
            },
            {
              "@type": "ListItem",
              "position": 5,
              "name": "Real-time Simulink models on Arm + FPGA — no third-party HIL simulator"
            },
            {
              "@type": "ListItem",
              "position": 6,
              "name": "Layered protection: OV/OC/OP/OT, short-circuit, desaturation, soft start/stop"
            },
            {
              "@type": "ListItem",
              "position": 7,
              "name": "Integrated liquid cooling — no external chiller"
            },
            {
              "@type": "ListItem",
              "position": 8,
              "name": "Scales toward 5 MW on the same software and models"
            },
            {
              "@type": "ListItem",
              "position": 9,
              "name": "FPGA Scope evidence for every scenario response"
            }
          ]
        },
        {
          "@type": "Table",
          "@id": "{{URL}}#table-2",
          "name": "Table 2 — What the CHP Series testbench replaces",
          "text": "Grid emulation: conventional — fixed-rating grid simulator per program; Impedyme CHP Series — GridSim Studio with programmable V/f/impedance, harmonics and faults in FPGA. Power handling: conventional — dissipative load banks, full facility draw; Impedyme CHP Series — four-quadrant regenerative loop, facility supplies only losses. Channel topology: conventional — rewiring and new hardware per configuration; Impedyme CHP Series — software modes: single-phase, three-phase, or paralleled 3-ph. Real-time simulation: conventional — separate third-party HIL equipment; Impedyme CHP Series — IMPEDYME-RT on every module, 200 ns FPGA update. Compliance testing: conventional — manual setups, limited repeatability; Impedyme CHP Series — IEEE 1547 / UL 1741 profiles sequenced in PowerHIL Studio. Growth path: conventional — new simulator at each power level; Impedyme CHP Series — modules parallel toward 5 MW on the same platform."
        },
        {
          "@type": "ItemList",
          "@id": "{{URL}}#chp-power-hil-testbench-specifications",
          "name": "Technical specifications — Impedyme CHP Series Power HIL Testbench (grid emulation)",
          "about": {
            "@id": "{{URL}}#chp-power-hil-testbench"
          },
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "item": {
                "@type": "PropertyValue",
                "name": "Module power rating",
                "minValue": 5,
                "maxValue": 50,
                "unitText": "kW",
                "description": "Scalable to 5 MW; same architecture"
              }
            },
            {
              "@type": "ListItem",
              "position": 2,
              "item": {
                "@type": "PropertyValue",
                "name": "Power stage",
                "value": "Four-quadrant, regenerative source/sink"
              }
            },
            {
              "@type": "ListItem",
              "position": 3,
              "item": {
                "@type": "PropertyValue",
                "name": "Channel modes",
                "value": "Software-assigned: single-phase, three-phase, or paralleled three-phase groups"
              }
            },
            {
              "@type": "ListItem",
              "position": 4,
              "item": {
                "@type": "PropertyValue",
                "name": "Grid emulation",
                "value": "Programmable voltage, frequency and impedance; harmonic injection; fault scenarios emulated in the FPGA"
              }
            },
            {
              "@type": "ListItem",
              "position": 5,
              "item": {
                "@type": "PropertyValue",
                "name": "Compliance scenarios",
                "value": "IEEE 1547 and UL 1741 — voltage and frequency ride-through, grid impedance variation, islanding detection, dynamic reconnection"
              }
            },
            {
              "@type": "ListItem",
              "position": 6,
              "item": {
                "@type": "PropertyValue",
                "name": "DUT connection",
                "value": "AC or DC bus over the front-panel busbar"
              }
            },
            {
              "@type": "ListItem",
              "position": 7,
              "item": {
                "@type": "PropertyValue",
                "name": "System efficiency",
                "minValue": 94,
                "unitText": "%",
                "description": "With the optional regenerative Active Front End (AFE); facility supplies only losses"
              }
            },
            {
              "@type": "ListItem",
              "position": 8,
              "item": {
                "@type": "PropertyValue",
                "name": "Processor per module",
                "value": "AMD/Xilinx Zynq UltraScale+ quad-core Arm + 600K-cell FPGA"
              }
            },
            {
              "@type": "ListItem",
              "position": 9,
              "item": {
                "@type": "PropertyValue",
                "name": "FPGA update rate",
                "value": 200,
                "unitText": "ns",
                "description": "Real-time MATLAB/Simulink models"
              }
            },
            {
              "@type": "ListItem",
              "position": 10,
              "item": {
                "@type": "PropertyValue",
                "name": "Synchronization links",
                "value": "4 × SFP+ Aurora ports per module, ≥ 12.5 Gbps",
                "description": "Daisy-chain control and measurement for parallel and multiphase operation"
              }
            },
            {
              "@type": "ListItem",
              "position": 11,
              "item": {
                "@type": "PropertyValue",
                "name": "Analog inputs per module",
                "value": 8,
                "description": "Up to 2.5 MS/s, resolver IP supported"
              }
            },
            {
              "@type": "ListItem",
              "position": 12,
              "item": {
                "@type": "PropertyValue",
                "name": "Cooling",
                "value": "Integrated liquid cooling in a 19-inch cabinet — no external chiller"
              }
            },
            {
              "@type": "ListItem",
              "position": 13,
              "item": {
                "@type": "PropertyValue",
                "name": "Protection",
                "value": "Over-voltage, over-current, over-power, over-temperature, short-circuit, desaturation detection, device-level monitoring, soft start/stop"
              }
            },
            {
              "@type": "ListItem",
              "position": 14,
              "item": {
                "@type": "PropertyValue",
                "name": "Support",
                "value": "Standard Maintenance Plan included (software and hardware maintenance, firmware updates, technical assistance, remote access and testing, module replacement, loaner availability); Ultimate Maintenance Plan available for mission-critical programs"
              }
            }
          ]
        }
      ]
    }
  ]
}
JSONLD;

	$schema = strtr(
		$schema,
		array(
			'{{URL}}'         => $page_url,
			'{{IMG_STORY}}'   => $img_story,
			'{{IMG_DESKTOP}}' => $img_desktop,
			'{{IMG_MOBILE}}'  => $img_mobile,
			'{{DATE}}'        => $date_published,
		)
	);

	echo "\n<script type=\"application/ld+json\">\n" . $schema . "\n</script>\n";
}
