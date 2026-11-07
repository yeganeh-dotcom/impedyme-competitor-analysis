# Structured data (JSON-LD)

## `motor-emulator.jsonld`

Schema for https://impedyme.com/motor-emulator/ ("Motor Emulator for Inverter Hardware Development").

| Node | What it carries |
| --- | --- |
| `ItemPage` | Page title, description, images, breadcrumb, topics (`about`), customers and concepts (`mentions`) |
| `Product` (Impedyme Motor Emulator) | Description, the page's key features as `additionalProperty`, related CHP Motor Emulator and RCP Box products |
| `FAQPage` | The page's FAQ (low- and high-power testing) |
| `ItemList` | Organizations that have used the motor emulator: NASA, JLG, Duke Energy, Exowatt, Flex, CEA-Liten, Lucid, Unbox Robotics |
| `ImageObject` ×3 | The three page images, with captions and image credit |
| `Organization`, `WebSite`, `Brand`, `BreadcrumbList` | Site-level entities, using the `#organization` / `#website` IDs that Yoast and Rank Math also use |

### Install

Wrap the file contents in `<script type="application/ld+json"> … </script>` and add it to the
motor-emulator page only. If the tool you paste into asks for JSON only, use the file as-is.

### Before publishing

- The customer names must be visible on the page (for example a "Trusted by" logo strip with alt text).
- If the page's FAQ block already outputs FAQ schema, remove the `FAQPage` node to avoid a duplicate.
- Google may report the Product as missing `offers`/`review`/`aggregateRating`; that is expected for
  quote-based hardware. Do not add placeholder prices or ratings.
- Check with https://search.google.com/test/rich-results and https://validator.schema.org/.
