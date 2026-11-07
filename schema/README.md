# Structured data (JSON-LD)

## `motor-emulator.jsonld`

Schema for https://impedyme.com/motor-emulator/ ("Motor Emulator for Inverter Hardware Development").

| Node | What it carries |
| --- | --- |
| `ItemPage` | Page title, description, images, breadcrumb, topics (`about`), customers and concepts (`mentions`), in-content links to the HIL and inverter-test pages (`significantLink`), video page (`relatedLink`) |
| `Product` (Impedyme Motor Emulator) | Full description, the four user groups from "Who Uses Motor Emulation?" (`audience`), 14 key facts as `additionalProperty`, related CHP Motor Emulator and RCP Box products |
| `FAQPage` | All 8 FAQs on the page, word for word |
| `ItemList` | Organizations that have used the motor emulator: NASA, JLG, Duke Energy, Exowatt, Flex, CEA-Liten, Lucid, Unbox Robotics |
| `ImageObject` ×3 | The three page images, with captions and image credit (`@id` = image URL) |
| `Organization`, `WebSite`, `Brand`, `BreadcrumbList` | Site-level entities, using the `#organization` / `#website` IDs that Yoast and Rank Math also use |

### Editing rules

- Every node needs its own `@id`. Two nodes with the same `@id` are read as one thing, so never reuse an ID.
  The page uses its plain URL; everything else uses the URL plus `#name`.
- JSON strings cannot contain line breaks, and the last item in a list or object must not end with a comma.
  Either mistake makes Google skip the whole block.
- There are no `sameAs` links. Customers are identified by name and official website (`url`).
- The award ("2025 ... Powertrain Test Innovation of the Year") is not in the schema yet: ATTI's 2025 shortlist lists
  Impedyme under *Sustainable* Powertrain Test Innovation of the Year, and the win could not be confirmed here.

### Install

Wrap the file contents in `<script type="application/ld+json"> … </script>` and add it to the
motor-emulator page only. If the tool you paste into asks for JSON only, use the file as-is.

### Before publishing

- The customer names must be visible on the page (for example a "Trusted by" logo strip with alt text).
- If the page's FAQ block already outputs FAQ schema, remove the `FAQPage` node to avoid a duplicate.
- Google may report the Product as missing `offers`/`review`/`aggregateRating`; that is expected for
  quote-based hardware. Do not add placeholder prices or ratings.
- Check with https://search.google.com/test/rich-results and https://validator.schema.org/.
