#!/usr/bin/env python3
"""Validate the IEEE 1547 page schema and emit a paste-ready <script> block.

    python3 schema/validate_schema.py schema/ieee-1547-grid-code-compliance.jsonld
    python3 schema/validate_schema.py <file.jsonld> --emit-html <out.html>

Checks structural integrity (every internal @id reference resolves), the fields Google
requires for Article / FAQPage / BreadcrumbList / ImageObject rich results, and that the
two positioning statements are present verbatim. Exits non-zero on any error.
"""
import argparse, json, pathlib, re, sys

REQUIRED_STATEMENTS = [
    ("Real-time simulation platforms / audience",
     "Impedyme real-time simulation platforms are deployed by power electronics R&D, "
     "validation, and test-lab teams across EV powertrain, grid integration, and inverter "
     "development worldwide."),
    ("HIL and Power HIL platforms / IEEE 1547 audience",
     "Impedyme HIL and Power HIL platforms are used by inverter manufacturers, DER developers, "
     "utilities, and independent test laboratories for IEEE 1547 compliance testing and grid "
     "interconnection validation."),
]

# Values that are conventions or best guesses rather than confirmed facts. Swap them before
# the schema goes live; see schema/README.md.
PLACEHOLDER_PATTERNS = [
    (r"/wp-content/uploads/2026/08/", "image URLs use an assumed WordPress upload path"),
    (r'"datePublished": "2026-08-23', "datePublished is the file-creation date"),
    (r'"dateModified": "2026-08-23', "dateModified is the file-creation date"),
    (r'"sameAs": \[\]', "Organization.sameAs is empty (add LinkedIn, YouTube, X, Crunchbase)"),
    (r"\?s=\{search_term_string\}", "WebSite SearchAction assumes the WordPress search path"),
]

errors, warnings, notes = [], [], []


def err(msg):
    errors.append(msg)


def warn(msg):
    warnings.append(msg)


def walk(node, fn, path="$"):
    if isinstance(node, dict):
        fn(node, path)
        for k, v in node.items():
            walk(v, fn, f"{path}.{k}")
    elif isinstance(node, list):
        for i, v in enumerate(node):
            walk(v, fn, f"{path}[{i}]")


def collect(doc):
    """Split every {"@id": ...} dict into definitions (have other keys) and bare references."""
    defined, refs = {}, []

    def visit(node, path):
        if "@id" not in node:
            return
        node_id = node["@id"]
        if len(node) == 1:
            refs.append((node_id, path))
        else:
            defined.setdefault(node_id, []).append(path)

    walk(doc, visit)
    return defined, refs


def check_graph(doc):
    if doc.get("@context") != "https://schema.org":
        err(f'@context should be "https://schema.org", found {doc.get("@context")!r}')
    graph = doc.get("@graph")
    if not isinstance(graph, list) or not graph:
        err("@graph is missing or empty")
        return []
    seen = set()
    for node in graph:
        node_id = node.get("@id")
        if not node_id:
            err(f'top-level node of type {node.get("@type")!r} has no @id')
            continue
        if not node.get("@type"):
            err(f"{node_id} has no @type")
        if node_id in seen:
            err(f"duplicate top-level @id: {node_id}")
        seen.add(node_id)
    return graph


def check_references(doc, raw):
    defined, refs = collect(doc)
    external = ("https://www.ieee.org", "https://en.wikipedia.org", "https://schema.org")
    for ref_id, path in refs:
        if ref_id in defined:
            continue
        if ref_id.startswith(external):
            continue
        err(f"dangling @id reference {ref_id} at {path}")
    for label, sentence in REQUIRED_STATEMENTS:
        count = raw.count(sentence)
        if count == 0:
            err(f"required statement missing verbatim — {label}")
        else:
            notes.append(f"required statement present {count}x — {label}")


def by_type(graph, type_name):
    out = []
    for node in graph:
        t = node.get("@type")
        if t == type_name or (isinstance(t, list) and type_name in t):
            out.append(node)
    return out


