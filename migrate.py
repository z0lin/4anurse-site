#!/usr/bin/env python3
"""
migrate.py — Convert wp-export.csv to Astro product markdown files.

Preview mode (default): prints the first converted product and a category report.
Full run: python3 migrate.py --run
"""

import csv
import os
import re
import sys
from datetime import datetime

AFFILIATE_TAG = "4anurse05-20"
OUTPUT_DIR = "src/content/products"
CSV_FILE = "wp-export.csv"

# Maps Amazon top-level + subcategory keywords → our enum values.
# Checked against the keyword order: more specific rules first.
CATEGORY_RULES = [
    (['glassware', 'drinkware', 'tumbler', 'mug', 'cup', 'bottle', 'beverage'], 'drinkware'),
    (['jewelry', 'jewel', 'necklace', 'bracelet', 'earring', 'ring'],           'jewelry'),
    (['clothing', 'apparel', 'socks', 'scrubs', 'shoes and jewelry > women > clothing',
      'shoes and jewelry > women > sports'],                                      'apparel'),
    (['books', 'nursing'],                                                        'books'),
    (['beauty', 'personal care', 'health and household', 'massage', 'bath'],     'self-care'),
    (['stethoscope', 'medical', 'diagnostic', 'instrument', 'surgical',
      'office', 'badge', 'writing', 'notebook', 'laptop', 'electronics',
      'computer', 'accessories > skins'],                                         'accessories'),
    (['home', 'kitchen', 'décor', 'decor', 'candle', 'patio', 'tools'],         'home'),
    (['toy', 'game', 'movies', 'automotive', 'novelty'],                         'humor'),
]


def map_category(woo_category: str) -> str:
    # Top-level category wins for Books — prevents "Books > Jewelry Making" → jewelry
    top = woo_category.split('>')[0].strip().lower()
    if top == 'books':
        return 'books'
    c = woo_category.lower()
    for keywords, enum_val in CATEGORY_RULES:
        if any(k in c for k in keywords):
            return enum_val
    return 'other'


def slugify(text: str) -> str:
    t = text.lower()
    t = re.sub(r'[^\w\s-]', '', t)
    t = re.sub(r'[\s_]+', '-', t)
    t = re.sub(r'-+', '-', t)
    return t.strip('-')[:55]


def unix_to_date(ts_str: str) -> str:
    try:
        return datetime.fromtimestamp(int(ts_str)).strftime('%Y-%m-%d')
    except (ValueError, TypeError):
        return datetime.today().strftime('%Y-%m-%d')


def yaml_str(s: str) -> str:
    """Double-quote a YAML string value, escaping backslashes and internal quotes."""
    s = s.replace('\\', '\\\\').replace('"', '\\"')
    return f'"{s}"'


def convert_row(row: dict):
    """Return (slug, frontmatter_markdown)."""
    name = row['Name'].strip()
    product_url = row['Meta: _amzaff_product_url'].strip().rstrip('/')
    amazon_url = f"{product_url}/?tag={AFFILIATE_TAG}"

    price_raw = row['Regular price'].strip()
    try:
        price_val = float(price_raw)
        price_display = f"${price_val:.2f}"
    except (ValueError, TypeError):
        price_val = None
        price_display = None

    images_raw = row['Images'].strip()
    image = images_raw.split(',')[0].strip() if images_raw else ''

    category = map_category(row['Categories'])
    date_added = unix_to_date(row['Meta: _price_update_date'])
    slug = slugify(name)

    lines = [
        '---',
        f'title: {yaml_str(name)}',
        f'image: {yaml_str(image)}',
        f'amazonUrl: {yaml_str(amazon_url)}',
    ]
    if price_display:
        lines.append(f'price: {yaml_str(price_display)}')
    if price_val is not None:
        lines.append(f'priceValue: {price_val}')
    lines += [
        f'category: {category}',
        'featured: false',
        f'dateAdded: {date_added}',
        '---',
        '',  # empty body — edit in CMS if needed
    ]

    return slug, '\n'.join(lines)


def load_rows():
    with open(CSV_FILE, newline='', encoding='utf-8-sig') as f:
        return list(csv.DictReader(f))


def preview(rows):
    slug, md = convert_row(rows[0])
    print(f"{'='*60}")
    print(f"PREVIEW — would write: {OUTPUT_DIR}/{slug}.md")
    print(f"{'='*60}")
    print(md)
    print(f"{'='*60}")

    # Category mapping report — show what each WooCommerce category maps to
    from collections import Counter
    mapping_counts: dict[str, Counter] = {}
    for row in rows:
        woo = row['Categories'].split('>')[0].strip()
        mapped = map_category(row['Categories'])
        mapping_counts.setdefault(mapped, Counter())[woo] += 1

    print(f"\nCATEGORY MAPPING SUMMARY ({len(rows)} products total)")
    print(f"{'-'*60}")
    for our_cat in ['graduation','apparel','accessories','drinkware','jewelry',
                    'books','home','humor','self-care','other']:
        if our_cat in mapping_counts:
            total = sum(mapping_counts[our_cat].values())
            top = mapping_counts[our_cat].most_common(3)
            top_str = ', '.join(f"{v}× {k}" for k, v in top)
            print(f"  {our_cat:12s} {total:3d}  ← {top_str}")

    print(f"\nRun with --run to write all {len(rows)} files to {OUTPUT_DIR}/")


def run(rows):
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    seen_slugs: dict[str, int] = {}
    written = 0
    skipped = 0

    for row in rows:
        slug, md = convert_row(row)

        # Deduplicate slugs
        if slug in seen_slugs:
            seen_slugs[slug] += 1
            slug = f"{slug}-{seen_slugs[slug]}"
        else:
            seen_slugs[slug] = 1

        # Skip rows with no Amazon URL
        if 'amazon.com' not in row.get('Meta: _amzaff_product_url', ''):
            print(f"  SKIP (no Amazon URL): {row['Name'][:60]}")
            skipped += 1
            continue

        path = os.path.join(OUTPUT_DIR, f"{slug}.md")
        with open(path, 'w', encoding='utf-8') as f:
            f.write(md)
        written += 1

    print(f"\nDone. {written} files written to {OUTPUT_DIR}/, {skipped} skipped.")


if __name__ == '__main__':
    rows = load_rows()
    if '--run' in sys.argv:
        run(rows)
    else:
        preview(rows)
