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
 *   node scripts/ingest.mjs --import products.csv   # no PA-API needed
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

// ─────────────────────────── import (no PA-API) ─────────────────────────────

/**
 * Extract an ASIN from anything Amazon hands you.
 *
 * SiteStripe gives you a full product URL, so accepting URLs directly removes a
 * manual copy step. Handles /dp/, /gp/product/, and a bare ASIN.
 */
export function extractAsin(input) {
  const s = String(input).trim();
  if (/^[A-Z0-9]{10}$/i.test(s)) return s.toUpperCase();
  // The (?![A-Z0-9]) is load-bearing. Without it an 11-char token silently
  // matches its first 10 characters, producing a VALID-LOOKING ASIN that points
  // at a different product — a live affiliate link to the wrong item. Reject
  // rather than truncate.
  const m = s.match(/\/(?:dp|gp\/product|gp\/aw\/d)\/([A-Z0-9]{10})(?![A-Z0-9])/i);
  return m ? m[1].toUpperCase() : null;
}

/** Minimal CSV parser: handles quoted fields, embedded commas and doubled quotes. */
function parseCsv(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  const src = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((x) => x.trim()));
}

/**
 * Bulk import from a spreadsheet, for use before PA-API access exists.
 *
 * Only enrichment needs the API — classification, dedup, the quality gate and
 * file writing are all offline. So supplying four raw fields per product in a
 * spreadsheet gets you the entire rest of the pipeline, including correct facet
 * assignment and duplicate rejection.
 *
 * Required columns (header row, any order, case-insensitive):
 *   url_or_asin , title , price , image
 * Optional: brand, type, occasion, recipient  (semicolon-separated lists;
 * anything supplied here overrides the classifier)
 */
function importCsv() {
  const path = val('--import');
  if (!path) { console.error('Usage: --import <file.csv>'); process.exit(1); }

  const rows = parseCsv(readFileSync(path, 'utf8'));
  if (rows.length < 2) { console.error('CSV has no data rows.'); process.exit(1); }

  const header = rows[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'));
  const idx = (...names) => {
    for (const n of names) { const i = header.indexOf(n); if (i >= 0) return i; }
    return -1;
  };
  const cols = {
    asin: idx('url_or_asin', 'asin', 'url', 'link'),
    title: idx('title', 'name', 'product'),
    price: idx('price', 'display_price'),
    image: idx('image', 'image_url', 'img'),
    brand: idx('brand'),
    type: idx('type'),
    occasion: idx('occasion', 'occasions'),
    recipient: idx('recipient', 'recipients'),
  };
  const missing = ['asin', 'title', 'price', 'image'].filter((k) => cols[k] < 0);
  if (missing.length) {
    console.error(`CSV missing required column(s): ${missing.join(', ')}`);
    console.error(`Found: ${header.join(', ')}`);
    console.error('See scripts/product-import-template.csv');
    process.exit(1);
  }

  const seen = existingAsins();
  const queue = readQueue();
  const queued = new Set(queue.map((r) => r.asin));
  const staged = [];

  for (const [n, r] of rows.slice(1).entries()) {
    const raw = (r[cols.asin] ?? '').trim();
    const asin = extractAsin(raw);
    if (!asin) { console.log(`  row ${n + 2}: SKIP — no ASIN in "${raw.slice(0, 40)}"`); continue; }

    const title = (r[cols.title] ?? '').trim();
    const priceStr = (r[cols.price] ?? '').trim();
    const priceValue = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
    const splitList = (i) =>
      i >= 0 && r[i] ? r[i].split(';').map((x) => x.trim()).filter(Boolean) : null;

    const auto = classify(title, null);
    const row = {
      asin,
      title,
      brand: cols.brand >= 0 ? (r[cols.brand] ?? '').trim() : '',
      image: (r[cols.image] ?? '').trim(),
      price: priceStr.startsWith('$') ? priceStr : `$${priceStr}`,
      priceValue: Number.isFinite(priceValue) ? priceValue : null,
      availability: 'in_stock',
      // Explicit spreadsheet values win over the classifier: a human correcting
      // a facet should not be silently overridden on the next import.
      type: (cols.type >= 0 && r[cols.type]?.trim()) || auto.type,
      occasion: splitList(cols.occasion) ?? auto.occasion,
      recipient: splitList(cols.recipient) ?? auto.recipient,
      priceBand: Number.isFinite(priceValue) ? priceBand(priceValue) : null,
      classifiedBy: cols.type >= 0 && r[cols.type]?.trim() ? 'manual' : auto.matchedBy,
      credentialStuffed: auto.stuffed,
      source: 'csv',
      approved: false,
    };
    row.blocked = gate(row, seen);

    if (queued.has(asin)) { console.log(`  row ${n + 2}: ALREADY QUEUED ${asin}`); continue; }
    queued.add(asin);
    staged.push(row);
    console.log(
      `  ${row.blocked.length ? 'BLOCKED' : 'STAGED '}  ${asin}  ${row.type ?? '?'}  ` +
        `$${row.priceValue ?? '?'}  ${title.slice(0, 40)}` +
        (row.blocked.length ? `\n            -> ${row.blocked.join('; ')}` : '')
    );
  }

  writeQueue([...queue, ...staged]);
  const ok = staged.filter((r) => !r.blocked.length).length;
  console.log(`\nImported ${staged.length} row(s): ${ok} clean, ${staged.length - ok} blocked`);
  console.log('Review with:  node scripts/ingest.mjs --review');
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
  if (has('--import')) importCsv();
  else if (has('--stage')) await stage();
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
