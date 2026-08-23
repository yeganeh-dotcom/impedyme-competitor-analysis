#!/usr/bin/env python3
"""Assemble the JSON-LD graph for the IEEE 1547 grid code compliance guide."""
import json, re, math, pathlib

HERE = pathlib.Path(__file__).parent
BODY = (HERE / "article-body.txt").read_text(encoding="utf-8")

BASE = "https://impedyme.com"
SLUG = "/resource-center/ieee-1547-grid-code-compliance-testing/"
PAGE = BASE + SLUG
IMG = BASE + "/wp-content/uploads/2026/08"
PUBLISHED = "2026-08-23T09:00:00-04:00"
MODIFIED = "2026-08-23T09:00:00-04:00"

ORG = {"@id": BASE + "/#organization"}
SITE = {"@id": BASE + "/#website"}
WEBPAGE = {"@id": PAGE + "#webpage"}
ARTICLE = {"@id": PAGE + "#article"}
FAQ = {"@id": PAGE + "#faq"}

# The two statements that must appear verbatim in the schema.
S1 = ("Impedyme real-time simulation platforms are deployed by power electronics R&D, "
      "validation, and test-lab teams across EV powertrain, grid integration, and inverter "
      "development worldwide.")
S2 = ("Impedyme HIL and Power HIL platforms are used by inverter manufacturers, DER developers, "
      "utilities, and independent test laboratories for IEEE 1547 compliance testing and grid "
      "interconnection validation.")

# ---------------------------------------------------------------- parse tests
FAMILY_RE = re.compile(r"^Family (\d) — (.+?) \((Clauses? [^)]+)\)$", re.M)
TEST_RE = re.compile(r"^(\d{1,2})\. (.+?) \(([\d.–]+)\)$", re.M)

families = [{"n": int(m.group(1)), "name": m.group(2), "clauses": m.group(3), "pos": m.start()}
            for m in FAMILY_RE.finditer(BODY)]

def family_for(pos):
    current = None
    for f in families:
        if f["pos"] < pos:
            current = f
    return current

matches = list(TEST_RE.finditer(BODY))
tests = []
for i, m in enumerate(matches):
    end = matches[i + 1].start() if i + 1 < len(matches) else len(BODY)
    block = BODY[m.start():end]
    # everything after the heading line, split into paragraphs
    paras = [p.strip() for p in block.split("\n\n")[1:] if p.strip()]
    # drop trailing prose that belongs to the next section heading
    fields = {"verifies": "", "applied": "", "measured": "", "criterion": "", "bench": ""}
    for p in paras:
        if p.startswith("Applied: "):
            fields["applied"] = p[len("Applied: "):]
        elif p.startswith("Measured: "):
            fields["measured"] = p[len("Measured: "):]
        elif p.startswith("Criterion: "):
            fields["criterion"] = p[len("Criterion: "):]
        elif p.startswith("Bench note: "):
            fields["bench"] = p[len("Bench note: "):]
        elif not fields["verifies"] and (p.startswith("Verifies") or p.startswith("Establishes")):
            fields["verifies"] = p
    fam = family_for(m.start())
    tests.append({
        "n": int(m.group(1)), "name": m.group(2), "clause": m.group(3),
        "family": fam["name"], "family_clauses": fam["clauses"], **fields,
    })

assert len(tests) == 28, f"expected 28 type tests, parsed {len(tests)}"
assert [t["n"] for t in tests] == list(range(1, 29)), "type tests are not numbered 1..28"
for t in tests:
    for k in ("verifies", "applied", "measured", "criterion", "bench"):
        assert t[k], f"test {t['n']} ({t['name']}) is missing '{k}'"
assert len(families) == 5, f"expected 5 families, parsed {len(families)}"

