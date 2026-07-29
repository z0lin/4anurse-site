/**
 * Dev tool: preview and tune the blog -> product matcher without a full build.
 *
 * Reports coverage (how many posts get products), the distribution, and spot
 * checks so weight changes in src/lib/match.mjs can be judged before shipping.
 *
 * Usage:
 *   node scripts/preview-matches.mjs
 *   node scripts/preview-matches.mjs "icu"     # spot-check posts matching a term
 */
import { readFileSync, readdirSync } from 'node:fs';
import { matchProducts, matchHubs } from '../src/lib/match.mjs';

const fm = (src, k) =>
  (src.match(new RegExp(`^${k}:\\s*(.*)$`, 'm'))?.[1] ?? '').trim().replace(/^["']|["']$/g, '');
const list = (src, k) => {
  const v = fm(src, k);
  return v.startsWith('[') ? v.slice(1, -1).split(',').map((s) => s.trim()).filter(Boolean) : [];
};

const products = readdirSync('src/content/products').map((f) => {
  const s = readFileSync(`src/content/products/${f}`, 'utf8').replace(/\r\n/g, '\n');
  return {
    slug: f.replace('.md', ''),
    data: {
      title: fm(s, 'title'),
      type: fm(s, 'type'),
      occasion: list(s, 'occasion'),
      recipient: list(s, 'recipient'),
      priceValue: parseFloat(fm(s, 'priceValue')) || 0,
    },
  };
});

const hubs = readdirSync('src/content/hubs').map((f) => {
  const s = readFileSync(`src/content/hubs/${f}`, 'utf8').replace(/\r\n/g, '\n');
  const kws = (s.match(/matchKeywords:\n((?:\s+- .*\n)+)/)?.[1] ?? '')
    .split('\n').map((l) => l.replace(/^\s*-\s*/, '').trim()).filter(Boolean);
  return { slug: f.replace('.md', ''), data: { matchKeywords: kws, breadcrumbLabel: fm(s, 'breadcrumbLabel') } };
});

const posts = readdirSync('src/content/blog').map((f) => {
  const s = readFileSync(`src/content/blog/${f}`, 'utf8').replace(/\r\n/g, '\n');
  return {
    slug: f.replace('.md', ''),
    title: fm(s, 'title'),
    description: fm(s, 'description'),
    category: fm(s, 'category'),
  };
});

console.log(`products=${products.length}  hubs=${hubs.length}  posts=${posts.length}\n`);

const hist = {};
let zero = 0, hubZero = 0, totalP = 0, totalH = 0;
for (const p of posts) {
  const m = matchProducts(p, products, 6);
  const h = matchHubs(p, hubs, 3);
  hist[m.length] = (hist[m.length] ?? 0) + 1;
  totalP += m.length; totalH += h.length;
  if (!m.length) zero++;
  if (!h.length) hubZero++;
}

console.log('products per post:');
for (const k of Object.keys(hist).sort((a, b) => a - b)) {
  console.log(`  ${String(k).padStart(2)} products: ${hist[k]} posts`);
}
console.log(`\nposts with ZERO products: ${zero}/${posts.length} (${(100 * zero / posts.length).toFixed(1)}%)`);
console.log(`posts with ZERO hub links: ${hubZero}/${posts.length}`);
console.log(`product placements: ${totalP} (avg ${(totalP / posts.length).toFixed(1)}/post)`);
console.log(`hub links added:    ${totalH} (avg ${(totalH / posts.length).toFixed(1)}/post)`);

const term = process.argv[2];
const samples = term
  ? posts.filter((p) => p.title.toLowerCase().includes(term.toLowerCase())).slice(0, 5)
  : ['icu', 'graduation', 'tumbler', 'stethoscope', 'candle', 'student']
      .map((t) => posts.find((p) => p.title.toLowerCase().includes(t)))
      .filter(Boolean);

console.log('\n--- spot checks ---');
for (const p of samples) {
  console.log(`\n"${p.title.slice(0, 68)}"  [${p.category}]`);
  for (const x of matchProducts(p, products, 4)) {
    console.log(`    ${x.data.type.padEnd(15)} $${String(x.data.priceValue).padEnd(7)} ${x.data.title.slice(0, 50)}`);
  }
  console.log(`    hubs: ${matchHubs(p, hubs, 3).map((h) => h.slug).join(', ') || '(none)'}`);
}