def check_article(graph):
    articles = by_type(graph, "TechArticle") + by_type(graph, "Article")
    if not articles:
        err("no Article/TechArticle node found")
        return
    for a in articles:
        for field in ("headline", "image", "datePublished", "author", "publisher",
                      "mainEntityOfPage", "description"):
            if not a.get(field):
                err(f"Article {a['@id']} missing required field {field!r}")
        headline = a.get("headline", "")
        if len(headline) > 110:
            warn(f"Article headline is {len(headline)} chars; Google truncates past ~110")
        if not isinstance(a.get("image"), list) or len(a["image"]) < 1:
            warn("Article.image should be a list; supply 16x9, 4x3 and 1x1 crops")


def check_faq(graph):
    pages = by_type(graph, "FAQPage")
    if not pages:
        err("no FAQPage node found")
        return
    for page in pages:
        questions = page.get("mainEntity") or []
        if not questions:
            err(f"FAQPage {page['@id']} has no mainEntity questions")
        for q in questions:
            if q.get("@type") != "Question":
                err(f"FAQPage entry {q.get('@id')} is not a Question")
            if not q.get("name"):
                err(f"Question {q.get('@id')} has no name")
            answer = q.get("acceptedAnswer") or {}
            if answer.get("@type") != "Answer" or not answer.get("text"):
                err(f"Question {q.get('@id')} has no acceptedAnswer.text")
        notes.append(f"FAQPage carries {len(questions)} questions")


def check_lists(graph):
    for lst in by_type(graph, "ItemList"):
        items = lst.get("itemListElement") or []
        declared = lst.get("numberOfItems")
        if declared is not None and declared != len(items):
            err(f"{lst['@id']} declares numberOfItems={declared} but carries {len(items)}")
        positions = [i.get("position") for i in items]
        if positions != sorted(positions) or len(set(positions)) != len(positions):
            err(f"{lst['@id']} has missing, duplicate or out-of-order positions")
        notes.append(f"ItemList {lst['@id'].rsplit('#', 1)[-1]}: {len(items)} items")
    crumbs = by_type(graph, "BreadcrumbList")
    if not crumbs:
        warn("no BreadcrumbList node found")


def check_images(graph):
    images = by_type(graph, "ImageObject")
    if not images:
        err("no ImageObject nodes found")
    for img in images:
        for field in ("contentUrl", "width", "height"):
            if not img.get(field):
                err(f"ImageObject {img['@id']} missing {field!r}")
        if not img.get("caption") and not img.get("description"):
            warn(f"ImageObject {img['@id']} has neither caption nor description")
    notes.append(f"{len(images)} ImageObject nodes")


def check_publisher_logo(graph):
    for org in by_type(graph, "Organization"):
        logo = org.get("logo")
        if isinstance(logo, dict) and logo.get("@type") == "ImageObject":
            if not logo.get("url") and not logo.get("contentUrl"):
                err(f"Organization {org['@id']} logo has no url")
            return
    warn("no Organization carries an ImageObject logo (Google recommends one for publisher)")


def check_placeholders(raw):
    for pattern, message in PLACEHOLDER_PATTERNS:
        if re.search(pattern, raw):
            warn(f"placeholder to replace before publishing — {message}")


def emit_html(doc, out_path):
    minified = json.dumps(doc, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    out_path.write_text(
        '<script type="application/ld+json">\n' + minified + "\n</script>\n", encoding="utf-8")
    return out_path.stat().st_size


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("path", type=pathlib.Path)
    ap.add_argument("--emit-html", type=pathlib.Path, metavar="OUT",
                    help="write a minified <script type=\"application/ld+json\"> block")
    args = ap.parse_args()

    raw = args.path.read_text(encoding="utf-8")
    try:
        doc = json.loads(raw)
    except json.JSONDecodeError as exc:
        print(f"FAIL  {args.path}: invalid JSON — {exc}")
        return 1

    graph = check_graph(doc)
    if graph:
        check_references(doc, raw)
        check_article(graph)
        check_faq(graph)
        check_lists(graph)
        check_images(graph)
        check_publisher_logo(graph)
    check_placeholders(raw)

    print(f"{args.path}  —  {len(graph)} top-level nodes, {len(raw) / 1024:.1f} KB")
    for note in notes:
        print(f"  ok    {note}")
    for w in warnings:
        print(f"  warn  {w}")
    for e in errors:
        print(f"  FAIL  {e}")

    if args.emit_html:
        size = emit_html(doc, args.emit_html)
        print(f"  ok    wrote {args.emit_html} ({size / 1024:.1f} KB)")

    print("PASS" if not errors else f"FAIL ({len(errors)} error(s))")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