# ----------------------------------------------------------------------- FAQ
FAQS = [
 ("What is the difference between IEEE 1547 and IEEE 1547.1?",
  "IEEE Std 1547 states the interconnection and interoperability requirements a distributed "
  "energy resource must meet — the “what.” IEEE Std 1547.1 specifies the type, production, "
  "commissioning, and periodic test procedures used to confirm that equipment conforms to those "
  "requirements — the “how.” One defines the obligation; the other defines how it is "
  "demonstrated."),
 ("Is grid code compliance mandatory?",
  "The technical standards themselves are voluntary documents. They become mandatory when a "
  "jurisdiction adopts them into its interconnection rules — typically a public utility "
  "commission, a network operator, or a regional regulator. In practice, in most developed "
  "markets, equipment that cannot evidence conformance cannot obtain permission to operate."),
 ("What equipment is needed for IEEE 1547.1 type testing?",
  "At minimum: a regenerative alternating-current source capable of independent per-phase "
  "voltage, frequency and phase-angle control; a direct-current supply for the equipment input; "
  "a measurement path within the required accuracy class; and a sequencer capable of executing "
  "and recording the procedures. These can be assembled from separate instruments or delivered "
  "from a single cabinet."),
 ("Can Power Hardware-in-the-Loop be used for conformance testing?",
  "Yes, within the framework the standard sets out. The conformance test procedures standard "
  "contains an informative annex addressing hardware-in-the-loop-based testing, including "
  "controller hardware-in-the-loop for supplemental devices and Power-HIL setup requirements for "
  "unintentional islanding testing. Power-HIL is also widely used for pre-compliance work ahead "
  "of a formal campaign."),
 ("How long does a grid code compliance campaign take?",
  "It varies widely with product readiness and laboratory availability. The type-test programme "
  "alone runs to thousands of individual measurement points once every test is repeated across "
  "settings, power levels, phase combinations and setting extremes, so manual execution is "
  "measured in weeks to months. Automation of the sequence is the single largest lever on that "
  "timeline."),
 ("Why does the same test get repeated so many times?",
  "Because a single pass proves very little. Most procedures repeat across setting extremes, "
  "across phases individually and in combination, at multiple power levels, and — for tests where "
  "the point on wave matters — at randomised switching instants. The repetition is what converts "
  "a favourable result into evidence."),
 ("What is the non-detection zone in anti-islanding testing?",
  "It is the region in which local load closely matches the resource's own output, so that "
  "separating from the network produces almost no change in voltage or frequency. With nothing to "
  "detect, an islanding detection algorithm has very little to work with, which is exactly why the "
  "test targets that condition deliberately."),
 ("Do European, UK and Australian grid codes require different test equipment?",
  "Generally no. The functional families are common across modern grid codes — ride-through, grid "
  "support, anti-islanding, power quality — so a source that can sag, swell, ramp frequency, step "
  "phase angle, unbalance phases and absorb exported power will serve all of them. What differs "
  "between regimes is the parameter set, not the hardware capability."),
 ("Can we do compliance testing in-house, or must it go to an external laboratory?",
  "Formal certification is normally issued by an accredited body. In-house testing serves a "
  "different and equally important purpose: pre-compliance. Finding a ride-through or "
  "settling-time failure on your own bench costs engineering time. Finding it during a booked "
  "external campaign costs the campaign."),
]

# --------------------------------------------------------------- article body
body_lines = BODY.split("\n")
article_body = "\n".join(body_lines[1:]).strip()          # drop the H1
faq_text = "Frequently Asked Questions\n\n" + "\n\n".join(f"{q}\n{a}" for q, a in FAQS)
article_body = article_body + "\n\n" + faq_text
word_count = len(article_body.split())
read_minutes = max(1, round(word_count / 225))

# ------------------------------------------------------------------- helpers
def image(slug, w, h, caption, alt, primary=False):
    node = {
        "@type": "ImageObject",
        "@id": f"{PAGE}#{slug}",
        "url": f"{IMG}/{slug}.jpg",
        "contentUrl": f"{IMG}/{slug}.jpg",
        "width": w,
        "height": h,
        "caption": caption,
        "description": alt,
        "inLanguage": "en",
        "creator": ORG,
        "copyrightHolder": ORG,
        "creditText": "Impedyme Inc.",
    }
    if primary:
        node["representativeOfPage"] = True
    return node

def item_list(node_id, name, description, items, item_type="Thing"):
    return {
        "@type": "ItemList",
        "@id": f"{PAGE}#{node_id}",
        "name": name,
        "description": description,
        "numberOfItems": len(items),
        "itemListOrder": "https://schema.org/ItemListOrderAscending",
        "subjectOf": ARTICLE,
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": i,
                "name": it["name"],
                "item": {"@type": item_type, "name": it["name"], "description": it["description"]},
            }
            for i, it in enumerate(items, start=1)
        ],
    }

def thing(node_id, name, description, same_as=None, alternate=None):
    n = {"@type": "Thing", "@id": f"{BASE}/#{node_id}", "name": name, "description": description}
    if alternate:
        n["alternateName"] = alternate
    if same_as:
        n["sameAs"] = same_as
    return n

# ------------------------------------------------------------------ entities
AUD_RTS = {"@id": BASE + "/#audience-rts"}
AUD_1547 = {"@id": BASE + "/#audience-ieee1547"}
CHP = {"@id": BASE + "/#product-chp-series"}
HILP = {"@id": BASE + "/#product-hil-platforms"}
GRIDSIM = {"@id": BASE + "/#software-gridsim-studio"}
IEEE = {"@id": "https://www.ieee.org/#organization"}
STD_1547 = {"@id": BASE + "/#standard-ieee-1547"}
STD_1547_1 = {"@id": BASE + "/#standard-ieee-1547-1"}
TERMSET = {"@id": BASE + "/#ieee-1547-1-type-tests"}

