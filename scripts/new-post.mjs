/**
 * Scaffold a blog post with valid frontmatter.
 *
 * Exists because three things about a post are load-bearing and easy to get
 * wrong by hand:
 *
 *   1. The filename MUST be YYYY-MM-DD-slug.md — that is the URL, and the
 *      Decap `blog` collection declares that slug pattern.
 *   2. `category` is a fixed 8-value enum. A typo fails the build.
 *   3. The product matcher reads title + description + category ONLY. A post
 *      whose title omits the product noun gets the generic fallback block
 *      instead of relevant picks, so the wording is a monetisation decision,
 *      not just a style one.
 *
 * Usage:
 *   node scripts/new-post.mjs "Best Nursing Clipboards for Report Sheets"
 *   node scripts/new-post.mjs "..." --category "Buying Guide" --date 2026-08-02
 *   node scripts/new-post.mjs "..." --preview     # show matched products, write nothing
 */
import { writeFileSync, existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { matchProducts } from '../src/lib/match.mjs';

const BLOG_DIR = 'src/content/blog';
const CATEGORIES = [
  'Gift Guide', 'Buying Guide', 'Self-Care', 'Graduation',
  'Nurses Week', 'Holiday', 'Personalization', 'Story',
];

const argv = process.argv.slice(2);
const flag = (f) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : undefined; };
const has = (f) => argv.includes(f);

const title = argv.find((a) => !a.startsWith('--') && argv[argv.indexOf(a) - 1]?.startsWith('--') !== true);
if (!title) {
  console.error('Usage: node scripts/new-post.mjs "Post Title" [--category "Gift Guide"] [--date YYYY-MM-DD] [--preview]');
  console.error(`\nCategories: ${CATEGORIES.join(' | ')}`);
  process.exit(1);
}

const category = flag('--category') ?? 'Gift Guide';
if (!CATEGORIES.includes(category)) {
  console.error(`Invalid category "${category}".\nMust be one of: ${CATEGORIES.join(' | ')}`);
  process.exit(1);
}

const date = flag('--date') ?? new Date().toISOString().slice(0, 10);
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  console.error(`--date must be YYYY-MM-DD, got "${date}"`);
  process.exit(1);
}

const slug = title.toLowerCase()
  .replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-')
  .replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 62);
const filename = `${date}-${slug}.md`;
const path = join(BLOG_DIR, filename);

// ── show which products this title will pull in ──────────────────────────────
const rd = (p) => readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
const fm = (s, k) => {
  const m = s.match(new RegExp(`^${k}:\\s*(.*)$`, 'm'));
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : '';
};
const asList = (s, k) => {
  const v = fm(s, k);
  return v.startsWith('[') ? v.slice(1, -1).split(',').map((x) => x.trim()).filter(Boolean) : [];
};

const products = readdirSync('src/content/products').filter((f) => f.endsWith('.md')).map((f) => {
  const s = rd(join('src/content/products', f));
  return {
    data: {
      title: fm(s, 'title'), type: fm(s, 'type'),
      occasion: asList(s, 'occasion'), recipient: asList(s, 'recipient'),
      priceValue: parseFloat(fm(s, 'priceValue')) || 0,
    },
  };
});

const description = flag('--description') ?? '';
const matched = matchProducts({ title, description, category }, products, 6);

console.log(`\nTitle:    ${title}`);
console.log(`Category: ${category}`);
console.log(`URL:      /blog/${date}-${slug}/`);
console.log(`\nProducts the matcher will inject (${matched.length}):`);
if (!matched.length) {
  console.log('  NONE — this post will get the generic "Popular nurse gifts" block.');
  console.log('  Add the product noun to the title (e.g. "clipboard", "stethoscope",');
  console.log('  "tumbler") or a specialty ("ICU", "NICU") so the matcher can bind it.');
} else {
  for (const p of matched) {
    console.log(`  ${p.data.type.padEnd(14)} $${String(p.data.priceValue).padEnd(8)} ${p.data.title.slice(0, 46)}`);
  }
}

if (has('--preview')) { console.log('\n(preview only — nothing written)'); process.exit(0); }

if (existsSync(path)) {
  console.error(`\nRefusing to overwrite ${path}`);
  process.exit(1);
}

const body = `---
title: "${title.replace(/"/g, "'")}"
description: "${(description || 'TODO: 150-160 characters, written for the search result snippet.').replace(/"/g, "'")}"
pubDate: ${date}
category: "${category}"
readTime: "6 min read"
featured: false
draft: true
---

TODO — opening paragraph. Answer the query in the first two sentences; do not
warm up. The product block is injected automatically after the body, so do not
paste Amazon links inline.

## TODO section heading

TODO body.

## TODO section heading

TODO body.
`;

writeFileSync(path, body, 'utf8');
console.log(`\nCreated ${path}`);
console.log('draft: true — flip to false when ready, then `npm run build` and commit.');
