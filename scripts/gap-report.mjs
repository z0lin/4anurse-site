/**
 * Catalog gap report — what to source next, derived from the site's own guards.
 *
 * Works offline with no PA-API credentials. This is the input to ingestion:
 * rather than "add more products", it names the specific facets that are
 * blocking pages, and the price band that is distorting the whole catalog.
 *
 * Usage: node scripts/gap-report.mjs
 */
import { readFileSync, readdirSync } from 'node:fs';
import { priceBand } from '../src/lib/taxonomy-shim.mjs';
import rules from '../src/data/tag-rules.json' with { type: 'json' };

const rd = (p) => readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
const fm = (s, k) => (s.match(new RegExp(`^${k}:\\s*(.*)$`, 'm'))?.[1] ?? '').trim().replace(/^["']|["']$/g, '');
const list = (s, k) => { const v = fm(s, k); return v.startsWith('[') ? v.slice(1, -1).split(',').map((x) => x.trim()).filter(Boolean) : []; };

const products = readdirSync('src/content/products').filter((f) => f.endsWith('.md')).map((f) => {
  const s = rd(`src/content/products/${f}`);
  const pv = parseFloat(fm(s, 'priceValue')) || 0;
  return { type: fm(s, 'type'), occasion: list(s, 'occasion'), recipient: list(s, 'recipient'), priceValue: pv, band: priceBand(pv) };
});

const count = (kind, v) =>
  products.filter((p) =>
    kind === 'type' ? p.type === v
    : kind === 'occasion' ? p.occasion.includes(v)
    : kind === 'recipient' ? p.recipient.includes(v)
    : p.band === v
  ).length;

const { minProductsSingleFacet: MIN, minProductsIntersection: MINX, maxParentOverlap: MAXOV } = rules.pageGuard;

console.log(`CATALOG GAP REPORT — ${products.length} products\n`);

// ── 1. price distribution: the structural problem ───────────────────────────
console.log('1. PRICE DISTRIBUTION');
const bands = rules.price.map((b) => ({ tag: b.tag, n: count('price', b.tag) }));
for (const b of bands) {
  const pct = (100 * b.n) / products.length;
  console.log(`   ${b.tag.padEnd(10)} ${String(b.n).padStart(3)}  ${(pct).toFixed(0).padStart(3)}%  ${'#'.repeat(Math.round(pct / 2))}`);
}
const cheap = bands[0].n / products.length;
if (cheap > 0.5) {
  console.log(
    `   >> ${(100 * cheap).toFixed(0)}% of the catalog sits in ${bands[0].tag}. This is why price\n` +
    `      intersections collapse into their parents: "X ${bands[0].tag}" is effectively "X".\n` +
    `      SOURCE HIGHER-PRICED STOCK to make price facets meaningful (and lift AOV).`
  );
}

// ── 2. facets blocking a page ───────────────────────────────────────────────
console.log('\n2. FACETS BELOW THE SINGLE-FACET GUARD (need >=' + MIN + ')');
const blocked = [];
for (const kind of ['type', 'occasion', 'recipient']) {
  for (const r of rules[kind]) {
    const n = count(kind, r.tag);
    if (n > 0 && n < MIN) blocked.push({ kind, tag: r.tag, label: r.label, n, need: MIN - n });
  }
}
blocked.sort((a, b) => b.n - a.n);
if (!blocked.length) console.log('   none');
for (const b of blocked) {
  console.log(`   ${b.tag.padEnd(16)} ${b.n} product(s) — need ${b.need} more to unblock /gifts/${b.kind === 'type' ? '' : b.kind === 'occasion' ? 'occasion/' : 'for/'}${b.tag}/`);
}

// ── 3. facets with zero coverage ────────────────────────────────────────────
console.log('\n3. FACETS WITH ZERO PRODUCTS (page cannot exist at all)');
const empty = [];
for (const kind of ['type', 'occasion', 'recipient']) {
  for (const r of rules[kind]) if (count(kind, r.tag) === 0) empty.push(`${kind}:${r.tag}`);
}
console.log(empty.length ? '   ' + empty.join(', ') : '   none');

// ── 4. intersections one step from viable ───────────────────────────────────
console.log(`\n4. INTERSECTIONS CLOSE TO VIABLE (need >=${MINX} and <=${MAXOV * 100}% of each parent)`);
const PAIRS = [['occasion', 'price'], ['type', 'price'], ['recipient', 'price'], ['type', 'occasion'], ['type', 'recipient']];
const near = [];
for (const [ka, kb] of PAIRS) {
  for (const a of rules[ka].map((r) => r.tag)) {
    for (const b of rules[kb].map((r) => r.tag)) {
      const n = products.filter((p) =>
        (ka === 'type' ? p.type === a : ka === 'occasion' ? p.occasion.includes(a) : ka === 'recipient' ? p.recipient.includes(a) : p.band === a) &&
        (kb === 'price' ? p.band === b : kb === 'occasion' ? p.occasion.includes(b) : kb === 'recipient' ? p.recipient.includes(b) : p.type === b)
      ).length;
      if (n < 3 || n >= MINX) continue;
      const ov = Math.max(n / count(ka, a), n / count(kb, b));
      if (ov > MAXOV) continue; // would be a parent duplicate even if it grew
      near.push({ slug: `${a}-${b}`, n, need: MINX - n });
    }
  }
}
near.sort((x, y) => y.n - x.n);
if (!near.length) console.log('   none');
for (const x of near.slice(0, 12)) {
  console.log(`   /gifts/${x.slug}/`.padEnd(44) + `${x.n} product(s) — need ${x.need} more`);
}

// ── 5. actionable summary ───────────────────────────────────────────────────
console.log('\n5. SUGGESTED SEARCH TERMS FOR INGESTION');
const terms = [
  ...blocked.slice(0, 6).map((b) => `"${b.label.toLowerCase()} nurse gift"`),
  ...(cheap > 0.5 ? ['"luxury nurse gift"', '"premium stethoscope"', '"nurse gift over $100"'] : []),
];
for (const t of [...new Set(terms)]) console.log(`   node scripts/ingest.mjs --stage --search ${t} --limit 10`);
