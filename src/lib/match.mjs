/**
 * Build-time matcher: pick relevant products for a blog post.
 *
 * The 320 existing posts carry NO tags — the field exists in the schema but no
 * post populates it. So matching runs off `title` + `description` + `category`,
 * put through the same tag-rules.json classifier that types the products. That
 * keeps one source of truth and, more importantly, requires editing zero
 * markdown files: monetization becomes a layout concern, not a content migration.
 *
 * Side effect worth knowing: because matching is computed at build time, every
 * product added later automatically appears in every relevant existing post.
 * The monetization surface grows with the catalog on its own.
 */
import { classify, rules } from './classify.mjs';

/** Blog `category` values carry occasion/type intent that titles sometimes omit. */
const CATEGORY_HINTS = {
  'Nurses Week': { occasion: ['nurses-week'] },
  Graduation: { occasion: ['graduation'] },
  Holiday: { occasion: ['christmas'] },
  'Self-Care': { type: ['self-care'] },
  Personalization: {},
  'Buying Guide': {},
  'Gift Guide': {},
};

const WEIGHT = { type: 5, recipient: 4, occasion: 3, token: 1 };

/** Minimum score for a product to count as genuinely relevant. */
const MIN_SCORE = 3;

/**
 * Cap per type, by how focused the post is.
 *
 * A generic gift roundup should not show six near-identical stethoscopes — hence
 * the low default. But a post whose TITLE names a product type ("Best Nursing
 * Clipboards…") is about that type, and depth is the point: capping it at 2 of 11
 * clipboards made the flagship buying guide weaker than a random listicle.
 */
const MAX_PER_TYPE = 2;
const MAX_PER_TYPE_FOCUSED = 6;

/**
 * Price intent read off the post's wording.
 *
 * The scorer weighs type, occasion and recipient — not price. So a "luxury
 * splurge" post had no way to prefer expensive stock and surfaced a $24.95 blood
 * pressure kit. These re-rank equally-scored matches; they never widen the match
 * set, so a budget post cannot invent cheap products that do not exist.
 */
const PRICE_INTENT = [
  { dir: 'desc', re: /\b(luxury|splurge|premium|high[- ]end|expensive|investment|best of the best|top[- ]tier)\b/i },
  { dir: 'asc', re: /\b(budget|cheap|affordable|under \$?\d+|inexpensive|stocking stuffer|small gift)\b/i },
];

function priceIntent(text) {
  for (const p of PRICE_INTENT) if (p.re.test(text)) return p.dir;
  return null;
}

const STOP = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'your', 'you', 'are', 'best', 'top',
  'gift', 'gifts', 'nurse', 'nurses', 'nursing', 'ideas', 'idea', 'will', 'they',
  'their', 'from', 'have', 'more', 'what', 'when', 'how', 'why', 'who', 'love',
  'make', 'made', 'every', 'about', 'them', 'these', 'those', 'just', 'also',
]);

function tokens(text) {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOP.has(w))
  );
}

/**
 * @param {{title:string, description?:string, category?:string}} post
 * @param {Array<any>} products astro collection entries
 * @param {number} limit
 * @returns {Array<any>} highest-scoring products, most relevant first
 */
export function matchProducts(post, products, limit = 6) {
  const text = `${post.title} ${post.description ?? ''}`;
  const facets = classify(text, null);

  const hint = CATEGORY_HINTS[post.category ?? ''] ?? {};
  const wantTypes = new Set([...(facets.type ? [facets.type] : []), ...(hint.type ?? [])]);
  const wantOccasions = new Set([...facets.occasion, ...(hint.occasion ?? [])]);
  const wantRecipients = new Set(facets.recipient);

  const postTokens = tokens(text);

  const scored = products
    .map((p) => {
      let score = 0;
      if (wantTypes.has(p.data.type)) score += WEIGHT.type;
      if (p.data.recipient.some((r) => wantRecipients.has(r))) score += WEIGHT.recipient;
      if (p.data.occasion.some((o) => wantOccasions.has(o))) score += WEIGHT.occasion;

      // Light lexical overlap catches specifics the facets miss ("tumbler",
      // "journal", "candle") without letting generic words dominate.
      const prodTokens = tokens(p.data.title);
      let overlap = 0;
      for (const t of postTokens) if (prodTokens.has(t)) overlap++;
      score += Math.min(overlap, 3) * WEIGHT.token;

      return { product: p, score };
    })
    .filter((s) => s.score >= MIN_SCORE);

  // Tie-break by price when the post signals an intent; otherwise cheapest first.
  const intent = priceIntent(text);
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const d = a.product.data.priceValue - b.product.data.priceValue;
    return intent === 'desc' ? -d : d;
  });

  // A post whose title names a type is ABOUT that type, so allow real depth there
  // and keep the tight cap for everything else.
  const focusedType = facets.type;
  const capFor = (t) => (t === focusedType ? MAX_PER_TYPE_FOCUSED : MAX_PER_TYPE);

  const perType = {};
  const picked = [];
  for (const { product } of scored) {
    const t = product.data.type;
    perType[t] = (perType[t] ?? 0) + 1;
    if (perType[t] > capFor(t)) continue;
    picked.push(product);
    if (picked.length >= limit) break;
  }
  return picked;
}