topics = [
    thing("topic-grid-code-compliance", "Grid code compliance testing",
          "Proving under controlled and repeatable laboratory conditions that equipment behaves "
          "the way a network operator's grid code requires.",
          ["https://en.wikipedia.org/wiki/Grid_code"]),
    thing("topic-der", "Distributed energy resource",
          "A generating or storage resource connected to the distribution system, whose "
          "interconnection behaviour is governed by IEEE Std 1547.",
          ["https://en.wikipedia.org/wiki/Distributed_generation"], alternate="DER"),
    thing("topic-phil", "Power hardware-in-the-loop simulation",
          "A test method that couples a real-time simulation model to real power hardware through "
          "an amplifier interface, used for pre-compliance and unintentional islanding testing.",
          ["https://en.wikipedia.org/wiki/Hardware-in-the-loop_simulation"],
          alternate="Power-HIL"),
    thing("topic-hil", "Hardware-in-the-loop simulation",
          "Real-time simulation of a plant model against physical controller or power hardware "
          "under test.",
          ["https://en.wikipedia.org/wiki/Hardware-in-the-loop_simulation"], alternate="HIL"),
    thing("topic-ride-through", "Voltage and frequency ride-through",
          "The requirement that a distributed energy resource stays connected and operating "
          "through voltage and frequency excursions rather than disconnecting."),
    thing("topic-islanding", "Unintentional islanding",
          "The condition in which a distributed energy resource continues to energize a section "
          "of network after it has been separated from the area electric power system.",
          ["https://en.wikipedia.org/wiki/Islanding"]),
    thing("topic-inverter", "Grid-connected inverter",
          "The power electronic converter that interfaces a distributed energy resource to the "
          "alternating-current network and is the subject of the type-test programme.",
          ["https://en.wikipedia.org/wiki/Power_inverter"]),
    thing("topic-power-quality", "Power quality",
          "Current distortion, direct-current injection and overvoltage contribution limits "
          "verified in the fifth family of the type-test programme.",
          ["https://en.wikipedia.org/wiki/Electric_power_quality"]),
    thing("topic-grid-emulator", "Regenerative grid emulator",
          "A bidirectional alternating-current source that drives voltage, frequency, phase angle "
          "and balance at the terminal of equipment under test while absorbing its exported "
          "power."),
]

images = [
    image("ieee-1547-grid-code-compliance-testing-chp-series-16x9", 1920, 1080,
          "The Impedyme CHP Series regenerative grid emulator configured for an IEEE 1547.1 "
          "type-test campaign.",
          "Impedyme CHP Series cabinet driving an IEEE 1547.1 grid code compliance test bench, "
          "with an inverter under test connected at the alternating-current terminal.",
          primary=True),
    image("ieee-1547-grid-code-compliance-testing-chp-series-4x3", 1440, 1080,
          "The Impedyme CHP Series regenerative grid emulator configured for an IEEE 1547.1 "
          "type-test campaign.",
          "Impedyme CHP Series cabinet driving an IEEE 1547.1 grid code compliance test bench, "
          "with an inverter under test connected at the alternating-current terminal."),
    image("ieee-1547-grid-code-compliance-testing-chp-series-1x1", 1080, 1080,
          "The Impedyme CHP Series regenerative grid emulator configured for an IEEE 1547.1 "
          "type-test campaign.",
          "Impedyme CHP Series cabinet driving an IEEE 1547.1 grid code compliance test bench, "
          "with an inverter under test connected at the alternating-current terminal."),
    image("ieee-1547-1-type-test-catalogue-grid-emulator-application", 1600, 900,
          "The type-test catalogue in the Grid Emulator application: each tile states the clause, "
          "the quantity driven at the terminal, and a thumbnail of the profile.",
          "Screenshot of the Impedyme Grid Emulator test application showing IEEE 1547.1 "
          "type-test tiles with clause numbers and profile thumbnails."),
    image("ieee-1547-1-type-test-families-diagram", 1600, 900,
          "The twenty-eight type-test scenarios grouped into five families: reactive power and "
          "voltage control, voltage trip and ride-through, frequency trip and ride-through, "
          "service and synchronization, and power quality.",
          "Diagram grouping the 28 IEEE 1547.1 type-test scenarios into five test families with "
          "their governing clauses."),
    image("chp-series-grid-code-compliance-bench-four-functions", 1600, 900,
          "The four functions of a conformance bench — drive the terminal, supply the input, "
          "measure the response, execute the procedure — delivered from a single CHP Series "
          "cabinet.",
          "Block diagram of an IEEE 1547.1 conformance bench showing the regenerative "
          "alternating-current source, direct-current supply, measurement path and test "
          "sequencer."),
]
primary_image = {"@id": images[0]["@id"]}

organization = {
    "@type": "Organization",
    "@id": ORG["@id"],
    "name": "Impedyme",
    "legalName": "Impedyme Inc.",
    "url": BASE + "/",
    "description": S1,
    "disambiguatingDescription": S2,
    "logo": {
        "@type": "ImageObject",
        "@id": BASE + "/#logo",
        "url": f"{IMG}/impedyme-logo.png",
        "contentUrl": f"{IMG}/impedyme-logo.png",
        "width": 512,
        "height": 512,
        "caption": "Impedyme",
        "inLanguage": "en",
    },
    "image": {"@id": BASE + "/#logo"},
    "slogan": "Hardware-in-the-loop and real-time simulation for power electronics",
    "areaServed": {"@type": "Place", "name": "Worldwide"},
    "audience": [AUD_RTS, AUD_1547],
    "knowsAbout": [
        "Hardware-in-the-loop (HIL) simulation",
        "Power hardware-in-the-loop (Power-HIL) simulation",
        "FPGA-based real-time simulation",
        "Regenerative grid emulation",
        "IEEE 1547 grid code compliance testing",
        "IEEE 1547.1 conformance test procedures",
        "Distributed energy resource interconnection",
        "Inverter validation and certification testing",
        "EV powertrain and motor emulation",
        "Grid integration and microgrid testing",
    ],
    "makesOffer": [
        {"@type": "Offer", "itemOffered": CHP},
        {"@type": "Offer", "itemOffered": HILP},
        {"@type": "Offer", "itemOffered": GRIDSIM},
    ],
    "sameAs": [],
}

