<?php
/**
 * Lucid Motors success story — JSON-LD schema.
 * Prints only on the page set in $page_url below (no other URL).
 * Install: add to the child theme's functions.php or the Code Snippets plugin
 * (run everywhere / front-end). Do not include the opening "<?php" twice.
 */
add_action( 'wp_head', 'impedyme_lucid_success_story_schema', 5 );

function impedyme_lucid_success_story_schema() {
	// ---- Edit these if the live page or image addresses differ. ----
	$page_url       = 'https://impedyme.com/success-stories/lucid-motors/';
	$img_desktop    = 'https://impedyme.com/wp-content/uploads/2026/11/Lucid-header-desktop-scaled.webp';
	$img_mobile     = 'https://impedyme.com/wp-content/uploads/2026/11/lucid-header-mobile.webp';
	$img_logo       = 'https://impedyme.com/wp-content/uploads/2026/11/Lucid-logo.webp';
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
      "name": "Both Sides of the Inverter: EV Motor & Battery Emulation — Lucid Motors Customer Success Story",
      "description": "How Lucid Motors validates traction inverters and electric powertrains with high-power motor emulation and battery-pack emulation on one Impedyme platform: –50 % testing time, –45 % validation time, +55 % test coverage, +60 % system safety.",
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
          "@id": "{{URL}}#image-lucid-logo"
        }
      ],
      "about": [
        {
          "@id": "https://lucidmotors.com/#organization"
        },
        {
          "@id": "{{URL}}#motor-battery-emulator"
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
          "name": "Lucid Motors",
          "item": {
            "@id": "https://lucidmotors.com/#organization"
          }
        }
      ]
    },
    {
      "@type": "Organization",
      "@id": "https://lucidmotors.com/#organization",
      "name": "Lucid Motors",
      "url": "https://lucidmotors.com/",
      "logo": {
        "@id": "{{URL}}#image-lucid-logo"
      },
      "image": {
        "@id": "{{URL}}#image-lucid-logo"
      },
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Newark",
        "addressRegion": "CA",
        "addressCountry": "US"
      },
      "description": "Lucid Motors, headquartered in Newark, California, designs and builds luxury electric vehicles around powertrain, battery, and power-electronics technology it develops in-house.",
      "knowsAbout": [
        "Luxury electric vehicles",
        "In-house EV powertrains",
        "Traction inverters",
        "High-voltage batteries",
        "Power electronics"
      ],
      "employee": {
        "@id": "{{URL}}#saeid-amiri"
      }
    },
    {
      "@type": "Person",
      "@id": "{{URL}}#saeid-amiri",
      "name": "Saeid Amiri (customer)",
      "honorificPrefix": "Dr.",
      "jobTitle": "Technical Specialist, High Voltage Battery Testing",
      "worksFor": {
        "@id": "https://lucidmotors.com/#organization"
      },
      "description": "Dr. Saeid Amiri is Technical Specialist for High Voltage Battery Testing at Lucid Motors, working on design-validation testing and automated 24/7 HIL platforms for electric-powertrain and high-voltage battery development — including the traction-inverter and battery-emulation work on the Impedyme platform.",
      "knowsAbout": [
        "High-voltage battery testing",
        "Design-validation testing",
        "Hardware-in-the-Loop (HIL)",
        "Traction inverters",
        "Battery emulation",
        "Electric powertrains"
      ]
    },
    {
      "@type": "Thing",
      "@id": "{{URL}}#motor-battery-emulator",
      "name": "Impedyme CHP Series High-Power Motor Emulator with Battery-Pack Emulation",
      "description": "A high-power motor emulator built on the CHP Series that combines real-time motor models with bidirectional power hardware, and that the same platform configures to emulate the battery pack — validating the traction inverter at full power from both sides: the motor on the AC side and the battery pack on the DC side, with regenerative energy recirculated on a shared DC bus. Every CHP module is a regenerative, four-quadrant, bidirectional power stage with an AMD/Xilinx Zynq UltraScale+ quad-core Arm processor and 600K-cell FPGA running IMPEDYME-RT.",
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
      "description": "Linux with Impedyme's proprietary real-time kernel on every module; runs the battery-pack and powertrain models in MATLAB/Simulink on the Arm cores and FPGA (200 ns FPGA update); real-time monitoring and parameter tuning from MATLAB."
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
      "@id": "{{URL}}#image-lucid-logo",
      "contentUrl": "{{IMG_LOGO}}",
      "url": "{{IMG_LOGO}}",
      "encodingFormat": "image/webp",
      "name": "Lucid Motors logo",
      "caption": "Lucid Motors logo",
      "copyrightHolder": {
        "@id": "https://lucidmotors.com/#organization"
      }
    },
    {
      "@type": "ImageObject",
      "@id": "{{URL}}#image-header-desktop",
      "contentUrl": "{{IMG_DESKTOP}}",
      "url": "{{IMG_DESKTOP}}",
      "encodingFormat": "image/webp",
      "name": "Lucid Motors success story header (desktop)",
      "caption": "Both Sides of the Inverter: EV Motor & Battery Emulation — Lucid Motors validates traction inverters and electric powertrains with high-power motor emulation and battery-pack emulation on one Impedyme platform.",
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
      "name": "Lucid Motors success story header (mobile)",
      "caption": "Both Sides of the Inverter: EV Motor & Battery Emulation — Lucid Motors validates traction inverters and electric powertrains with high-power motor emulation and battery-pack emulation on one Impedyme platform.",
      "creator": {
        "@id": "https://impedyme.com/#organization"
      }
    },
    {
      "@type": "TechArticle",
      "@id": "{{URL}}#article",
      "headline": "Both Sides of the Inverter: EV Motor & Battery Emulation",
      "alternativeHeadline": "How Lucid Motors validates traction inverters and electric powertrains with high-power motor emulation and battery-pack emulation on one Impedyme platform",
      "description": "See how Lucid Motors uses Impedyme's high-power motor emulator — with battery-pack emulation on the same platform — to validate traction inverters at full power without a physical traction motor, dynamometer, or battery pack. Learn how one configurable environment lets engineers address both sides of the traction inverter — the motor on the AC side and the battery pack on the DC side — and evaluate integrated energy flow with consistent software and measurements.",
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
          "@id": "https://lucidmotors.com/#organization"
        },
        {
          "@id": "{{URL}}#motor-battery-emulator"
        },
        {
          "@type": "Thing",
          "name": "Traction inverter validation"
        },
        {
          "@type": "Thing",
          "name": "High-power motor emulation"
        },
        {
          "@type": "Thing",
          "name": "Battery-pack emulation"
        },
        {
          "@type": "Thing",
          "name": "Regenerative energy flow"
        },
        {
          "@type": "Thing",
          "name": "Electric powertrain validation"
        },
        {
          "@type": "Thing",
          "name": "Power Hardware-in-the-Loop (PHIL)"
        }
      ],
      "mentions": [
        {
          "@id": "https://lucidmotors.com/#organization"
        },
        {
          "@id": "{{URL}}#saeid-amiri"
        },
        {
          "@id": "{{URL}}#customers-and-partners"
        }
      ],
      "keywords": "Lucid Motors, Impedyme, high-power motor emulator, battery-pack emulation, battery emulator, CHP Series, Power HIL, traction inverter, electric powertrain, EV propulsion, regenerative operation, DC-bus transients, shared DC bus, dynamometer replacement, 24/7 HIL",
      "hasPart": [
        {
          "@type": "ItemList",
          "@id": "{{URL}}#headline-impact",
          "name": "Headline impact",
          "description": "Impact reported and approved by Lucid Motors.",
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
          "name": "The Challenge — Full-power propulsion testing without the full-power rig",
          "text": "Lucid Motors, headquartered in Newark, California, designs and builds luxury electric vehicles around powertrain, battery, and power-electronics technology it develops in-house. At that level of integration, the traction inverter has to be validated at full power against the motor and the high-voltage battery it will see in the vehicle — across motoring, regeneration, and every transient in between. High-power EV propulsion testing normally requires a traction motor, a mechanical dynamometer, a battery pack or high-power DC source, extensive instrumentation, and multiple safety systems. That makes it difficult to reproduce motor parameters, operating points, transients, regenerative conditions, and battery states with consistent repeatability. The team needed a flexible platform that could validate the inverter at full power while reducing dependence on multiple specialized test assets — a single environment for motor behavior, DC-source behavior, regenerative energy flow, and integrated powertrain scenarios. Figure 1 — Conceptual view of a system-level EV powertrain model: battery, inverter, motor, gearbox, thermal, controllers, and vehicle dynamics solved together in one real-time loop."
        },
        {
          "@type": "WebPageElement",
          "@id": "{{URL}}#the-solution",
          "name": "The Solution — One platform for the motor side and the battery side",
          "text": "Impedyme delivered a high-power motor emulator built on the CHP Series that combines real-time motor models with bidirectional power hardware — and that the same platform can configure to emulate the battery pack. Every CHP module is a regenerative, four-quadrant, bidirectional power stage with its own AMD/Xilinx Zynq UltraScale+ quad-core Arm processor and 600K-cell FPGA running IMPEDYME-RT — a Linux OS with Impedyme's proprietary real-time kernel that executes MATLAB/Simulink models directly on the Arm cores and the FPGA with a 200 ns FPGA update rate. CHP modules are offered across a power range from 5 kW to 50 kW, scalable to 5 MW, so the same architecture sizes to the program. On the AC side, the traction inverter connects directly to the motor emulator. A real-time motor model on the FPGA sets the electrical behavior the inverter sees, so engineers command speed and torque, change the emulated motor characteristics in MotorSim Studio, and run motoring and regenerative operation without a physical traction motor or dynamometer. On the DC side, a battery-pack model running in Simulink under IMPEDYME-RT presents controlled DC voltage, source and sink behavior, and state-dependent response. For a team experienced in design-validation testing and automated 24/7 HIL platforms, the fit was one configurable environment for motor behavior, DC-source behavior, regenerative energy flow, and integrated powertrain scenarios — with a consistent software and measurement environment across every stage of powertrain validation. PowerHIL Studio sequences the tests, FPGA Scope captures every phase synchronously, and MLX returns the data to MATLAB."
        },
        {
          "@type": "WebPageElement",
          "@id": "{{URL}}#architecture",
          "name": "Architecture — Testbed configuration",
          "text": "Figure 2 — Lucid Motors testbed: CHP Series channels emulate the traction motor on the inverter's AC side and the battery pack on its DC side, with regenerative energy recirculated on the shared DC bus. Because motor and battery are both software-defined, the same bench moves from inverter bring-up and motor-model verification to high-power operating-point sweeps, transient testing, and regenerative operation — and on to integrated powertrain scenarios — without changing physical machines. Channels are software-assigned, so motor-side and battery-side roles can be re-mapped without rewiring, and adding modules — scalable to 5 MW in the same architecture — extends power without changing models, scripts, or the software suite."
        },
        {
          "@type": "WebPageElement",
          "@id": "{{URL}}#in-practice",
          "name": "In Practice — The traction inverter at full power, from both sides",
          "text": "A representative use case connects the traction inverter directly to the motor emulator. Engineers command speed and torque conditions, modify the emulated motor characteristics, observe current and voltage behavior, and evaluate motoring and regenerative operation — without a physical traction motor or dynamometer. The platform also emulates the battery pack on the DC side, enabling repeatable evaluation of inverter response and bidirectional power flow under controlled battery conditions: high-power torque and speed sweeps, rapid motor-parameter changes, controlled battery-pack behavior, DC-bus transients, and system interactions that are difficult or expensive to reproduce with physical motors, dynamometers, and battery packs."
        },
        {
          "@type": "Table",
          "@id": "{{URL}}#table-1",
          "name": "Table 1 — Impedyme software suite included with the Lucid Motors testbench",
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
          "text": "MotorSim Studio: motor library (Rs, Ld, Lq, Ke, J, pole pairs), mechanical-load and torque-vs-speed profiles, parameter sweeps, and the protection relay executed on the FPGA. PowerHIL Studio: cabinet-level control and signal routing; per-module mode and reference selection; dynamic test sequencing; failure emulation; safety limits and device-level protections; launches MLX, Simulink, and FPGA Scope. IMPEDYME-RT: Linux with Impedyme's proprietary real-time kernel on every module; runs the battery-pack and powertrain models in MATLAB/Simulink on the Arm cores and FPGA (200 ns FPGA update). FPGA Scope: on-module oscilloscope with waveform preview, per-phase real-time monitoring, trigger-based capture, measurement table, and sync verification across modules. MLX: operating-point sweeps, efficiency and response metrics, pass/fail overlays, and automated test reports."
        },
        {
          "@type": "WebPageElement",
          "@id": "{{URL}}#the-result",
          "name": "The Result — Fewer test assets, more coverage",
          "text": "The system creates a repeatable workflow from inverter bring-up and motor-model verification to high-power operating-point sweeps, transient testing, and regenerative operation. Motor parameters and load conditions change in software instead of changing physical machines, and battery-pack emulation extends the workflow to DC voltage, source and sink behavior, state-dependent response, and energy-flow testing. The measured impact, as reported and approved: development time down 35 %, testing time down 50 %, validation time down 45 %, and testing costs down 35 %; engineering productivity up 45 %, test coverage up 55 %, system safety up 60 %, and confidence before hardware deployment up 55 %. Software-defined motor and battery conditions reduce mechanical setup changes and let the same test cases repeat across inverter revisions. The platform also enabled testing that was previously difficult, expensive, or impossible: repeatable high-power torque and speed sweeps, regenerative operation, rapid motor-parameter changes, controlled battery-pack behavior, DC-bus transients, and system interactions — without physical motors, dynamometers, and battery packs. The result is a faster path from component testing to integrated powertrain scenarios, with consistent measurements and operating conditions from first bring-up to vehicle-level integration."
        },
        {
          "@type": "ItemList",
          "@id": "{{URL}}#at-a-glance",
          "name": "At a Glance — Key metrics",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Full-power motor emulation — traction inverter tested without a dyno"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Battery-pack emulation — same platform, DC source & sink"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": "Regenerative operation — energy recirculated on shared DC bus"
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
          "name": "Table 2 — Impact reported compared with the previous workflow",
          "description": "All quantified benefits reviewed and approved; external publication approved by Lucid Motors.",
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
          "name": "The Added Value — Two emulators' worth of capability, one toolchain",
          "text": "Lucid chose Impedyme for a high-power motor emulator that combines real-time motor models with bidirectional power hardware — and for the additional ability to emulate a battery pack, which increased the value of the system by supporting validation from both sides of the traction inverter. The capabilities the team rates most valuable — high-power motor emulation, real-time FPGA-based simulation, Power Hardware-in-the-Loop, traction-inverter validation, battery-pack emulation, regenerative power operation, motor parameter and load configuration, DC source and sink operation, integrated powertrain validation, and technical support and customization — reduce the need to maintain separate test systems. And every module is a fault-isolating unit with layered protection — over-voltage, over-current, over-power, over-temperature, short-circuit and desaturation detection, device-level destruction monitoring, and soft start/stop — so a test that goes wrong stops the test, not the program."
        },
        {
          "@type": "ItemList",
          "@id": "{{URL}}#why-it-works",
          "name": "Why It Works — The advantages",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Traction inverter validated at full power — no motor or dynamometer"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Battery-pack emulation on the same platform — both sides of the inverter"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": "Motor parameters and load conditions changed in software"
            },
            {
              "@type": "ListItem",
              "position": 4,
              "name": "Regenerative operation and DC-bus transients, repeatable"
            },
            {
              "@type": "ListItem",
              "position": 5,
              "name": "Consistent software and measurements across validation stages"
            },
            {
              "@type": "ListItem",
              "position": 6,
              "name": "Automated sequences suited to 24/7 HIL operation"
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
          "name": "Table 3 — What the Impedyme platform replaces in traction-inverter validation",
          "text": "Motor & load: conventional — traction motor on a mechanical dynamometer; Impedyme CHP Series — high-power motor emulator with real-time motor model. Energy source: conventional — battery pack or high-power DC source; Impedyme CHP Series — battery-pack emulation on the same platform, DC source and sink. Motor variants: conventional — physical machine change per case; Impedyme CHP Series — motor parameters and load conditions set in software. Regeneration: conventional — hard to control and repeat; Impedyme CHP Series — regenerative operation on the shared DC bus, repeatable. Energy handling: conventional — full test power drawn and dissipated; Impedyme CHP Series — regenerative, facility supplies only losses (94 %+). Real-time simulator: conventional — separate third-party HIL box; Impedyme CHP Series — IMPEDYME-RT on every module, 200 ns FPGA update."
        },
        {
          "@type": "Quotation",
          "@id": "{{URL}}#quote-1",
          "text": "Impedyme's high-power motor emulator gives us a flexible, high-power environment for traction-inverter and electric-powertrain validation. Its ability to also emulate the battery pack allows our team to address both sides of the inverter and evaluate integrated energy flow using one configurable platform.",
          "creator": {
            "@id": "{{URL}}#saeid-amiri"
          },
          "about": {
            "@id": "{{URL}}#motor-battery-emulator"
          }
        },
        {
          "@type": "Quotation",
          "@id": "{{URL}}#quote-2",
          "text": "The most valuable aspect is the platform's flexibility. Engineers can use it as a high-power motor emulator for traction-inverter development and also configure it to represent battery-pack behavior.",
          "creator": {
            "@id": "{{URL}}#saeid-amiri"
          },
          "about": {
            "@id": "{{URL}}#motor-battery-emulator"
          }
        },
        {
          "@type": "Quotation",
          "@id": "{{URL}}#quote-3",
          "text": "Organizations developing high-power EV propulsion systems should consider Impedyme when they need a reusable alternative to separate motor, dynamometer, and battery test assets. The platform combines real-time motor behavior, bidirectional power, battery-pack emulation, and system-level flexibility in one environment.",
          "creator": {
            "@id": "{{URL}}#saeid-amiri"
          },
          "about": {
            "@id": "{{URL}}#motor-battery-emulator"
          }
        },
        {
          "@type": "ItemList",
          "@id": "{{URL}}#motor-battery-emulator-specifications",
          "name": "Technical specifications — Impedyme CHP Series High-Power Motor Emulator with Battery-Pack Emulation",
          "about": {
            "@id": "{{URL}}#motor-battery-emulator"
          },
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "item": {
                "@type": "PropertyValue",
                "name": "Motor emulation",
                "value": "Full-power, real-time motor model on FPGA — traction inverter tested without a dynamometer"
              }
            },
            {
              "@type": "ListItem",
              "position": 2,
              "item": {
                "@type": "PropertyValue",
                "name": "Battery-pack emulation",
                "value": "Same platform — DC source and sink, controlled DC voltage, state-dependent response (battery-pack model in Simulink under IMPEDYME-RT)"
              }
            },
            {
              "@type": "ListItem",
              "position": 3,
              "item": {
                "@type": "PropertyValue",
                "name": "Regenerative operation",
                "value": "Energy recirculated on shared DC bus"
              }
            },
            {
              "@type": "ListItem",
              "position": 4,
              "item": {
                "@type": "PropertyValue",
                "name": "System efficiency",
                "minValue": 94,
                "unitText": "%",
                "description": "Regenerative — facility supplies only losses"
              }
            },
            {
              "@type": "ListItem",
              "position": 5,
              "item": {
                "@type": "PropertyValue",
                "name": "Channel assignment",
                "value": "Software-assigned motor-side and battery-side roles, re-mapped without rewiring"
              }
            },
            {
              "@type": "ListItem",
              "position": 6,
              "item": {
                "@type": "PropertyValue",
                "name": "Power stage",
                "value": "Regenerative, four-quadrant, bidirectional"
              }
            },
            {
              "@type": "ListItem",
              "position": 7,
              "item": {
                "@type": "PropertyValue",
                "name": "Processor per module",
                "value": "AMD/Xilinx Zynq UltraScale+ quad-core Arm + 600K-cell FPGA"
              }
            },
            {
              "@type": "ListItem",
              "position": 8,
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
              "position": 9,
              "item": {
                "@type": "PropertyValue",
                "name": "Synchronization links",
                "value": "4 × SFP+ per module, up to 12.5 Gbps",
                "description": "Daisy-chain sync, parallel and multiphase operation"
              }
            },
            {
              "@type": "ListItem",
              "position": 10,
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
              "position": 11,
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
