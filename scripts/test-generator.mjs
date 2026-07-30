/**
 * Tests for the weekly post generator's publication gates.
 *
 * These matter more than a normal test suite: the generator publishes to main
 * with no human review, so src/lib/post-gates.mjs IS the review. Everything
 * here imports the real functions — a test that re-implemented the checks would
 * only prove the copy works.
 *
 * Run: node scripts/test-generator.mjs
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  MIN_PRODUCTS, MIN_WORDS,
  tooSimilar, boundProducts, bodyProblems, wordCount, parseBacklog, significantWords,
} from '../src/lib/post-gates.mjs';

let pass = 0, fail = 0;
const ok = (name) => { pass++; console.log(`  ok    ${name}`); };
const bad = (name, detail) => { fail++; console.log(`  FAIL  ${name}${detail ? `  -> ${detail}` : ''}`); };
const check = (name, cond, detail) => (cond ? ok(name) : bad(name, detail));

// ── real data ────────────────────────────────────────────────────────────────
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
const existing = readdirSync('src/content/blog').filter((f) => f.endsWith('.md'))
  .map((f) => fm(rd(join('src/content/blog', f)), 'title')).filter(Boolean);

const filler = 'word '.repeat(MIN_WORDS + 50);
const clean = `## One\n${filler}\n## Two\n${filler}\n## Three\n${filler}`;

console.log(`\nfixtures: ${products.length} products, ${existing.length} existing titles\n`);

// ── dedupe gate ──────────────────────────────────────────────────────────────
console.log('DEDUPE — must not republish an existing post');
for (const t of existing.slice(0, 25)) {
  if (tooSimilar(t, existing) === null) { bad('every real existing title is caught verbatim', `missed "${t}"`); break; }
}
if (!existing.slice(0, 25).some((t) => tooSimilar(t, existing) === null)) ok('every real existing title is caught verbatim');

check('catches a reworded duplicate',
  tooSimilar('Sip in Style: Personalized Tumblers for Nurses', existing) !== null);
check('catches a title with only stopwords',
  tooSimilar('The Best Gifts for Nurses', existing) !== null);
check('allows a genuinely new angle',
  tooSimilar('Gifts for Nurse Practitioners Who Run Their Own Panel', existing) === null,
  tooSimilar('Gifts for Nurse Practitioners Who Run Their Own Panel', existing));
check('allows the clipboard post against a catalog that lacks it',
  tooSimilar('Foldable Clipboards for Report Sheets', existing.filter((t) => !/clipboard/i.test(t))) === null);
check('empty existing list allows anything', tooSimilar('Anything At All Here', []) === null);
check('significantWords drops stopwords',
  !significantWords('The Best Gifts for Nurses').has('gifts'));

// ── match gate ───────────────────────────────────────────────────────────────
console.log('\nMATCH — a post must bind real products or it earns nothing');
const matchCases = [
  ['Gifts for Nurse Practitioners: Stethoscopes and Jewelry', 'Gift Guide', true],
  ['The Best Badge Reels and Lanyards for NICU Nurses', 'Buying Guide', true],
  ['Mother’s Day Gifts for Nurse Moms: Jewelry and Drinkware', 'Gift Guide', true],
  ['Nursing Clipboards That Fit a Scrub Pocket', 'Buying Guide', true],
  ['Thoughtful Gifts They Will Absolutely Love', 'Gift Guide', false],
  ['A Meaningful Present for Someone Truly Special', 'Gift Guide', false],
];
for (const [title, category, shouldBind] of matchCases) {
  const n = boundProducts({ title, description: '', category }, products).length;
  check(`${shouldBind ? 'binds' : 'blocks'}: "${title.slice(0, 44)}"`,
    shouldBind ? n >= MIN_PRODUCTS : n < MIN_PRODUCTS, `matched ${n}`);
}
check('match gate agrees with the live matcher (same fn, same fields)',
  boundProducts({ title: 'Nursing Clipboards for Brain Sheets', description: '', category: 'Buying Guide' }, products)
    .every((p) => p.data.type === 'clipboards'));

// ── quality gate ─────────────────────────────────────────────────────────────
console.log('\nQUALITY — body must be publishable as-is');
check('passes a clean body', bodyProblems(clean).length === 0, bodyProblems(clean).join('; '));
check('blocks a pasted Amazon URL',
  bodyProblems(`${clean}\nSee https://www.amazon.com/dp/B01ABCDEFG here.`).some((p) => /affiliate|Amazon/i.test(p)));
check('blocks a bare /dp/ path',
  bodyProblems(`${clean}\n[this one](/dp/B01ABCDEFG)`).some((p) => /affiliate|Amazon/i.test(p)));
check('blocks an amzn.to shortlink',
  bodyProblems(`${clean}\nhttps://amzn.to/3abcdef`).some((p) => /affiliate|Amazon/i.test(p)));
check('blocks a leaked affiliate tag',
  bodyProblems(`${clean}\n?tag=4anurse05-20`).some((p) => /affiliate|Amazon/i.test(p)));
check('blocks TODO placeholder', bodyProblems(`${clean}\nTODO write this bit`).some((p) => /placeholder/i.test(p)));
check('blocks lorem ipsum', bodyProblems(`${clean}\nlorem ipsum dolor`).some((p) => /placeholder/i.test(p)));
check('blocks an H1', bodyProblems(`# A Title\n${clean}`).some((p) => /H1/.test(p)));
check('blocks a frontmatter block', bodyProblems(`---\ntitle: x\n---\n${clean}`).some((p) => /frontmatter|H1/i.test(p)));
check('blocks a short body', bodyProblems('## One\n## Two\n## Three\ntoo short').some((p) => /words/.test(p)));
check('blocks too few headings', bodyProblems(`## Only one\n${filler}`).some((p) => /H2/.test(p)));
check('blocks an empty body', bodyProblems('').length > 0);
check('blocks a wildly over-length body',
  bodyProblems(`## A\n## B\n## C\n${'word '.repeat(4000)}`).some((p) => /over the/.test(p)));
check('wordCount("") is 0', wordCount('') === 0);
check('wordCount counts words', wordCount('one two three') === 3);

// ── backlog parsing ──────────────────────────────────────────────────────────
console.log('\nBACKLOG — must read only the writable table');
const rows = parseBacklog(rd('BLOG-BACKLOG.md'));
check('finds un-done topics', rows.length > 0, `${rows.length}`);
check('skips rows already marked DONE', !rows.some((r) => /DONE|~~/.test(r.line)));
check('sorted by rank', rows.every((r, i) => i === 0 || rows[i - 1].rank <= r.rank));
check('excludes the blocked-on-stock table (male nurses has 0 products)',
  !rows.some((r) => /male nurse/i.test(r.topic)));
check('excludes the saturated-themes list',
  !rows.some((r) => /self-care|christmas/i.test(r.topic)));
check('parses the product count', rows[0] && Number.isFinite(rows[0].products));
check('a fully-done backlog yields zero rows',
  parseBacklog(rd('BLOG-BACKLOG.md').replace(/^\| (\d+) \| (?!~~)/gm, '| $1 | ~~DONE~~ ')).length === 0);

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
