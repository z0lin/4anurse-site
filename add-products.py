#!/usr/bin/env python3
"""
add-products.py — Fetch Amazon products by ASIN and write Astro product files.

SUPERSEDED by scripts/ingest.mjs. This script writes the OLD schema — no `asin`
field, and the retired 10-value category enum — so files it produces now FAIL
content validation at build time. Its SigV4 implementation was the reference for
scripts/lib/paapi.mjs; kept for that provenance. Use:

    node scripts/ingest.mjs --stage <ASIN...>
    node scripts/ingest.mjs --review
    node scripts/ingest.mjs --commit --approve-all

Usage:
    python3 add-products.py B01ABCDEF B02GHIJKL ...
    python3 add-products.py --file asins.txt
    python3 add-products.py --dry-run B01ABCDEF

Credentials (set once in your shell or a .env file):
    export PAAPI_ACCESS_KEY="your-access-key"
    export PAAPI_SECRET_KEY="your-secret-key"
    export PAAPI_TAG="4anurse05-20"        # already set as default

Get PA API credentials at:
    https://affiliate-program.amazon.com/ → Tools → Product Advertising API
"""

import argparse
import hashlib
import hmac
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

try:
    import requests
except ImportError:
    sys.exit("Missing dependency — run: pip install requests")

# ── Config ────────────────────────────────────────────────────────────────────

AFFILIATE_TAG = os.getenv("PAAPI_TAG", "4anurse05-20")
ACCESS_KEY    = os.getenv("PAAPI_ACCESS_KEY", "")
SECRET_KEY    = os.getenv("PAAPI_SECRET_KEY", "")

OUTPUT_DIR   = Path("src/content/products")
HOST         = "webservices.amazon.com"
ENDPOINT     = "/paapi5/getitems"
REGION       = "us-east-1"
SERVICE      = "ProductAdvertisingAPI"
TARGET       = "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems"
CONTENT_TYPE = "application/json; charset=utf-8"

RESOURCES = [
    "Images.Primary.Large",
    "ItemInfo.Title",
    "Offers.Listings.Price",
    "BrowseNodeInfo.BrowseNodes",
]

# Same rules as migrate.py — more specific first
CATEGORY_RULES = [
    (["tumbler", "mug", "cup", "bottle", "drinkware", "glassware", "beverage"], "drinkware"),
    (["necklace", "bracelet", "earring", "jewelry", "jewel", "ring", "pendant"], "jewelry"),
    (["scrubs", "socks", "clothing", "apparel", "shoes", "compression"],         "apparel"),
    (["beauty", "personal care", "massage", "bath", "spa", "skin"],              "self-care"),
    (["stethoscope", "badge", "penlight", "clipboard", "medical supply",
      "diagnostic", "instrument", "backpack"],                                   "accessories"),
    (["home", "kitchen", "candle", "decor", "figurine", "sign", "pillow"],      "home"),
    (["game", "toy", "movie", "novelty", "sticker"],                             "humor"),
]


# ── SigV4 signing ─────────────────────────────────────────────────────────────

def _hmac_bytes(key: bytes, msg: str) -> bytes:
    return hmac.new(key, msg.encode("utf-8"), hashlib.sha256).digest()


def _signing_key(date_stamp: str) -> bytes:
    k = _hmac_bytes(("AWS4" + SECRET_KEY).encode("utf-8"), date_stamp)
    k = _hmac_bytes(k, REGION)
    k = _hmac_bytes(k, SERVICE)
    return _hmac_bytes(k, "aws4_request")


