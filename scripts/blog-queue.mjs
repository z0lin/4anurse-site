#!/usr/bin/env node
/**
 * Topic queue for the automated blog writer (see BLOG-AUTOMATION.md).
 *
 *   node scripts/blog-queue.mjs --next [--date YYYY-MM-DD]   what to write now, as JSON
 *   node scripts/blog-queue.mjs --status                     the whole queue, human readable
 *   node scripts/blog-queue.mjs --done <id> <post-file.md>   mark published
 *   node scripts/blog-queue.mjs --candidates <id>            product pages the post may link
 *
 * Rules, all decided here so the writer never has to:
 *   - Items run in list order. Seasonal items carry an `after`/`before` window;
 *     an item whose window has closed is skipped, never written late (a
 *     Christmas guide published on Dec 28 is worse than none).
 *   - Pacing: no new post until `minDays` have passed since the last one
 *     (twice a week through the holidays, weekly after).
 *   - `--next` prints {"ready": false, "reason": ...} when nothing is due, so a
 *     cron pre-check can stay silent and spend nothing.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const QUEUE = join(ROOT, 'blog-queue.json');
const BLOG = join(ROOT, 'src/content/blog');

const argv = process.argv.slice(2);
const flag = (f) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : undefined; };
const today = flag('--date') ?? new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });

const q = JSON.parse(readFileSync(QUEUE, 'utf8'));
const days = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);

/** Newest published (non draft) post date in the repo: the pacing anchor. */
function lastPublished() {
  let last = '1970-01-01';
  for (const f of readdirSync(BLOG)) {
    if (!f.endsWith('.md')) continue;
    const s = readFileSync(join(BLOG, f), 'utf8');
    if (/^draft:\s*true/m.test(s)) continue;
    const d = s.match(/^pubDate:\s*(\d{4}-\d{2}-\d{2})/m)?.[1];
    if (d && d > last && d <= today) last = d;
  }
  return last;
}

function minDaysFor(date) {
  return (q.pace.find((p) => date <= p.until) ?? q.pace.at(-1)).minDays;
}

function open(i) {
  return i.status !== 'done' && i.status !== 'skipped' && (!i.after || i.after <= today) && (!i.before || today <= i.before);
}
function upcoming(i) {
  return i.status !== 'done' && i.status !== 'skipped' && (!i.before || today <= i.before);
}

if (argv.includes('--candidates')) {
  // Product pages the writer may link for an item: products with a /gift/ page
  // whose facets intersect the item's focus. Sorted by facet hits, then price.
  const id = argv[argv.indexOf('--candidates') + 1];
  const item = q.items.find((i) => i.id === id);
  if (!item) throw new Error(`no queue item ${id}`);
  const PRODUCTS = join(ROOT, 'src/content/products');
  const PAGES = join(ROOT, 'src/content/giftpages');
  const pages = new Map(readdirSync(PAGES).map((f) => {
    const d = JSON.parse(readFileSync(join(PAGES, f), 'utf8'));
    return [d.asin, d];
  }));
  const f = item.focus ?? {};
  const out = [];
  for (const file of readdirSync(PRODUCTS)) {
    const s = readFileSync(join(PRODUCTS, file), 'utf8').replace(/\r/g, '');
    const g = (k) => s.match(new RegExp(`^${k}:\\s*(.*)$`, 'm'))?.[1]?.replace(/^"|"$/g, '') ?? '';
    const list = (k) => g(k).replace(/[[\]]/g, '').split(',').map((x) => x.trim()).filter(Boolean);
    if (g('availability') === 'dead') continue;
    const page = pages.get(g('asin'));
    if (!page) continue;
    const type = g('type'); const occ = list('occasion'); const rec = list('recipient');
    const hits = (f.type ?? []).includes(type) * 2 + occ.filter((o) => (f.occasion ?? []).includes(o)).length * 2
      + rec.filter((r) => (f.recipient ?? []).includes(r)).length * 3;
    if (!hits) continue;
    out.push({ hits, url: `/gift/${page.slug}/`, name: page.name, type, occasion: occ, recipient: rec,
      price: parseFloat(g('priceValue')) || 0, bestFor: page.bestFor, summary: page.summary });
  }
  out.sort((a, b) => b.hits - a.hits || a.price - b.price);
  console.log(JSON.stringify(out.slice(0, 40), null, 1));
  process.exit(0);
}

if (argv.includes('--next')) {
  const last = lastPublished();
  const gap = days(last, today);
  const need = minDaysFor(today);
  const item = q.items.find(open);
  const remaining = q.items.filter(upcoming).length;
  const lowWater = remaining <= (q.lowWater ?? 4);
  // The first `reviewFirst` automated posts go out as pull requests for Matt
  // to approve; after that the writer publishes directly.
  const published = q.items.filter((i) => i.status === 'done').length;
  const mode = published < (q.reviewFirst ?? 0) ? 'pr' : 'publish';
  if (!item) {
    console.log(JSON.stringify({ ready: false, reason: 'no topic window open today', remaining, lowWater, today }));
  } else if (gap < need) {
    console.log(JSON.stringify({ ready: false, reason: `last post ${last}, ${gap} of ${need} days`, next: item.id, remaining, lowWater, today }));
  } else {
    console.log(JSON.stringify({ ready: true, mode, published, today, lastPublished: last, remaining, lowWater, item }));
  }
} else if (argv.includes('--done')) {
  const [id, file] = argv.slice(argv.indexOf('--done') + 1);
  const item = q.items.find((i) => i.id === id);
  if (!item) throw new Error(`no queue item ${id}`);
  Object.assign(item, { status: 'done', post: file, published: today });
  writeFileSync(QUEUE, JSON.stringify(q, null, 2) + '\n');
  console.log(`marked ${id} done (${file})`);
} else {
  const last = lastPublished();
  console.log(`today ${today}, last post ${last}, pacing ${minDaysFor(today)} days\n`);
  for (const i of q.items) {
    const state = i.status === 'done' ? `done ${i.published}` : !upcoming(i) ? 'EXPIRED' : open(i) ? 'OPEN' : `opens ${i.after}`;
    console.log(`${state.padEnd(16)} ${i.id.padEnd(28)} ${i.title}`);
  }
}
