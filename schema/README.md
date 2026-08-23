# Page schema — Testing to IEEE 1547 with the CHP Series

Complete schema.org JSON-LD for the grid code compliance guide: the full article text, the
nine FAQs, the images, the CHP Series and HIL/Power-HIL platform entities, and all 28
IEEE 1547.1 type-test scenarios as individually addressable structured items.

Target page: `https://impedyme.com/resource-center/ieee-1547-grid-code-compliance-testing/`

## Files

| File | What it is |
| --- | --- |
| `ieee-1547-grid-code-compliance.jsonld` | The full graph. Source of truth — edit this one. 171 KB |
| `ieee-1547-grid-code-compliance.min.html` | Paste-ready `<script type="application/ld+json">` block, minified from the above. 140 KB |
| `ieee-1547-grid-code-compliance.lite.jsonld` | Same graph without the inlined `articleBody` and without the per-test Applied/Measured/Criterion/Bench note fields. 93 KB |
| `validate_schema.py` | Validator, and the emitter for the paste-ready block |
| `source/article-body.txt` | The article prose the builder reads |
| `source/build_schema.py` | Regenerates all three outputs from the prose |

## Installing it

Paste the contents of `ieee-1547-grid-code-compliance.min.html` into the `<head>` of the page
(the `<body>` is also valid; `<head>` is conventional). One `<script>` block, nothing else
required.

If the site already emits schema from an SEO plugin, **turn that plugin's output off for this
page** rather than shipping both. Two competing `WebPage`/`Article` graphs on one URL is the
most common way a correct schema stops working.

Two anchors in the page HTML back references in the graph, so add them if they are not already
there:

- `id="faq"` on the Frequently Asked Questions heading
- `id="faq-1"` … `id="faq-9"` on the individual questions

Optionally `id="test-1"` … `id="test-28"` on the 28 scenario headings. The graph gives every
scenario a distinct URL fragment, which is what lets an answer engine cite one test rather than
the whole page.

## Replace before publishing

Everything below is a convention or a best guess, not a confirmed fact. `validate_schema.py`
flags each one on every run.

| Value | Currently | Action |
| --- | --- | --- |
| Page URL | `/resource-center/ieee-1547-grid-code-compliance-testing/` | Set to the real slug once published. Appears as `@id` and `url` throughout — find/replace |
| `datePublished` / `dateModified` | `2026-08-23T09:00:00-04:00` | Real publication timestamp. Update `dateModified` on every substantive edit — it is the field that matters most for a guide like this |
| Image URLs | `/wp-content/uploads/2026/08/<slug>.jpg` | Real uploaded file URLs. Six images are declared; see below |
| `Organization.sameAs` | `[]` | Add LinkedIn, YouTube, X, Crunchbase. This is the strongest entity-disambiguation signal in the file and it is currently empty |
| `WebSite.potentialAction` | `?s={search_term_string}` | Confirm the site's real search URL, or delete the `potentialAction` block |
| CHP Series `additionalProperty` | 110 kVA/kW single cabinet, 550 kVA/kW paralleled, 90 ns FPGA timestep, 100% regenerative | Taken from public product pages, not from the datasheet. Confirm against current specs |
| `SoftwareApplication` name | `GridSim Studio`, with `alternateName` "Grid Emulator test application" | The article calls it "the companion Grid Emulator application". Confirm which name should be the canonical one and which the alias |
| `Organization` address / contact | omitted | Add `address` and `contactPoint` if you want them — they were left out rather than guessed |

### The six declared images

Three crops of one hero image plus three supporting figures. Google asks for multiple aspect
ratios of the primary image, which is why the hero appears three times.

| Node | Ratio | Declared size | Subject |
| --- | --- | --- | --- |
| `…-16x9` | 16:9 | 1920×1080 | CHP Series configured for a type-test campaign (primary) |
| `…-4x3` | 4:3 | 1440×1080 | same image, second crop |
| `…-1x1` | 1:1 | 1080×1080 | same image, third crop |
| `…-type-test-catalogue-…` | 16:9 | 1600×900 | Grid Emulator application showing the test tiles |
| `…-type-test-families-diagram` | 16:9 | 1600×900 | the 28 scenarios grouped into five families |
| `chp-series-…-four-functions` | 16:9 | 1600×900 | block diagram of the four bench functions |

Every node carries a `caption` and a `description` written to serve as alt text. If you ship
fewer images, delete the unused nodes and their `@id` references from `TechArticle.image` — a
declared image that 404s is worse than one that was never declared.

## Where the two positioning statements live

Both appear verbatim three times each, on the highest-authority nodes in the graph, so an
extractor reaches them regardless of which entity it resolves.

**"Impedyme real-time simulation platforms are deployed by power electronics R&D, validation,
and test-lab teams across EV powertrain, grid integration, and inverter development
worldwide."**

- `Organization.description`
- `WebSite.description`
- `Audience` node `#audience-rts`, referenced by the Organization, the article, the web page,
  the CHP Series and the HIL platforms