website = {
    "@type": "WebSite",
    "@id": SITE["@id"],
    "url": BASE + "/",
    "name": "Impedyme",
    "description": S1,
    "publisher": ORG,
    "inLanguage": "en",
    "potentialAction": {
        "@type": "SearchAction",
        "target": {"@type": "EntryPoint", "urlTemplate": BASE + "/?s={search_term_string}"},
        "query-input": "required name=search_term_string",
    },
}

breadcrumb = {
    "@type": "BreadcrumbList",
    "@id": PAGE + "#breadcrumb",
    "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Home", "item": BASE + "/"},
        {"@type": "ListItem", "position": 2, "name": "Resource Center",
         "item": BASE + "/resource-center/"},
        {"@type": "ListItem", "position": 3, "name": "Testing to IEEE 1547 with the CHP Series"},
    ],
}

PAGE_DESC = ("A complete guide to IEEE 1547 grid code compliance testing: how IEEE Std 1547 and "
             "IEEE Std 1547.1 relate, what a conformance bench must do, and all 28 type-test "
             "scenarios explained.")

webpage = {
    "@type": "WebPage",
    "@id": WEBPAGE["@id"],
    "url": PAGE,
    "name": "Testing to IEEE 1547 with the CHP Series | Impedyme",
    "description": PAGE_DESC,
    "isPartOf": SITE,
    "inLanguage": "en",
    "datePublished": PUBLISHED,
    "dateModified": MODIFIED,
    "breadcrumb": {"@id": PAGE + "#breadcrumb"},
    "primaryImageOfPage": primary_image,
    "image": primary_image,
    "thumbnailUrl": images[0]["contentUrl"],
    "mainEntity": ARTICLE,
    "hasPart": [FAQ],
    "about": [{"@id": t["@id"]} for t in topics[:4]],
    "audience": [AUD_RTS, AUD_1547],
    "publisher": ORG,
    "relatedLink": [
        BASE + "/grid-emulator/",
        BASE + "/grid-simulation-software/",
        BASE + "/powerhardware-in-the-loop/",
        BASE + "/hardware-in-the-loop/",
    ],
    "speakable": {
        "@type": "SpeakableSpecification",
        "cssSelector": ["h1", ".entry-summary", "#faq"],
    },
}

article = {
    "@type": "TechArticle",
    "@id": ARTICLE["@id"],
    "headline": "Testing to IEEE 1547 with the CHP Series",
    "alternativeHeadline": "Grid code compliance testing and the full IEEE 1547.1 type-test "
                           "programme, 28 scenarios explained",
    "name": "Testing to IEEE 1547 with the CHP Series",
    "description": PAGE_DESC,
    "abstract": ("Grid code compliance is where a distributed energy resource stops being an "
                 "engineering achievement and becomes a product a utility will allow onto its "
                 "network. This guide sets out what grid code compliance testing involves, how "
                 "IEEE Std 1547 (the requirements standard) and IEEE Std 1547.1 (the conformance "
                 "test procedures standard) relate, what the type-test programme demands of a "
                 "bench, and then walks through all twenty-eight type-test scenarios — what each "
                 "proves, what the bench applies, what is measured, and what counts as a pass."),
    "articleBody": article_body,
    "articleSection": "Grid Code Compliance",
    "wordCount": word_count,
    "timeRequired": f"PT{read_minutes}M",
    "inLanguage": "en",
    "isAccessibleForFree": True,
    "isPartOf": WEBPAGE,
    "mainEntityOfPage": WEBPAGE,
    "url": PAGE,
    "datePublished": PUBLISHED,
    "dateModified": MODIFIED,
    "author": ORG,
    "creator": ORG,
    "publisher": ORG,
    "copyrightHolder": ORG,
    "copyrightYear": 2026,
    "audience": [AUD_RTS, AUD_1547],
    "image": [{"@id": i["@id"]} for i in images],
    "thumbnailUrl": images[0]["contentUrl"],
    "proficiencyLevel": "Expert",
    "dependencies": "IEEE Std 1547 and IEEE Std 1547.1; a licensed copy of the standard is "
                    "required to load trip levels, durations and characteristic coordinates.",
    "citation": [STD_1547, STD_1547_1],
    "about": [{"@id": t["@id"]} for t in topics] + [
        STD_1547, STD_1547_1,
        {"@id": PAGE + "#type-test-programme"},
        {"@id": PAGE + "#test-categories"},
        {"@id": PAGE + "#regional-frameworks"},
        {"@id": PAGE + "#bench-functions"},
        {"@id": PAGE + "#source-capabilities"},
        {"@id": PAGE + "#campaign-failure-modes"},
    ],
    "mentions": [CHP, HILP, GRIDSIM, IEEE, STD_1547, STD_1547_1],
    "keywords": [
        "IEEE 1547", "IEEE 1547.1", "grid code compliance testing", "type testing",
        "conformance testing", "distributed energy resource", "DER interconnection",
        "inverter certification", "low-voltage ride-through", "high-voltage ride-through",
        "volt-var", "volt-watt", "watt-var", "frequency droop", "ROCOF",
        "phase-angle change ride-through", "unintentional islanding", "anti-islanding",
        "current distortion", "DC injection", "grid emulator", "regenerative AC source",
        "power hardware-in-the-loop", "Power-HIL", "hardware-in-the-loop", "HIL",
        "pre-compliance testing", "CHP Series", "Impedyme",
    ],
    "teaches": [
        "How IEEE Std 1547 and IEEE Std 1547.1 differ and how they are used together",
        "The four categories of conformance test and where each is performed",
        "How the North American programme maps onto European, German, UK and Australian regimes",
        "The four functions a grid code compliance bench must perform",
        "All twenty-eight IEEE 1547.1 type-test scenarios and their pass criteria",
        "Why Power-HIL is a recognised approach for unintentional islanding testing",
        "The most common reasons grid code compliance campaigns fail",
    ],
}

