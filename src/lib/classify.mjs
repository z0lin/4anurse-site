/**
 * Product classifier — applies src/data/tag-rules.json to a product title.
 *
 * Shared by scripts/migrate-taxonomy.mjs and (in future) the ingestion
 * pipeline, so a rule change takes effect everywhere at once.
 */
// Import attribute rather than readFileSync(__dirname). Astro bundles this
// module into dist/pages/, where a __dirname-relative path no longer resolves —
// it worked under plain Node and broke the build. The import form is resolved
// at bundle time by Vite and natively by Node, so both callers work.
import rulesJson from '../data/tag-rules.json' with { type: 'json' };

export const rules = rulesJson;

/**
 * Match a keyword against text.
 *
 * The leading \b prevents substring false positives: plain `includes()` matched
 * "men work" inside "Women Work" and tagged a tote bag as male-nurse.
 *
 * The trailing (?:e?s)? allows plurals, because a bare trailing \b fails on
 * "badge reels" — \b after "reel" needs a non-word char but finds "s". That bug
 * silently dropped 7 products.
 *
 * Both halves are load-bearing. Do not simplify either one.
 */
function matchKeyword(keyword, text) {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}(?:e?s)?\\b`, 'i').test(text);
}

function matchRule(rule, text) {
  if (!rule.any.some((kw) => matchKeyword(kw, text))) return false;
  if (rule.none?.some((kw) => matchKeyword(kw, text))) return false;
  return true;
}

/**
 * Amazon sellers stuff titles with every credential ("Nurse Rn Lpn
 * Practitioner CNA") for search reach. That is a seller SEO artifact, not a
 * specialty signal — it inflated `lpn` to 14 and `np` to 11 before this guard.
 */
function isCredentialStuffed(text) {
  const guard = rules.credentialStuffingGuard;
  if (!guard) return false;
  const hits = guard.tokens.filter((t) => matchKeyword(t, text)).length;
  return hits >= guard.threshold;
}

/**
 * @param {string} title       product title
 * @param {string} [legacyCategory] old category value, used only for fallback
 * @returns {{type: string|null, occasion: string[], recipient: string[],
 *            matchedBy: string, stuffed: boolean}}
 */
export function classify(title, legacyCategory) {
  const text = title.toLowerCase().replace(/[‘’“”]/g, "'").replace(/\s+/g, ' ');

  // type: single-valued, first match wins (rules are ordered specific -> general)
  let type = null;
  let matchedBy = 'none';
  for (const rule of rules.type) {
    if (matchRule(rule, text)) {
      type = rule.tag;
      matchedBy = 'rule';
      break;
    }
  }
  // fall back to a mapped legacy category rather than leaving it unclassified
  if (!type && legacyCategory && legacyCategory in rules.typeFallback) {
    const fb = rules.typeFallback[legacyCategory];
    if (fb) {
      type = fb;
      matchedBy = 'fallback';
    }
  }

  const occasion = rules.occasion.filter((r) => matchRule(r, text)).map((r) => r.tag);

  const stuffed = isCredentialStuffed(text);
  const recipient = stuffed
    ? []
    : rules.recipient.filter((r) => matchRule(r, text)).map((r) => r.tag);

  return { type, occasion, recipient, matchedBy, stuffed };
}
