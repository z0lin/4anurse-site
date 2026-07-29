/**
 * List intersection pages that clear the page guard, so new facet pages are
 * chosen from data rather than guesswork. Read-only.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { priceBand } from '../src/lib/taxonomy-shim.mjs';
import rules from '../src/data/tag-rules.json' with { type: 'json' };

const rd = (p) => readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
const fm = (s, k) => (s.match(new RegExp(`^${k}:\s*(.*)$`, 'm'))?.[1] ?? '').trim().replace(/^["']|["']$/g, '');
const list = (s, k) => { const v = fm(s, k); return v.startsWith('[') ? v.slice(1, -1).split(',').map(x => x.trim()).filter(Boolean) : []; };

const products = readdirSync('src/content/products').map((f) => {
  const s = rd(`src/content/products/${f}`);
  const pv = parseFloat(fm(s, 'priceValue')) || 0;
  return { type: fm(s, 'type'), occasion: list(s, 'occasion'), recipient: list(s, 'recipient'), price: priceBand(pv) };
});

const existing = new Set(readdirSync('src/content/categories').map((f) => f.replace('.md', '')));
const MIN = rules.pageGuard.minProductsIntersection;

const groups = {
  type: rules.type.map(r => r.tag),
  occasion: rules.occasion.map(r => r.tag),
  recipient: rules.recipient.map(r => r.tag),
  price: rules.price.map(r => r.tag),
};
const has = (p, kind, v) =>
  kind === 'type' ? p.type === v
  : kind === 'price' ? p.price === v
  : kind === 'occasion' ? p.occasion.includes(v)
  : p.recipient.includes(v);

// Pairs ordered so the slug reads like a search query.
const PAIRS = [['occasion','price'],['type','price'],['recipient','price'],['type','occasion'],['type','recipient']];
const out = [];
for (const [ka, kb] of PAIRS) {
  for (const a of groups[ka]) for (const b of groups[kb]) {
    const n = products.filter((p) => has(p, ka, a) && has(p, kb, b)).length;
    if (n >= MIN) out.push({ slug: `${a}-${b}`, a, b, ka, kb, n, exists: existing.has(`${a}-${b}`) });
  }
}
out.sort((x, y) => y.n - x.n);
console.log(`intersections clearing >=${MIN}: ${out.length}\n`);
console.log('  n   slug                              facets');
for (const o of out) console.log(`  ${String(o.n).padStart(3)}  ${o.slug.padEnd(33)} ${o.ka}+${o.kb}${o.exists ? '  [EXISTS]' : ''}`);

// ---- overlap check: is the intersection meaningfully different from its parents? ----
const parentCount = (kind, v) => products.filter((p) => has(p, kind, v)).length;
console.log('\n=== overlap vs parent pages (an intersection holding most of a parent IS that parent) ===');
console.log('  n   slug                            % of parent A   % of parent B   verdict');
for (const o of out) {
  const pa = parentCount(o.ka, o.a), pb = parentCount(o.kb, o.b);
  const ra = o.n / pa, rb = o.n / pb;
  const worst = Math.max(ra, rb);
  const verdict = worst > 0.7 ? `DUPLICATE of ${ra > rb ? o.a : o.b}` : 'distinct';
  console.log(
    `  ${String(o.n).padStart(3)}  ${o.slug.padEnd(31)} ${(100*ra).toFixed(0).padStart(4)}% (${String(pa).padStart(3)})    ${(100*rb).toFixed(0).padStart(4)}% (${String(pb).padStart(3)})    ${verdict}`
  );
}
