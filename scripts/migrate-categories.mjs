/**
 * Migrate the 9 category pages from `categoryId` to facet selectors.
 *
 * Every existing /gifts/<slug>/ URL is preserved — none are renamed or
 * redirected. The mapping below is the whole point of the change, so it is
 * explicit rather than derived.
 *
 * Usage: node scripts/migrate-categories.mjs [--dry-run]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'src/content/categories';
const dryRun = process.argv.includes('--dry-run');

const MAP = {
  // `accessories` was the dumping ground (77 products). Rather than redirect a
  // ranking URL, it becomes the parent hub for the seven types it split into —
  // which is exactly what its existing intro copy already describes.
  accessories: {
    order: 10,
    types: ['stethoscopes', 'badge-reels', 'clipboards', 'bags', 'medical-tools', 'reference-cards', 'vein-finders'],
  },
  // `graduation` is an OCCASION now, not a product type. The URL stays.
  graduation: { order: 20, occasions: ['graduation'] },

  drinkware:   { order: 30, types: ['drinkware'] },
  jewelry:     { order: 40, types: ['jewelry'] },
  books:       { order: 50, types: ['books'] },
  home:        { order: 60, types: ['home-decor'] },
  'self-care': { order: 70, types: ['self-care'] },
  // `humor` maps to games-media: the Grey's Anatomy box set, Monopoly, tarot
  // stickers. Funny mugs and badge reels live on their own type pages.
  humor:       { order: 80, types: ['games-media'] },
  apparel:     { order: 90, types: ['apparel'] },
};

let changed = 0;
for (const [slug, sel] of Object.entries(MAP)) {
  const path = join(DIR, `${slug}.md`);
  const src = readFileSync(path, 'utf8');

  if (!/^categoryId:/m.test(src)) {
    console.log(`  SKIP  ${slug}.md (no categoryId — already migrated?)`);
    continue;
  }

  const lines = [];
  if (sel.types?.length) lines.push(`types: [${sel.types.join(', ')}]`);
  if (sel.occasions?.length) lines.push(`occasions: [${sel.occasions.join(', ')}]`);
  if (sel.recipients?.length) lines.push(`recipients: [${sel.recipients.join(', ')}]`);
  lines.push(`order: ${sel.order}`);

  // Replace the categoryId line in place so field order stays readable.
  const out = src.replace(/^categoryId:.*$/m, lines.join('\n'));
  if (out === src) { console.log(`  NO-OP ${slug}.md`); continue; }

  if (!dryRun) writeFileSync(path, out, 'utf8');
  const n = (sel.types?.length ?? 0) + (sel.occasions?.length ?? 0) + (sel.recipients?.length ?? 0);
  console.log(`  ${dryRun ? 'DRY  ' : 'OK   '} ${slug}.md -> ${n} facet value(s)`);
  changed++;
}
console.log(`\n${dryRun ? 'DRY RUN — ' : ''}${changed} category page(s) migrated`);
