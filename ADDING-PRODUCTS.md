# Adding products

Three ways in, depending on whether PA-API access exists yet. All three feed the
same queue and go through the same classification, dedup, quality gate and file
writing — only how the raw fields arrive differs.

---

## Start here: what should I add?

```bash
node scripts/gap-report.mjs
```

This reads the site's own build guards and tells you what is actually blocking
pages, rather than guessing. It reports:

- **the price distribution** — currently 71% of the catalog is under $25, which
  is why price-band pages collapse into their parents. Higher-priced stock is the
  single highest-value thing to add.
- **facets below the page guard**, with the exact count each needs
- **facets with zero products** — pages that cannot exist at all
- **intersections within 1–3 products of viable**, pre-filtered to exclude any
  that would just duplicate a parent page

Work from that list. Adding two ICU-tagged products, for example, is enough to
unblock `/gifts/for/icu/`.

---

## Method 1 — CSV bulk import (works today, no API needed)

Best for adding a batch. Copy `scripts/product-import-template.csv`, fill it in
from a spreadsheet, then:

```bash
node scripts/ingest.mjs --import my-products.csv
node scripts/ingest.mjs --review
node scripts/ingest.mjs --commit --approve-all
npm run build          # confirm the guards pass
```

**Required columns:** `url_or_asin`, `title`, `price`, `image`
**Optional:** `brand`, `type`, `occasion`, `recipient`

Notes that save time:

- `url_or_asin` takes a **full Amazon URL** — paste straight from SiteStripe or
  the address bar. Query strings and `/Some-Name/dp/ASIN/ref=...` forms are fine.
- Leave `type`/`occasion`/`recipient` **blank** and the classifier assigns them
  from the title using the same rules the site uses. Fill them in only to
  override, and your value wins.
- Multiple facet values are semicolon-separated: `graduation;nurses-week`
- Price can be `24.99` or `$24.99`.

Where to get `image`: right-click the main product image on Amazon and copy the
image address (an `m.media-amazon.com` URL).

---

## Method 2 — PA-API (once approved: fastest, and the only complete option)

```bash
export PAAPI_ACCESS_KEY=...      # or set as GitHub Actions secrets
export PAAPI_SECRET_KEY=...

node scripts/ingest.mjs --stage B01ABCDEFG B02HIJKLMN
node scripts/ingest.mjs --stage --search "luxury nurse gift" --limit 10
node scripts/ingest.mjs --review
node scripts/ingest.mjs --commit --approve-all
```

This fills in title, brand, price, image, availability and browse nodes
automatically — no spreadsheet. `--search` also **discovers** candidate ASINs, so
you can work straight from the gap report's suggested terms.

It additionally unlocks two things nothing else can:

1. **The daily refresh** (`.github/workflows/refresh-catalog.yml`), which keeps
   displayed prices current and picks up rotated image URLs. Displayed prices go
   stale silently on a static site, and PA-API terms require them to be accurate.
2. **Fixing the 190 legacy images.** They came from the old WooCommerce export,
   not from PA-API, which is a ToS exposure and means they will break as Amazon
   rotates URLs. Only re-fetching through PA-API resolves it — and note the fix is
   to store the returned CDN URL and hotlink it, **not** to download images
   locally, which the terms restrict.

**Getting access:** affiliate-program.amazon.com → Tools → Product Advertising
API. Requires an approved Associates account with 3 qualifying sales in 180 days.

---

## Method 3 — Decap CMS (one-off edits)

`/admin/` gives a web form per product. Fine for fixing a title or flipping
`featured`; slow for bulk work, and it does not run the quality gate.

**Currently only works at the Netlify URL**, not 4anurse.com — the live nginx host
has no Netlify Identity endpoints, so the login on the production domain cannot
succeed. See the outstanding Phase 1 item in `rebuild-plan.md`.

---

## What the quality gate rejects

Nothing reaching a content file skips these. A product with no price silently
vanishes from every price facet; one with no image renders an empty card.

| Rejected when | Why |
|---|---|
| ASIN is not 10 chars | it is the primary key |
| title under 8 chars | unusable as a card heading |
| no image URL | renders an empty card |
| no usable price | disappears from every price-band page |
| price over $2000 | almost always a parsing error |
| type unclassifiable | cannot be routed to any page |
| out of stock | dead link for the reader |
| ASIN already in catalog | the duplicate class that ASIN keys exist to stop |

Blocked rows stay in the queue with their reasons so you can fix and re-run
rather than losing the work.

---

## After committing

```bash
npm run build
```

Always. The build enforces guards that ingestion does not: the content schema,
the thin-page threshold, and the parent-overlap rule. A product whose facets drop
a page below its minimum fails the build here rather than shipping a near-empty
grid.

Then commit the new markdown and push — the existing deploy workflow ships it.

## Do not scrape Amazon

It violates the Associates operating agreement and risks the account the whole
site depends on. The manual CSV path exists precisely so there is a legitimate
way to bulk-add before PA-API approval.
