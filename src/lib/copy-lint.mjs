/**
 * Quality gate for gift page copy (src/content/giftpages/*.json).
 *
 * Shared by the build (src/pages/gift/[slug].astro) and the import script
 * (scripts/gift-pages.mjs), so a page that would fail the build is rejected
 * before it is ever written.
 *
 * ERRORS block. WARNINGS are printed but ship. The split is deliberate: a dash
 * or a stale price reads as machine written or wrong and must never go live,
 * while a meta description a few characters long is cosmetic.
 */

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+){1,7}$/;

// Em dash, en dash, figure dash, horizontal bar, minus sign used as a dash.
const DASH_RE = /[\u2012\u2013\u2014\u2015]/;
// A hyphen joining two words ("full-time", "well-made"). Numbers with units
// ("3-in-1") are caught too, which is intended for prose.
const HYPHEN_WORD_RE = /[A-Za-z]-[A-Za-z]/;
const PRICE_RE = /\$\s?\d/;
const FIRST_PERSON_RE = /\b(I|I'm|I've|my)\b|we tested|our team tested|in our testing/;
const HYPE = [
  'game changer', 'game-changer', 'must have', 'must-have', 'elevate', 'look no further',
  "whether you're", 'in today', 'delve', 'testament', 'unleash',
];

const words = (s) => s.trim().split(/\s+/).filter(Boolean).length;

/** Every prose string in a page, labelled, for the per-string rules. */
function proseFields(d) {
  const out = [
    ['seoTitle', d.seoTitle],
    ['metaDescription', d.metaDescription],
    ['summary', d.summary],
    ...(d.bestFor ?? []).map((s, i) => [`bestFor[${i}]`, s]),
    ...(d.whyItWorks ?? []).map((s, i) => [`whyItWorks[${i}]`, s]),
    ...(d.goodToKnow ?? []).map((s, i) => [`goodToKnow[${i}]`, s]),
    ...(d.faq ?? []).flatMap((f, i) => [[`faq[${i}].q`, f.q], [`faq[${i}].a`, f.a]]),
  ];
  return out.filter(([, v]) => typeof v === 'string');
}

/**
 * Slogans printed on the product ("I'm Trying My Best", "I'm a Nurse") are
 * quoted in its name and legitimately repeated in the copy. Blank out any run
 * of 3+ words from the name before the first person check, so the check only
 * sees our own voice.
 */
function withoutNamePhrases(text, name) {
  if (!name) return text;
  const w = name.replace(/\([^)]*\)/g, ' ').split(/\s+/).filter(Boolean);
  let out = text;
  for (let len = w.length; len >= 3; len--) {
    for (let i = 0; i + len <= w.length; i++) {
      const phrase = w.slice(i, i + len).join(' ').replace(/[,.]$/, '');
      if (!/\b(I|I'm|my)\b/i.test(phrase)) continue;
      const re = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      out = out.replace(re, ' ');
    }
  }
  return out;
}

/**
 * @param {object} d  gift page data
 * @returns {{errors: string[], warnings: string[]}}
 */
export function lintGiftPage(d) {
  const errors = [];
  const warnings = [];

  if (!/^[A-Z0-9]{10}$/.test(d.asin ?? '')) errors.push('asin must be a 10 character ASIN');
  if (!SLUG_RE.test(d.slug ?? '')) errors.push(`slug "${d.slug}" must be lowercase words joined by hyphens`);
  for (const k of ['name', 'seoTitle', 'metaDescription', 'summary']) {
    if (!d[k] || typeof d[k] !== 'string') errors.push(`${k} is required`);
  }
  if (!Array.isArray(d.whyItWorks) || d.whyItWorks.length < 2) errors.push('whyItWorks needs 2 paragraphs');
  if (!Array.isArray(d.bestFor) || d.bestFor.length < 2) errors.push('bestFor needs at least 2 entries');
  if (!Array.isArray(d.goodToKnow) || d.goodToKnow.length < 2) errors.push('goodToKnow needs at least 2 entries');
  if (!Array.isArray(d.faq) || d.faq.length < 2) errors.push('faq needs at least 2 questions');

  // The name is a product name and may legitimately carry "3-in-1" or "L&D".
  if (d.name && DASH_RE.test(d.name)) errors.push('name contains an em/en dash');

  for (const [k, v] of proseFields(d)) {
    if (DASH_RE.test(v)) errors.push(`${k} contains an em/en dash`);
    if (HYPHEN_WORD_RE.test(v)) errors.push(`${k} joins words with a hyphen: "${v.match(/\S*[A-Za-z]-[A-Za-z]\S*/)?.[0]}"`);
    if (PRICE_RE.test(v)) errors.push(`${k} mentions a price (prices go stale)`);
    // FAQ questions are in the shopper's voice ("Can I split one pack?"), so
    // first person is only checked in our own writing.
    if (!k.endsWith('.q') && FIRST_PERSON_RE.test(withoutNamePhrases(v, d.name))) errors.push(`${k} claims first person use or testing`);
    const lower = v.toLowerCase();
    for (const h of HYPE) if (lower.includes(h)) warnings.push(`${k} uses hype phrase "${h}"`);
  }

  // Thin page guard: the write-up IS the page's unique content.
  const body = [d.summary, ...(d.whyItWorks ?? []), ...(d.goodToKnow ?? []),
    ...(d.faq ?? []).flatMap((f) => [f.q, f.a])].filter(Boolean).join(' ');
  const total = words(body);
  if (total < 180) errors.push(`only ${total} words of original copy (minimum 180, thin page)`);

  const why = words((d.whyItWorks ?? []).join(' '));
  if (why < 110) errors.push(`whyItWorks is ${why} words (minimum 110)`);
  else if (why < 140 || why > 220) warnings.push(`whyItWorks is ${why} words (target 140 to 200)`);

  if (d.seoTitle && (d.seoTitle.length < 20 || d.seoTitle.length > 60)) {
    warnings.push(`seoTitle is ${d.seoTitle.length} chars (target 30 to 50)`);
  }
  if (d.metaDescription && (d.metaDescription.length < 110 || d.metaDescription.length > 165)) {
    warnings.push(`metaDescription is ${d.metaDescription.length} chars (target 130 to 155)`);
  }

  return { errors, warnings };
}