/**
 * Fallback for posts with no genuine product match.
 *
 * Roughly a third of posts are about the idea of gifting rather than a product
 * category ("What NOT to Gift a Nurse", "Are Gag Gifts Okay?"), and forcing a
 * match on those would surface irrelevant items under a "Shop this guide"
 * heading. Instead they get featured products under an honestly different
 * label, so the page still earns without misrepresenting relevance.
 *
 * Type-diversified so the block isn't six mugs.
 */
export function popularProducts(products, limit = 6, seed = '') {
  const featured = products.filter((p) => p.data.featured);
  const rest = products.filter((p) => !p.data.featured);

  // Rotate the non-featured pool by a hash of the seed (the post slug).
  // Without this every fallback post rendered an IDENTICAL block, which just
  // recreates the boilerplate problem this work exists to remove. Deterministic
  // so builds stay reproducible.
  const offset = rest.length ? hash(seed) % rest.length : 0;
  const rotated = [...rest.slice(offset), ...rest.slice(0, offset)];
  const pool = [...featured, ...rotated];

  const perType = {};
  const picked = [];
  for (const p of pool) {
    perType[p.data.type] = (perType[p.data.type] ?? 0) + 1;
    if (perType[p.data.type] > 1) continue;
    picked.push(p);
    if (picked.length >= limit) break;
  }
  return picked;
}

/** Small deterministic string hash (FNV-1a style). */
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/**
 * Category pages relevant to a post, derived from the types of the products
 * that actually matched it.
 *
 * Replaces the old boilerplate block that linked all 9 categories from every
 * post regardless of subject. Those 10 identical links carried no relevance
 * signal; these do, and they scale automatically as new category pages appear.
 *
 * @param {Array<any>} matched products returned by matchProducts()
 * @param {Array<any>} categories the categories collection
 */
export function relatedCategories(matched, categories, limit = 4) {
  const types = new Set(matched.map((p) => p.data.type));
  const occasions = new Set(matched.flatMap((p) => p.data.occasion));
  const recipients = new Set(matched.flatMap((p) => p.data.recipient));

  const scored = categories
    .map((c) => {
      // Must score all three facets, not just types: /gifts/graduation/ selects
      // an OCCASION and was receiving zero blog links when this only looked at
      // types. Same would apply to any future recipient-based page.
      let score = 0;
      score += (c.data.types ?? []).filter((t) => types.has(t)).length;
      score += (c.data.occasions ?? []).filter((o) => occasions.has(o)).length;
      score += (c.data.recipients ?? []).filter((r) => recipients.has(r)).length;
      return { cat: c, score };
    })
    .filter((s) => s.score > 0)
    // Prefer the specific page over the broad aggregate: /gifts/badge-reels/
    // (1 facet value) should outrank /gifts/accessories/ (7).
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const breadth = (c) =>
        (c.data.types?.length ?? 0) + (c.data.occasions?.length ?? 0) + (c.data.recipients?.length ?? 0);
      return breadth(a.cat) - breadth(b.cat);
    });
  return scored.slice(0, limit).map((s) => s.cat);
}

/**
 * Pick hub pages relevant to a post.
 *
 * Fixes a real structural problem: the commercial landing pages currently
 * receive exactly ONE internal link each, from /gifts/. Linking them from the
 * 320 posts that actually rank is the whole point of this function.
 */
export function matchHubs(post, hubs, limit = 3) {
  const haystack = `${post.slug ?? ''} ${post.title} ${post.description ?? ''}`.toLowerCase();
  const scored = hubs
    .map((h) => ({
      hub: h,
      score: (h.data.matchKeywords ?? []).filter((k) => {
        const kw = k.toLowerCase();
        return haystack.includes(kw) || haystack.includes(kw.replace(/-/g, ' '));
      }).length,
    }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.hub);
}

export { rules };