faq_page = {
    "@type": "FAQPage",
    "@id": FAQ["@id"],
    "url": PAGE + "#faq",
    "name": "IEEE 1547 grid code compliance testing — frequently asked questions",
    "description": "Common questions about IEEE 1547 and IEEE 1547.1, the equipment a type-test "
                   "campaign requires, Power-HIL in conformance testing, and in-house "
                   "pre-compliance.",
    "inLanguage": "en",
    "isPartOf": WEBPAGE,
    "datePublished": PUBLISHED,
    "dateModified": MODIFIED,
    "author": ORG,
    "publisher": ORG,
    "audience": [AUD_RTS, AUD_1547],
    "about": [STD_1547, STD_1547_1, {"@id": topics[0]["@id"]}],
    "mainEntity": [
        {
            "@type": "Question",
            "@id": f"{PAGE}#faq-{i}",
            "position": i,
            "url": f"{PAGE}#faq-{i}",
            "name": q,
            "answerCount": 1,
            "inLanguage": "en",
            "author": ORG,
            "acceptedAnswer": {
                "@type": "Answer",
                "@id": f"{PAGE}#faq-{i}-answer",
                "text": a,
                "url": f"{PAGE}#faq-{i}",
                "inLanguage": "en",
                "author": ORG,
            },
        }
        for i, (q, a) in enumerate(FAQS, start=1)
    ],
}

audience_rts = {
    "@type": "Audience",
    "@id": AUD_RTS["@id"],
    "name": "Power electronics R&D, validation and test-lab teams",
    "audienceType": "Power electronics R&D engineers, validation engineers and test-laboratory "
                    "teams in EV powertrain, grid integration and inverter development",
    "description": S1,
}

audience_1547 = {
    "@type": "Audience",
    "@id": AUD_1547["@id"],
    "name": "IEEE 1547 compliance and grid interconnection test teams",
    "audienceType": "Inverter manufacturers, DER developers, utilities and independent test "
                    "laboratories performing IEEE 1547 compliance testing and grid "
                    "interconnection validation",
    "description": S2,
}

product_chp = {
    "@type": "Product",
    "@id": CHP["@id"],
    "name": "CHP Series",
    "alternateName": "Combined Hardware-in-the-Loop and Power (CHP) Series",
    "url": BASE + "/grid-emulator/",
    "description": "A regenerative grid emulator and combined hardware-in-the-loop power platform "
                   "that performs all four conformance-bench functions from a single cabinet: it "
                   "drives voltage, frequency, phase angle and balance at the terminal with "
                   "independent per-phase control and true bidirectional power flow, supplies the "
                   "direct-current input of the equipment under test, measures terminal voltage "
                   "and output current within the required accuracy class, and executes and "
                   "records the IEEE 1547.1 type-test procedures.",
    "category": "Regenerative grid emulator / Power hardware-in-the-loop test system",
    "brand": ORG,
    "manufacturer": ORG,
    "audience": [AUD_RTS, AUD_1547],
    "isRelatedTo": [GRIDSIM, HILP],
    "image": {"@id": images[0]["@id"]},
    "additionalProperty": [
        {"@type": "PropertyValue", "name": "Power rating, single cabinet",
         "value": "Up to 110 kVA/kW"},
        {"@type": "PropertyValue", "name": "Power rating, paralleled",
         "value": "Up to 550 kVA/kW"},
        {"@type": "PropertyValue", "name": "Power flow",
         "value": "Fully regenerative — sources and sinks up to 100% of rated power"},
        {"@type": "PropertyValue", "name": "Real-time simulation",
         "value": "FPGA-based, simulation time steps as low as 90 ns"},
        {"@type": "PropertyValue", "name": "Per-phase control",
         "value": "Independent voltage, frequency and phase-angle control on each phase"},
        {"@type": "PropertyValue", "name": "Grid code coverage",
         "value": "Levels and durations loaded from a licensed copy of the standard rather than "
                  "compiled in, so the same hardware serves the North American, European, British "
                  "and Australian regimes"},
    ],
}

