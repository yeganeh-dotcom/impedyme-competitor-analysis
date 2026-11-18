<?php
/**
 * NASA JPL success story — JSON-LD schema.
 * Prints only on the page set in $page_url below (no other URL).
 * Install: add to the child theme's functions.php or the Code Snippets plugin
 * (run everywhere / front-end). Do not include the opening "<?php" twice.
 */
add_action( 'wp_head', 'impedyme_nasa_success_story_schema', 5 );

function impedyme_nasa_success_story_schema() {
	// ---- Edit these if the live page or image addresses differ. ----
	$page_url       = 'https://impedyme.com/success-stories/nasa-jpl/';
	$img_story      = 'https://impedyme.com/wp-content/uploads/2026/11/nasa-success-story-scaled.webp';
	$img_desktop    = 'https://impedyme.com/wp-content/uploads/2026/11/Nasa-header-desktop-scaled.webp';
	$img_mobile     = 'https://impedyme.com/wp-content/uploads/2026/11/nasa-mobile-header-scaled.webp';
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
      "publisher": { "@id": "https://impedyme.com/#organization" }
    },

    {
      "@type": "WebPage",
      "@id": "{{URL}}#webpage",
      "url": "{{URL}}",
      "name": "From Inverter to Subsystem: Aerospace Power HIL at NASA JPL — Customer Success Story",
      "description": "How NASA's Jet Propulsion Laboratory validates aerospace inverters against real-time electrical-load and machine models at real power on Impedyme's CHP Series Power HIL platform, then evaluates the same inverter inside a simulated aerospace subsystem: –50 % testing time, –45 % validation time, +55 % test coverage, +60 % system safety.",
      "inLanguage": "en",
      "isPartOf": { "@id": "https://impedyme.com/#website" },
      "breadcrumb": { "@id": "{{URL}}#breadcrumb" },
      "mainEntity": { "@id": "{{URL}}#article" },
      "primaryImageOfPage": { "@id": "{{URL}}#image-success-story" },
      "image": [
        { "@id": "{{URL}}#image-success-story" },
        { "@id": "{{URL}}#image-header-desktop" },
        { "@id": "{{URL}}#image-header-mobile" }
      ],
      "about": [
        { "@id": "https://www.jpl.nasa.gov/#organization" },
        { "@id": "{{URL}}#power-hil-testbench" }
      ],
      "mentions": { "@id": "{{URL}}#customers-and-partners" }
    },

    {
      "@type": "BreadcrumbList",
      "@id": "{{URL}}#breadcrumb",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://impedyme.com/" },
        { "@type": "ListItem", "position": 2, "name": "Success Stories", "item": "https://impedyme.com/success-stories/" },
        { "@type": "ListItem", "position": 3, "name": "NASA JPL", "item": "{{URL}}" }
      ]
    },

    {
      "@type": "ItemList",
      "@id": "{{URL}}#customers-and-partners",
      "name": "Customers and Partners",
      "description": "Impedyme customers and partners featured in this customer success story.",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "NASA Jet Propulsion Laboratory", "item": { "@id": "https://www.jpl.nasa.gov/#organization" } }
      ]
    },

    {
      "@type": "GovernmentOrganization",
      "@id": "https://www.nasa.gov/#organization",
      "name": "NASA",
      "alternateName": "National Aeronautics and Space Administration",
      "url": "https://www.nasa.gov/"
    },

    {
      "@type": "CollegeOrUniversity",
      "@id": "https://www.caltech.edu/#organization",
      "name": "California Institute of Technology",
      "alternateName": "Caltech",
      "url": "https://www.caltech.edu/"
    },

    {
      "@type": "ResearchOrganization",
      "@id": "https://www.jpl.nasa.gov/#organization",
      "name": "NASA Jet Propulsion Laboratory",
      "alternateName": ["JPL", "NASA JPL"],
      "url": "https://www.jpl.nasa.gov/",
      "parentOrganization": { "@id": "https://www.nasa.gov/#organization" },
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Pasadena",
        "addressRegion": "CA",
        "addressCountry": "US"
      },
      "description": "NASA's Jet Propulsion Laboratory in Pasadena, California, is a federally funded research and development center managed by Caltech for NASA, and the agency's lead center for robotic exploration of the solar system.",
      "knowsAbout": [
        "Robotic exploration of the solar system",
        "Spacecraft power electronics",
        "Aerospace inverters",
        "Integrated system verification"
      ],
      "employee": { "@id": "{{URL}}#firouz-naderi" },
      "owns": { "@id": "{{URL}}#power-hil-testbench" }
    },

    {
      "@type": "Person",
      "@id": "{{URL}}#firouz-naderi",
      "name": "Firouz Naderi (customer)",
      "honorificPrefix": "Dr.",
      "jobTitle": "Director of Solar System Exploration",
      "worksFor": { "@id": "https://www.jpl.nasa.gov/#organization" },
      "description": "Dr. Firouz Naderi led the program as Director of Solar System Exploration at NASA's Jet Propulsion Laboratory, the organization responsible for JPL's robotic missions to the planets and small bodies of the solar system — including the aerospace inverter and integrated system-validation work on the Impedyme platform.",
      "knowsAbout": ["Solar system exploration", "Aerospace power electronics", "Inverter validation", "System verification"]
    },

    {
      "@type": "Product",
      "@id": "{{URL}}#power-hil-testbench",
      "name": "Impedyme CHP Series Power HIL Testbench",
      "brand": { "@type": "Brand", "name": "Impedyme" },
      "manufacturer": { "@id": "https://impedyme.com/#organization" },
      "category": "Real-time Power Hardware-in-the-Loop (Power HIL) testbench",
      "description": "A Power HIL testbench built on the CHP Series — a combined real-time simulation and bidirectional power architecture in a 19-inch, 42U liquid-cooled cabinet. It provides a programmable DC bus on the source side and a real-time electrical-load or machine model on the load side, so the aerospace inverter is validated at real power and then evaluated inside a simulated aerospace subsystem on the same platform. Every CHP module is a regenerative, four-quadrant, bidirectional power stage with an AMD/Xilinx Zynq UltraScale+ quad-core Arm processor and 600K-cell FPGA running IMPEDYME-RT.",
      "image": { "@id": "{{URL}}#image-success-story" },
      "isRelatedTo": [
        { "@id": "{{URL}}#sw-powerhil-studio" },
        { "@id": "{{URL}}#sw-motorsim-studio" },
        { "@id": "{{URL}}#sw-impedyme-rt" },
        { "@id": "{{URL}}#sw-fpga-scope" },
        { "@id": "{{URL}}#sw-mlx" }
      ],
      "additionalProperty": [
        { "@type": "PropertyValue", "name": "Source side", "value": "Programmable DC bus" },
        { "@type": "PropertyValue", "name": "Load side", "value": "Real-time electrical-load or machine model in Simulink on the module's Arm cores and FPGA, at real power" },
        { "@type": "PropertyValue", "name": "Validation layers", "value": "Component-level inverter characterization through integrated subsystem verification on one platform" },
        { "@type": "PropertyValue", "name": "DUT connection", "value": "Front-panel busbar to a controlled bidirectional power interface" },
        { "@type": "PropertyValue", "name": "Channel assignment", "value": "Software-assigned source and load roles, re-mapped without rewiring" },
        { "@type": "PropertyValue", "name": "Additional use", "value": "Highly dynamic excitation source for impedance characterization and stability analysis of high-power bus architectures" },
        { "@type": "PropertyValue", "name": "System efficiency", "minValue": 94, "unitText": "%", "description": "Regenerative shared DC bus — no dissipative load; facility supplies only losses" },
        { "@type": "PropertyValue", "name": "Cabinet", "value": "19-inch, 42U, liquid-cooled" },
        { "@type": "PropertyValue", "name": "Power stage", "value": "Regenerative, four-quadrant, bidirectional" },
        { "@type": "PropertyValue", "name": "Processor per module", "value": "AMD/Xilinx Zynq UltraScale+ quad-core Arm + 600K-cell FPGA" },
        { "@type": "PropertyValue", "name": "FPGA update rate", "value": 200, "unitText": "ns", "description": "Real-time models on FPGA" },
        { "@type": "PropertyValue", "name": "Synchronization links", "value": "4 × SFP+ per module, up to 12.5 Gbps", "description": "Daisy-chain sync, parallel and multiphase operation" },
        { "@type": "PropertyValue", "name": "Module power rating", "minValue": 5, "maxValue": 50, "unitText": "kW", "description": "Scalable to 5 MW; same architecture and software" },
        { "@type": "PropertyValue", "name": "Protection", "value": "Over-voltage, over-current, over-power, over-temperature, short-circuit and desaturation detection, device-level destruction monitoring, soft start/stop" }
      ]
    },

    {
      "@type": "SoftwareApplication",
      "@id": "{{URL}}#sw-powerhil-studio",
      "name": "PowerHIL Studio",
      "applicationCategory": "Power HIL testbench operation software",
      "publisher": { "@id": "https://impedyme.com/#organization" },
      "description": "Cabinet-level control and signal routing; per-module mode and reference selection; dynamic test sequencing; failure emulation; safety limits and device-level protections; launches MLX, Simulink, and FPGA Scope."
    },
    {
      "@type": "SoftwareApplication",
      "@id": "{{URL}}#sw-motorsim-studio",
      "name": "MotorSim Studio",
      "applicationCategory": "Motor emulation software",
      "publisher": { "@id": "https://impedyme.com/#organization" },
      "description": "Machine and dynamic-load models for inverter testing; parameter sweeps and load profiles; protection relay executed on the FPGA."
    },
    {
      "@type": "SoftwareApplication",
      "@id": "{{URL}}#sw-impedyme-rt",
      "name": "IMPEDYME-RT",
      "applicationCategory": "Real-time operating system",
      "operatingSystem": "Linux with proprietary real-time kernel",
      "publisher": { "@id": "https://impedyme.com/#organization" },
      "description": "Linux with Impedyme's proprietary real-time kernel on every module; runs MATLAB/Simulink models on the Arm cores and FPGA (200 ns FPGA update); real-time monitoring, control, and parameter tuning from MATLAB."
    },
    {
      "@type": "SoftwareApplication",
      "@id": "{{URL}}#sw-fpga-scope",
      "name": "FPGA Scope",
      "applicationCategory": "Real-time data acquisition",
      "publisher": { "@id": "https://impedyme.com/#organization" },
      "description": "On-module oscilloscope: waveform preview before enable, per-phase real-time monitoring, trigger-based capture, measurement table (max / min / pk-pk / gain / phase), and sync verification across modules."
    },
    {
      "@type": "SoftwareApplication",
      "@id": "{{URL}}#sw-mlx",
      "name": "MLX",
      "applicationCategory": "Post-processing and analytics software",
      "publisher": { "@id": "https://impedyme.com/#organization" },
      "description": "Post-processing and analytics of streamed data in MATLAB — operating-point sweeps, efficiency and response metrics, pass/fail overlays, and automated test reports."
    },

    {
      "@type": "ImageObject",
      "@id": "{{URL}}#image-success-story",
      "contentUrl": "{{IMG_STORY}}",
      "url": "{{IMG_STORY}}",
      "encodingFormat": "image/webp",
      "name": "NASA JPL customer success story — aerospace inverter validation on Impedyme Power HIL",
      "caption": "Impedyme customer success story: NASA's Jet Propulsion Laboratory validates aerospace inverters against real-time electrical-load and machine models at real power on Impedyme's CHP Series Power HIL platform — –50 % testing time, –45 % validation time, +55 % test coverage, +60 % system safety.",
      "creator": { "@id": "https://impedyme.com/#organization" },
      "copyrightHolder": { "@id": "https://impedyme.com/#organization" }
    },
    {
      "@type": "ImageObject",
      "@id": "{{URL}}#image-header-desktop",
      "contentUrl": "{{IMG_DESKTOP}}",
      "url": "{{IMG_DESKTOP}}",
      "encodingFormat": "image/webp",
      "name": "NASA JPL success story header (desktop)",
      "caption": "NASA JPL validates aerospace inverters and integrated subsystems on Impedyme's CHP Series Power HIL platform.",
      "creator": { "@id": "https://impedyme.com/#organization" }
    },
    {
      "@type": "ImageObject",
      "@id": "{{URL}}#image-header-mobile",
      "contentUrl": "{{IMG_MOBILE}}",
      "url": "{{IMG_MOBILE}}",
      "encodingFormat": "image/webp",
      "name": "NASA JPL success story header (mobile)",
      "caption": "NASA JPL validates aerospace inverters and integrated subsystems on Impedyme's CHP Series Power HIL platform.",
      "creator": { "@id": "https://impedyme.com/#organization" }
    },

    {
      "@type": "TechArticle",
      "@id": "{{URL}}#article",
      "headline": "From Inverter to Subsystem: Aerospace Power HIL at NASA JPL",
      "alternativeHeadline": "How NASA's Jet Propulsion Laboratory validates aerospace inverters at real power and inside a simulated aerospace subsystem on Impedyme's CHP Series Power HIL platform",
      "description": "See how NASA's Jet Propulsion Laboratory uses Impedyme's CHP Series Power HIL platform to validate aerospace inverters against real-time electrical-load and machine models at real power — and then to evaluate the same inverter inside a simulated aerospace subsystem. Learn how one configurable platform takes engineers from focused inverter characterization to integrated system verification without rebuilding the test environment for each stage.",
      "genre": "Customer success story",
      "articleSection": ["The Challenge", "The Solution", "In Practice", "Architecture", "The Result", "At a Glance", "The Added Value", "Why It Works"],
      "inLanguage": "en",
      "datePublished": "{{DATE}}",
      "dateModified": "{{DATE}}",
      "image": [
        { "@id": "{{URL}}#image-success-story" },
        { "@id": "{{URL}}#image-header-desktop" },
        { "@id": "{{URL}}#image-header-mobile" }
      ],
      "author": { "@id": "https://impedyme.com/#organization" },
      "publisher": { "@id": "https://impedyme.com/#organization" },
      "mainEntityOfPage": { "@id": "{{URL}}#webpage" },
      "about": [
        { "@id": "https://www.jpl.nasa.gov/#organization" },
        { "@id": "{{URL}}#power-hil-testbench" },
        { "@type": "Thing", "name": "Aerospace inverter validation" },
        { "@type": "Thing", "name": "Integrated system verification" },
        { "@type": "Thing", "name": "Real-time load and machine emulation" },
        { "@type": "Thing", "name": "Fault and boundary-condition testing" },
        { "@type": "Thing", "name": "Power Hardware-in-the-Loop (PHIL)" }
      ],
      "mentions": [
        { "@id": "https://www.jpl.nasa.gov/#organization" },
        { "@id": "https://www.nasa.gov/#organization" },
        { "@id": "https://www.caltech.edu/#organization" },
        { "@id": "{{URL}}#firouz-naderi" },
        { "@id": "{{URL}}#customers-and-partners" },
        { "@type": "SoftwareApplication", "name": "MATLAB/Simulink", "publisher": { "@type": "Organization", "name": "MathWorks" } },
        { "@type": "Organization", "name": "AMD/Xilinx" }
      ],
      "keywords": "NASA JPL, Jet Propulsion Laboratory, NASA, Caltech, Impedyme, Power HIL, PHIL, CHP Series, aerospace inverter, inverter validation, system verification, real-time load emulation, machine emulation, fault injection, boundary-condition testing, impedance characterization, regenerative, MATLAB/Simulink",
      "hasPart": [
        {
          "@type": "ItemList",
          "@id": "{{URL}}#headline-impact",
          "name": "Headline impact",
          "description": "Impact reported and approved for the NASA JPL program.",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "item": { "@type": "PropertyValue", "name": "Testing time", "value": -50, "unitText": "%" } },
            { "@type": "ListItem", "position": 2, "item": { "@type": "PropertyValue", "name": "Validation time", "value": -45, "unitText": "%" } },
            { "@type": "ListItem", "position": 3, "item": { "@type": "PropertyValue", "name": "Test coverage", "value": 55, "unitText": "%" } },
            { "@type": "ListItem", "position": 4, "item": { "@type": "PropertyValue", "name": "System safety", "value": 60, "unitText": "%" } }
          ]
        },
        {
          "@type": "WebPageElement",
          "@id": "{{URL}}#the-challenge",
          "name": "The Challenge — Flight-like conditions without flight-like risk",
          "text": "NASA's Jet Propulsion Laboratory in Pasadena, California, is a federally funded research and development center managed by Caltech for NASA, and the agency's lead center for robotic exploration of the solar system. Its missions depend on power electronics that must perform under conditions no program can afford to discover in flight. Aerospace inverter validation requires engineers to exercise electrical operating points, dynamic loads, control responses, and abnormal conditions that can be difficult, costly, or unsafe to reproduce using complete flight-like hardware. The program also needed a path from focused inverter testing to integrated system validation without rebuilding the test environment for each stage. A standalone load or a software-only simulator covers only one side of that problem. JPL needed one environment that could represent the electrical and dynamic behavior around the inverter at real power — and then expand into a broader real-time system model as validation progressed."
        },
        {
          "@type": "WebPageElement",
          "@id": "{{URL}}#the-solution",
          "name": "The Solution — One platform across every validation layer",
          "text": "Impedyme delivered a Power HIL testbench built on the CHP Series — a combined real-time simulation and bidirectional power architecture in a 19-inch, 42U liquid-cooled cabinet. Every CHP module is a regenerative, four-quadrant, bidirectional power stage with its own AMD/Xilinx Zynq UltraScale+ quad-core Arm processor and 600K-cell FPGA running IMPEDYME-RT — a Linux OS with Impedyme's proprietary real-time kernel that executes MATLAB/Simulink models directly on the Arm cores and the FPGA with a 200 ns FPGA update rate. CHP modules are offered across a power range from 5 kW to 50 kW, scalable to 5 MW, so the same architecture sizes to the program. The CHP Series represents the electrical and dynamic behavior around the inverter: on the source side, a programmable DC bus; on the load side, a real-time electrical-load or machine model running in Simulink on the module's Arm cores and FPGA. The inverter under test connects on the front-panel busbar to a controlled bidirectional power interface, while the platform links to the controller and measurement interfaces of JPL's setup. Models, operating conditions, load profiles, and fault cases change in software while the hardware under test stays connected. PowerHIL Studio sequences the tests, injects failures, and enforces the safety envelope; FPGA Scope provides high-speed measurement and monitoring on every port; MLX returns the results to MATLAB for analysis and reporting."
        },
        {
          "@type": "WebPageElement",
          "@id": "{{URL}}#in-practice",
          "name": "In Practice — From inverter characterization to the complete subsystem",
          "text": "A representative use case begins with component-level validation of the aerospace inverter against a real-time electrical load or machine model. Engineers evaluate command response, voltage and current behavior, load transitions, protection logic, and selected fault conditions under repeatable electrical conditions. The same test architecture then incorporates higher-level subsystem dynamics, so the inverter is evaluated as part of the complete system rather than as an isolated component — exercising interactions, transients, limits, and fault responses. Reusing the same models, power interface, measurements, and test cases from component verification through system integration shortens setup and troubleshooting, and issues surface under controlled conditions before scarce or high-value flight-like hardware is committed."
        },
        {
          "@type": "WebPageElement",
          "@id": "{{URL}}#architecture",
          "name": "Architecture — Testbed configuration",
          "text": "Figure 1 — NASA JPL testbed: CHP Series channels provide the programmable DC bus and the real-time load or plant model around the aerospace inverter; subsystem dynamics are added in the same loop for integrated validation. Because channels are software-assigned, source and load roles can be re-mapped without rewiring, and the real-time system model grows with the validation campaign — from a single electrical load to the dynamics of the complete subsystem. The same modules also act as a highly dynamic excitation source for impedance characterization and stability analysis of high-power bus architectures, so one platform serves both inverter validation and power-system studies. Adding modules — scalable to 5 MW in the same architecture — extends power without changing models, scripts, or the software suite."
        },
        {
          "@type": "Table",
          "@id": "{{URL}}#table-1",
          "name": "Table 1 — Impedyme software suite included with the NASA JPL testbench",
          "about": [
            { "@id": "{{URL}}#sw-powerhil-studio" },
            { "@id": "{{URL}}#sw-motorsim-studio" },
            { "@id": "{{URL}}#sw-impedyme-rt" },
            { "@id": "{{URL}}#sw-fpga-scope" },
            { "@id": "{{URL}}#sw-mlx" }
          ],
          "text": "PowerHIL Studio: cabinet-level control and signal routing; per-module mode and reference selection; dynamic test sequencing; failure emulation; safety limits and device-level protections; launches MLX, Simulink, and FPGA Scope. MotorSim Studio: machine and dynamic-load models for inverter testing; parameter sweeps and load profiles; protection relay executed on the FPGA. IMPEDYME-RT: Linux with Impedyme's proprietary real-time kernel on every module; runs MATLAB/Simulink models on the Arm cores and FPGA (200 ns FPGA update). FPGA Scope: on-module oscilloscope with waveform preview, per-phase real-time monitoring, trigger-based capture, measurement table, and sync verification across modules. MLX: operating-point sweeps, efficiency and response metrics, pass/fail overlays, and automated test reports."
        },
        {
          "@type": "WebPageElement",
          "@id": "{{URL}}#the-result",
          "name": "The Result — A continuous path to system verification",
          "text": "The platform establishes a continuous workflow from inverter characterization to integrated system verification. Models, operating conditions, load profiles, and fault cases change in software while the hardware under test stays connected to a controlled bidirectional power interface — improving repeatability and making it easy to compare design revisions against the same set of test conditions. The measured impact, as reported and approved: development time down 35 %, testing time down 50 %, validation time down 45 %, and testing costs down 30 %; engineering productivity up 40 %, test coverage up 55 %, system safety up 60 %, and confidence before hardware deployment up 55 %. The platform also enabled testing that was previously difficult, expensive, or impossible: repeatable boundary-condition testing, rapid load and parameter changes, dynamic transients, selected fault cases, and full-system interactions that may be impractical to reproduce safely with conventional hardware-only methods. The result is a controlled, extensible approach to validating aerospace inverters and their interaction with the surrounding system — issues found on the testbench, not on flight-like hardware."
        },
        {
          "@type": "ItemList",
          "@id": "{{URL}}#at-a-glance",
          "name": "At a Glance — Key metrics",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Component + system — one platform, reused across validation layers" },
            { "@type": "ListItem", "position": 2, "name": "Real-time plant models — load, machine, and subsystem dynamics" },
            { "@type": "ListItem", "position": 3, "name": "Fault & boundary tests — scripted, repeatable, contained" },
            { "@type": "ListItem", "position": 4, "name": "94 %+ system efficiency — regenerative, no dissipative load" },
            { "@type": "ListItem", "position": 5, "name": "Zynq UltraScale+ per module — quad-core Arm + 600K FPGA logic cells" },
            { "@type": "ListItem", "position": 6, "name": "200 ns FPGA update rate — real-time models on FPGA" },
            { "@type": "ListItem", "position": 7, "name": "4 × SFP+ up to 12.5 Gbps — daisy-chain sync, parallel & multiphase" },
            { "@type": "ListItem", "position": 8, "name": "Module ratings to suit — 5 kW to 50 kW, scalable to 5 MW; same architecture and software" }
          ]
        },
        {
          "@type": "Table",
          "@id": "{{URL}}#table-2",
          "name": "Table 2 — Impact reported for the NASA JPL program compared with the previous workflow",
          "description": "All quantified benefits reviewed and approved; external publication permission received.",
          "mainEntity": {
            "@type": "ItemList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "item": { "@type": "PropertyValue", "name": "Reduced development time", "value": -35, "unitText": "%" } },
              { "@type": "ListItem", "position": 2, "item": { "@type": "PropertyValue", "name": "Reduced testing time", "value": -50, "unitText": "%" } },
              { "@type": "ListItem", "position": 3, "item": { "@type": "PropertyValue", "name": "Reduced validation time", "value": -45, "unitText": "%" } },
              { "@type": "ListItem", "position": 4, "item": { "@type": "PropertyValue", "name": "Reduced testing costs", "value": -30, "unitText": "%" } },
              { "@type": "ListItem", "position": 5, "item": { "@type": "PropertyValue", "name": "Improved engineering productivity", "value": 40, "unitText": "%" } },
              { "@type": "ListItem", "position": 6, "item": { "@type": "PropertyValue", "name": "Improved test coverage", "value": 55, "unitText": "%" } },
              { "@type": "ListItem", "position": 7, "item": { "@type": "PropertyValue", "name": "Improved system safety", "value": 60, "unitText": "%" } },
              { "@type": "ListItem", "position": 8, "item": { "@type": "PropertyValue", "name": "Improved confidence before hardware deployment", "value": 55, "unitText": "%" } }
            ]
          }
        },
        {
          "@type": "WebPageElement",
          "@id": "{{URL}}#the-added-value",
          "name": "The Added Value — Built for complex aerospace programs",
          "text": "JPL selected Impedyme because its combined real-time simulation and bidirectional power architecture offered one environment for both component-level and system-level work — able to represent the electrical and dynamic behavior around the inverter, connect to the controller and measurement interfaces, and expand into a broader real-time system model as validation progressed. The features rated most valuable — the combined HIL and power architecture, real-time FPGA-based simulation, Power Hardware-in-the-Loop, inverter component validation, integrated system-level validation, dynamic load and plant emulation, fault and boundary-condition testing, high-speed measurement and monitoring, MATLAB/Simulink integration, and technical support and customization — are exactly what this testbench delivers. And every module is a fault-isolating unit with layered protection — over-voltage, over-current, over-power, over-temperature, short-circuit and desaturation detection, device-level destruction monitoring, and soft start/stop — so a test that goes wrong stops the test, not the program."
        },
        {
          "@type": "ItemList",
          "@id": "{{URL}}#why-it-works",
          "name": "Why It Works — The advantages",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Inverter validated at real power against real-time load and machine models" },
            { "@type": "ListItem", "position": 2, "name": "Same setup extends to integrated subsystem validation" },
            { "@type": "ListItem", "position": 3, "name": "Boundary conditions, transients, and selected faults — repeatable" },
            { "@type": "ListItem", "position": 4, "name": "Models, load profiles, and fault cases changed in software" },
            { "@type": "ListItem", "position": 5, "name": "High-speed synchronized measurement on every port" },
            { "@type": "ListItem", "position": 6, "name": "Regenerative four-quadrant operation, 94 %+ efficiency" },
            { "@type": "ListItem", "position": 7, "name": "Native MATLAB/Simulink workflow — no third-party HIL simulator" },
            { "@type": "ListItem", "position": 8, "name": "Comprehensive protection: OV/OC/OP/OT, short-circuit, desaturation" },
            { "@type": "ListItem", "position": 9, "name": "Module power ratings to match the program — 5 kW to 50 kW, scalable to 5 MW — without redesign" }
          ]
        },
        {
          "@type": "Table",
          "@id": "{{URL}}#table-3",
          "name": "Table 3 — What the Impedyme platform replaces in aerospace inverter validation",
          "text": "Electrical load: conventional — fixed or dissipative load bank; Impedyme CHP Series — real-time electrical-load or machine model at real power, bidirectional. System integration: conventional — separate integration rig, rebuilt per stage; Impedyme CHP Series — same platform, extended with subsystem dynamics. Fault testing: conventional — risky on flight-like hardware; Impedyme CHP Series — selected fault and boundary cases scripted behind layered protection. Real-time simulator: conventional — separate third-party HIL box; Impedyme CHP Series — IMPEDYME-RT on every module, 200 ns FPGA update. Energy handling: conventional — full test power drawn and dissipated; Impedyme CHP Series — regenerative shared DC bus, facility supplies only losses. Measurement: conventional — separate scopes and loggers; Impedyme CHP Series — FPGA Scope + MLX, synchronized across modules."
        },
        {
          "@type": "Quotation",
          "@id": "{{URL}}#quote-1",
          "text": "Impedyme provided a flexible validation environment that connected detailed inverter testing with integrated aerospace system verification. The ability to move from component-level evaluation to system-level scenarios on one platform helped address complex validation challenges with greater repeatability and control.",
          "creator": { "@id": "{{URL}}#firouz-naderi" },
          "about": { "@id": "{{URL}}#power-hil-testbench" }
        },
        {
          "@type": "Quotation",
          "@id": "{{URL}}#quote-2",
          "text": "The principal advantage is the ability to reuse one configurable platform across multiple validation layers.",
          "creator": { "@id": "{{URL}}#firouz-naderi" },
          "about": { "@id": "{{URL}}#power-hil-testbench" }
        },
        {
          "@type": "Quotation",
          "@id": "{{URL}}#quote-3",
          "text": "Organizations developing mission-critical power electronics should consider Impedyme when they need more than a standalone load or software-only simulator. The combined real-time and power platform supports focused inverter verification while preserving a clear path to integrated system validation.",
          "creator": { "@id": "{{URL}}#firouz-naderi" },
          "about": { "@id": "{{URL}}#power-hil-testbench" }
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
