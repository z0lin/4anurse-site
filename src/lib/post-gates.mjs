/**
 * Publication gates for automatically generated blog posts.
 *
 * These live in their own module for one reason: the weekly generator publishes
 * with NO human review, so these functions ARE the review — and a test that
 * re-implements them would only be testing its own copy. scripts/generate-post.mjs
 * and scripts/test-generator.mjs both import from here, so the tests exercise the
 * code that actually runs in CI.
 */
import { matchProducts } from './match.mjs';

/** A post binding fewer than this earns almost nothing — not worth publishing. */
export const MIN_PRODUCTS = 3;
/** Reject a title sharing this fraction of its significant words with an existing one. */
export const MAX_TITLE_OVERLAP = 0.6;
export const MIN_WORDS = 700;
export const MAX_WORDS = 1600;

const STOP = new Set(['the', 'and', 'for', 'with', 'that', 'this', 'your', 'you', 'are',
  'best', 'top', 'gift', 'gifts', 'nurse', 'nurses', 'nursing', 'ideas', 'idea', 'from',
  'they', 'their', 'what', 'when', 'how', 'why', 'who', 'will', 'make', 'every', 'about']);

/** Significant words in a title — the unit the dedupe check compares. */
export function significantWords(title) {
  return new Set(
    String(title).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/)
      .filter((w) => w.length > 3 && !STOP.has(w))
  );
}

/**
 * Why this title is too close to something already published, or null if it is
 * genuinely new.
 *
 * A title with no significant words at all ("Gifts for Nurses") is also
 * rejected — it would collide with everything and matches no products either.
 *
 * @param {string} title
 * @param {string[]} existingTitles
 * @returns {string|null} human-readable reason, or null when the title is fine
 */
export function tooSimilar(title, existingTitles) {
  const a = significantWords(title);
  if (!a.size) return 'no significant words in the title';
  for (const other of existingTitles) {
    const b = significantWords(other);
    if (!b.size) continue;
    let shared = 0;
    for (const w of a) if (b.has(w)) shared++;
    if (shared / a.size >= MAX_TITLE_OVERLAP) {
      return `${Math.round((shared / a.size) * 100)}% word overlap with "${other}"`;
    }
  }
  return null;
}

/**
 * Which products the build-time matcher will inject under this post.
 *
 * Wrapped rather than called directly so the monetisation gate and the runtime
 * behaviour can never drift apart: this is the same matchProducts() the Astro
 * build uses, given the same three fields it reads.
 */
export function boundProducts(meta, products, limit = 6) {
  return matchProducts(
    { title: meta.title, description: meta.description ?? '', category: meta.category ?? '' },
    products, limit
  );
}

/**
 * Everything wrong with a generated body, as a list of human-readable problems.
 * Empty array means publishable.
 *
 * The pasted-link check is the one worth understanding: the product block is
 * injected by the layout with affiliate tags, rel attributes, image dimensions
 * and ItemList schema. A link the model wrote by hand gets none of that and can
 * miss the tag entirely, so it is a hard block rather than something to clean up.
 *
 * @param {string} body markdown, no frontmatter
 * @returns {string[]}
 */
export function bodyProblems(body) {
  const problems = [];
  const text = String(body ?? '');
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  if (words < MIN_WORDS) problems.push(`only ${words} words (minimum ${MIN_WORDS})`);
  if (words > MAX_WORDS * 1.5) problems.push(`${words} words is far over the ${MAX_WORDS} target`);

  const headings = (text.match(/^## /gm) ?? []).length;
  if (headings < 3) problems.push(`only ${headings} H2 section(s) (minimum 3)`);

  if (/^# /m.test(text)) problems.push('contains an H1 — the layout already renders the title');
  if (/amazon\.|amzn\.to|\/dp\/|tag=/i.test(text)) problems.push('contains a hand-pasted Amazon or affiliate link');
  if (/\b(TODO|TK|LOREM|PLACEHOLDER)\b/i.test(text)) problems.push('contains placeholder text');
  if (/^---\s*$/m.test(text.split('\n').slice(0, 3).join('\n'))) problems.push('contains a frontmatter block');

  return problems;
}

/** Words in a body, used for readTime and the length gate. */
export function wordCount(body) {
  const t = String(body ?? '').trim();
  return t ? t.split(/\s+/).length : 0;
}

/**
 * Parse the "Write these next" table out of BLOG-BACKLOG.md.
 *
 * Only that first table — the "Blocked on stock" and "Avoid — already saturated"
 * tables below it are explicitly topics NOT to write, and a generator that read
 * them would publish posts with nothing to link or straight into a saturated
 * theme. Completed rows are struck through and marked DONE, so one check skips
 * both conventions.
 *
 * @param {string} markdown contents of BLOG-BACKLOG.md
 * @returns {Array<{rank:number, topic:string, products:number, line:string}>}
 */
export function parseBacklog(markdown) {
  const section = String(markdown).replace(/\r\n/g, '\n').split(/^## Blocked on stock/m)[0];
  const rows = [];
  for (const line of section.split('\n')) {
    const m = line.match(/^\|\s*(\d+)\s*\|([^|]+)\|([^|]+)\|([^|]+)\|/);
    if (!m) continue;
    if (/DONE|~~/.test(line)) continue;
    rows.push({
      rank: Number(m[1]),
      topic: m[2].trim(),
      products: parseInt(String(m[4]).replace(/\D/g, ''), 10) || 0,
      line,
    });
  }
  return rows.sort((a, b) => a.rank - b.rank);
}
