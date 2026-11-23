<?php
/**
 * JLG Industries success story — JSON-LD schema.
 * Prints only on the page set in $page_url below (no other URL).
 * Install: add to the child theme's functions.php or the Code Snippets plugin
 * (run everywhere / front-end). Do not include the opening "<?php" twice.
 */
add_action( 'wp_head', 'impedyme_jlg_success_story_schema', 5 );

function impedyme_jlg_success_story_schema() {
	// ---- Edit these if the live page or image addresses differ. ----
	$page_url       = 'https://impedyme.com/success-stories/jlg-industries/';
	$img_desktop    = 'https://impedyme.com/wp-content/uploads/2026/11/jlg-desktop-header-scaled.webp';
	$img_mobile     = 'https://impedyme.com/wp-content/uploads/2026/11/jlg-mobile-header-scaled.webp';
	$img_logo       = 'https://impedyme.com/wp-content/uploads/2026/11/jlg-logo.webp';
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
      "name": "One Bench for the Whole Electric Powertrain — JLG Industries Customer Success Story",
      "description": "How JLG Industries validates battery, inverter, and motor interactions with an Impedyme Motor Emulator integrated with the NI NHR Battery Emulator: –50 % testing time, –45 % validation time, +55 % test coverage, +60 % system safety.",
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
          "@id": "{{URL}}#image-jlg-logo"
        }
      ],
      "about": [
        {
          "@id": "https://www.jlg.com/#organization"
        },
        {
          "@id": "{{URL}}#powertrain-testbench"
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
          "name": "JLG Industries",
          "item": {
            "@id": "https://www.jlg.com/#organization"
          }
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "NI",
          "item": {
            "@id": "https://www.ni.com/#organization"
          }
        }
      ]
    },
    {
      "@type": "Organization",
      "@id": "https://www.oshkoshcorp.com/#organization",
      "name": "Oshkosh Corporation",
      "url": "https://www.oshkoshcorp.com/"
    },
    {
      "@type": "Organization",
      "@id": "https://www.jlg.com/#organization",
      "name": "JLG Industries",
      "legalName": "JLG Industries, Inc.",
      "url": "https://www.jlg.com/",
      "logo": {
        "@id": "{{URL}}#image-jlg-logo"
      },
      "image": {
        "@id": "{{URL}}#image-jlg-logo"
      },
      "parentOrganization": {
        "@id": "https://www.oshkoshcorp.com/#organization"
      },
      "description": "JLG Industries, an Oshkosh Corporation business, designs and manufactures access equipment — aerial work platforms and telehandlers — for construction, industrial, and rental markets worldwide.",
      "knowsAbout": [
        "Access equipment",
        "Aerial work platforms",
        "Telehandlers",
        "Electric powertrains for mobile equipment",
        "Equipment electrification"
      ],
      "employee": {
        "@id": "{{URL}}#david-lombardo"
      }
    },
    {
      "@type": "Organization",
      "@id": "https://www.ni.com/#organization",
      "name": "NI",
      "url": "https://www.ni.com/",
      "description": "Test and measurement company whose NHR product line includes battery emulators."
    },
    {
      "@type": "Person",
      "@id": "{{URL}}#david-lombardo",
      "name": "David Lombardo (customer)",
      "jobTitle": "Sr. Chief Engineer",
      "worksFor": {
        "@id": "https://www.jlg.com/#organization"
      },
      "description": "David Lombardo is Sr. Chief Engineer at JLG Industries, where the integrated Impedyme Motor Emulator and NI NHR Battery Emulator testbench is used to validate the complete electric powertrain of electrified mobile equipment.",
      "knowsAbout": [
        "Electric powertrains",
        "Traction inverters",
        "Battery emulation",
        "Motor emulation",
        "Powertrain validation"
      ]
    },
    {
      "@type": "Thing",
      "@id": "{{URL}}#powertrain-testbench",
      "name": "Impedyme CHP Series Motor Emulator Testbench for integrated powertrain validation",
      "description": "An Impedyme Motor Emulator built on the CHP Series, integrated by Impedyme with the NI NHR Battery Emulator in JLG's lab, forming one coordinated environment that validates the complete electric powertrain — DC energy source, traction inverter, motor and mechanical load — including regenerative energy flow back to the emulated battery. Every CHP module is a regenerative, four-quadrant, bidirectional power stage with an AMD/Xilinx Zynq UltraScale+ quad-core Arm processor and 600K-cell FPGA running IMPEDYME-RT.",
      "image": {
        "@id": "{{URL}}#image-header-desktop"
      }
    },
    {
      "@type": "Service",
      "@id": "{{URL}}#ni-nhr-integration",
      "name": "NI NHR integration",
      "provider": {
        "@id": "https://impedyme.com/#organization"
      },
      "serviceType": "Test-system integration",
      "description": "Integration delivered by Impedyme: coordinates NI NHR battery setpoints and conditions with motor-emulator operating points in shared test sequences, with synchronized measurement and consolidated data."
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
      "@id": "{{URL}}#image-jlg-logo",
      "contentUrl": "{{IMG_LOGO}}",
      "url": "{{IMG_LOGO}}",
      "encodingFormat": "image/webp",
      "name": "JLG Industries logo",
      "caption": "JLG Industries logo",
      "copyrightHolder": {
        "@id": "https://www.jlg.com/#organization"
      }
    },
    {
      "@type": "ImageObject",
      "@id": "{{URL}}#image-header-desktop",
      "contentUrl": "{{IMG_DESKTOP}}",
      "url": "{{IMG_DESKTOP}}",
      "encodingFormat": "image/webp",
      "name": "JLG Industries success story header (desktop)",
      "caption": "One Bench for the Whole Electric Powertrain — JLG Industries validates battery, inverter, and motor interactions with an Impedyme Motor Emulator integrated with the NI NHR Battery Emulator.",
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
      "name": "JLG Industries success story header (mobile)",
      "caption": "One Bench for the Whole Electric Powertrain — JLG Industries validates battery, inverter, and motor interactions with an Impedyme Motor Emulator integrated with the NI NHR Battery Emulator.",
      "creator": {
        "@id": "https://impedyme.com/#organization"
      }
    },
    {
      "@type": "TechArticle",
      "@id": "{{URL}}#article",
      "headline": "One Bench for the Whole Electric Powertrain",
      "alternativeHeadline": "How JLG Industries validates battery, inverter, and motor interactions with an Impedyme Motor Emulator integrated with the NI NHR Battery Emulator",
      "description": "See how JLG Industries uses an Impedyme Motor Emulator, integrated by Impedyme with the NI NHR Battery Emulator, to validate the complete electric powertrain — from the DC energy source, through the traction inverter, to the motor and its mechanical load. Learn how one coordinated testbench lets JLG engineers move from inverter bring-up to powertrain-level validation without rebuilding the bench — including regenerative energy flow back to the emulated battery, under controlled and repeatable conditions.",
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
          "@id": "https://www.jlg.com/#organization"
        },
        {
          "@id": "{{URL}}#powertrain-testbench"
        },
        {
          "@type": "Thing",
          "name": "Electric powertrain validation"
        },
        {
          "@type": "Thing",
          "name": "Motor emulation"
        },
        {
          "@type": "Thing",
          "name": "Battery emulation"
        },
        {
          "@type": "Thing",
          "name": "Traction inverter validation"
        },
        {
          "@type": "Thing",
          "name": "Regenerative energy flow"
        },
        {
          "@type": "Thing",
          "name": "Power Hardware-in-the-Loop (PHIL)"
        }
      ],
      "mentions": [
        {
          "@id": "https://www.jlg.com/#organization"
        },
        {
          "@id": "https://www.oshkoshcorp.com/#organization"
        },
        {
          "@id": "https://www.ni.com/#organization"
        },
        {
          "@id": "{{URL}}#ni-nhr-integration"
        },
        {
          "@id": "{{URL}}#david-lombardo"
        },
        {
          "@id": "{{URL}}#customers-and-partners"
        }
      ],
      "keywords": "JLG Industries, Oshkosh Corporation, Impedyme, motor emulator, battery emulator, CHP Series, Power HIL, electric powertrain, traction inverter, regenerative energy flow, bidirectional power, DC-bus transients, aerial work platforms, telehandlers, mobile equipment electrification",
      "hasPart": [
        {
          "@type": "ItemList",
          "@id": "{{URL}}#headline-impact",
          "name": "Headline impact",
          "description": "Impact reported and approved by JLG Industries.",
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
          "name": "The Challenge — A powertrain is more than its parts",
          "text": "JLG Industries, an Oshkosh Corporation business, designs and manufactures access equipment — aerial work platforms and telehandlers — for construction, industrial, and rental markets worldwide. As that equipment electrifies, the battery, the traction inverter, and the motor have to be proven not only as components but as one powertrain, under every operating and regenerative condition a machine will see in the field. Validating an electric powertrain as a complete system normally requires a physical battery pack, a traction motor, a mechanical dynamometer, the inverter, instrumentation, and multiple safety and control layers. Separate motor and battery test systems create integration challenges of their own — inconsistent interfaces and fragmented data that make it hard to see how the battery, inverter, and motor interact. JLG needed a repeatable way to evaluate the powertrain from the DC energy source through the inverter to the motor and mechanical load — in one coordinated test environment rather than two independent pieces of equipment."
        },
        {
          "@type": "WebPageElement",
          "@id": "{{URL}}#the-solution",
          "name": "The Solution — Motor and battery emulation, integrated as one system",
          "text": "Impedyme supplied a Motor Emulator built on the CHP Series and took responsibility for integrating it with the NI NHR Battery Emulator already in JLG's lab — creating one coordinated test environment instead of two independent instruments. Every CHP module is a regenerative, four-quadrant, bidirectional power stage with its own AMD/Xilinx Zynq UltraScale+ quad-core Arm processor and 600K-cell FPGA running IMPEDYME-RT — a Linux OS with Impedyme's proprietary real-time kernel that executes MATLAB/Simulink models directly on the Arm cores and the FPGA with a 200 ns FPGA update rate. CHP modules are offered across a power range from 5 kW to 50 kW, scalable to 5 MW, so the same architecture sizes to the program. On the motor side, the traction inverter's three-phase output connects to the Impedyme Motor Emulator. A real-time motor model runs on the FPGA, so motor parameters, speed and torque operating points, and mechanical loads are configured in software in MotorSim Studio rather than on a dynamometer. On the DC side, the NI NHR system represents the battery, providing controlled DC-source and sink behavior at programmable voltages and battery conditions. Impedyme's integration ties the two together: shared operating sequences, coordinated measurement and control, and synchronized testing across both emulators, so motor operating points, mechanical loads, battery conditions, and regenerative energy flow are commanded from one test architecture. PowerHIL Studio sequences the tests and enforces the safety envelope; FPGA Scope captures the inverter phases synchronously; MLX brings the combined data back into MATLAB."
        },
        {
          "@type": "WebPageElement",
          "@id": "{{URL}}#in-practice",
          "name": "In Practice — The complete bidirectional power path, under control",
          "text": "A representative validation scenario connects the NI NHR Battery Emulator to the inverter's DC input and the Impedyme Motor Emulator to the inverter's three-phase output. Engineers command motor speed and torque conditions, vary mechanical loading, and evaluate inverter current, voltage, control response, and protection behavior. During regenerative operation, power flows back through the inverter toward the emulated battery, so the complete bidirectional power path is tested under controlled and repeatable conditions — battery-voltage conditions, motor speed and torque sweeps, dynamic load changes, DC-bus transients, and coordinated powertrain fault or limit tests that would be difficult, expensive, or unsafe to reproduce consistently with physical battery packs and motors."
        },
        {
          "@type": "WebPageElement",
          "@id": "{{URL}}#architecture",
          "name": "Architecture — Testbed configuration",
          "text": "Figure 1 — JLG Industries testbed: the NI NHR Battery Emulator feeds the inverter's DC input, the Impedyme Motor Emulator loads its three-phase output, and Impedyme's integration coordinates both — including regenerative power flow back to the emulated battery. Because the motor is a model and the battery is programmable, the same bench moves through inverter bring-up, motor-control development, battery-interaction testing, and powertrain-level validation without being rebuilt. Motor parameters and mechanical loads are configured in software, the battery emulator provides the DC-source and sink behavior, and shared operating sequences make it easy to compare results and isolate issues across the electrical powertrain. Adding CHP modules — scalable to 5 MW in the same architecture — extends power and channels without changing models, scripts, or the software suite."
        },
        {
          "@type": "Table",
          "@id": "{{URL}}#table-1",
          "name": "Table 1 — Impedyme software and integration delivered with the JLG testbench",
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
            },
            {
              "@id": "{{URL}}#ni-nhr-integration"
            }
          ],
          "text": "MotorSim Studio: motor library (Rs, Ld, Lq, Ke, J, pole pairs), mechanical-load and torque-vs-speed profiles, parameter sweeps, and the protection relay executed on the FPGA. PowerHIL Studio: cabinet-level control and signal routing; per-module mode and reference selection; dynamic test sequencing; failure emulation; safety limits and device-level protections; launches MLX, Simulink, and FPGA Scope. IMPEDYME-RT: Linux with Impedyme's proprietary real-time kernel on every module; runs MATLAB/Simulink models on the Arm cores and FPGA (200 ns FPGA update). FPGA Scope: on-module oscilloscope with waveform preview, per-phase real-time monitoring, trigger-based capture, measurement table, and sync verification across modules. MLX: operating-point sweeps, efficiency and response metrics, pass/fail overlays, and automated test reports. NI NHR integration: coordinates NI NHR battery setpoints and conditions with motor-emulator operating points in shared test sequences, with synchronized measurement and consolidated data."
        },
        {
          "@type": "WebPageElement",
          "@id": "{{URL}}#the-result",
          "name": "The Result — Battery, inverter, and motor — validated together",
          "text": "The integrated platform lets JLG's team move through inverter bring-up, motor-control development, battery-interaction testing, and powertrain-level validation on one bench. Interactions between the battery, inverter, and motor are identified earlier — before complete vehicles or specialized mechanical assets are committed — and the same automated scenarios are repeated across control and hardware revisions. The measured impact, as reported and approved by JLG Industries: development time down 35 %, testing time down 50 %, validation time down 45 %, and testing costs down 35 %; engineering productivity up 45 %, test coverage up 55 %, system safety up 60 %, and confidence before hardware deployment up 55 %. The unified motor-and-battery testbench reduces integration effort and accelerates the development cycle. The platform also enabled testing that was previously difficult, expensive, or impossible: repeatable battery-voltage conditions, motor speed and torque sweeps, regenerative operation, dynamic load changes, DC-bus transients, and coordinated powertrain fault or limit testing — all without physical battery packs, motors, or a dynamometer. The result is a complete electric-powertrain validation environment — one coordinated workflow for component and powertrain-level testing."
        },
        {
          "@type": "ItemList",
          "@id": "{{URL}}#at-a-glance",
          "name": "At a Glance — Key metrics",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Motor emulation — real-time model on FPGA, software-defined loads"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "NI NHR battery emulation — integrated and sequenced by Impedyme"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": "Bidirectional power path — motoring and regeneration, repeatable"
            },
            {
              "@type": "ListItem",
              "position": 4,
              "name": "Synchronized data — shared sequences across both emulators"
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
          "name": "Table 2 — Impact reported by JLG Industries compared with its previous workflow",
          "description": "All quantified benefits reviewed and approved by JLG Industries; external publication permission received.",
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
          "name": "The Added Value — Integration is the product",
          "text": "JLG selected Impedyme because Impedyme provided the Motor Emulator and took responsibility for integrating it with the NI NHR Battery Emulator — one coordinated test environment, with configurable motor and battery behavior, bidirectional power flow, regenerative operation, synchronized testing, and a clearer path from component validation to complete powertrain verification. The capabilities JLG rates most valuable — motor emulation, NI NHR battery emulation, real-time FPGA-based simulation, traction-inverter validation, bidirectional power operation, regenerative energy-flow testing, integrated powertrain validation, dynamic motor and battery conditions, coordinated measurement and control, and system integration and support — are the ones this testbench exercises every day. And every module is a fault-isolating unit with layered protection — over-voltage, over-current, over-power, over-temperature, short-circuit and desaturation detection, device-level destruction monitoring, and soft start/stop — so a test that goes wrong stops the test, not the program."
        },
        {
          "@type": "ItemList",
          "@id": "{{URL}}#why-it-works",
          "name": "Why It Works — The advantages",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Complete powertrain on one bench — battery, inverter, motor, load"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Impedyme-integrated NI NHR battery emulation — one coordinated system"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": "Motor parameters and mechanical loads defined in software"
            },
            {
              "@type": "ListItem",
              "position": 4,
              "name": "Regenerative energy flow tested back to the emulated battery"
            },
            {
              "@type": "ListItem",
              "position": 5,
              "name": "Speed/torque sweeps, DC-bus transients, fault and limit tests — repeatable"
            },
            {
              "@type": "ListItem",
              "position": 6,
              "name": "Shared sequences and synchronized measurements across emulators"
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
          "name": "Table 3 — What the integrated testbench replaces on JLG's powertrain bench",
          "text": "Motor & load: conventional — traction motor on a mechanical dynamometer; Impedyme + NI NHR — Impedyme Motor Emulator with real-time motor model and software-defined mechanical load. Energy source: conventional — physical battery pack; Impedyme + NI NHR — NI NHR Battery Emulator with programmable voltage and battery conditions. Integration: conventional — separate motor and battery systems, fragmented data; Impedyme + NI NHR — one coordinated environment integrated by Impedyme with shared sequences and data. Regeneration: conventional — hard to control and repeat; Impedyme + NI NHR — bidirectional power path tested under controlled conditions. Fault & limit tests: conventional — risky with physical packs and motors; Impedyme + NI NHR — coordinated powertrain fault and limit tests behind layered protection. Real-time simulator: conventional — separate third-party HIL box; Impedyme + NI NHR — IMPEDYME-RT on every module, 200 ns FPGA update."
        },
        {
          "@type": "Quotation",
          "@id": "{{URL}}#quote-1",
          "text": "Impedyme delivered more than a motor emulator; they integrated the Motor Emulator with our NI NHR Battery Emulator to provide a complete electric-powertrain validation environment. The solution allows us to evaluate battery, inverter, motor, and regenerative interactions with the repeatability and control needed for engineering development.",
          "creator": {
            "@id": "{{URL}}#david-lombardo"
          },
          "about": {
            "@id": "{{URL}}#powertrain-testbench"
          }
        },
        {
          "@type": "Quotation",
          "@id": "{{URL}}#quote-2",
          "text": "The greatest value is the fully integrated solution. Engineers can validate the inverter against a real-time motor model while the NI NHR system represents the battery on the DC side.",
          "creator": {
            "@id": "{{URL}}#david-lombardo"
          },
          "about": {
            "@id": "{{URL}}#powertrain-testbench"
          }
        },
        {
          "@type": "Quotation",
          "@id": "{{URL}}#quote-3",
          "text": "Organizations developing electrified mobile equipment should consider Impedyme when they need a complete validation environment instead of disconnected motor and battery test assets. Impedyme's integration capability brings the systems together into one coordinated workflow for component and powertrain-level testing.",
          "creator": {
            "@id": "{{URL}}#david-lombardo"
          },
          "about": {
            "@id": "{{URL}}#powertrain-testbench"
          }
        },
        {
          "@type": "ItemList",
          "@id": "{{URL}}#powertrain-testbench-specifications",
          "name": "Technical specifications — Impedyme CHP Series Motor Emulator Testbench for integrated powertrain validation",
          "about": {
            "@id": "{{URL}}#powertrain-testbench"
          },
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "item": {
                "@type": "PropertyValue",
                "name": "Motor emulation",
                "value": "Real-time motor model on FPGA, software-defined mechanical loads"
              }
            },
            {
              "@type": "ListItem",
              "position": 2,
              "item": {
                "@type": "PropertyValue",
                "name": "Battery emulation",
                "value": "NI NHR Battery Emulator, integrated and sequenced by Impedyme"
              }
            },
            {
              "@type": "ListItem",
              "position": 3,
              "item": {
                "@type": "PropertyValue",
                "name": "Power path",
                "value": "Bidirectional — motoring and regeneration, repeatable"
              }
            },
            {
              "@type": "ListItem",
              "position": 4,
              "item": {
                "@type": "PropertyValue",
                "name": "Data",
                "value": "Shared sequences and synchronized measurement across both emulators"
              }
            },
            {
              "@type": "ListItem",
              "position": 5,
              "item": {
                "@type": "PropertyValue",
                "name": "Power stage",
                "value": "Regenerative, four-quadrant, bidirectional"
              }
            },
            {
              "@type": "ListItem",
              "position": 6,
              "item": {
                "@type": "PropertyValue",
                "name": "Processor per module",
                "value": "AMD/Xilinx Zynq UltraScale+ quad-core Arm + 600K-cell FPGA"
              }
            },
            {
              "@type": "ListItem",
              "position": 7,
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
              "position": 8,
              "item": {
                "@type": "PropertyValue",
                "name": "Synchronization links",
                "value": "4 × SFP+ per module, up to 12.5 Gbps",
                "description": "Daisy-chain sync, parallel and multiphase operation"
              }
            },
            {
              "@type": "ListItem",
              "position": 9,
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
              "position": 10,
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
