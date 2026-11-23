<?php
/**
 * KEMA Labs (motor drive) success story — JSON-LD schema.
 * Prints only on the page set in $page_url below (no other URL).
 * Install: add to the child theme's functions.php or the Code Snippets plugin
 * (run everywhere / front-end). Do not include the opening "<?php" twice.
 */
add_action( 'wp_head', 'impedyme_kema_motor_drive_success_story_schema', 5 );

function impedyme_kema_motor_drive_success_story_schema() {
	// ---- Edit these if the live page or image addresses differ. ----
	$page_url       = 'https://impedyme.com/success-stories/kema-labs-motor-drive/';
	$img_desktop    = 'https://impedyme.com/wp-content/uploads/2026/11/Kema-Lab-motor-drive-header-desktop-scaled.webp';
	$img_mobile     = 'https://impedyme.com/wp-content/uploads/2026/11/kema-lab-motor-drive-mobile-header-scaled.webp';
	$img_logo       = 'https://impedyme.com/wp-content/uploads/2026/11/kema-labs-logo.webp';
	$date_published = '2026-11-18';
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
      "name": "400 kW, 800 V — No Dynamometer: Motor-Drive Testing at KEMA Labs — Customer Success Story",
      "description": "How KEMA Labs tests a 400 kW, 800 V automotive motor drive against a real-time emulated motor on Impedyme's high-power Motor Emulator Platform, at real power and without a dynamometer: –50 % testing time, –45 % validation time, +55 % test coverage, +60 % system safety.",
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
        "@id": "{{URL}}#image-header-desktop"
      },
      "image": [
        {
          "@id": "{{URL}}#image-header-desktop"
        },
        {
          "@id": "{{URL}}#image-header-mobile"
        },
        {
          "@id": "{{URL}}#image-kema-logo"
        }
      ],
      "about": [
        {
          "@id": "https://www.kema.com/#organization"
        },
        {
          "@id": "{{URL}}#motor-emulator-platform"
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
      "logo": {
        "@id": "{{URL}}#image-kema-logo"
      },
      "image": {
        "@id": "{{URL}}#image-kema-logo"
      },
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Arnhem",
        "addressCountry": "NL"
      },
      "description": "KEMA Labs in Arnhem, The Netherlands, operates some of the world's foremost independent testing, inspection, and certification facilities for the electric power industry. As electrification moves high-power conversion into vehicles, the lab's work extends to automotive power electronics — including traction drives operating at 800 V and hundreds of kilowatts.",
      "knowsAbout": [
        "Independent testing, inspection and certification",
        "Electric power industry",
        "Automotive power electronics",
        "800 V traction drives",
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
      "description": "KEMA Labs' Flex Power Grid Lab offers HIL testing of protection systems and power-electronic equipment for a grid reshaped by inverter-based resources, electrified transport, and distributed energy systems.",
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
      "description": "Dr. Renzo Fabian leads the Flex Power Grid Lab at KEMA Labs in Arnhem, The Netherlands, where he and his team offer world-class HIL testing of protection systems and power-electronic equipment — a holistic approach that grows increasingly relevant as inverter-based resources, electrified transport, and distributed energy systems reshape the modern power grid.",
      "knowsAbout": [
        "Hardware-in-the-Loop testing",
        "Protection systems",
        "Power-electronic equipment",
        "Inverter-based resources",
        "Electrified transport",
        "Distributed energy systems"
      ]
    },
    {
      "@type": "Thing",
      "@id": "{{URL}}#motor-emulator-platform",
      "name": "Impedyme CHP Series High-Power Motor Emulator Platform",
      "description": "A high-power Motor Emulator Platform built on the CHP Series, combining bidirectional power hardware with real-time motor models in one scalable system. It provides a controlled electrical interface at the inverter output while the real-time model on the FPGA determines speed, torque, rotor position, back EMF, and dynamic response — testing a 400 kW, 800 V automotive motor drive at real power through motoring and regenerative regions without a dynamometer. Every CHP module is a regenerative, four-quadrant, bidirectional power stage with an AMD/Xilinx Zynq UltraScale+ quad-core Arm processor and 600K-cell FPGA running IMPEDYME-RT.",
      "image": {
        "@id": "{{URL}}#image-header-desktop"
      }
    },
    {
      "@type": "SoftwareApplication",
      "@id": "{{URL}}#sw-motorsim-studio",
      "name": "MotorSim Studio",
      "applicationCategory": "Motor emulation software",
      "publisher": {
        "@id": "https://impedyme.com/#organization"
      },
      "description": "Motor-emulation control: motor library (Rs, Ld, Lq, Ke, J, pole pairs), mechanical-load and torque-vs-speed profiles, parameter sweeps, and the protection relay executed on the FPGA."
    },
    {
      "@type": "SoftwareApplication",
      "@id": "{{URL}}#sw-powerhil-studio",
      "name": "PowerHIL Studio",
      "applicationCategory": "Power HIL testbench operation software",
      "publisher": {
        "@id": "https://impedyme.com/#organization"
      },
      "description": "Cabinet-level control and signal routing; per-module mode and reference selection; dynamic test sequencing; failure emulation; safety limits and device-level protections; launches MLX, Simulink, and FPGA Scope."
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
      "description": "Linux with Impedyme's proprietary real-time kernel on every module; runs MATLAB/Simulink models on the Arm cores and FPGA (200 ns FPGA update); real-time monitoring, control, and parameter tuning from MATLAB."
    },
    {
      "@type": "SoftwareApplication",
      "@id": "{{URL}}#sw-fpga-scope",
      "name": "FPGA Scope",
      "applicationCategory": "Real-time data acquisition",
      "publisher": {
        "@id": "https://impedyme.com/#organization"
      },
      "description": "On-module oscilloscope: waveform preview before enable, per-phase real-time monitoring, trigger-based capture, measurement table (max / min / pk-pk / gain / phase), and sync verification across modules."
    },
    {
      "@type": "SoftwareApplication",
      "@id": "{{URL}}#sw-mlx",
      "name": "MLX",
      "applicationCategory": "Post-processing and analytics software",
      "publisher": {
        "@id": "https://impedyme.com/#organization"
      },
      "description": "Post-processing and analytics of streamed data in MATLAB — operating-point sweeps, efficiency and response metrics, pass/fail overlays, and automated test reports."
    },
    {
      "@type": "ImageObject",
      "@id": "{{URL}}#image-kema-logo",
      "contentUrl": "{{IMG_LOGO}}",
      "url": "{{IMG_LOGO}}",
      "encodingFormat": "image/webp",
      "name": "KEMA Labs logo",
      "caption": "KEMA Labs logo",
      "copyrightHolder": {
        "@id": "https://www.kema.com/#organization"
      }
    },
    {
      "@type": "ImageObject",
      "@id": "{{URL}}#image-header-desktop",
      "contentUrl": "{{IMG_DESKTOP}}",
      "url": "{{IMG_DESKTOP}}",
      "encodingFormat": "image/webp",
      "name": "KEMA Labs motor-drive success story header (desktop)",
      "caption": "KEMA Labs tests a 400 kW, 800 V automotive motor drive against a real-time emulated motor on Impedyme's high-power Motor Emulator Platform — at real power, without a dynamometer.",
      "creator": {
        "@id": "https://impedyme.com/#organization"
      },
      "copyrightHolder": {
        "@id": "https://impedyme.com/#organization"
      }
    },
    {
      "@type": "ImageObject",
      "@id": "{{URL}}#image-header-mobile",
      "contentUrl": "{{IMG_MOBILE}}",
      "url": "{{IMG_MOBILE}}",
      "encodingFormat": "image/webp",
      "name": "KEMA Labs motor-drive success story header (mobile)",
      "caption": "KEMA Labs tests a 400 kW, 800 V automotive motor drive against a real-time emulated motor on Impedyme's high-power Motor Emulator Platform — at real power, without a dynamometer.",
      "creator": {
        "@id": "https://impedyme.com/#organization"
      }
    },
    {
      "@type": "TechArticle",
      "@id": "{{URL}}#article",
      "headline": "400 kW, 800 V — No Dynamometer: Motor-Drive Testing at KEMA Labs",
      "alternativeHeadline": "How KEMA Labs tests a 400 kW, 800 V automotive motor drive against a real-time emulated motor on Impedyme's high-power Motor Emulator Platform",
      "description": "See how KEMA Labs uses Impedyme's high-power Motor Emulator Platform to test a 400 kW, 800 V automotive motor drive against a real-time emulated motor — at real power, across motoring, regenerative, dynamic-load, and protection-related operating conditions. Learn how software-defined motor behavior replaces the large motor, dynamometer, and mechanical coupling a drive of this class would otherwise need for every test — while keeping operating points controlled, measurable, and repeatable.",
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
          "@id": "{{URL}}#motor-emulator-platform"
        },
        {
          "@type": "Thing",
          "name": "High-power motor emulation"
        },
        {
          "@type": "Thing",
          "name": "800 V automotive motor-drive testing"
        },
        {
          "@type": "Thing",
          "name": "Regenerative operation"
        },
        {
          "@type": "Thing",
          "name": "Protection and limit testing"
        },
        {
          "@type": "Thing",
          "name": "Dynamometer replacement"
        },
        {
          "@type": "Thing",
          "name": "Power Hardware-in-the-Loop (PHIL)"
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
      "keywords": "KEMA Labs, Flex Power Grid Lab, Arnhem, Impedyme, motor emulator, CHP Series, Power HIL, 400 kW, 800 V, automotive motor drive, traction inverter, regenerative testing, dynamometer replacement, back EMF, protection testing, efficiency mapping, operating-point sweeps, MATLAB/Simulink",
      "hasPart": [
        {
          "@type": "ItemList",
          "@id": "{{URL}}#headline-impact",
          "name": "Headline impact",
          "description": "Impact reported and approved by KEMA Labs.",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "item": {
                "@type": "PropertyValue",
                "name": "Testing time",
                "value": -50,
                "unitText": "%"
              }
            },
            {
              "@type": "ListItem",
              "position": 2,
              "item": {
                "@type": "PropertyValue",
                "name": "Validation time",
                "value": -45,
                "unitText": "%"
              }
            },
            {
              "@type": "ListItem",
              "position": 3,
              "item": {
                "@type": "PropertyValue",
                "name": "Test coverage",
                "value": 55,
                "unitText": "%"
              }
            },
            {
              "@type": "ListItem",
              "position": 4,
              "item": {
                "@type": "PropertyValue",
                "name": "System safety",
                "value": 60,
                "unitText": "%"
              }
            }
          ]
        },
        {
          "@type": "WebPageElement",
          "@id": "{{URL}}#the-challenge",
          "name": "The Challenge — The dyno is the hardest part of the test",
          "text": "KEMA Labs in Arnhem, The Netherlands, operates some of the world's foremost independent testing, inspection, and certification facilities for the electric power industry. As electrification moves high-power conversion into vehicles, the lab's work extends to automotive power electronics — including traction drives operating at 800 V and hundreds of kilowatts. Testing a 400 kW, 800 V automotive motor drive with a physical machine requires a large motor, a dynamometer, mechanical coupling, cooling, guarding, and extensive instrumentation. Changing the motor characteristics, or reproducing aggressive transients and fault-oriented conditions, adds time and risk — and a conventional high-power dynamometer carries stored mechanical energy and a heavy reconfiguration burden. KEMA needed a high-power platform that could present realistic three-phase motor behavior to the drive while keeping operating points controlled, measurable, and repeatable."
        },
        {
          "@type": "WebPageElement",
          "@id": "{{URL}}#the-solution",
          "name": "The Solution — The motor becomes a real-time model",
          "text": "Impedyme delivered its high-power Motor Emulator Platform built on the CHP Series, combining bidirectional power hardware with real-time motor models in one scalable system. Every CHP module is a regenerative, four-quadrant, bidirectional power stage with its own AMD/Xilinx Zynq UltraScale+ quad-core Arm processor and 600K-cell FPGA running IMPEDYME-RT — a Linux OS with Impedyme's proprietary real-time kernel that executes MATLAB/Simulink models directly on the Arm cores and the FPGA with a 200 ns FPGA update rate. CHP modules are offered across a power range from 5 kW to 50 kW, scalable to 5 MW, so the same architecture sizes to the program. The emulator provides a controlled electrical interface at the inverter output, while the real-time model on the FPGA determines speed, torque, rotor position, back EMF, and dynamic response. The platform supports the 800 V automotive drive architecture, operates through motoring and regenerative regions, and lets motor and load parameters be changed in software in MotorSim Studio rather than on a test bed. Impedyme's engineering support helped translate the required operating envelope into a practical and safe validation workflow. PowerHIL Studio sequences the tests, automates operating-point sweeps, and enforces the safety envelope; FPGA Scope captures the drive's phases synchronously; MLX returns the data to MATLAB for efficiency maps and regression reports."
        },
        {
          "@type": "WebPageElement",
          "@id": "{{URL}}#in-practice",
          "name": "In Practice — A 400 kW drive, exercised against an emulated motor",
          "text": "Impedyme enabled KEMA Labs to exercise the 400 kW, 800 V automotive motor drive against a real-time emulated motor rather than a fixed physical machine. The test team commands speed and torque trajectories, reproduces acceleration and deceleration, evaluates regenerative power flow, and observes drive response under repeatable dynamic loading. The same platform supports controlled limit and protection testing — DC-bus and current-limit interactions, back-EMF conditions, motor-parameter variation, and selected abnormal operating cases — while avoiding the stored mechanical energy and reconfiguration burden of a conventional high-power dynamometer."
        },
        {
          "@type": "WebPageElement",
          "@id": "{{URL}}#architecture",
          "name": "Architecture — Testbed configuration",
          "text": "Figure 1 — KEMA Labs testbed: the 400 kW, 800 V automotive drive switches into a real-time emulated motor on the CHP Series platform; regenerative energy is recirculated on the shared DC bus instead of a dynamometer. Because the machine is a model, motor parameters and load profiles are defined in software and swept automatically, and synchronized measurements are compared across control-software and hardware revisions. Channels are software-assigned and modules parallel for higher power — scalable to 5 MW in the same architecture — so the platform extends to larger drives without changing models, scripts, or the software suite."
        },
        {
          "@type": "Table",
          "@id": "{{URL}}#table-1",
          "name": "Table 1 — Impedyme software suite included with the KEMA Labs motor-drive testbench",
          "about": [
            {
              "@id": "{{URL}}#sw-motorsim-studio"
            },
            {
              "@id": "{{URL}}#sw-powerhil-studio"
            },
            {
              "@id": "{{URL}}#sw-impedyme-rt"
            },
            {
              "@id": "{{URL}}#sw-fpga-scope"
            },
            {
              "@id": "{{URL}}#sw-mlx"
            }
          ],
          "text": "MotorSim Studio: motor library (Rs, Ld, Lq, Ke, J, pole pairs), mechanical-load and torque-vs-speed profiles, parameter sweeps, and the protection relay executed on the FPGA. PowerHIL Studio: cabinet-level control and signal routing; per-module mode and reference selection; dynamic test sequencing; failure emulation; safety limits and device-level protections; launches MLX, Simulink, and FPGA Scope. IMPEDYME-RT: Linux with Impedyme's proprietary real-time kernel on every module; runs MATLAB/Simulink models on the Arm cores and FPGA (200 ns FPGA update). FPGA Scope: on-module oscilloscope with waveform preview, per-phase real-time monitoring, trigger-based capture, measurement table, and sync verification across modules. MLX: operating-point sweeps, efficiency and response metrics, pass/fail overlays, and automated test reports."
        },
        {
          "@type": "WebPageElement",
          "@id": "{{URL}}#the-result",
          "name": "The Result — The whole operating envelope, repeatable",
          "text": "The Motor Emulator Platform gives the team one continuous workflow for inverter bring-up, motor-control tuning, efficiency mapping, transient testing, regenerative operation, and protection validation. Engineers define motor parameters and load profiles in software, automate operating-point sweeps, and compare synchronized measurements across revisions — reducing mechanical setup work and completing more validation before vehicle or full-drivetrain testing. The measured impact, as reported and approved by KEMA Labs: development time down 35 %, testing time down 50 %, validation time down 45 %, and testing costs down 35 %; engineering productivity up 45 %, test coverage up 55 %, system safety up 60 %, and confidence before hardware deployment up 55 %. Automated sweeps and reusable test profiles accelerate the transition from initial inverter operation to full-power validation and regression testing. The platform also enabled testing that was previously difficult, expensive, or impossible: repeatable 800 V drive testing across motoring and regeneration, rapid torque and speed changes, parameter variation, back-EMF conditions, DC-bus and current-limit interactions, and selected abnormal operating cases — many of them costly, risky, or hard to reproduce precisely with a physical 400 kW motor and dynamometer. The result is a safer path to validating an 800 V automotive drive — real power, software-defined motor, and no dynamometer in the loop."
        },
        {
          "@type": "ItemList",
          "@id": "{{URL}}#at-a-glance",
          "name": "At a Glance — Key metrics",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "400 kW · 800 V — automotive motor drive under test"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Real-time motor model — speed, torque, position, back EMF"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": "Motoring + regeneration — bidirectional, repeatable"
            },
            {
              "@type": "ListItem",
              "position": 4,
              "name": "94 %+ system efficiency — facility supplies only losses"
            },
            {
              "@type": "ListItem",
              "position": 5,
              "name": "Zynq UltraScale+ per module — quad-core Arm + 600K FPGA logic cells"
            },
            {
              "@type": "ListItem",
              "position": 6,
              "name": "200 ns FPGA update rate — real-time models on FPGA"
            },
            {
              "@type": "ListItem",
              "position": 7,
              "name": "4 × SFP+ up to 12.5 Gbps — daisy-chain sync, parallel & multiphase"
            },
            {
              "@type": "ListItem",
              "position": 8,
              "name": "Module ratings to suit — 5 kW to 50 kW, scalable to 5 MW; same architecture and software"
            }
          ]
        },
        {
          "@type": "Table",
          "@id": "{{URL}}#table-2",
          "name": "Table 2 — Impact reported by KEMA Labs compared with its previous workflow",
          "description": "All quantified benefits reviewed and approved by KEMA Labs; external publication permission received.",
          "mainEntity": {
            "@type": "ItemList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "item": {
                  "@type": "PropertyValue",
                  "name": "Reduced development time",
                  "value": -35,
                  "unitText": "%"
                }
              },
              {
                "@type": "ListItem",
                "position": 2,
                "item": {
                  "@type": "PropertyValue",
                  "name": "Reduced testing time",
                  "value": -50,
                  "unitText": "%"
                }
              },
              {
                "@type": "ListItem",
                "position": 3,
                "item": {
                  "@type": "PropertyValue",
                  "name": "Reduced validation time",
                  "value": -45,
                  "unitText": "%"
                }
              },
              {
                "@type": "ListItem",
                "position": 4,
                "item": {
                  "@type": "PropertyValue",
                  "name": "Reduced testing costs",
                  "value": -35,
                  "unitText": "%"
                }
              },
              {
                "@type": "ListItem",
                "position": 5,
                "item": {
                  "@type": "PropertyValue",
                  "name": "Improved engineering productivity",
                  "value": 45,
                  "unitText": "%"
                }
              },
              {
                "@type": "ListItem",
                "position": 6,
                "item": {
                  "@type": "PropertyValue",
                  "name": "Improved test coverage",
                  "value": 55,
                  "unitText": "%"
                }
              },
              {
                "@type": "ListItem",
                "position": 7,
                "item": {
                  "@type": "PropertyValue",
                  "name": "Improved system safety",
                  "value": 60,
                  "unitText": "%"
                }
              },
              {
                "@type": "ListItem",
                "position": 8,
                "item": {
                  "@type": "PropertyValue",
                  "name": "Improved confidence before hardware deployment",
                  "value": 55,
                  "unitText": "%"
                }
              }
            ]
          }
        },
        {
          "@type": "WebPageElement",
          "@id": "{{URL}}#the-added-value",
          "name": "The Added Value — High-power testing without the mechanical burden",
          "text": "KEMA chose Impedyme because it combined high-power bidirectional hardware with real-time motor models in one scalable platform: it reproduces the electrical behavior seen by the inverter, supports the 800 V automotive drive architecture, operates through motoring and regenerative regions, and allows motor and load parameters to be changed in software — backed by engineering support that turned the operating envelope into a safe validation workflow. The capabilities KEMA rates most valuable — 400 kW motor-drive testing, the 800 V automotive architecture, real-time motor emulation, bidirectional power operation, regenerative testing, dynamic speed and torque profiles, motor-parameter variation, automated operating-point sweeps, protection and limit testing, and technical support and integration — are the core of this testbench. And every module is a fault-isolating unit with layered protection — over-voltage, over-current, over-power, over-temperature, short-circuit and desaturation detection, device-level destruction monitoring, and soft start/stop — so a test that goes wrong stops the test, not the program."
        },
        {
          "@type": "ItemList",
          "@id": "{{URL}}#why-it-works",
          "name": "Why It Works — The advantages",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "400 kW, 800 V drive tested at real power — no dynamometer"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Speed, torque, rotor position, and back EMF from a real-time model"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": "Motoring and regenerative regions, bidirectional and repeatable"
            },
            {
              "@type": "ListItem",
              "position": 4,
              "name": "Motor parameters and load profiles changed in software"
            },
            {
              "@type": "ListItem",
              "position": 5,
              "name": "Automated operating-point sweeps and regression runs"
            },
            {
              "@type": "ListItem",
              "position": 6,
              "name": "Protection and limit tests without stored mechanical energy"
            },
            {
              "@type": "ListItem",
              "position": 7,
              "name": "Native MATLAB/Simulink workflow — no third-party HIL simulator"
            },
            {
              "@type": "ListItem",
              "position": 8,
              "name": "Comprehensive protection: OV/OC/OP/OT, short-circuit, desaturation"
            },
            {
              "@type": "ListItem",
              "position": 9,
              "name": "Module power ratings to match the program — 5 kW to 50 kW, scalable to 5 MW — without redesign"
            }
          ]
        },
        {
          "@type": "Table",
          "@id": "{{URL}}#table-3",
          "name": "Table 3 — What the Motor Emulator Platform replaces in high-power drive testing",
          "text": "Motor & load: conventional — large physical motor on a high-power dynamometer; Impedyme CHP Series — real-time emulated motor at the inverter output. Mechanical assets: conventional — coupling, cooling, guarding, stored energy; Impedyme CHP Series — no rotating machinery, electrical interface only. Motor variants: conventional — physical machine change per case; Impedyme CHP Series — parameter sets in MotorSim Studio. Transients & limits: conventional — risky and hard to reproduce; Impedyme CHP Series — scripted speed/torque steps, limit and protection cases. Energy handling: conventional — full test power drawn and dissipated; Impedyme CHP Series — regenerative shared DC bus, facility supplies only losses. Measurement: conventional — separate instrumentation per setup; Impedyme CHP Series — FPGA Scope + MLX, synchronized across revisions."
        },
        {
          "@type": "Quotation",
          "@id": "{{URL}}#quote-1",
          "text": "The Impedyme Motor Emulator Platform gave us a controlled and repeatable way to validate a 400 kW, 800 V automotive motor drive across its operating range. It combined high-power bidirectional operation with flexible real-time motor models and reduced our dependence on large mechanical test assets.",
          "creator": {
            "@id": "{{URL}}#renzo-fabian"
          },
          "about": {
            "@id": "{{URL}}#motor-emulator-platform"
          }
        },
        {
          "@type": "Quotation",
          "@id": "{{URL}}#quote-2",
          "text": "The strongest advantage is the ability to test the complete motor-drive operating envelope without repeatedly changing physical machines or mechanical loads.",
          "creator": {
            "@id": "{{URL}}#renzo-fabian"
          },
          "about": {
            "@id": "{{URL}}#motor-emulator-platform"
          }
        },
        {
          "@type": "Quotation",
          "@id": "{{URL}}#quote-3",
          "text": "Organizations testing high-power automotive inverters should consider Impedyme when they need the flexibility of software-defined motor behavior without sacrificing real power operation. The platform supports development, performance testing, regenerative validation, and protection-oriented testing in one scalable environment.",
          "creator": {
            "@id": "{{URL}}#renzo-fabian"
          },
          "about": {
            "@id": "{{URL}}#motor-emulator-platform"
          }
        },
        {
          "@type": "ItemList",
          "@id": "{{URL}}#motor-emulator-platform-specifications",
          "name": "Technical specifications — Impedyme CHP Series High-Power Motor Emulator Platform",
          "about": {
            "@id": "{{URL}}#motor-emulator-platform"
          },
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "item": {
                "@type": "PropertyValue",
                "name": "Drive under test",
                "value": "400 kW, 800 V automotive motor drive"
              }
            },
            {
              "@type": "ListItem",
              "position": 2,
              "item": {
                "@type": "PropertyValue",
                "name": "Drive power",
                "value": 400,
                "unitText": "kW"
              }
            },
            {
              "@type": "ListItem",
              "position": 3,
              "item": {
                "@type": "PropertyValue",
                "name": "Drive voltage architecture",
                "value": 800,
                "unitText": "V"
              }
            },
            {
              "@type": "ListItem",
              "position": 4,
              "item": {
                "@type": "PropertyValue",
                "name": "Real-time motor model",
                "value": "Speed, torque, rotor position, back EMF and dynamic response computed on the FPGA"
              }
            },
            {
              "@type": "ListItem",
              "position": 5,
              "item": {
                "@type": "PropertyValue",
                "name": "Operating regions",
                "value": "Motoring and regeneration — bidirectional, repeatable"
              }
            },
            {
              "@type": "ListItem",
              "position": 6,
              "item": {
                "@type": "PropertyValue",
                "name": "Mechanical assets",
                "value": "No rotating machinery — electrical interface only; no dynamometer, coupling or stored mechanical energy"
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
                "description": "Regenerative shared DC bus — facility supplies only losses"
              }
            },
            {
              "@type": "ListItem",
              "position": 8,
              "item": {
                "@type": "PropertyValue",
                "name": "Channel assignment",
                "value": "Software-assigned channels; modules parallel for higher power"
              }
            },
            {
              "@type": "ListItem",
              "position": 9,
              "item": {
                "@type": "PropertyValue",
                "name": "Power stage",
                "value": "Regenerative, four-quadrant, bidirectional"
              }
            },
            {
              "@type": "ListItem",
              "position": 10,
              "item": {
                "@type": "PropertyValue",
                "name": "Processor per module",
                "value": "AMD/Xilinx Zynq UltraScale+ quad-core Arm + 600K-cell FPGA"
              }
            },
            {
              "@type": "ListItem",
              "position": 11,
              "item": {
                "@type": "PropertyValue",
                "name": "FPGA update rate",
                "value": 200,
                "unitText": "ns",
                "description": "Real-time models on FPGA"
              }
            },
            {
              "@type": "ListItem",
              "position": 12,
              "item": {
                "@type": "PropertyValue",
                "name": "Synchronization links",
                "value": "4 × SFP+ per module, up to 12.5 Gbps",
                "description": "Daisy-chain sync, parallel and multiphase operation"
              }
            },
            {
              "@type": "ListItem",
              "position": 13,
              "item": {
                "@type": "PropertyValue",
                "name": "Module power rating",
                "minValue": 5,
                "maxValue": 50,
                "unitText": "kW",
                "description": "Scalable to 5 MW; same architecture and software"
              }
            },
            {
              "@type": "ListItem",
              "position": 14,
              "item": {
                "@type": "PropertyValue",
                "name": "Protection",
                "value": "Over-voltage, over-current, over-power, over-temperature, short-circuit and desaturation detection, device-level destruction monitoring, soft start/stop"
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
			'{{IMG_DESKTOP}}' => $img_desktop,
			'{{IMG_MOBILE}}'  => $img_mobile,
			'{{IMG_LOGO}}'    => $img_logo,
			'{{DATE}}'        => $date_published,
		)
	);

	echo "\n<script type=\"application/ld+json\">\n" . $schema . "\n</script>\n";
}
