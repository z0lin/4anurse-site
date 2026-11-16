#!/usr/bin/env node
/**
 * Gift page copy: import, check, and coverage report.
 *
 * Every product can have its own page at /gift/<slug>/, generated from
 * src/content/giftpages/<slug>.json. This script is the only supported way
 * to write those files, because it runs the same copy rules the build does
 * (src/lib/copy-lint.mjs) and refuses anything that would fail.
 *
 *   node scripts/gift-pages.mjs --missing            products with no page yet (writes imports/giftpages-todo.json)
 *   node scripts/gift-pages.mjs --import <file.json> add or replace pages from a JSON array
 *   node scripts/gift-pages.mjs --check              lint every existing page (what the build enforces)
 *
 * The import file is a JSON array of objects with: asin, slug, name, seoTitle,
 * metaDescription, summary, bestFor[], whyItWorks[], goodToKnow[], faq[{q,a}].
 * See ADDING-PRODUCTS.md ("Product pages") for the writing rules. The copy
 * must be original: never paste Amazon's description or bullets.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, unlinkSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { lintGiftPage } from '../src/lib/copy-lint.mjs';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const PAGES_DIR = join(ROOT, 'src/content/giftpages');
const PRODUCTS_DIR = join(ROOT, 'src/content/products');
const FIELDS = ['asin', 'slug', 'name', 'seoTitle', 'metaDescription', 'summary', 'bestFor', 'whyItWorks', 'goodToKnow', 'faq', 'updated'];

function readProducts() {
  return readdirSync(PRODUCTS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const fm = readFileSync(join(PRODUCTS_DIR, f), 'utf8').replace(/\r/g, '').split('---')[1] ?? '';
      const get = (k) => fm.match(new RegExp(`^${k}:\\s*(.*)$`, 'm'))?.[1]?.replace(/^"|"$/g, '') ?? '';
      return {
        file: f, asin: get('asin'), title: get('title'), brand: get('brand'), price: get('price'),
        type: get('type'), occasion: get('occasion'), recipient: get('recipient'), availability: get('availability'),
      };
    });
}

function readPages() {
  mkdirSync(PAGES_DIR, { recursive: true });
  return readdirSync(PAGES_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => ({ file: f, data: JSON.parse(readFileSync(join(PAGES_DIR, f), 'utf8')) }));
}

const [, , cmd, arg] = process.argv;

if (cmd === '--missing') {
  const have = new Set(readPages().map((p) => p.data.asin));
  const missing = readProducts().filter((p) => !have.has(p.asin) && p.availability !== 'dead');
  const out = join(ROOT, 'imports/giftpages-todo.json');
  writeFileSync(out, JSON.stringify(missing, null, 1) + '\n');
  console.log(`${missing.length} product(s) without a gift page.`);
  for (const m of missing) console.log(`  ${m.asin}  ${m.title.slice(0, 80)}`);
  if (missing.length) console.log(`\nWrote ${out}. Write copy for these, then run --import.`);
} else if (cmd === '--import') {
  if (!arg) throw new Error('usage: --import <file.json>');
  const rows = JSON.parse(readFileSync(arg, 'utf8'));
  const products = new Map(readProducts().map((p) => [p.asin, p]));
  const pages = readPages();
  const slugOwner = new Map(pages.map((p) => [p.data.slug, p.data.asin]));
  let ok = 0, bad = 0;
  for (const r of rows) {
    const d = Object.fromEntries(FIELDS.filter((k) => r[k] !== undefined).map((k) => [k, r[k]]));
    const { errors, warnings } = lintGiftPage(d);
    if (!products.has(d.asin)) errors.push(`no product with ASIN ${d.asin}`);
    const owner = slugOwner.get(d.slug);
    if (owner && owner !== d.asin) errors.push(`slug "${d.slug}" already belongs to ${owner}`);
    if (errors.length) {
      bad++;
      console.log(`BLOCKED ${d.asin} ${d.slug}\n  - ${errors.join('\n  - ')}`);
      continue;
    }
    // One file per ASIN: replacing a page with a new slug removes the old file.
    for (const p of pages.filter((p) => p.data.asin === d.asin && p.file !== `${d.slug}.json`)) {
      unlinkSync(join(PAGES_DIR, p.file));
      console.log(`  replaced ${p.file} (slug changed: add a redirect if it was already live)`);
    }
    writeFileSync(join(PAGES_DIR, `${d.slug}.json`), JSON.stringify(d, null, 1) + '\n');
    slugOwner.set(d.slug, d.asin);
    ok++;
    for (const w of warnings) console.log(`  warn ${d.slug}: ${w}`);
  }
  console.log(`\nImported ${ok}, blocked ${bad}.`);
  if (bad) process.exitCode = 1;
} else if (cmd === '--check') {
  const products = new Set(readProducts().map((p) => p.asin));
  let bad = 0, warn = 0;
  const pages = readPages();
  for (const p of pages) {
    const { errors, warnings } = lintGiftPage(p.data);
    if (!products.has(p.data.asin)) errors.push('orphan: product no longer exists');
    if (`${p.data.slug}.json` !== p.file) errors.push(`file name should be ${p.data.slug}.json`);
    if (errors.length) { bad++; console.log(`FAIL ${p.file}\n  - ${errors.join('\n  - ')}`); }
    warn += warnings.length;
  }
  console.log(`${pages.length} page(s): ${bad} failing, ${warn} warning(s).`);
  if (bad) process.exitCode = 1;
} else {
  console.log('usage: node scripts/gift-pages.mjs --missing | --import <file.json> | --check');
}
