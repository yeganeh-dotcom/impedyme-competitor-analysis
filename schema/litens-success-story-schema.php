<?php
/**
 * Litens Automotive success story — JSON-LD schema.
 * Prints only on the page set in $page_url below (no other URL).
 * Install: add to the child theme's functions.php or the Code Snippets plugin
 * (run everywhere / front-end). Do not include the opening "<?php" twice.
 */
add_action( 'wp_head', 'impedyme_litens_success_story_schema', 5 );

function impedyme_litens_success_story_schema() {
	// ---- Edit these if the live page or image addresses differ. ----
	$page_url       = 'https://impedyme.com/success-stories/liten-automotive/';
	$img_story      = 'https://impedyme.com/wp-content/uploads/2026/11/liten-success-story-scaled.webp';
	$img_mobile     = 'https://impedyme.com/wp-content/uploads/2026/11/litens-header-mobile.webp';
	$img_shot_1     = 'https://impedyme.com/wp-content/uploads/2026/11/motorsim-studio-litens.webp';
	$img_shot_2     = 'https://impedyme.com/wp-content/uploads/2026/11/motorsim-studio-litens-2.webp';
	$img_shot_3     = 'https://impedyme.com/wp-content/uploads/2026/11/motorsim-studio-litens-3.webp';
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
      "name": "From LIN Command to Phase Current — Litens Automotive Customer Success Story",
      "description": "How Litens Automotive validates its low-voltage sensorless BLDC motor-drive PCB on Impedyme's CHP Series motor emulator, commanded over LIN with TSMaster: –55 % testing time, –45 % validation time, +60 % test coverage, +50 % system safety.",
      "inLanguage": "en",
      "isPartOf": { "@id": "https://impedyme.com/#website" },
      "breadcrumb": { "@id": "{{URL}}#breadcrumb" },
      "mainEntity": { "@id": "{{URL}}#article" },
      "primaryImageOfPage": { "@id": "{{URL}}#image-success-story" },
      "image": [
        { "@id": "{{URL}}#image-success-story" },
        { "@id": "{{URL}}#image-header-mobile" },
        { "@id": "{{URL}}#image-screenshot-1" },
        { "@id": "{{URL}}#image-screenshot-2" },
        { "@id": "{{URL}}#image-screenshot-3" }
      ],
      "about": [
        { "@id": "https://www.litens.com/#organization" },
        { "@id": "{{URL}}#motor-emulator-testbench" }
      ],
      "mentions": { "@id": "{{URL}}#customers-and-partners" }
    },

    {
      "@type": "BreadcrumbList",
      "@id": "{{URL}}#breadcrumb",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://impedyme.com/" },
        { "@type": "ListItem", "position": 2, "name": "Success Stories", "item": "https://impedyme.com/success-stories/" },
        { "@type": "ListItem", "position": 3, "name": "Litens Automotive", "item": "{{URL}}" }
      ]
    },

    {
      "@type": "ItemList",
      "@id": "{{URL}}#customers-and-partners",
      "name": "Customers and Partners",
      "description": "Impedyme customers and partners featured in this customer success story.",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Litens Automotive", "item": { "@id": "https://www.litens.com/#organization" } }
      ]
    },

    {
      "@type": "Organization",
      "@id": "https://www.litens.com/#organization",
      "name": "Litens Automotive",
      "alternateName": "Litens Automotive Group",
      "url": "https://www.litens.com/",
      "foundingDate": "1979",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Woodbridge",
        "addressRegion": "ON",
        "addressCountry": "CA"
      },
      "description": "Litens Automotive Group, founded in 1979 and headquartered in Woodbridge, Ontario, is a global tier-one supplier of advanced powertrain systems, engineered from facilities across North America, Europe, South America, and Asia. As Litens extends into electrified actuation, its teams develop compact sensorless BLDC/PMSM drive electronics.",
      "knowsAbout": [
        "Advanced powertrain systems",
        "Electrified actuation",
        "Sensorless BLDC/PMSM motor drives",
        "Motor-control PCBs",
        "LIN communication"
      ],
      "subOrganization": { "@id": "https://www.litens.com/#technical-center-india" },
      "owns": { "@id": "{{URL}}#motor-emulator-testbench" }
    },

    {
      "@type": "Organization",
      "@id": "https://www.litens.com/#technical-center-india",
      "name": "Litens Technical Center India",
      "parentOrganization": { "@id": "https://www.litens.com/#organization" },
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Bengaluru",
        "addressCountry": "IN"
      },
      "employee": { "@id": "{{URL}}#shramik-kumar" }
    },

    {
      "@type": "Person",
      "@id": "{{URL}}#shramik-kumar",
      "name": "Shramik Kumar (customer)",
      "jobTitle": "Validation Manager",
      "worksFor": { "@id": "https://www.litens.com/#technical-center-india" },
      "workLocation": {
        "@type": "Place",
        "address": { "@type": "PostalAddress", "addressLocality": "Bengaluru", "addressCountry": "IN" }
      },
      "description": "Shramik Kumar is Validation Manager at the Litens Technical Center India in Bengaluru, where the Litens validation and engineering team validates low-voltage motor-drive PCBs against the Impedyme motor emulator — from LIN communication and startup to controlled speed, load, and parameter-sweep testing.",
      "knowsAbout": ["Motor-drive validation", "Motor-control PCBs", "LIN communication", "Motor emulation", "Hardware-in-the-Loop (HIL)"]
    },

    {
      "@type": "Product",
      "@id": "{{URL}}#motor-emulator-testbench",
      "name": "Impedyme CHP Series Motor Emulator Testbench (HIL + PHIL)",
      "brand": { "@type": "Brand", "name": "Impedyme" },
      "manufacturer": { "@id": "https://impedyme.com/#organization" },
      "category": "Real-time Power HIL motor emulator",
      "description": "A CHP Series Motor Emulator platform that collapses signal-level HIL and power-level PHIL testing into one testbench. The CHP module emulates the three-phase machine electrically: the Litens drive switches into the emulated windings at its native 12 V DC link and drives real phase current, while the FPGA real-time engine (AMD/Xilinx Zynq UltraScale+, quad-core Arm + 600K logic cells under IMPEDYME-RT) solves the motor model every FPGA cycle, so the sensorless algorithm sees the back-EMF signature it expects. The drive is commanded over LIN with TSMaster.",
      "image": { "@id": "{{URL}}#image-success-story" },
      "isRelatedTo": [
        { "@id": "{{URL}}#sw-motorsim-studio" },
        { "@id": "{{URL}}#sw-tsmaster" },
        { "@id": "{{URL}}#sw-motor-scope" },
        { "@id": "{{URL}}#sw-impedyme-rt" },
        { "@id": "{{URL}}#sw-powerhil-studio" }
      ],
      "additionalProperty": [
        { "@type": "PropertyValue", "name": "DC link", "value": 12, "unitText": "V", "description": "Drive tested at its native supply" },
        { "@type": "PropertyValue", "name": "Commanded speeds", "value": "500 RPM and 1,000 RPM constant-speed operation" },
        { "@type": "PropertyValue", "name": "Torque sweep", "minValue": -0.2, "maxValue": 0.2, "unitText": "N·m", "description": "Programmable torque sweeps, constant loads and load profiles" },
        { "@type": "PropertyValue", "name": "Command interface", "value": "LIN / TSMaster — CTRL_Frame commands per Litens specification" },
        { "@type": "PropertyValue", "name": "Motor model parameters", "value": "Rs, Ld, Lq, Ke, J, pole pairs" },
        { "@type": "PropertyValue", "name": "Supported drives", "value": "Sensorless BLDC/PMSM — realistic back-EMF from the first commutation; hall-sensor and encoder outputs via expansion card for sensored variants" },
        { "@type": "PropertyValue", "name": "Test layers", "value": "Signal-level HIL and power-level PHIL on one platform" },
        { "@type": "PropertyValue", "name": "Processor per module", "value": "AMD/Xilinx Zynq UltraScale+ quad-core Arm + 600K-cell FPGA" },
        { "@type": "PropertyValue", "name": "FPGA update rate", "value": 200, "unitText": "ns", "description": "Real-time motor models" },
        { "@type": "PropertyValue", "name": "Synchronization links", "value": "SFP+ backbone, up to 12.5 Gbps", "description": "Links modules and real-time simulators" },
        { "@type": "PropertyValue", "name": "Cooling", "value": "Liquid-cooled cabinet, no external chiller required" },
        { "@type": "PropertyValue", "name": "Protection", "value": "Layered protection with protection relay executed on the FPGA" }
      ]
    },

    {
      "@type": "SoftwareApplication",
      "@id": "{{URL}}#sw-motorsim-studio",
      "name": "MotorSim Studio",
      "applicationCategory": "Motor emulation software",
      "publisher": { "@id": "https://impedyme.com/#organization" },
      "description": "Defines the emulated machine: motor library (Rs, Ld, Lq, Ke, J, pole pairs), DC-bus and torque limits, constant loads, load profiles, parameter sweeps, and the protection relay executed on the FPGA."
    },
    {
      "@type": "SoftwareApplication",
      "@id": "{{URL}}#sw-tsmaster",
      "name": "TSMaster",
      "applicationCategory": "Vehicle bus (LIN) communication and test software",
      "description": "Signal-level command and communication testing: Litens' LIN schedule tables and CTRL_Frame signals — start/stop, target speed, fault handling — driven and logged at byte level."
    },
    {
      "@type": "SoftwareApplication",
      "@id": "{{URL}}#sw-motor-scope",
      "name": "Motor Scope",
      "applicationCategory": "Real-time data acquisition",
      "publisher": { "@id": "https://impedyme.com/#organization" },
      "description": "Real-time, trigger-based capture of drive output voltage, emulated phase current, speed, generated torque, and electrical power; zoomed views resolve commutation and switching events."
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
      "@id": "{{URL}}#sw-powerhil-studio",
      "name": "PowerHIL Studio",
      "applicationCategory": "Power HIL testbench operation software",
      "publisher": { "@id": "https://impedyme.com/#organization" },
      "description": "Platform configuration and sequencing; scales to additional CHP modules and channels as the program grows."
    },

    {
      "@type": "ImageObject",
      "@id": "{{URL}}#image-success-story",
      "contentUrl": "{{IMG_STORY}}",
      "url": "{{IMG_STORY}}",
      "encodingFormat": "image/webp",
      "name": "Litens Automotive customer success story",
      "caption": "Impedyme customer success story: Litens Automotive validates its low-voltage sensorless BLDC motor-drive PCB on Impedyme's CHP Series motor emulator, commanded over LIN — –55 % testing time, –45 % validation time, +60 % test coverage, +50 % system safety.",
      "creator": { "@id": "https://impedyme.com/#organization" },
      "copyrightHolder": { "@id": "https://impedyme.com/#organization" }
    },
    {
      "@type": "ImageObject",
      "@id": "{{URL}}#image-header-mobile",
      "contentUrl": "{{IMG_MOBILE}}",
      "url": "{{IMG_MOBILE}}",
      "encodingFormat": "image/webp",
      "name": "Litens Automotive success story header (mobile)",
      "caption": "Litens Automotive validates its motor-drive PCB on Impedyme's CHP Series motor emulator — from LIN command to phase current.",
      "creator": { "@id": "https://impedyme.com/#organization" }
    },
    {
      "@type": "ImageObject",
      "@id": "{{URL}}#image-screenshot-1",
      "contentUrl": "{{IMG_SHOT_1}}",
      "url": "{{IMG_SHOT_1}}",
      "encodingFormat": "image/webp",
      "name": "Litens testbench software screenshot 1",
      "caption": "Impedyme software on the Litens testbench — MotorSim Studio, TSMaster LIN configuration and Motor Scope capture of the Litens drive running against the emulated machine.",
      "creator": { "@id": "https://impedyme.com/#organization" }
    },
    {
      "@type": "ImageObject",
      "@id": "{{URL}}#image-screenshot-2",
      "contentUrl": "{{IMG_SHOT_2}}",
      "url": "{{IMG_SHOT_2}}",
      "encodingFormat": "image/webp",
      "name": "Litens testbench software screenshot 2",
      "caption": "Impedyme software on the Litens testbench — MotorSim Studio, TSMaster LIN configuration and Motor Scope capture of the Litens drive running against the emulated machine.",
      "creator": { "@id": "https://impedyme.com/#organization" }
    },
    {
      "@type": "ImageObject",
      "@id": "{{URL}}#image-screenshot-3",
      "contentUrl": "{{IMG_SHOT_3}}",
      "url": "{{IMG_SHOT_3}}",
      "encodingFormat": "image/webp",
      "name": "Litens testbench software screenshot 3",
      "caption": "Impedyme software on the Litens testbench — MotorSim Studio, TSMaster LIN configuration and Motor Scope capture of the Litens drive running against the emulated machine.",
      "creator": { "@id": "https://impedyme.com/#organization" }
    },

    {
      "@type": "TechArticle",
      "@id": "{{URL}}#article",
      "headline": "From LIN Command to Phase Current: Validating the Litens Motor-Drive PCB",
      "alternativeHeadline": "How Litens Automotive validates its low-voltage motor-drive PCB on Impedyme's CHP Series platform, commanded over its own LIN protocol",
      "description": "See how Litens Automotive validates its low-voltage motor-drive PCB on Impedyme's CHP Series platform — where the drive switches real current into a configurable real-time motor emulator while being commanded over its own LIN protocol. Learn how MotorSim Studio, TSMaster, and Motor Scope work together as one workflow from LIN command to phase current — with repeatable positive and negative torque sweeps, start/stop transients, and parameter changes that no bench motor applies as consistently.",
      "genre": "Customer success story",
      "articleSection": ["The Challenge", "The Solution", "In Practice", "Architecture", "The Result", "At a Glance", "The Added Value", "Why It Works"],
      "inLanguage": "en",
      "datePublished": "{{DATE}}",
      "dateModified": "{{DATE}}",
      "image": [
        { "@id": "{{URL}}#image-success-story" },
        { "@id": "{{URL}}#image-header-mobile" },
        { "@id": "{{URL}}#image-screenshot-1" },
        { "@id": "{{URL}}#image-screenshot-2" },
        { "@id": "{{URL}}#image-screenshot-3" }
      ],
      "author": { "@id": "https://impedyme.com/#organization" },
      "publisher": { "@id": "https://impedyme.com/#organization" },
      "mainEntityOfPage": { "@id": "{{URL}}#webpage" },
      "about": [
        { "@id": "https://www.litens.com/#organization" },
        { "@id": "{{URL}}#motor-emulator-testbench" },
        { "@type": "Thing", "name": "Motor emulation" },
        { "@type": "Thing", "name": "Motor-drive PCB validation" },
        { "@type": "Thing", "name": "Sensorless BLDC/PMSM drives" },
        { "@type": "Thing", "name": "LIN communication testing" },
        { "@type": "Thing", "name": "Hardware-in-the-Loop (HIL)" },
        { "@type": "Thing", "name": "Power Hardware-in-the-Loop (PHIL)" }
      ],
      "mentions": [
        { "@id": "https://www.litens.com/#organization" },
        { "@id": "https://www.litens.com/#technical-center-india" },
        { "@id": "{{URL}}#shramik-kumar" },
        { "@id": "{{URL}}#sw-tsmaster" },
        { "@id": "{{URL}}#customers-and-partners" },
        { "@type": "SoftwareApplication", "name": "MATLAB/Simulink", "publisher": { "@type": "Organization", "name": "MathWorks" } },
        { "@type": "Organization", "name": "AMD/Xilinx" }
      ],
      "keywords": "Litens Automotive, Litens Technical Center India, Impedyme, motor emulator, CHP Series, MotorSim Studio, TSMaster, LIN, Motor Scope, motor-drive PCB, sensorless BLDC, PMSM, back EMF, 12 V drive, torque sweep, HIL, PHIL, Power HIL, electrified actuation, MATLAB/Simulink",
      "hasPart": [
        {
          "@type": "ItemList",
          "@id": "{{URL}}#headline-impact",
          "name": "Headline impact",
          "description": "Impact reported and approved by Litens Automotive.",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "item": { "@type": "PropertyValue", "name": "Testing time", "value": -55, "unitText": "%" } },
            { "@type": "ListItem", "position": 2, "item": { "@type": "PropertyValue", "name": "Validation time", "value": -45, "unitText": "%" } },
            { "@type": "ListItem", "position": 3, "item": { "@type": "PropertyValue", "name": "Test coverage", "value": 60, "unitText": "%" } },
            { "@type": "ListItem", "position": 4, "item": { "@type": "PropertyValue", "name": "System safety", "value": 50, "unitText": "%" } }
          ]
        },
        {
          "@type": "WebPageElement",
          "@id": "{{URL}}#the-challenge",
          "name": "The Challenge — Two test layers, traditionally two labs",
          "text": "Litens Automotive Group, founded in 1979 and headquartered in Woodbridge, Ontario, is a global tier-one supplier of advanced powertrain systems, engineered from facilities across North America, Europe, South America, and Asia — including the Litens Technical Center India in Bengaluru. As Litens extends into electrified actuation, its teams develop compact sensorless BLDC/PMSM drive electronics whose firmware and hardware must be proven well before production. In Litens' own words, the team needed a repeatable way to validate the motor-control PCB and drive behavior without relying on a physical motor for every test. The setup also had to support LIN-based start, stop, and speed commands; reproduce realistic electrical and mechanical motor behavior; apply controlled positive and negative load torque; and provide clear visibility into phase current, voltage, speed, torque, and power. Conventionally those needs span two benches — a signal-level rig for LIN communication and control logic, and a dynamometer with a physical motor and load machine for the power stage — with a gap between them where integration problems hide. Litens needed both layers on one platform, against a machine it could reconfigure in software."
        },
        {
          "@type": "WebPageElement",
          "@id": "{{URL}}#the-solution",
          "name": "The Solution — One platform from LIN signal to phase current",
          "text": "Impedyme's CHP Series Motor Emulator platform collapses both layers into one testbench. On the power side, the CHP module emulates the three-phase machine electrically: the Litens drive switches into the emulated windings at its native 12 V DC link and drives real phase current, while the FPGA real-time engine (AMD/Xilinx Zynq UltraScale+, quad-core Arm + 600K logic cells under IMPEDYME-RT) solves the motor model every FPGA cycle — so the sensorless algorithm sees the back-EMF signature it expects, from open-loop start through observer-based closed loop. The machine is defined in MotorSim Studio: the motor library holds the BLDC model with Litens' parameters — stator resistance, d/q inductances, back-EMF constant, inertia, and pole pairs — alongside DC-bus settings, torque limits, constant loads, load profiles, and parameter sweeps, with the protection relay on the FPGA. Changing the machine under test is a parameter set, not a mechanical rebuild. Figure 1 — MotorSim Studio, Motor Library: the Litens BLDC machine defined by its electrical parameters (Rs, Ld, Lq, Ke, J, pole pairs) with DC-bus settings and the back-EMF / torque-vs-speed profile. Figure 2 — TSMaster LIN configuration: Litens' schedule tables and CTRL_Frame transmit signals (start motor, target speed, clear faults) commanded at signal level — the same interface the drive sees in the product."
        },
        {
          "@type": "WebPageElement",
          "@id": "{{URL}}#in-practice",
          "name": "In Practice — Every commutation, observed",
          "text": "A representative test connected the Litens sample drive to the Impedyme motor emulator and TSMaster. The DUT was commanded over LIN and operated at 500 RPM and 1,000 RPM while the emulated mechanical torque was swept from −0.2 N·m to +0.2 N·m. Impedyme also varied the motor parameters to demonstrate non-resistive motor behavior, provided zoomed phase-current waveforms and start/stop operation, and supported comparison of the emulated waveform with measurements from the actual motor. Motor Scope captures the result in real time — drive output voltage, emulated phase current, speed, generated torque, and electrical power, with triggering and zoom down to individual commutation and switching events. Reviewing those captures, Litens engineers confirmed the waveforms were right for judging the PCB's load performance — a verdict delivered straight from testbench data, without a motor spinning on a bench. Figure 3 — Motor Scope: multi-channel real-time capture of the Litens drive running against the emulated machine — phase currents and control signals with triggering, zoom, and live measurements."
        },
        {
          "@type": "WebPageElement",
          "@id": "{{URL}}#architecture",
          "name": "Architecture — Testbed configuration",
          "text": "Figure 4 — The Litens testbed: the CHP module emulates the machine at power level (PHIL) while LIN/TSMaster and Simulink models exercise the controller at signal level (HIL); Motor Scope observes both layers together. The same platform scales into a full program: MotorSim Studio ships with multiple motor types and the protection relay on FPGA, hall-sensor and encoder outputs are available via expansion card for sensored drive variants, additional CHP modules add channels under PowerHIL Studio, and the SFP+ backbone (up to 12.5 Gbps) links modules and real-time simulators — with a Simulink-native workflow that fits alongside existing real-time equipment."
        },
        {
          "@type": "Table",
          "@id": "{{URL}}#table-1",
          "name": "Table 1 — The software stack spanning signal-level and power-level testing",
          "about": [
            { "@id": "{{URL}}#sw-motorsim-studio" },
            { "@id": "{{URL}}#sw-tsmaster" },
            { "@id": "{{URL}}#sw-motor-scope" },
            { "@id": "{{URL}}#sw-impedyme-rt" },
            { "@id": "{{URL}}#sw-powerhil-studio" }
          ],
          "text": "MotorSim Studio: defines the emulated machine — motor library (Rs, Ld, Lq, Ke, J, pole pairs), DC-bus and torque limits, constant loads, load profiles, parameter sweeps, and the protection relay executed on the FPGA. TSMaster (LIN): signal-level command and communication testing — Litens' LIN schedule tables and CTRL_Frame signals (start/stop, target speed, fault handling) driven and logged at byte level. Motor Scope: real-time, trigger-based capture of drive output voltage, emulated phase current, speed, generated torque, and electrical power; zoomed views resolve commutation and switching events. IMPEDYME-RT: Linux with Impedyme's proprietary real-time kernel on every module; runs MATLAB/Simulink models on the Arm cores and FPGA (200 ns FPGA update). PowerHIL Studio: platform configuration and sequencing; scales to additional CHP modules and channels as the program grows."
        },
        {
          "@type": "WebPageElement",
          "@id": "{{URL}}#the-result",
          "name": "The Result — Signal level and power level, closed in one loop",
          "text": "The platform creates a structured workflow from communication setup through load validation. The DUT is commanded over LIN, tested at defined speed targets, and subjected to repeatable torque sweeps while the emulator calculates the motor response in real time; engineers then review drive output voltage, emulated phase current, speed, torque, electrical power, and oscilloscope measurements without changing physical motors or mechanical loads. The measured impact, as reported and approved by Litens: development time down 35 %, testing time down 55 %, validation time down 45 %, and testing costs down 35 %; engineering productivity up 45 %, test coverage up 60 %, system safety up 50 %, and confidence before hardware deployment up 55 %. The team moves from DUT communication and startup to controlled speed, load, and parameter-sweep testing on one bench, shortening the iteration cycle. The platform also enabled testing that was previously difficult or impossible: repeatable positive and negative torque sweeps, rapid changes to motor parameters, configurable constant and profiled loads, start/stop transients, and detailed waveform review — plus a direct study of how closely the emulated phase-current behavior matches measurements from the actual motor. For a drive family that spans products and platforms, every variant is a configuration, and every test is a script."
        },
        {
          "@type": "ItemList",
          "@id": "{{URL}}#at-a-glance",
          "name": "At a Glance — Key facts",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "LIN / TSMaster — CTRL_Frame commands per Litens spec" },
            { "@type": "ListItem", "position": 2, "name": "500 / 1,000 RPM — commanded constant-speed operation" },
            { "@type": "ListItem", "position": 3, "name": "−0.2 to +0.2 N·m — programmable torque sweeps & profiles" },
            { "@type": "ListItem", "position": 4, "name": "12 V DC link — drive tested at its native supply" },
            { "@type": "ListItem", "position": 5, "name": "MotorSim Studio — machine defined by Rs · Ld · Lq · Ke · J · p" },
            { "@type": "ListItem", "position": 6, "name": "Motor Scope — V · I · speed · torque · power, zoomed" },
            { "@type": "ListItem", "position": 7, "name": "Zynq UltraScale+ — quad-core Arm + 600K-cell FPGA" },
            { "@type": "ListItem", "position": 8, "name": "HIL + PHIL — signal-level and power-level testing, one rack" }
          ]
        },
        {
          "@type": "Table",
          "@id": "{{URL}}#table-2",
          "name": "Table 2 — Impact reported by Litens compared with its previous workflow",
          "description": "All quantified benefits reviewed and approved by Litens Automotive; external publication permission received.",
          "mainEntity": {
            "@type": "ItemList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "item": { "@type": "PropertyValue", "name": "Reduced development time", "value": -35, "unitText": "%" } },
              { "@type": "ListItem", "position": 2, "item": { "@type": "PropertyValue", "name": "Reduced testing time", "value": -55, "unitText": "%" } },
              { "@type": "ListItem", "position": 3, "item": { "@type": "PropertyValue", "name": "Reduced validation time", "value": -45, "unitText": "%" } },
              { "@type": "ListItem", "position": 4, "item": { "@type": "PropertyValue", "name": "Reduced testing costs", "value": -35, "unitText": "%" } },
              { "@type": "ListItem", "position": 5, "item": { "@type": "PropertyValue", "name": "Improved engineering productivity", "value": 45, "unitText": "%" } },
              { "@type": "ListItem", "position": 6, "item": { "@type": "PropertyValue", "name": "Improved test coverage", "value": 60, "unitText": "%" } },
              { "@type": "ListItem", "position": 7, "item": { "@type": "PropertyValue", "name": "Improved system safety", "value": 50, "unitText": "%" } },
              { "@type": "ListItem", "position": 8, "item": { "@type": "PropertyValue", "name": "Improved confidence before hardware deployment", "value": 55, "unitText": "%" } }
            ]
          }
        },
        {
          "@type": "WebPageElement",
          "@id": "{{URL}}#the-added-value",
          "name": "The Added Value — One vendor, one toolchain, both layers",
          "text": "Litens chose Impedyme because it combined real-time motor modeling with power-level emulation and a practical workflow for connecting the Litens DUT through TSMaster and LIN — with configurable motor parameters and load profiles, responses observed in MotorSim Studio, and Impedyme engineers working directly with the team on the setup. The capabilities Litens rates most valuable — motor emulation, real-time FPGA-based simulation, closed-loop drive and PCB testing, LIN and TSMaster integration, motor parameter configuration, constant and profiled mechanical loads, real-time waveform, torque, and power monitoring, and technical support and customization — are exactly what this testbench delivers. Layered protection keeps aggressive cases contained, and the liquid-cooled cabinet needs no external chiller."
        },
        {
          "@type": "ItemList",
          "@id": "{{URL}}#why-it-works",
          "name": "Why It Works — The advantages",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Signal-level HIL and power-level PHIL on one platform — no seam between benches" },
            { "@type": "ListItem", "position": 2, "name": "Sensorless drives supported: realistic back-EMF from the first commutation" },
            { "@type": "ListItem", "position": 3, "name": "Drive commanded over its own protocol — LIN / TSMaster to the customer's spec" },
            { "@type": "ListItem", "position": 4, "name": "Machine variants are MotorSim Studio parameter sets, not hardware rebuilds" },
            { "@type": "ListItem", "position": 5, "name": "Programmable ±0.2 N·m torque sweeps, constant loads, and profiles" },
            { "@type": "ListItem", "position": 6, "name": "Motor Scope traces every command to the waveform it produces" },
            { "@type": "ListItem", "position": 7, "name": "Emulated waveforms compared directly with actual-motor measurements" },
            { "@type": "ListItem", "position": 8, "name": "Layered FPGA protection keeps fault-case testing contained" }
          ]
        },
        {
          "@type": "Table",
          "@id": "{{URL}}#table-3",
          "name": "Table 3 — What one HIL + PHIL platform replaces",
          "text": "Signal-level testing: conventional — separate HIL simulator and comms rig; Impedyme CHP Series — LIN / TSMaster + Simulink models on the same platform as the power stage. Power-level testing: conventional — dynamometer with physical motor + load machine; Impedyme CHP Series — CHP module emulates the machine, drive switches real current at its native DC link. Machine variants: conventional — new motor and fixturing per variant; Impedyme CHP Series — parameter set in MotorSim Studio (Rs, Ld, Lq, Ke, J, pole pairs). Torque loading: conventional — load-machine limits and dynamics; Impedyme CHP Series — programmable −0.2…+0.2 N·m sweeps, constant loads, and load profiles. Measurement: conventional — bench scopes, separate logging per rig; Impedyme CHP Series — Motor Scope with synchronized V, I, speed, torque, power and commutation-level zoom."
        },
        {
          "@type": "Quotation",
          "@id": "{{URL}}#quote-1",
          "text": "We were very pleased with the Impedyme motor-emulation solution. It gave our team a flexible and visible way to validate the drive PCB under realistic motor and load conditions, and Impedyme worked closely with us to solve the technical challenges encountered during setup and testing.",
          "creator": { "@id": "{{URL}}#shramik-kumar" },
          "about": { "@id": "{{URL}}#motor-emulator-testbench" }
        },
        {
          "@type": "Quotation",
          "@id": "{{URL}}#quote-2",
          "text": "The team liked the product very much, particularly its flexibility and the amount of engineering visibility it provides. Motor parameters, constant loads, load profiles, and parameter sweeps can be changed from one interface while real-time electrical and mechanical results are monitored.",
          "creator": { "@id": "{{URL}}#shramik-kumar" },
          "about": { "@id": "{{URL}}#motor-emulator-testbench" }
        },
        {
          "@type": "Quotation",
          "@id": "{{URL}}#quote-3",
          "text": "Impedyme is a strong choice when a motor-control program needs repeatable drive testing without building a separate motor and mechanical-load setup for every case. The platform combines configurable real-time motor behavior, controlled loading, useful measurement tools, and responsive engineering support.",
          "creator": { "@id": "{{URL}}#shramik-kumar" },
          "about": { "@id": "{{URL}}#motor-emulator-testbench" }
        }
      ]
    }
  ]
}
JSONLD;

	$schema = strtr(
		$schema,
		array(
			'{{URL}}'        => $page_url,
			'{{IMG_STORY}}'  => $img_story,
			'{{IMG_MOBILE}}' => $img_mobile,
			'{{IMG_SHOT_1}}' => $img_shot_1,
			'{{IMG_SHOT_2}}' => $img_shot_2,
			'{{IMG_SHOT_3}}' => $img_shot_3,
			'{{DATE}}'       => $date_published,
		)
	);

	echo "\n<script type=\"application/ld+json\">\n" . $schema . "\n</script>\n";
}