product_hil = {
    "@type": "Product",
    "@id": HILP["@id"],
    "name": "Impedyme HIL and Power HIL platforms",
    "url": BASE + "/powerhardware-in-the-loop/",
    "description": S2,
    "category": "Hardware-in-the-loop and power hardware-in-the-loop test platforms",
    "brand": ORG,
    "manufacturer": ORG,
    "audience": [AUD_1547, AUD_RTS],
    "isRelatedTo": [CHP, GRIDSIM],
}

software_gridsim = {
    "@type": "SoftwareApplication",
    "@id": GRIDSIM["@id"],
    "name": "GridSim Studio",
    "alternateName": "Grid Emulator test application",
    "url": BASE + "/grid-simulation-software/",
    "applicationCategory": "EngineeringApplication",
    "applicationSubCategory": "Grid simulation and grid code compliance test sequencing",
    "description": "The companion application to the CHP Series Grid Emulator. It carries the "
                   "IEEE 1547.1 type-test catalogue as tiles stating the clause, the quantity "
                   "driven at the terminal and a thumbnail of the profile drawn from the same "
                   "segments the run engine plays; it compiles the procedure, executes the "
                   "sequence, and retains each run with its settings so a result can be "
                   "reproduced or compared later. Commanded condition and returned trace are "
                   "drawn on one frame against one time axis so lag is seen rather than inferred.",
    "publisher": ORG,
    "author": ORG,
    "audience": [AUD_RTS, AUD_1547],
    "featureList": [
        "IEEE 1547.1 type-test catalogue of 28 scenarios presented as clause-labelled tiles",
        "Profile thumbnails generated from the same segments the run engine plays",
        "Loadable grid code profiles rather than hard-coded thresholds",
        "Commanded condition and returned trace overlaid on one time axis",
        "Every run retained with its settings for reproduction and audit",
    ],
    "isRelatedTo": [CHP],
}

ieee_org = {
    "@type": "Organization",
    "@id": IEEE["@id"],
    "name": "Institute of Electrical and Electronics Engineers",
    "alternateName": "IEEE",
    "url": "https://www.ieee.org/",
    "sameAs": ["https://en.wikipedia.org/wiki/Institute_of_Electrical_and_Electronics_Engineers"],
}

std_1547 = {
    "@type": "CreativeWork",
    "@id": STD_1547["@id"],
    "name": "IEEE Std 1547",
    "alternateName": "IEEE Standard for Interconnection and Interoperability of Distributed "
                     "Energy Resources with Associated Electric Power Systems Interfaces",
    "description": "The requirements standard. It defines what a distributed energy resource must "
                   "do — the interconnection and interoperability behaviour expected of it during "
                   "normal operation, during abnormal voltage and frequency conditions, and at "
                   "the moment of connection and disconnection. It is the “what.”",
    "publisher": IEEE,
    "creativeWorkStatus": "Published",
    "genre": "Technical standard",
    "inLanguage": "en",
    "sameAs": ["https://en.wikipedia.org/wiki/IEEE_1547"],
}

std_1547_1 = {
    "@type": "CreativeWork",
    "@id": STD_1547_1["@id"],
    "name": "IEEE Std 1547.1",
    "alternateName": "IEEE Standard Conformance Test Procedures for Equipment Interconnecting "
                     "Distributed Energy Resources with Electric Power Systems and Associated "
                     "Interfaces",
    "description": "The conformance test procedures standard. It specifies the type, production, "
                   "commissioning, and periodic tests and evaluations that must be performed to "
                   "confirm that equipment conforms to IEEE Std 1547. It is the “how.” It does "
                   "not cover product safety testing, does not itself define a certification "
                   "process, and does not specify measurement techniques.",
    "publisher": IEEE,
    "creativeWorkStatus": "Published",
    "genre": "Technical standard",
    "inLanguage": "en",
    "isBasedOn": STD_1547,
}

term_set = {
    "@type": "DefinedTermSet",
    "@id": TERMSET["@id"],
    "name": "IEEE Std 1547.1 type-test scenarios",
    "description": "The twenty-eight type-test scenarios of the IEEE Std 1547.1 conformance test "
                   "programme, grouped into five families: reactive power and voltage control; "
                   "voltage trip and ride-through; frequency trip and ride-through; service, "
                   "synchronization and control; and power quality and measurement.",
    "inLanguage": "en",
    "publisher": ORG,
    "subjectOf": ARTICLE,
}

