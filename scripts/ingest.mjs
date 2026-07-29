/**
 * Product ingestion: ASIN in, reviewed product markdown out.
 *
 *   discover/paste  ->  enrich (PA-API)  ->  classify (tag-rules.json)
 *                   ->  gate  ->  stage for review  ->  write markdown
 *
 * Two-step by design. `--stage` writes a JSON queue you can eyeball or edit;
 * `--commit` turns approved rows into content files. That is the "batched
 * one-click approve" shape rather than per-product form filling, and it keeps a
 * human between an API response and a live page.
 *
 * Usage:
 *   node scripts/ingest.mjs --stage B01ABCDEFG B02HIJKLMN
 *   node scripts/ingest.mjs --stage --search "nurse badge reel" --limit 10
 *   node scripts/ingest.mjs --stage --file asins.txt
 *   node scripts/ingest.mjs --review                 # print the queue
 *   node scripts/ingest.mjs --commit                 # write approved rows
 *   node scripts/ingest.mjs --commit --approve-all   # approve then write
 *
 * Requires PAAPI_ACCESS_KEY / PAAPI_SECRET_KEY for --stage. --review and
 * --commit work offline on an existing queue.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { classify } from '../src/lib/classify.mjs';
import { priceBand } from '../src/lib/taxonomy-shim.mjs';
import { getItems, searchItems, normalizeItem, isConfigured, MAX_BATCH, PaapiNotConfiguredError } from './lib/paapi.mjs';

const PRODUCTS_DIR = 'src/content/products';
const QUEUE = 'ingest-queue.json';

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const val = (f) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : undefined; };

// ─────────────────────────────── helpers ────────────────────────────────────

const readQueue = () => (existsSync(QUEUE) ? JSON.parse(readFileSync(QUEUE, 'utf8')) : []);
const writeQueue = (q) => writeFileSync(QUEUE, JSON.stringify(q, null, 2) + '\n', 'utf8');

function existingAsins() {
  if (!existsSync(PRODUCTS_DIR)) return new Set();
  const set = new Set();
  for (const f of readdirSync(PRODUCTS_DIR).filter((x) => x.endsWith('.md'))) {
    const m = readFileSync(join(PRODUCTS_DIR, f), 'utf8').match(/^asin:\s*"?([A-Z0-9]{10})"?/m);
    if (m) set.add(m[1]);
  }
  return set;
}

function slugify(text) {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 70);
}

const yamlStr = (s) => `"${String(s).replace(/"/g, "'")}"`;
const yamlList = (a) => (a.length ? `[${a.join(', ')}]` : '[]');

/**
 * Quality gate. Anything failing here should never reach a content file —
 * a product with no price silently disappears from every price facet, and one
 * with no image renders an empty card.
 */
function gate(row, seen) {
  const reasons = [];
  if (!/^[A-Z0-9]{10}$/.test(row.asin)) reasons.push('invalid ASIN');
  if (!row.title || row.title.length < 8) reasons.push('missing/short title');
  if (!row.image) reasons.push('no image URL');
  if (typeof row.priceValue !== 'number' || row.priceValue <= 0) reasons.push('no usable price');
  if (row.priceValue > 2000) reasons.push('price implausible (>$2000)');
  if (!row.type) reasons.push('unclassifiable type');
  if (row.availability === 'out_of_stock') reasons.push('out of stock');
  if (seen.has(row.asin)) reasons.push('duplicate ASIN already in catalog');
  return reasons;
}

// ─────────────────────────────── stage ──────────────────────────────────────

async function stage() {
  if (!isConfigured()) throw new PaapiNotConfiguredError();

  let asins = argv.filter((a) => /^[A-Z0-9]{10}$/.test(a));

  const file = val('--file');
  if (file) {
    asins.push(
      ...readFileSync(file, 'utf8').split('\n').map((l) => l.trim())
        .filter((l) => l && !l.startsWith('#'))
    );
  }

  const search = val('--search');
  if (search) {
    const limit = Number(val('--limit') ?? 10);
    console.log(`Searching PA-API for "${search}" (up to ${limit})...`);
    const found = await searchItems(search, { itemCount: Math.min(limit, MAX_BATCH) });
    asins.push(...found.map((i) => i.ASIN));
  }

  asins = [...new Set(asins)];
  if (!asins.length) {
    console.error('No ASINs given. Pass ASINs, --file, or --search.');
    process.exit(1);
  }

  const seen = existingAsins();
  const queue = readQueue();
  const queued = new Set(queue.map((r) => r.asin));
  const rows = [];

  for (let i = 0; i < asins.length; i += MAX_BATCH) {
    const batch = asins.slice(i, i + MAX_BATCH);
    console.log(`Fetching ${batch.length}: ${batch.join(', ')}`);
    const items = await getItems(batch);
    const got = new Set(items.map((it) => it.ASIN));
    for (const a of batch) if (!got.has(a)) console.log(`  NOT FOUND  ${a}`);

    for (const item of items) {
      const n = normalizeItem(item);
      // Classification uses the same rules file as the site, so a product lands
      // in exactly the facets the routing layer expects.
      const c = classify([n.title, n.brand, ...n.features].join(' '), null);
      const row = {
        ...n,
        type: c.type,
        occasion: c.occasion,
        recipient: c.recipient,
        priceBand: n.priceValue != null ? priceBand(n.priceValue) : null,
        classifiedBy: c.matchedBy,
        credentialStuffed: c.stuffed,
        approved: false,
      };
      row.blocked = gate(row, seen);
      if (queued.has(row.asin)) { console.log(`  ALREADY QUEUED  ${row.asin}`); continue; }
      rows.push(row);
      console.log(
        `  ${row.blocked.length ? 'BLOCKED' : 'STAGED '}  ${row.asin}  ${row.type ?? '?'}  ` +
          `$${row.priceValue ?? '?'}  ${row.title.slice(0, 44)}` +
          (row.blocked.length ? `\n            -> ${row.blocked.join('; ')}` : '')
      );
    }
  }

  writeQueue([...queue, ...rows]);
  const ok = rows.filter((r) => !r.blocked.length).length;
  console.log(`\nStaged ${rows.length} (${ok} clean, ${rows.length - ok} blocked) -> ${QUEUE}`);
  console.log('Review with:  node scripts/ingest.mjs --review');
}

