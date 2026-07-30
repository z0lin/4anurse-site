# Blog backlog

The blog stopped 2026-04-16 after 320 posts and the old Airtable topic queue is
exhausted (315/315 marked done). This is the replacement, built from two measured
inputs rather than brainstorming:

1. **Coverage gaps** — which themes the existing 320 titles barely touch
2. **Product depth** — how many catalogued products a topic can actually link

A topic needs both. A gap with no products produces a post that earns nothing; a
well-stocked topic already covered 25 times cannibalises itself.

Re-run the analysis any time:

```bash
node scripts/gap-report.mjs                      # product-side gaps
node scripts/new-post.mjs "Draft Title" --preview  # what a title would pull
```

---

## Write these next

Ranked by gap × product depth. Counts as of 2026-07-30.

| # | Topic | Existing posts | Products | Why |
|---|---|---|---|---|
| 1 | ~~Nursing clipboards~~ | ~~0~~ | 11 | **DONE** 2026-07-30 |
| 2 | ~~Luxury / splurge gifts~~ | ~~3~~ | 18 | **DONE** 2026-07-30 |
| 3 | Gifts for nurse practitioners | 0 | 8 | Zero coverage, good stock, high-earning audience |
| 4 | Mother's Day gifts for nurse moms | 0 | 7 | Zero coverage; seasonal spike every May |
| 5 | Gifts for ER / trauma nurses | 2 | 6 | Thin coverage, distinct buying intent |
| 6 | Gifts for LPNs | 0 | 5 | Zero coverage; LPNs are usually lumped in with RNs |
| 7 | NICU nurse gifts | 0 | 4 | Zero coverage; very specific, low competition |
| 8 | Nurse retirement gifts | 3 | 4 | Thin; high emotional intent, higher budgets |
| 9 | Stethoscope buying guide, deepened | — | 24 | Biggest product pool on the site; supports the highest-AOV pages |
| 10 | Nursing study guides and NCLEX prep | 0 | 3 | New `study-guides` type needs 1 more product to earn its own page |

## Blocked on stock, not on writing

Do not write these yet — the post would have nothing to link:

| Topic | Products | Needs |
|---|---|---|
| Gifts for ICU nurses | 2 | 2 more ICU-tagged |
| Gifts for CNAs | 3 | 1 more |
| Gifts for nurse managers / leaders | 2 | 2 more |
| School nurse gifts | 1 | 3 more |
| Gifts for male nurses | **0** | anything at all |

`/gifts-for-icu-nurses/` is already a live commercial page backed by 2 relevant
products. Sourcing for it beats writing about it.

## Avoid — already saturated

Self-care/spa (25 posts), Christmas/holiday (19), books (13), DIY (13),
tumblers/mugs (12), Nurses Week (11), graduation (9), bags (9), food (9).

Another post here competes with your own ranking pages. If you want to invest in
these, **update the strongest existing post** instead — refreshing `updatedDate`
and deepening the content beats a near-duplicate.

---

## How to write one

```bash
# 1. Check what the title will pull BEFORE writing
node scripts/new-post.mjs "Gifts for Nurse Practitioners That Respect the Role" \
  --category "Gift Guide" --preview

# 2. Scaffold it
node scripts/new-post.mjs "..." --category "Gift Guide"

# 3. Write, set draft: false, then
npm run build
```

### The title is a monetisation decision

The matcher reads **title + description + category only**. It never reads the body.

- Name the product type ("clipboard", "stethoscope", "tumbler") or a specialty
  ("NICU", "ER") and the post binds relevant products.
- Omit both and it silently falls back to a generic "Popular nurse gifts" block.
- A title naming one type raises that type's cap from 2 to 6 products, so focused
  titles get real depth.
- Words like *luxury*, *splurge*, *premium* sort matches high-to-low on price;
  *budget*, *cheap*, *under $25* sort low-to-high.

`--preview` shows all of this before you write a word. Use it.

### Categories

Fixed enum — a typo fails the build:
`Gift Guide` · `Buying Guide` · `Self-Care` · `Graduation` · `Nurses Week` ·
`Holiday` · `Personalization` · `Story`

### Do not paste Amazon links into the body

The product block is injected automatically, with correct affiliate tags,
`rel="nofollow sponsored noopener"`, image dimensions, and `ItemList` schema. A
hand-pasted link gets none of that and can miss the tag entirely.

### Refreshing beats republishing

For saturated themes, set `updatedDate` on the best existing post and expand it.
Product blocks re-generate on every build, so an old post automatically picks up
newly added stock — which means refreshed posts improve without touching content.