def _signed_headers(body: str) -> dict:
    now        = datetime.now(timezone.utc)
    amz_date   = now.strftime("%Y%m%dT%H%M%SZ")
    date_stamp = now.strftime("%Y%m%d")

    canon_headers = (
        f"content-type:{CONTENT_TYPE}\n"
        f"host:{HOST}\n"
        f"x-amz-date:{amz_date}\n"
        f"x-amz-target:{TARGET}\n"
    )
    signed_hdrs = "content-type;host;x-amz-date;x-amz-target"

    canon_request = "\n".join([
        "POST",
        ENDPOINT,
        "",  # no query string
        canon_headers,
        signed_hdrs,
        hashlib.sha256(body.encode("utf-8")).hexdigest(),
    ])

    credential_scope = f"{date_stamp}/{REGION}/{SERVICE}/aws4_request"
    string_to_sign = "\n".join([
        "AWS4-HMAC-SHA256",
        amz_date,
        credential_scope,
        hashlib.sha256(canon_request.encode("utf-8")).hexdigest(),
    ])

    signature = hmac.new(
        _signing_key(date_stamp),
        string_to_sign.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    return {
        "content-type": CONTENT_TYPE,
        "host": HOST,
        "x-amz-date": amz_date,
        "x-amz-target": TARGET,
        "Authorization": (
            f"AWS4-HMAC-SHA256 Credential={ACCESS_KEY}/{credential_scope}, "
            f"SignedHeaders={signed_hdrs}, Signature={signature}"
        ),
    }


# ── API call ──────────────────────────────────────────────────────────────────

def fetch_items(asins: list) -> list:
    payload = json.dumps({
        "ItemIds": asins,
        "Resources": RESOURCES,
        "PartnerTag": AFFILIATE_TAG,
        "PartnerType": "Associates",
        "Marketplace": "www.amazon.com",
    }, separators=(",", ":"))

    headers = _signed_headers(payload)
    url     = f"https://{HOST}{ENDPOINT}"

    try:
        resp = requests.post(url, headers=headers, data=payload, timeout=15)
    except requests.RequestException as e:
        print(f"  Network error: {e}", file=sys.stderr)
        return []

    if resp.status_code != 200:
        print(f"  API error {resp.status_code}: {resp.text[:400]}", file=sys.stderr)
        return []

    data = resp.json()
    for err in data.get("Errors", []):
        print(f"  ASIN error: {err.get('Code')} — {err.get('Message')}", file=sys.stderr)

    return data.get("ItemsResult", {}).get("Items", [])


# ── Helpers ───────────────────────────────────────────────────────────────────

def slugify(text: str) -> str:
    t = re.sub(r"[^\w\s-]", "", text.lower())
    t = re.sub(r"[\s_]+", "-", t)
    return re.sub(r"-+", "-", t).strip("-")[:80]


def guess_category(browse_nodes: list) -> str:
    # "Books" top-level wins — prevents "Books > Jewelry Making" → jewelry
    if browse_nodes and browse_nodes[0].get("DisplayName", "").lower() == "books":
        return "books"
    combined = " ".join(n.get("DisplayName", "") for n in browse_nodes).lower()
    for keywords, cat in CATEGORY_RULES:
        if any(k in combined for k in keywords):
            return cat
    return "other"


def item_to_markdown(item: dict) -> tuple:
    """Return (slug, markdown_text) for one PA API item."""
    asin  = item["ASIN"]
    title = item["ItemInfo"]["Title"]["DisplayValue"]
    image = (
        item.get("Images", {})
            .get("Primary", {})
            .get("Large", {})
            .get("URL", "")
    )

    listings      = item.get("Offers", {}).get("Listings", [])
    price_display = listings[0]["Price"]["DisplayAmount"] if listings else ""
    price_value   = listings[0]["Price"]["Amount"]        if listings else ""

    browse_nodes = item.get("BrowseNodeInfo", {}).get("BrowseNodes", [])
    category     = guess_category(browse_nodes)
    amazon_url   = f"https://www.amazon.com/dp/{asin}/?tag={AFFILIATE_TAG}"
    date_added   = datetime.now().strftime("%Y-%m-%d")

    price_line  = f'price: "{price_display}"'   if price_display else "# price:"
    pvalue_line = f"priceValue: {price_value}"   if price_value   else "# priceValue:"

    md = f"""---
title: "{title.replace('"', "'")}"
image: "{image}"
amazonUrl: "{amazon_url}"
{price_line}
{pvalue_line}
category: {category}
featured: false
dateAdded: {date_added}
---
"""
    return slugify(title), md


# ── Main ──────────────────────────────────────────────────────────────────────

def run(asins: list, dry_run: bool):
    if not ACCESS_KEY or not SECRET_KEY:
        sys.exit(
            "\nMissing credentials. Set these environment variables:\n"
            "  export PAAPI_ACCESS_KEY='your-key'\n"
            "  export PAAPI_SECRET_KEY='your-secret'\n\n"
            "Get them at: https://affiliate-program.amazon.com/ → Tools → Product Advertising API\n"
        )

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    created = skipped = errors = 0

    # PA API max 10 ASINs per request
    for i in range(0, len(asins), 10):
        batch = asins[i : i + 10]
        print(f"\nFetching {len(batch)} item(s): {', '.join(batch)}")
        items = fetch_items(batch)

        found_asins = {item["ASIN"] for item in items}
        for asin in batch:
            if asin not in found_asins:
                print(f"  NOT FOUND  {asin}")
                errors += 1

        for item in items:
            slug, md = item_to_markdown(item)
            out = OUTPUT_DIR / f"{slug}.md"

            if out.exists():
                print(f"  SKIP       {out.name}  (already exists)")
                skipped += 1
                continue

            if dry_run:
                print(f"  DRY RUN    {out.name}")
                print(md)
            else:
                out.write_text(md, encoding="utf-8")
                asin = item["ASIN"]
                cat  = item_to_markdown(item)[1].split("category: ")[1].split("\n")[0]
                print(f"  CREATED    {out.name}  [{cat}]")
                created += 1

    print(f"\nDone — {created} created, {skipped} skipped, {errors} not found.")
    if created and not dry_run:
        print("Commit and push to deploy:\n  git add src/content/products/ && git commit -m 'Add products' && git push")


def main():
    parser = argparse.ArgumentParser(
        description="Fetch Amazon products by ASIN and write Astro markdown files.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("asins", nargs="*", metavar="ASIN", help="One or more Amazon ASINs")
    parser.add_argument("--file", metavar="FILE", help="Text file with one ASIN per line (# lines ignored)")
    parser.add_argument("--dry-run", action="store_true", help="Preview output without writing files")
    args = parser.parse_args()

    asins = list(args.asins)
    if args.file:
        lines = Path(args.file).read_text().splitlines()
        asins += [l.strip() for l in lines if l.strip() and not l.startswith("#")]

    if not asins:
        parser.print_help()
        sys.exit(1)

    # Deduplicate, preserve order
    seen = set()
    asins = [a for a in asins if not (a in seen or seen.add(a))]

    run(asins, dry_run=args.dry_run)


if __name__ == "__main__":
    main()
