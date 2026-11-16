#!/usr/bin/env node
/**
 * Quality gate for a blog post before it can publish (used by the automated
 * writer, and safe to run by hand):
 *
 *   node scripts/check-post.mjs src/content/blog/<file>.md
 *
 * Exit 0 = pass. Anything printed under ERRORS blocks publishing.
 *
 * Why these rules: the blog is the part of the site most exposed to Google's
 * scaled content policy, so every post must be substantial, original, link to
 * real pages on this site, and follow Matt's writing rules (no em/en dashes,
 * no hyphen-joined words in prose, no prices that go stale, no claims of hands
 * on testing). Product cards are injected by the build; the body must not
 * paste Amazon links.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const file = process.argv[2];
if (!file) { console.error('usage: node scripts/check-post.mjs <post.md>'); process.exit(2); }
const raw = readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
const [, fm, ...rest] = raw.split(/^---$/m);
const body = rest.join('---');
const get = (k) => fm.match(new RegExp(`^${k}:\\s*(.*)$`, 'm'))?.[1]?.trim().replace(/^["']|["']$/g, '') ?? '';

const errors = []; const warnings = [];
const CATEGORIES = ['Gift Guide', 'Buying Guide', 'Self-Care', 'Graduation', 'Nurses Week', 'Holiday', 'Personalization', 'Story'];

// Frontmatter
const title = get('title'); const desc = get('description');
if (!title) errors.push('title missing');
if (title.length > 90) warnings.push(`title is ${title.length} chars`);
if (desc.length < 110 || desc.length > 170) errors.push(`description is ${desc.length} chars (need 110 to 170)`);
if (!CATEGORIES.includes(get('category'))) errors.push(`category "${get('category')}" not in ${CATEGORIES.join(', ')}`);
if (!/^\d{4}-\d{2}-\d{2}$/.test(get('pubDate'))) errors.push('pubDate must be YYYY-MM-DD');
if (/TODO/.test(raw)) errors.push('still contains TODO placeholders');

// Visible prose = body minus link targets, code, and HTML tags
const prose = (fm.match(/^(title|description):.*$/gm) ?? []).join(' ') + ' ' + body
  .replace(/```[\s\S]*?```/g, ' ')
  .replace(/\]\([^)]*\)/g, ']')
  .replace(/<[^>]+>/g, ' ');

if (/[\u2012\u2013\u2014\u2015]/.test(prose)) errors.push(`em/en dash: "${prose.match(/.{0,30}[\u2012-\u2015].{0,30}/)[0]}"`);
const hy = prose.match(/\b[A-Za-z]+-[A-Za-z]+\b/g)?.filter((w) => !/^(e-mail|X-ray|x-ray|T-shirt|t-shirt)$/i.test(w)) ?? [];
if (hy.length) errors.push(`hyphen-joined words in prose: ${[...new Set(hy)].slice(0, 8).join(', ')}`);
if (/\$\s?\d/.test(body)) errors.push('mentions a dollar amount in the body (prices go stale; link the budget pages instead)');
if (/\b(we|I) (tested|tried|used|own|bought)\b|in (our|my) testing|hands[ -]on/i.test(prose)) errors.push('claims first hand testing');
if (/amazon\.com|amzn\.to/i.test(body)) errors.push('body pastes an Amazon link (the build injects product cards with the tag)');
for (const h of ['game changer', 'look no further', "whether you're", 'in today', 'delve', 'testament to', 'unleash', 'elevate your']) {
  if (prose.toLowerCase().includes(h)) errors.push(`hype phrase "${h}"`);
}

// Substance
const words = body.replace(/[#*>\-\[\]()]/g, ' ').split(/\s+/).filter(Boolean).length;
if (words < 900) errors.push(`only ${words} words (minimum 900)`);
const h2 = (body.match(/^## /gm) ?? []).length;
if (h2 < 4) errors.push(`only ${h2} H2 sections (minimum 4)`);

// Internal links must point at real pages
const giftSlugs = new Set(readdirSync(join(ROOT, 'src/content/giftpages')).map((f) => f.replace('.json', '')));
const catSlugs = new Set(readdirSync(join(ROOT, 'src/content/categories')).map((f) => f.replace('.md', '')));
const hubSlugs = new Set(readdirSync(join(ROOT, 'src/content/hubs')).map((f) => f.replace('.md', '')));
const blogSlugs = new Set(readdirSync(join(ROOT, 'src/content/blog')).map((f) => f.replace('.md', '')));
const pages = new Set(readdirSync(join(ROOT, 'src/pages')).filter((f) => f.endsWith('.astro') && !f.startsWith('[')).map((f) => f.replace('.astro', '')));
const links = [...body.matchAll(/\]\((\/[^)\s]*)\)/g)].map((m) => m[1]);
let giftLinks = 0;
for (const l of links) {
  const p = l.split('#')[0].replace(/\/$/, '').split('/').filter(Boolean);
  let ok = false;
  if (p[0] === 'gift' && giftSlugs.has(p[1])) { ok = true; giftLinks++; }
  else if (p[0] === 'gifts' && (p.length === 1 || catSlugs.has(p[1]))) ok = true;
  else if (p[0] === 'blog' && (p.length === 1 || blogSlugs.has(p[1]))) ok = true;
  else if (p.length === 1 && (hubSlugs.has(p[0]) || pages.has(p[0]))) ok = true;
  else if (p.length === 0) ok = true;
  if (!ok) errors.push(`internal link to a page that does not exist: ${l}`);
  if (!l.endsWith('/') && !l.includes('#')) errors.push(`internal link must end with a slash: ${l}`);
}
if (giftLinks < 4) errors.push(`links ${giftLinks} product pages (/gift/...); minimum 4`);
if (links.length - giftLinks < 1) errors.push('needs at least one link to a category, hub, or guide page');

// Near-duplicate title check against existing posts
const norm = (s) => new Set(s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((w) => w.length > 3));
const mine = norm(title);
for (const f of readdirSync(join(ROOT, 'src/content/blog'))) {
  if (join(ROOT, 'src/content/blog', f) === join(ROOT, file) || file.endsWith(f)) continue;
  const t = readFileSync(join(ROOT, 'src/content/blog', f), 'utf8').match(/^title:\s*(.*)$/m)?.[1] ?? '';
  const o = norm(t); const inter = [...mine].filter((w) => o.has(w)).length;
  const jac = inter / (new Set([...mine, ...o]).size || 1);
  if (jac >= 0.75) warnings.push(`title is very close to existing post ${f}`);
}

console.log(`${file}\n  ${words} words, ${h2} sections, ${giftLinks} product page links, ${links.length} internal links`);
for (const w of warnings) console.log(`  warn: ${w}`);
if (errors.length) { console.log(`ERRORS (${errors.length}):\n  - ${errors.join('\n  - ')}`); process.exit(1); }
console.log('  PASS');
