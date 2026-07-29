/**
 * Daily catalog refresh: re-fetch every ASIN and update price, availability and
 * image URL in place.
 *
 * Not optional once prices are displayed. PA-API terms require displayed prices
 * to be current, and the image URLs Amazon returns rotate — a static site has no
 * way to notice either going stale, so this job is what keeps the catalog honest.
 *
 * Line-based rewriting, deliberately: product titles carry quotes and mojibake
 * from the original WooCommerce export, and a YAML round-trip would rewrite them.
 *
 * Usage:
 *   node scripts/refresh-catalog.mjs --dry-run
 *   node scripts/refresh-catalog.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { getItems, normalizeItem, isConfigured, MAX_BATCH, PaapiNotConfiguredError } from './lib/paapi.mjs';

const DIR = 'src/content/products';
const dryRun = process.argv.includes('--dry-run');

/**
 * Refuse to apply a batch that looks like a bad API response rather than real
 * price movement. Without this, one malformed response could zero out prices
 * across the catalog and every price facet would silently empty on next deploy.
 */
const SANITY = {
  maxPriceSwing: 0.75,   // reject a single product moving more than 75%
  maxDeadFraction: 0.25, // abort if more than a quarter of ASINs come back missing
};

if (!isConfigured()) {
  // Clean message, not a stack trace: this is the expected state until
  // credentials exist, and CI surfaces it as a notice rather than a failure.
  console.error(`\n${new PaapiNotConfiguredError().message}`);
  process.exit(1);
}

const files = readdirSync(DIR).filter((f) => f.endsWith('.md'));
const records = files.map((f) => {
  const src = readFileSync(join(DIR, f), 'utf8');
  return {
    file: f,
    src,
    asin: src.match(/^asin:\s*"?([A-Z0-9]{10})"?/m)?.[1],
    priceValue: parseFloat(src.match(/^priceValue:\s*(.*)$/m)?.[1] ?? '') || null,
  };
});

const withAsin = records.filter((r) => r.asin);
console.log(`${withAsin.length} product(s) with an ASIN (of ${files.length} files)`);

const byAsin = new Map(withAsin.map((r) => [r.asin, r]));
const asins = [...byAsin.keys()];

const stats = { updated: 0, unchanged: 0, dead: [], rejected: [], throttled: 0 };
const fetched = new Map();

for (let i = 0; i < asins.length; i += MAX_BATCH) {
  const batch = asins.slice(i, i + MAX_BATCH);
  try {
    const items = await getItems(batch);
    for (const item of items) fetched.set(item.ASIN, normalizeItem(item));
  } catch (err) {
    if (err.throttled) {
      // Back off and retry once; PA-API throttles aggressively on low tiers.
      stats.throttled++;
      console.warn(`  throttled, backing off 5s...`);
      await new Promise((r) => setTimeout(r, 5000));
      i -= MAX_BATCH;
      continue;
    }
    throw err;
  }
  process.stdout.write(`\r  fetched ${Math.min(i + MAX_BATCH, asins.length)}/${asins.length}`);
}
console.log('');

for (const a of asins) if (!fetched.has(a)) stats.dead.push(a);

const deadFraction = stats.dead.length / asins.length;
if (deadFraction > SANITY.maxDeadFraction) {
  console.error(
    `\nABORT: ${stats.dead.length}/${asins.length} ASINs (${(100 * deadFraction).toFixed(0)}%) ` +
      `came back missing, above the ${SANITY.maxDeadFraction * 100}% threshold.\n` +
      `That looks like an API or credential problem, not real delistings. ` +
      `Nothing was written.`
  );
  process.exit(1);
}

const stamp = new Date().toISOString();

for (const [asin, fresh] of fetched) {
  const rec = byAsin.get(asin);
  if (fresh.priceValue == null) { stats.rejected.push(`${asin}: no price in response`); continue; }

  if (rec.priceValue) {
    const swing = Math.abs(fresh.priceValue - rec.priceValue) / rec.priceValue;
    if (swing > SANITY.maxPriceSwing) {
      stats.rejected.push(
        `${asin}: $${rec.priceValue} -> $${fresh.priceValue} (${(100 * swing).toFixed(0)}% swing)`
      );
      continue;
    }
  }

  let out = rec.src
    .replace(/^price:.*$/m, `price: "${fresh.price}"`)
    .replace(/^priceValue:.*$/m, `priceValue: ${fresh.priceValue}`)
    .replace(/^image:.*$/m, `image: "${fresh.image}"`);

  // priceUpdated / availability may not exist yet on older records.
  out = /^priceUpdated:/m.test(out)
    ? out.replace(/^priceUpdated:.*$/m, `priceUpdated: ${stamp}`)
    : out.replace(/^priceValue:(.*)$/m, `priceValue:$1\npriceUpdated: ${stamp}`);
  out = /^availability:/m.test(out)
    ? out.replace(/^availability:.*$/m, `availability: ${fresh.availability}`)
    : out.replace(/^priceUpdated:(.*)$/m, `priceUpdated:$1\navailability: ${fresh.availability}`);

  if (out === rec.src) { stats.unchanged++; continue; }
  if (!dryRun) writeFileSync(join(DIR, rec.file), out, 'utf8');
  stats.updated++;
}

console.log(`\n${dryRun ? 'DRY RUN — ' : ''}refresh complete`);
console.log(`  updated:   ${stats.updated}`);
console.log(`  unchanged: ${stats.unchanged}`);
console.log(`  throttles: ${stats.throttled}`);
if (stats.rejected.length) {
  console.log(`  rejected by sanity check (${stats.rejected.length}) — review manually:`);
  for (const r of stats.rejected) console.log(`    ${r}`);
}
if (stats.dead.length) {
  console.log(`  DEAD/UNAVAILABLE (${stats.dead.length}) — consider unpublishing:`);
  for (const a of stats.dead) console.log(`    ${a}  (${byAsin.get(a).file})`);
}