// ─────────────────────────────── review ─────────────────────────────────────

function review() {
  const queue = readQueue();
  if (!queue.length) return console.log('Queue empty.');
  console.log(`${queue.length} row(s) in ${QUEUE}\n`);
  for (const [i, r] of queue.entries()) {
    const flag = r.blocked?.length ? 'BLOCKED' : r.approved ? 'APPROVED' : 'pending';
    console.log(`[${i}] ${flag}  ${r.asin}  $${r.priceValue}  ${r.type}`);
    console.log(`     ${r.title.slice(0, 82)}`);
    console.log(
      `     occasion=${yamlList(r.occasion)} recipient=${yamlList(r.recipient)} ` +
        `band=${r.priceBand} via=${r.classifiedBy}${r.credentialStuffed ? ' [stuffed-title]' : ''}`
    );
    if (r.blocked?.length) console.log(`     blocked: ${r.blocked.join('; ')}`);
  }
  const pending = queue.filter((r) => !r.approved && !r.blocked?.length).length;
  console.log(`\n${pending} pending approval.`);
  console.log('Approve all clean rows and write:  node scripts/ingest.mjs --commit --approve-all');
  console.log(`Or edit "approved": true per row in ${QUEUE}, then --commit.`);
}

// ─────────────────────────────── commit ─────────────────────────────────────

function commit() {
  const queue = readQueue();
  if (!queue.length) return console.log('Queue empty; nothing to commit.');

  if (has('--approve-all')) {
    for (const r of queue) if (!r.blocked?.length) r.approved = true;
  }

  mkdirSync(PRODUCTS_DIR, { recursive: true });
  const seen = existingAsins();
  const today = new Date().toISOString().slice(0, 10);
  const stamp = new Date().toISOString();
  let written = 0;
  const remaining = [];

  for (const r of queue) {
    if (r.blocked?.length || !r.approved) { remaining.push(r); continue; }
    if (seen.has(r.asin)) { console.log(`  SKIP  ${r.asin} (now in catalog)`); continue; }

    const md = `---
title: ${yamlStr(r.title)}
asin: "${r.asin}"
${r.brand ? `brand: ${yamlStr(r.brand)}\n` : ''}image: ${yamlStr(r.image)}
amazonUrl: "https://www.amazon.com/dp/${r.asin}/?tag=4anurse05-20"
price: ${yamlStr(r.price)}
priceValue: ${r.priceValue}
priceUpdated: ${stamp}
availability: ${r.availability}
category: other
type: ${r.type}
occasion: ${yamlList(r.occasion)}
recipient: ${yamlList(r.recipient)}
featured: false
dateAdded: ${today}
---
`;
    const file = join(PRODUCTS_DIR, `${slugify(r.title) || r.asin.toLowerCase()}.md`);
    writeFileSync(file, md, 'utf8');
    seen.add(r.asin);
    written++;
    console.log(`  WROTE  ${file}  [${r.type}]`);
  }

  writeQueue(remaining);
  console.log(`\nWrote ${written} product(s); ${remaining.length} left in queue.`);
  if (written) {
    console.log('Verify before pushing:  npm run build');
  }
}

// ─────────────────────────────── main ───────────────────────────────────────

try {
  if (has('--stage')) await stage();
  else if (has('--review')) review();
  else if (has('--commit')) commit();
  else {
    console.log(readFileSync(new URL(import.meta.url)).toString().split('*/')[0].replace(/^\/\*\*?/, ''));
    process.exit(1);
  }
} catch (err) {
  console.error(`\n${err.message}`);
  process.exit(1);
}
