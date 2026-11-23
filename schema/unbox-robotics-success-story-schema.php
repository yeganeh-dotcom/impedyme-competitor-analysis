<?php
/**
 * Unbox Robotics success story — JSON-LD schema.
 * Prints only on the page set in $page_url below (no other URL).
 * Install: add to the child theme's functions.php or the Code Snippets plugin
 * (run everywhere / front-end). Do not include the opening "<?php" twice.
 */
add_action( 'wp_head', 'impedyme_unbox_robotics_success_story_schema', 5 );

function impedyme_unbox_robotics_success_story_schema() {
	// ---- Edit these if the live page or image addresses differ. ----
	$page_url       = 'https://impedyme.com/success-stories/unbox-robotics/';
	$img_desktop    = 'https://impedyme.com/wp-content/uploads/2026/11/Unbox-robotics-desktop-header-scaled.webp';
	$img_mobile     = 'https://impedyme.com/wp-content/uploads/2026/11/unbox-robotics-mobile-header-scaled.webp';
	$img_logo       = 'https://impedyme.com/wp-content/uploads/2026/11/unbox-robotics-logo.webp';
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
      "name": "The Whole Robot in a Rack: Controller Validation at Unbox Robotics — Customer Success Story",
      "description": "How Unbox Robotics validates the motor-control electronics of its warehouse robots with Impedyme's real-time HIL platform, a Custom Sensor Box and motor emulation — all 69 controller I/O channels across 60 V, 24 V and 3.3/5 V domains from one protected test environment: –45 % testing time, –40 % validation time, +55 % test coverage, +50 % system safety.",
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
          "@id": "{{URL}}#image-unbox-logo"
        }
      ],
      "about": [
        {
          "@id": "https://unboxrobotics.com/#organization"
        },
        {
          "@id": "{{URL}}#hil-testbench"
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
          "name": "Unbox Robotics",
          "item": {
            "@id": "https://unboxrobotics.com/#organization"
          }
        }
      ]
    },
    {
      "@type": "Organization",
      "@id": "https://unboxrobotics.com/#organization",
      "name": "Unbox Robotics",
      "url": "https://unboxrobotics.com/",
      "logo": {
        "@id": "{{URL}}#image-unbox-logo"
      },
      "image": {
        "@id": "{{URL}}#image-unbox-logo"
      },
      "foundingDate": "2019",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Pune",
        "addressCountry": "IN"
      },
      "description": "Unbox Robotics, founded in 2019 by Flipkart alumni and headquartered in Pune, India, builds full-stack robotic systems that help retail, logistics, and eCommerce companies automate intra-logistics. Powered by proprietary swarm intelligence, its UnboxSort solutions improve throughput, accuracy, and space efficiency in warehouses and fulfillment centers across India, Europe, and the United States.",
      "knowsAbout": [
        "Warehouse robotics",
        "Intra-logistics automation",
        "Swarm intelligence",
        "Parcel sortation",
        "Robot motor-control electronics"
      ],
      "employee": {
        "@id": "{{URL}}#swaroop-beegala"
      }
    },
    {
      "@type": "Person",
      "@id": "{{URL}}#swaroop-beegala",
      "name": "Swaroop Beegala (customer)",
      "jobTitle": "Sr. Power System Engineer",
      "worksFor": {
        "@id": "https://unboxrobotics.com/#organization"
      },
      "description": "Swaroop Beegala is a Senior Power System Engineer at Unbox Robotics, where he works with the engineering team that validates the motor-control electronics and mixed-voltage I/O of its warehouse-sortation robots on the Impedyme HIL platform.",
      "knowsAbout": [
        "Power systems",
        "Motor-control electronics",
        "Mixed-voltage I/O",
        "Hardware-in-the-Loop (HIL)",
        "Warehouse robotics"
      ]
    },
    {
      "@type": "Thing",
      "@id": "{{URL}}#hil-testbench",
      "name": "Impedyme Real-Time HIL Testbench with Custom Sensor Box and CHP Series Motor Emulation",
      "description": "An integrated validation environment for warehouse-robot motor-control electronics: a real-time HIL platform (AMD/Xilinx Zynq UltraScale+, quad-core Arm + 600K-cell FPGA under IMPEDYME-RT) for deterministic control, monitoring, and model execution; a Custom Sensor Box serving all 69 controller I/O channels across 60 V, 24 V, and 3.3/5 V domains; and CHP Series motor emulation at real current with hall-sensor patterns consistent with the emulated rotor.",
      "image": {
        "@id": "{{URL}}#image-header-desktop"
      }
    },
    {
      "@type": "Thing",
      "@id": "{{URL}}#custom-sensor-box",
      "name": "Impedyme Custom Sensor Box",
      "description": "Application-specific signal-conditioning unit built from Unbox Robotics' I/O compatibility matrix. It performs level shifting, isolation, mode selection, current handling, and protection for each of the 69 controller channels: adjustable 60 V battery-level signals, 24 V industrial I/O, and 3.3/5 V logic, with each digital channel configurable as high-side (PNP), low-side (NPN), push-pull, or open-drain, and analog channels in differential or single-ended operation."
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
      "description": "Platform configuration and test sequencing across motor and Sensor Box channels; automated test cases, operating-condition variation, and safety limits."
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
      "description": "Integrated oscilloscope with adjustable sample rate; real-time FPGA-based signal monitoring and trigger-based, synchronized data capture for control and I/O analysis."
    },
    {
      "@type": "ImageObject",
      "@id": "{{URL}}#image-unbox-logo",
      "contentUrl": "{{IMG_LOGO}}",
      "url": "{{IMG_LOGO}}",
      "encodingFormat": "image/webp",
      "name": "Unbox Robotics logo",
      "caption": "Unbox Robotics logo",
      "copyrightHolder": {
        "@id": "https://unboxrobotics.com/#organization"
      }
    },
    {
      "@type": "ImageObject",
      "@id": "{{URL}}#image-header-desktop",
      "contentUrl": "{{IMG_DESKTOP}}",
      "url": "{{IMG_DESKTOP}}",
      "encodingFormat": "image/webp",
      "name": "Unbox Robotics success story header (desktop)",
      "caption": "Unbox Robotics validates the motor-control electronics of its warehouse robots with Impedyme's real-time HIL platform, Custom Sensor Box and motor emulation — all 69 controller I/O channels from one protected test environment.",
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
      "name": "Unbox Robotics success story header (mobile)",
      "caption": "Unbox Robotics validates the motor-control electronics of its warehouse robots with Impedyme's real-time HIL platform, Custom Sensor Box and motor emulation — all 69 controller I/O channels from one protected test environment.",
      "creator": {
        "@id": "https://impedyme.com/#organization"
      }
    },
    {
      "@type": "TechArticle",
      "@id": "{{URL}}#article",
      "headline": "The Whole Robot in a Rack: Controller Validation at Unbox Robotics",
      "alternativeHeadline": "How Unbox Robotics validates warehouse-robot motor-control electronics and 69 mixed-voltage I/O channels with Impedyme's real-time HIL platform, Custom Sensor Box and motor emulation",
      "description": "See how Unbox Robotics uses Impedyme's real-time HIL platform, a Custom Sensor Box, and motor emulation to validate the motor-control electronics of its warehouse robots — with all 69 controller I/O channels across 60 V, 24 V, and 3.3/5 V domains served from one protected test environment. Learn how the team replaced extensive bench wiring and separate signal-conditioning hardware with one coordinated platform — and began controller and interface validation before the complete robotic mechanism was available.",
      "genre": "Customer success story",
      "articleSection": [
        "The Challenge",
        "The Solution",
        "Architecture",
        "In Practice",
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
          "@id": "https://unboxrobotics.com/#organization"
        },
        {
          "@id": "{{URL}}#hil-testbench"
        },
        {
          "@type": "Thing",
          "name": "Robotics controller validation"
        },
        {
          "@type": "Thing",
          "name": "Hardware-in-the-Loop (HIL)"
        },
        {
          "@type": "Thing",
          "name": "Mixed-voltage I/O testing"
        },
        {
          "@type": "Thing",
          "name": "Motor emulation"
        },
        {
          "@type": "Thing",
          "name": "Warehouse robotics"
        }
      ],
      "mentions": [
        {
          "@id": "https://unboxrobotics.com/#organization"
        },
        {
          "@id": "{{URL}}#swaroop-beegala"
        },
        {
          "@id": "{{URL}}#custom-sensor-box"
        },
        {
          "@id": "{{URL}}#customers-and-partners"
        },
        {
          "@type": "Organization",
          "name": "Flipkart"
        }
      ],
      "keywords": "Unbox Robotics, warehouse robots, Impedyme, real-time HIL, Custom Sensor Box, motor emulation, CHP Series, motor-control electronics, mixed-voltage I/O, 69 I/O channels, 60 V, 24 V, 3.3 V, 5 V, PNP, NPN, push-pull, open-drain, hall sensors, robotics controller validation",
      "hasPart": [
        {
          "@type": "ItemList",
          "@id": "{{URL}}#headline-impact",
          "name": "Headline impact",
          "description": "Impact reported and approved by Unbox Robotics.",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "item": {
                "@type": "PropertyValue",
                "name": "Testing time",
                "value": -45,
                "unitText": "%"
              }
            },
            {
              "@type": "ListItem",
              "position": 2,
              "item": {
                "@type": "PropertyValue",
                "name": "Validation time",
                "value": -40,
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
                "value": 50,
                "unitText": "%"
              }
            }
          ]
        },
        {
          "@type": "WebPageElement",
          "@id": "{{URL}}#the-challenge",
          "name": "The Challenge — A robot's controller speaks many voltages",
          "text": "Unbox Robotics, founded in 2019 by Flipkart alumni and headquartered in Pune, India, builds full-stack robotic systems that help retail, logistics, and eCommerce companies automate intra-logistics. Powered by proprietary swarm intelligence, its UnboxSort solutions improve throughput, accuracy, and space efficiency in warehouses and fulfillment centers across India, Europe, and the United States. In Unbox's own words, its robots combine motors, motor drives, sensors, limit switches, actuators, and control electronics across several voltage domains. Reproducing the complete interface environment required extensive bench wiring and separate signal-conditioning hardware — and the setup had to support 60 V battery-level signals, 24 V industrial I/O, 3.3 V and 5 V logic, high-side and low-side behavior, push-pull and open-drain interfaces, and analog channels while remaining safe and repeatable. Unbox needed one platform that could present the whole robot to the controller — every I/O channel at its real voltage and signaling mode, plus the motor — programmable, repeatable, and safe to fault."
        },
        {
          "@type": "WebPageElement",
          "@id": "{{URL}}#the-solution",
          "name": "The Solution — The robot's whole interface world, emulated",
          "text": "Impedyme began by translating Unbox's detailed I/O requirements into a complete compatibility matrix and an integrated test architecture. The real-time HIL platform provides deterministic control, monitoring, and model execution on an AMD/Xilinx Zynq UltraScale+ (quad-core Arm + 600K-cell FPGA) under IMPEDYME-RT, running MATLAB/Simulink models with a 200 ns FPGA update rate. The Custom Sensor Box performs the level shifting, isolation, mode selection, current handling, and protection each channel needs: adjustable 60 V battery-level signals, 24 V industrial I/O, and 3.3/5 V logic — each digital channel configurable as high-side (PNP), low-side (NPN), push-pull, or open-drain, and analog channels in differential or single-ended operation. Hall-sensor patterns are generated consistent with the emulated rotor position. Motor emulation on the CHP Series completes the picture: the robot's drive stage switches into an emulated three-phase motor at real current — 50 A peak per phase, 0–500 Hz fundamental — with motor models and the protection relay on the FPGA in MotorSim Studio. PowerHIL Studio sequences motor and I/O tests together; FPGA Scope captures synchronized data for every run."
        },
        {
          "@type": "WebPageElement",
          "@id": "{{URL}}#architecture",
          "name": "Architecture — Testbed configuration",
          "text": "Figure 1 — Unbox Robotics testbed: the CHP Series module emulates the motor, the Custom Sensor Box serves all 69 mixed-voltage I/O channels, and the real-time HIL platform coordinates both with robotic-system models. Because every channel's voltage domain and signaling mode is configured in the Sensor Box and every test is a sequence, the same platform serves electronics bring-up and higher-level functional testing. The architecture extends further: mechanical-system models run in real time alongside the motor emulation, additional modules add motor channels over the SFP+ link, and CHP modules are offered from 5 kW to 50 kW, scalable to 5 MW — all in the same software and the same Simulink models."
        },
        {
          "@type": "WebPageElement",
          "@id": "{{URL}}#in-practice",
          "name": "In Practice — 69 channels across multiple electrical standards",
          "text": "Impedyme solved the challenge of interfacing the DUT with 69 channels spanning multiple electrical standards: 28 digital inputs to the DUT, 29 digital outputs from the DUT, and 12 analog inputs to the DUT. The Sensor Box supports battery-level and industrial voltages, configurable high-side, low-side, push-pull, and open-drain behavior, differential or single-ended analog operation, and protected current handling up to 1 A per channel on the 24 V open-drain outputs. The HIL platform coordinates these interfaces with hall-sensor patterns, motor behavior, and real-time robotic-system models — so engineers can script repeatable tests of mixed-voltage interfaces, sensor behavior, motor operating conditions, and selected fault cases, and rerun the same cases after every hardware or firmware change."
        },
        {
          "@type": "Table",
          "@id": "{{URL}}#table-1",
          "name": "Table 1 — The Unbox Robotics I/O compatibility matrix served by the Custom Sensor Box (direction with respect to the DUT)",
          "about": {
            "@id": "{{URL}}#custom-sensor-box"
          },
          "text": "Digital inputs to DUT, 60 V, 10 mA, 2 channels: high-side (PNP), low-side (NPN), push-pull. Digital inputs to DUT, 24 V, 10 mA, 20 channels: high-side (PNP), low-side (NPN), push-pull. Digital inputs to DUT, 3.3 / 5 V, 10 mA, 6 channels: low-side, hall-sensor patterns. Digital outputs from DUT, 60 V, 500 mA / 20 mA, 2 + 3 channels: push-pull. Digital outputs from DUT, 24 V, 1000 mA, 13 channels: open-drain. Digital outputs from DUT, 24 V / 3.3 V, 10 mA, 8 + 3 channels: push-pull or open-drain. Analog inputs to DUT, 60 V / 24 V, 10 mA, 7 + 5 channels: differential or single-ended. Total: 69 channels — 28 DI, 29 DO, 12 AI."
        },
        {
          "@type": "Table",
          "@id": "{{URL}}#table-2",
          "name": "Table 2 — Impedyme software suite included with the Unbox Robotics testbench",
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
              "@id": "{{URL}}#custom-sensor-box"
            }
          ],
          "text": "MotorSim Studio: motor library (Rs, Ld, Lq, Ke, J, pole pairs), mechanical-load and torque-vs-speed profiles, parameter sweeps, and the protection relay executed on the FPGA. PowerHIL Studio: platform configuration and test sequencing across motor and Sensor Box channels; automated test cases, operating-condition variation, and safety limits. IMPEDYME-RT: Linux with Impedyme's proprietary real-time kernel on every module; runs MATLAB/Simulink models on the Arm cores and FPGA (200 ns FPGA update). FPGA Scope: integrated oscilloscope with adjustable sample rate; real-time FPGA-based signal monitoring and trigger-based, synchronized data capture. Sensor Box configuration: per-channel voltage domain, signaling mode (PNP / NPN / push-pull / open-drain), analog differential or single-ended operation, and protection — defined from the I/O compatibility matrix."
        },
        {
          "@type": "WebPageElement",
          "@id": "{{URL}}#the-result",
          "name": "The Result — Controller validation that runs like a regression suite",
          "text": "The platform organizes mixed-voltage I/O, motor-control behavior, and real-time models into a repeatable workflow. Engineers automate test sequences, vary operating conditions in software, capture synchronized data, and rerun the same cases after hardware or firmware changes — reducing manual rewiring, making failures easier to reproduce, and moving more verification ahead of testing on a complete warehouse robot. The measured impact, as reported and approved by Unbox Robotics: development time down 30 %, testing time down 45 %, validation time down 40 %, and testing costs down 30 %; engineering productivity up 40 %, test coverage up 55 %, system safety up 50 %, and confidence before hardware deployment up 50 %. Replacing repeated bench reconstruction with reusable configurations and automated sequences accelerates development, and controller and interface validation begins before the complete robotic mechanism is available. The platform also enabled testing that was previously difficult and time-consuming: repeatable tests of mixed-voltage interfaces, high-side and low-side sensor behavior, push-pull and open-drain outputs, hall-sensor patterns, analog-signal ranges, motor operating conditions, and selected fault cases — scenarios hard to reproduce consistently on a complete robotic system. The result is a controller test cycle that is repeatable, safe to fault, and independent of robot availability — the whole robot, from motor phases to limit switches, reduced to a programmable rack."
        },
        {
          "@type": "ItemList",
          "@id": "{{URL}}#at-a-glance",
          "name": "At a Glance — Key facts",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "69 I/O channels — 28 DI · 29 DO · 12 AI to/from the DUT"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "60 V · 24 V · 3.3/5 V — battery, industrial, and logic domains"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": "PNP / NPN / PP / OD — configurable signaling per channel"
            },
            {
              "@type": "ListItem",
              "position": 4,
              "name": "Up to 1 A — on 24 V open-drain outputs"
            },
            {
              "@type": "ListItem",
              "position": 5,
              "name": "3-phase motor emulation — 50 A peak per phase, 0–500 Hz"
            },
            {
              "@type": "ListItem",
              "position": 6,
              "name": "Hall-sensor patterns — consistent with emulated rotor"
            },
            {
              "@type": "ListItem",
              "position": 7,
              "name": "200 ns FPGA update rate — Zynq UltraScale+, IMPEDYME-RT"
            },
            {
              "@type": "ListItem",
              "position": 8,
              "name": "Module ratings to suit — 5 kW to 50 kW, scalable to 5 MW"
            }
          ]
        },
        {
          "@type": "Table",
          "@id": "{{URL}}#table-3",
          "name": "Table 3 — Impact reported by Unbox Robotics compared with its previous workflow",
          "description": "All quantified benefits reviewed and approved by Unbox Robotics; external publication permission received.",
          "mainEntity": {
            "@type": "ItemList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "item": {
                  "@type": "PropertyValue",
                  "name": "Reduced development time",
                  "value": -30,
                  "unitText": "%"
                }
              },
              {
                "@type": "ListItem",
                "position": 2,
                "item": {
                  "@type": "PropertyValue",
                  "name": "Reduced testing time",
                  "value": -45,
                  "unitText": "%"
                }
              },
              {
                "@type": "ListItem",
                "position": 3,
                "item": {
                  "@type": "PropertyValue",
                  "name": "Reduced validation time",
                  "value": -40,
                  "unitText": "%"
                }
              },
              {
                "@type": "ListItem",
                "position": 4,
                "item": {
                  "@type": "PropertyValue",
                  "name": "Reduced testing costs",
                  "value": -30,
                  "unitText": "%"
                }
              },
              {
                "@type": "ListItem",
                "position": 5,
                "item": {
                  "@type": "PropertyValue",
                  "name": "Improved engineering productivity",
                  "value": 40,
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
                  "value": 50,
                  "unitText": "%"
                }
              },
              {
                "@type": "ListItem",
                "position": 8,
                "item": {
                  "@type": "PropertyValue",
                  "name": "Improved confidence before hardware deployment",
                  "value": 50,
                  "unitText": "%"
                }
              }
            ]
          }
        },
        {
          "@type": "WebPageElement",
          "@id": "{{URL}}#the-added-value",
          "name": "The Added Value — One vendor from motor phases to limit switches",
          "text": "Unbox chose Impedyme because it translated the detailed I/O requirements into a complete compatibility matrix and an integrated architecture: a real-time HIL platform for deterministic control, monitoring, and model execution; a custom sensor box for level shifting, isolation, mode selection, current handling, and protection; and motor emulation with mechanical-system models — a practical path from controller I/O verification to closed-loop robotic-system validation. The features Unbox rates most valuable — real-time HIL simulation, the Custom Sensor Box, motor emulation, mixed-voltage I/O, high-side and low-side modes, push-pull and open-drain modes, differential analog outputs, MATLAB and Simulink integration, automated test and data capture, and technical support and customization — are the testbench. And every module is a fault-isolating unit with layered protection — over-voltage, over-current, over-power, over-temperature, short-circuit and desaturation detection, device-level destruction monitoring, and soft start/stop — so a test that goes wrong stops the test, not the program."
        },
        {
          "@type": "ItemList",
          "@id": "{{URL}}#why-it-works",
          "name": "Why It Works — The advantages",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "All 69 controller I/O channels served from one protected platform"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "60 V, 24 V, and 3.3/5 V domains — no custom interface circuit per test"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": "PNP, NPN, push-pull, and open-drain configurable per channel"
            },
            {
              "@type": "ListItem",
              "position": 4,
              "name": "Motor emulated at real current with consistent hall-sensor patterns"
            },
            {
              "@type": "ListItem",
              "position": 5,
              "name": "Automated sequences rerun after every hardware or firmware change"
            },
            {
              "@type": "ListItem",
              "position": 6,
              "name": "Controller validation starts before the robot exists"
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
            }
          ]
        },
        {
          "@type": "Table",
          "@id": "{{URL}}#table-4",
          "name": "Table 4 — What the Impedyme testbench replaces on Unbox Robotics' validation bench",
          "text": "Interface wiring: conventional — extensive bench wiring per test; Impedyme — Custom Sensor Box with 69 channels from one compatibility matrix. Signal conditioning: conventional — separate level shifters and fixtures; Impedyme — isolation, level shifting, mode selection, and protection built in. Motor & load: conventional — physical motor on a shaft; Impedyme — CHP Series motor emulation at real current, 0–500 Hz. Position feedback: conventional — physical hall sensors on the rig; Impedyme — hall patterns generated consistent with the emulated rotor. Fault testing: conventional — risky, manual, hard to reproduce; Impedyme — scripted sensor, I/O, and motor fault cases behind FPGA protection. Real-time simulation: conventional — separate third-party HIL box; Impedyme — IMPEDYME-RT with Simulink models on Arm + FPGA."
        },
        {
          "@type": "Quotation",
          "@id": "{{URL}}#quote-1",
          "text": "Impedyme developed an integrated HIL and custom sensor-box solution around our detailed robotics I/O requirements. The platform gives our team a controlled and repeatable way to validate motor-control electronics, mixed-voltage interfaces, and system behavior before full-machine testing.",
          "creator": {
            "@id": "{{URL}}#swaroop-beegala"
          },
          "about": {
            "@id": "{{URL}}#hil-testbench"
          }
        },
        {
          "@type": "Quotation",
          "@id": "{{URL}}#quote-2",
          "text": "The strongest advantage is the ability to validate a complex robotic controller through one coordinated platform. The solution supports all 69 requested channels and the required voltage and signaling modes without forcing the development team to assemble a different interface circuit for each test.",
          "creator": {
            "@id": "{{URL}}#swaroop-beegala"
          },
          "about": {
            "@id": "{{URL}}#hil-testbench"
          }
        },
        {
          "@type": "Quotation",
          "@id": "{{URL}}#quote-3",
          "text": "Impedyme is a strong choice for robotics teams that need more than a standard HIL simulator. Their engineering team can combine real-time models, motor emulation, and application-specific signal conditioning into one validation environment tailored to the actual controller and machine interfaces.",
          "creator": {
            "@id": "{{URL}}#swaroop-beegala"
          },
          "about": {
            "@id": "{{URL}}#hil-testbench"
          }
        },
        {
          "@type": "ItemList",
          "@id": "{{URL}}#hil-testbench-specifications",
          "name": "Technical specifications — Impedyme Real-Time HIL Testbench with Custom Sensor Box and CHP Series Motor Emulation",
          "about": {
            "@id": "{{URL}}#hil-testbench"
          },
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "item": {
                "@type": "PropertyValue",
                "name": "Controller I/O channels",
                "value": 69,
                "description": "28 digital inputs to the DUT, 29 digital outputs from the DUT, 12 analog inputs to the DUT"
              }
            },
            {
              "@type": "ListItem",
              "position": 2,
              "item": {
                "@type": "PropertyValue",
                "name": "Voltage domains",
                "value": "60 V battery-level, 24 V industrial, 3.3 / 5 V logic"
              }
            },
            {
              "@type": "ListItem",
              "position": 3,
              "item": {
                "@type": "PropertyValue",
                "name": "Signaling modes",
                "value": "High-side (PNP), low-side (NPN), push-pull, open-drain — configurable per channel; analog differential or single-ended"
              }
            },
            {
              "@type": "ListItem",
              "position": 4,
              "item": {
                "@type": "PropertyValue",
                "name": "Output current handling",
                "maxValue": 1,
                "unitText": "A",
                "description": "Per channel on the 24 V open-drain outputs"
              }
            },
            {
              "@type": "ListItem",
              "position": 5,
              "item": {
                "@type": "PropertyValue",
                "name": "Motor emulation",
                "value": "Three-phase, 50 A peak per phase, 0–500 Hz fundamental"
              }
            },
            {
              "@type": "ListItem",
              "position": 6,
              "item": {
                "@type": "PropertyValue",
                "name": "Motor phase current",
                "value": 50,
                "unitText": "A",
                "description": "Peak per phase"
              }
            },
            {
              "@type": "ListItem",
              "position": 7,
              "item": {
                "@type": "PropertyValue",
                "name": "Fundamental frequency",
                "minValue": 0,
                "maxValue": 500,
                "unitText": "Hz"
              }
            },
            {
              "@type": "ListItem",
              "position": 8,
              "item": {
                "@type": "PropertyValue",
                "name": "Position feedback",
                "value": "Hall-sensor patterns generated consistent with the emulated rotor position"
              }
            },
            {
              "@type": "ListItem",
              "position": 9,
              "item": {
                "@type": "PropertyValue",
                "name": "Processor",
                "value": "AMD/Xilinx Zynq UltraScale+ quad-core Arm + 600K-cell FPGA"
              }
            },
            {
              "@type": "ListItem",
              "position": 10,
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
              "position": 11,
              "item": {
                "@type": "PropertyValue",
                "name": "Module power rating",
                "minValue": 5,
                "maxValue": 50,
                "unitText": "kW",
                "description": "CHP modules scalable to 5 MW; additional motor channels over the SFP+ link"
              }
            },
            {
              "@type": "ListItem",
              "position": 12,
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
