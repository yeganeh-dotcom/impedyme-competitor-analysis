# Structured data (JSON-LD)

## `motor-emulator.jsonld`

Schema for https://impedyme.com/motor-emulator/ ("Motor Emulator for Inverter Hardware Development").

| Node | What it carries |
| --- | --- |
| `ItemPage` | Page title, description, images, breadcrumb, topics (`about`), customers and concepts (`mentions`), in-content links to the HIL and inverter-test pages (`significantLink`), video page (`relatedLink`) |
| `Product` (Impedyme Motor Emulator) | Full description, the four user groups from "Who Uses Motor Emulation?" (`audience`), 14 key facts as `additionalProperty`, related CHP Motor Emulator and RCP Box products |
| `FAQPage` | All 8 FAQs on the page, word for word |
| `ItemList` | Organizations that have used the motor emulator: NASA, JLG, Duke Energy, Exowatt, Flex, Lucid, Unbox Robotics |
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

Use `motor-emulator-schema.php`. It holds the same JSON and prints it in the page `<head>` only on
https://impedyme.com/motor-emulator/. Paste it as a PHP snippet in the Code Snippets or WPCode plugin
(safest: the plugin switches a broken snippet off instead of taking the site down), or at the end of the
child theme's `functions.php`. Do not add an opening `<?php` tag. If an edit breaks the JSON, the snippet
prints only an HTML comment ("Motor emulator schema skipped") instead of invalid markup.

When you change the schema, change the JSON inside the PHP file (and `motor-emulator.jsonld`, so the two match).

### Before publishing

- The customer names must be visible on the page (for example a "Trusted by" logo strip with alt text).
- If the page's FAQ block already outputs FAQ schema, remove the `FAQPage` node to avoid a duplicate.
- Google may report the Product as missing `offers`/`review`/`aggregateRating`; that is expected for
  quote-based hardware. Do not add placeholder prices or ratings.
- Check with https://search.google.com/test/rich-results and https://validator.schema.org/.