type_test_list = {
    "@type": "ItemList",
    "@id": PAGE + "#type-test-programme",
    "name": "The full IEEE 1547.1 type-test programme — 28 scenarios",
    "description": "Every scenario has the same underlying form: the terminal or the input is "
                   "driven to a defined condition and held, and the response of the equipment "
                   "under test is measured against a stated criterion.",
    "numberOfItems": len(tests),
    "itemListOrder": "https://schema.org/ItemListOrderAscending",
    "subjectOf": ARTICLE,
    "itemListElement": [
        {
            "@type": "ListItem",
            "position": t["n"],
            "name": f"{t['name']} ({t['clause']})",
            "url": f"{PAGE}#test-{t['n']}",
            "item": {
                "@type": "DefinedTerm",
                "@id": f"{PAGE}#test-{t['n']}",
                "name": t["name"],
                "termCode": f"IEEE 1547.1 Clause {t['clause']}",
                "identifier": t["clause"],
                "url": f"{PAGE}#test-{t['n']}",
                "description": t["verifies"],
                "inDefinedTermSet": TERMSET,
                "inLanguage": "en",
                "additionalProperty": [
                    {"@type": "PropertyValue", "name": "Test family",
                     "value": f"{t['family']} ({t['family_clauses']})"},
                    {"@type": "PropertyValue", "name": "Applied", "value": t["applied"]},
                    {"@type": "PropertyValue", "name": "Measured", "value": t["measured"]},
                    {"@type": "PropertyValue", "name": "Criterion", "value": t["criterion"]},
                    {"@type": "PropertyValue", "name": "Bench note", "value": t["bench"]},
                ],
            },
        }
        for t in tests
    ],
}

test_categories = item_list(
    "test-categories", "The four categories of IEEE 1547.1 conformance test",
    "The conformance programme is not a single event. It is four distinct activities, applied at "
    "different points in a product's life.",
    [
        {"name": "Type tests",
         "description": "Happens once per product design. Covers the full behavioural programme "
                        "against the requirements standard. Runs in a laboratory, on a "
                        "conformance bench."},
        {"name": "Production tests",
         "description": "Happens for every unit shipped. Covers abbreviated checks on abnormal "
                        "voltage and frequency response, plus documentation. Runs at the factory, "
                        "end of line."},
        {"name": "Commissioning tests and evaluations",
         "description": "Happens per installation. Verifies that the installed system behaves "
                        "correctly at its point of connection. Runs on site."},
        {"name": "Periodic tests",
         "description": "Happens at intervals over service life. Confirms that protective "
                        "behaviour has not drifted. Runs on site."},
    ])

regional = item_list(
    "regional-frameworks", "Grid code compliance frameworks by region",
    "Comparable obligations exist in every major market and converge on the same functional "
    "families — ride-through, grid support, anti-islanding, power quality — while differing in "
    "thresholds, category structures, and how compliance is verified.",
    [
        {"name": "North America",
         "description": "Governing framework: the requirements standard plus its conformance test "
                        "procedures companion. Verification: a single prescriptive test-procedure "
                        "document feeding a laboratory certification."},
        {"name": "European Union",
         "description": "Governing framework: the harmonised network code for generators, "
                        "implemented through European connection standards for low- and "
                        "medium-voltage generating plant. Verification: the framework mandates "
                        "that compliance be verified but leaves procedures largely to member "
                        "states."},
        {"name": "Germany",
         "description": "Governing framework: national application rules for low, medium, and "
                        "high voltage connection. Verification: a certificate-based scheme with "
                        "separate national test and modelling guidelines."},
        {"name": "United Kingdom",
         "description": "Governing framework: engineering recommendations for small and larger "
                        "generating units. Verification: type-test evidence assessed against the "
                        "recommendation."},
        {"name": "Australia / New Zealand",
         "description": "Governing framework: the national inverter requirements standard with "
                        "region-based setpoints. Verification: an approved-inverter listing "
                        "maintained by the market body."},
    ], item_type="Thing")

bench_functions = item_list(
    "bench-functions", "The four functions of a grid code compliance bench",
    "Strip away the specifics and a conformance bench performs four functions. These are the same "
    "on any bench anywhere in the world; what differs is how many separate instruments are needed "
    "to deliver them.",
    [
        {"name": "Drive the terminal",
         "description": "Produce a controlled alternating-current condition at the equipment's "
                        "grid connection — voltage, frequency, phase angle, and balance, each "
                        "independently commandable."},
        {"name": "Supply the input",
         "description": "Provide the direct-current source that the equipment under test "
                        "converts."},
        {"name": "Measure the response",
         "description": "Capture terminal voltage and output current with the bandwidth and "
                        "accuracy the procedures require."},
        {"name": "Execute the procedure",
         "description": "Sequence the run, hold each condition for its required dwell, repeat it "
                        "across settings, and retain the record."},
    ])