**"Impedyme HIL and Power HIL platforms are used by inverter manufacturers, DER developers,
utilities, and independent test laboratories for IEEE 1547 compliance testing and grid
interconnection validation."**

- `Organization.disambiguatingDescription`
- `Product` node `#product-hil-platforms` → `description`
- `Audience` node `#audience-ieee1547`, referenced by the Organization, the article, the web
  page, the FAQ block and both products

The validator fails the build if either sentence stops appearing verbatim, so an accidental
rewording during editing gets caught rather than shipped.

## What is in the graph

36 top-level nodes:

- **`Organization`** — Impedyme, with logo, `knowsAbout`, `areaServed`, both audiences, and
  offers pointing at the three product entities
- **`WebSite`** — with `SearchAction`
- **`WebPage`** — `mainEntity` → the article, `hasPart` → the FAQ block, breadcrumb, primary
  image, `speakable`, related product links
- **`BreadcrumbList`** — Home → Resource Center → this guide
- **`TechArticle`** — full `articleBody` (6,970 words), `abstract`, `wordCount`,
  `timeRequired` (PT31M), `proficiencyLevel`, `dependencies`, `teaches`, 29 keywords, six
  images, citations to both standards, and `about`/`mentions` wiring to every topic, product
  and list node
- **`FAQPage`** — 9 `Question` nodes, each with an `acceptedAnswer` and its own URL fragment
- **`Audience`** ×2 — the two statements above
- **`Product`** ×2 — CHP Series (with six spec properties) and the HIL/Power-HIL platform family
- **`SoftwareApplication`** — GridSim Studio, with `featureList`
- **`Organization`** — IEEE, as the publisher of both standards
- **`CreativeWork`** ×2 — IEEE Std 1547 (the requirement) and IEEE Std 1547.1 (the procedure),
  related by `isBasedOn`
- **`DefinedTermSet`** — the type-test catalogue
- **`ItemList`** ×6 — the 28 type tests (each a `DefinedTerm` carrying its clause as `termCode`
  plus Applied / Measured / Criterion / Bench note as `PropertyValue`s), the 4 test categories,
  the 5 regional frameworks, the 4 bench functions, the 7 source capabilities, the 6 campaign
  failure modes
- **`Thing`** ×9 — topic entities (grid code compliance, DER, Power-HIL, HIL, ride-through,
  unintentional islanding, grid-connected inverter, power quality, regenerative grid emulator),
  several grounded to Wikipedia via `sameAs`
- **`ImageObject`** ×6

The six `ItemList`s are the part that earns its keep with AI answer engines: they turn prose
that a model has to parse into 54 discrete, individually described, individually addressable
claims.

## Expected validator output elsewhere

Run it through the [Rich Results Test](https://search.google.com/test/rich-results) and the
[Schema Markup Validator](https://validator.schema.org/) after the URL and images are real.
Two families of message are expected and are not defects:

- **`Product` missing field `offers`** — the CHP Series has no public price, and inventing an
  `Offer` to silence a warning would put a false claim in structured data. This page is not a
  product page and is not trying to win a product rich result. Same for `SoftwareApplication`
  and `aggregateRating`.
- **No FAQ rich result** — since 2023 Google has limited FAQ rich results to well-known
  authoritative government and health sites. The `FAQPage` markup is still parsed, still valid,
  and still worth shipping: it is read by AI answer engines and non-Google consumers, and it is
  the cleanest machine-readable form of the nine answers.

## Page weight

The full file adds ~140 KB to the page because it inlines the entire 6,970-word article. That
is a deliberate trade: it makes the complete text available to any consumer that reads
structured data without rendering the page.

If that weight is unacceptable, ship the lite variant instead — it keeps every entity,
relationship and FAQ but drops the inlined text and the per-test detail fields:

```bash
python3 schema/validate_schema.py \
  schema/ieee-1547-grid-code-compliance.lite.jsonld \
  --emit-html schema/ieee-1547-grid-code-compliance.lite.min.html
```

The visible page text is unchanged either way, so nothing is lost to a crawler that renders.

## Regenerating and validating

The article prose lives in `source/article-body.txt`. The builder parses the 28 scenario
headings and their Applied / Measured / Criterion / Bench note paragraphs straight out of it,
so the structured data cannot drift from the prose — edit the text, rebuild, and the graph
follows.

```bash
python3 schema/source/build_schema.py                                  # rebuild all outputs
python3 schema/validate_schema.py schema/ieee-1547-grid-code-compliance.jsonld
```

The builder asserts that exactly 28 scenarios numbered 1–28 parse, in 5 families, each with all
five fields present. The validator checks that every internal `@id` reference resolves, that
the fields Google requires for Article / FAQPage / BreadcrumbList / ImageObject are present,
that `ItemList` counts and positions are consistent, and that both positioning statements
survive verbatim. Neither needs any dependency beyond the standard library.
