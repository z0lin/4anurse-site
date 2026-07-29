/**
 * One-off migration: add asin + faceted taxonomy to every product file.
 *
 * Deliberately line-based rather than parse-and-reserialize. Product titles
 * contain quotes, ampersands and mojibake from the WooCommerce export, and a
 * YAML round-trip would silently rewrite them. This only inserts new lines and
 * leaves every existing byte untouched.
 *
 * The legacy `category` field is PRESERVED. Existing pages, the categories
 * collection and the hubs collection all still key off it; switching them to
 * `type` is Phase 3. Removing it here would break the site.
 *
 * Usage:
 *   node scripts/migrate-taxonomy.mjs --dry-run
 *   node scripts/migrate-taxonomy.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { classify } from '../src/lib/classify.mjs';

const DIR = 'src/content/products';
const AFFILIATE_TAG = '4anurse05-20';
const dryRun = process.argv.includes('--dry-run');

const field = (src, name) => {
  const m = src.match(new RegExp(`^${name}:\\s*(.*)$`, 'm'));
  return m ? m[1].trim() : null;
};
const unquote = (v) => (v ? v.replace(/^["']|["']$/g, '') : v);

const files = readdirSync(DIR).filter((f) => f.endsWith('.md')).sort();
const stats = {
  migrated: 0, skipped: 0, byRule: 0, byFallback: 0,
  unclassified: [], stuffed: 0, badAsin: [], tagMismatch: [], changedType: 0,
};
const seenAsin = new Map();

for (const file of files) {
  const path = join(DIR, file);
  const src = readFileSync(path, 'utf8');

  if (field(src, 'asin')) { stats.skipped++; continue; }

  const title = unquote(field(src, 'title')) ?? '';
  const url = unquote(field(src, 'amazonUrl')) ?? '';
  const legacy = unquote(field(src, 'category'));

  // ASIN is the new primary key; derive it from the existing URL.
  const asin = url.match(/\/dp\/([A-Z0-9]{10})/)?.[1];
  if (!asin) { stats.badAsin.push(file); continue; }

  // Integrity check: every existing link must already carry the correct tag.
  // A mismatch here is real lost revenue, so surface it rather than paper over it.
  if (!url.includes(`tag=${AFFILIATE_TAG}`)) stats.tagMismatch.push(`${file} -> ${url}`);

  // Duplicate detection — the whole point of an ASIN primary key.
  if (seenAsin.has(asin)) {
    console.log(`  DUPLICATE ${asin}: ${seenAsin.get(asin)} <-> ${file}`);
  } else {
    seenAsin.set(asin, file);
  }

  const { type, occasion, recipient, matchedBy, stuffed } = classify(title, legacy);
  if (!type) stats.unclassified.push(file);
  if (matchedBy === 'rule') stats.byRule++;
  if (matchedBy === 'fallback') stats.byFallback++;
  if (stuffed) stats.stuffed++;
  if (type && type !== legacy) stats.changedType++;

  const yamlList = (a) => (a.length ? `[${a.join(', ')}]` : '[]');

  let out = src
    .replace(/^(title:.*)$/m, `$1\nasin: "${asin}"`)
    .replace(
      /^(category:.*)$/m,
      `$1\ntype: ${type ?? 'other'}\noccasion: ${yamlList(occasion)}\nrecipient: ${yamlList(recipient)}`
    );

  if (out === src) { console.log(`  NO-OP (unexpected shape) ${file}`); continue; }

  if (!dryRun) writeFileSync(path, out, 'utf8');
  stats.migrated++;
}

console.log(`\n${dryRun ? 'DRY RUN — ' : ''}migrated ${stats.migrated}, skipped ${stats.skipped} (already had asin)`);
console.log(`  typed by rule:      ${stats.byRule}`);
console.log(`  typed by fallback:  ${stats.byFallback}`);
console.log(`  type changed:       ${stats.changedType}`);
console.log(`  credential-stuffed: ${stats.stuffed} (recipient tags suppressed)`);
console.log(`  unique ASINs:       ${seenAsin.size}`);
if (stats.unclassified.length) console.log(`  UNCLASSIFIED (${stats.unclassified.length}):`, stats.unclassified);
if (stats.badAsin.length) console.log(`  NO ASIN IN URL (${stats.badAsin.length}):`, stats.badAsin);
if (stats.tagMismatch.length) console.log(`  AFFILIATE TAG MISSING/WRONG (${stats.tagMismatch.length}):`, stats.tagMismatch);
else console.log(`  affiliate tag: all ${stats.migrated + stats.skipped} links carry tag=${AFFILIATE_TAG}`);