source_caps = item_list(
    "source-capabilities", "Capabilities the type tests demand of the source",
    "Reading the type-test programme as a specification for the bench rather than for the product "
    "under test yields a clear list of requirements.",
    [
        {"name": "Regenerative, bidirectional power flow",
         "description": "The equipment under test exports. The source must absorb that power "
                        "continuously, not dissipate it, and must maintain the commanded "
                        "condition while doing so."},
        {"name": "Independent per-phase control",
         "description": "Several tests require one phase to be driven while others are held, or "
                        "phases to be driven in pairs. A source that can only move all three "
                        "together cannot execute them."},
        {"name": "Phase-angle stepping",
         "description": "Angle-change ride-through requires genuine, abrupt angle displacement, "
                        "on one phase and on all three, repeatable at arbitrary points on the "
                        "wave."},
        {"name": "Step fidelity",
         "description": "A large number of procedures specify a step, not a ramp, precisely "
                        "because a ramp makes the instant of crossing a matter of interpretation "
                        "— and the measured clearing time with it."},
        {"name": "Low output distortion",
         "description": "Current distortion tests measure the equipment's contribution. A source "
                        "that injects its own distortion contaminates the result."},
        {"name": "Adequate stiffness relative to the device rating",
         "description": "Whether a swell level can be held steady while the equipment under test "
                        "reacts is a property of the source impedance relative to the device "
                        "rating. This must be stated before coverage is claimed."},
        {"name": "Measurement accuracy within the required class",
         "description": "The criteria are accuracy-bounded. A measurement path that cannot "
                        "resolve the criterion cannot evidence it."},
    ])

failures = item_list(
    "campaign-failure-modes", "Why grid code compliance campaigns fail",
    "Across the programme, failures cluster in a small number of places. Every item is "
    "discoverable in-house, before a laboratory campaign begins, on a bench that can execute the "
    "same procedures.",
    [
        {"name": "Ride-through behaviour under combined stress",
         "description": "Equipment that rides through a clean sag often fails a consecutive "
                        "sequence, or fails when the sag is applied to a single phase rather than "
                        "all three."},
        {"name": "Settling and response times",
         "description": "The characteristic is met, but not within the declared response time — "
                        "or the declared response time was optimistic in the datasheet and nobody "
                        "re-checked it."},
        {"name": "Priority conflicts",
         "description": "Functions that behave correctly in isolation resolve in the wrong order "
                        "when enabled together."},
        {"name": "Setting ranges",
         "description": "The equipment meets the trip requirement at its default setting but its "
                        "adjustable range does not span what the standard requires."},
        {"name": "Bench limitations misread as device failures",
         "description": "A source too soft for the device rating cannot hold a swell; a "
                        "measurement path outside the required accuracy class cannot evidence a "
                        "criterion. Both produce results that look like device failures and are "
                        "not."},
        {"name": "Configuration drift",
         "description": "Firmware changes after testing, and the certified configuration no "
                        "longer matches the shipped one."},
    ])

# ------------------------------------------------------------------ assemble
graph = ([organization, website, webpage, breadcrumb, article, faq_page,
          audience_rts, audience_1547, product_chp, product_hil, software_gridsim,
          ieee_org, std_1547, std_1547_1, term_set,
          type_test_list, test_categories, regional, bench_functions, source_caps, failures]
         + topics + images)

doc = {"@context": "https://schema.org", "@graph": graph}

# A lighter variant for pages where the full articleBody is too much weight: it keeps every
# entity and relationship but drops the inlined article text and the per-test Applied /
# Measured / Criterion / Bench note properties.
lite = json.loads(json.dumps(doc, ensure_ascii=False))
for node in lite["@graph"]:
    if node.get("@id") == ARTICLE["@id"]:
        node.pop("articleBody", None)
    if node.get("@id") == PAGE + "#type-test-programme":
        for entry in node["itemListElement"]:
            entry["item"]["additionalProperty"] = [
                p for p in entry["item"]["additionalProperty"] if p["name"] == "Test family"
            ]

OUT = HERE.parent
STEM = "ieee-1547-grid-code-compliance"

full_path = OUT / f"{STEM}.jsonld"
lite_path = OUT / f"{STEM}.lite.jsonld"
html_path = OUT / f"{STEM}.min.html"

full_path.write_text(json.dumps(doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
lite_path.write_text(json.dumps(lite, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

minified = json.dumps(doc, ensure_ascii=False, separators=(",", ":"))
# "</" inside a <script> block would close the element early; the escape is JSON-transparent.
minified = minified.replace("</", "<\\/")
html_path.write_text(
    '<script type="application/ld+json">\n' + minified + "\n</script>\n", encoding="utf-8")

def kb(path):
    return f"{path.stat().st_size / 1024:.1f} KB"

print(f"nodes                 {len(graph)}")
print(f"type-test scenarios   {type_test_list['numberOfItems']}")
print(f"FAQ questions         {len(faq_page['mainEntity'])}")
print(f"articleBody words     {word_count}")
print(f"{full_path.name:<34} {kb(full_path)}")
print(f"{lite_path.name:<34} {kb(lite_path)}")
print(f"{html_path.name:<34} {kb(html_path)}  (paste-ready, minified)")
