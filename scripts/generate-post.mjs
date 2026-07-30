/**
 * Generate one blog post from BLOG-BACKLOG.md, unattended.
 *
 * Runs weekly from .github/workflows/weekly-post.yml and commits straight to
 * main. There is no human review step, so every safeguard has to live in the
 * pipeline. The gates are:
 *
 *   1. KILL SWITCH   — PAUSE-BLOG file or PAUSE_BLOG=1 stops the run
 *   2. TOPIC         — next un-done backlog row; EXHAUSTED stops cleanly
 *   3. DEDUPE        — rejected if too similar to any existing title
 *   4. MATCH GATE    — the title MUST bind >= MIN_PRODUCTS real products
 *   5. QUALITY GATE  — length, structure, no pasted links, no placeholders
 *   6. BUILD         — the workflow runs `npm run build` before it commits
 *
 * Gates 3-5 live in src/lib/post-gates.mjs and are covered by
 * scripts/test-generator.mjs, so they can be changed with a test behind them.
 *
 * Gate 2 matters more than it looks. A generator that runs out of topics and
 * keeps writing anyway produces exactly the 320 near-duplicate posts this site
 * is already carrying. Running dry is a valid weekly outcome — it exits 0,
 * writes nothing, and says so.
 *
 * Gate 4 is the monetisation gate. The build-time matcher reads title +
 * description ONLY, so a title without a product noun silently earns nothing.
 * Validating the title BEFORE writing the body also lets the body prompt name
 * the products that will actually appear beneath it, so the prose and the block
 * agree.
 *
 * Usage:
 *   node scripts/generate-post.mjs                 # write the post
 *   node scripts/generate-post.mjs --dry-run       # print it, write nothing
 *   node scripts/generate-post.mjs --topic "..."   # override topic selection
 */
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  MIN_PRODUCTS, MIN_WORDS, MAX_WORDS,
  tooSimilar, boundProducts, bodyProblems, wordCount, parseBacklog,
} from '../src/lib/post-gates.mjs';

const MODEL = 'claude-opus-5';
/** Claude Opus 5, $ per million tokens. Reported each run so spend stays visible. */
const PRICE = { input: 5, output: 25 };

const BLOG_DIR = 'src/content/blog';
const BACKLOG = 'BLOG-BACKLOG.md';
const PAUSE_FILES = ['PAUSE-BLOG', 'imports/PAUSE-BLOG'];
const TITLE_ATTEMPTS = 3;

const CATEGORIES = [
  'Gift Guide', 'Buying Guide', 'Self-Care', 'Graduation',
  'Nurses Week', 'Holiday', 'Personalization', 'Story',
];

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const flag = (f) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : undefined; };
const DRY = has('--dry-run');

const log = (m) => console.log(m);
const notice = (m) => log(`::notice::${m}`);
const fail = (m) => { console.error(`::error::${m}`); process.exit(1); };

// ── 1. kill switch ───────────────────────────────────────────────────────────
for (const f of PAUSE_FILES) {
  if (existsSync(f)) { notice(`Paused: ${f} exists. Delete it to resume weekly posts.`); process.exit(0); }
}
if (process.env.PAUSE_BLOG === '1') { notice('Paused: PAUSE_BLOG=1.'); process.exit(0); }

// ── frontmatter helpers (same shape the other scripts use) ───────────────────
const rd = (p) => readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
const fm = (s, k) => {
  const m = s.match(new RegExp(`^${k}:\\s*(.*)$`, 'm'));
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : '';
};
const asList = (s, k) => {
  const v = fm(s, k);
  return v.startsWith('[') ? v.slice(1, -1).split(',').map((x) => x.trim()).filter(Boolean) : [];
};

// ── 2. pick the topic ────────────────────────────────────────────────────────
const override = flag('--topic');
const backlog = parseBacklog(rd(BACKLOG));

if (!override && !backlog.length) {
  notice('Backlog exhausted — no un-done topics in BLOG-BACKLOG.md.');
  notice('This is a clean stop, not a failure. Add topics there to resume.');
  process.exit(0);
}
const chosen = override ? { topic: override, products: null, line: null } : backlog[0];
log(`Topic: ${chosen.topic}${chosen.products != null ? `  (${chosen.products} products in stock)` : ''}`);

// ── the catalog and the existing titles ──────────────────────────────────────
const products = readdirSync('src/content/products').filter((f) => f.endsWith('.md')).map((f) => {
  const s = rd(join('src/content/products', f));
  return {
    data: {
      title: fm(s, 'title'), type: fm(s, 'type'), brand: fm(s, 'brand'),
      occasion: asList(s, 'occasion'), recipient: asList(s, 'recipient'),
      priceValue: parseFloat(fm(s, 'priceValue')) || 0,
    },
  };
});

const existingTitles = readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'))
  .map((f) => fm(rd(join(BLOG_DIR, f)), 'title')).filter(Boolean);

log(`Catalog: ${products.length} products | existing posts: ${existingTitles.length}`);

// ── the model ────────────────────────────────────────────────────────────────
if (!process.env.ANTHROPIC_API_KEY) {
  fail('ANTHROPIC_API_KEY is not set. Add it under Settings -> Secrets and variables -> Actions.');
}
const client = new Anthropic();

const VOICE = `
You write for 4aNurse, a nurse gift and gear site. House voice:

- Answer the query in the first two sentences. No warm-up, no "In today's world".
- Concrete and specific. Name the real constraint (scrub pockets, twelve-hour
  shifts, night shift, infection control) rather than gesturing at "hard work".
- Be willing to say what NOT to buy, and why. That is what makes the rest credible.
- Second person, plain sentences, no hedging.
- No emoji. Never use: elevate, curated, game-changer, must-have, look no further,
  in today's fast-paced world, whether you're a seasoned pro.
- Close by matching the item to the reader's situation, not with a summary.
`.trim();

const RULES = `
Hard rules:

- Do NOT paste Amazon links, URLs, or affiliate links of any kind. A product
  block with correct affiliate tags is injected automatically below your text.
- Do NOT write specific dollar prices for named products. Prices change and the
  injected block shows the live figure. Broad ranges ("around $20", "north of
  $200") are fine; "$24.95" is not.
- Do NOT invent product names, brands, features, or clinical claims.
- Do NOT write frontmatter, an H1, or a "Conclusion" heading.
- Use ## for section headings, 4 to 6 of them.
- No placeholder text (TODO, TK, lorem ipsum).
`.trim();

/** Title + description + category, validated against the dedupe and match gates. */
async function generateTitle(rejected) {
  const schema = {
    type: 'object',
    properties: {
      title: { type: 'string', description: '55-70 characters. MUST contain a concrete product noun or a nursing specialty.' },
      description: { type: 'string', description: '140-160 characters, written for the search result snippet.' },
      category: { type: 'string', enum: CATEGORIES },
    },
    required: ['title', 'description', 'category'],
    additionalProperties: false,
  };

  const typeList = [...new Set(products.map((p) => p.data.type))].sort().join(', ');
  const rejectionNote = rejected.length
    ? `\n\nAlready tried and REJECTED — do not repeat their shape:\n${rejected.map((r) => `- "${r.title}" — ${r.why}`).join('\n')}`
    : '';

  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 4000,
    thinking: { type: 'adaptive' },
    system: VOICE,
    output_config: { format: { type: 'json_schema', schema } },
    messages: [{
      role: 'user',
      content: `Write the title, meta description and category for a new post on this topic:

  ${chosen.topic}

CRITICAL — the title decides whether this post earns anything. A build-time
matcher reads ONLY the title and description to choose which products appear
beneath the post. It matches concrete product types and nursing specialties.

Product types in the catalog: ${typeList}
Specialties it recognises: NICU, ICU, ER, pediatric, school nurse, student, NP, CNA, LPN, leader, nurse mom

So the title must name a concrete product noun (clipboard, stethoscope, tumbler,
badge reel, jewelry, journal) or a specialty (NICU, ER, LPN). A vague title such
as "Thoughtful Gifts They'll Love" matches nothing and earns nothing.

The title must also not restate an existing post. Be specific about the angle.

Category must be one of: ${CATEGORIES.join(', ')}${rejectionNote}`,
    }],
  });

  if (res.stop_reason === 'refusal') {
    fail(`Model declined the title request (${res.stop_details?.category ?? 'unknown'}). The topic may need rewording.`);
  }
  const text = res.content.find((b) => b.type === 'text')?.text ?? '';
  try {
    return { ...JSON.parse(text), usage: res.usage };
  } catch {
    return fail(`Title response was not valid JSON:\n${text.slice(0, 400)}`);
  }
}

async function generateBody(meta, matched) {
  const inventory = matched.map((p) =>
    `- ${p.data.title} — type: ${p.data.type}${p.data.brand ? `, brand: ${p.data.brand}` : ''}`
  ).join('\n');

  // Streamed: a long body at default (high) effort can outrun the SDK's HTTP
  // timeout, and streaming removes that failure mode outright.
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: 'adaptive' },
    system: VOICE,
    messages: [{
      role: 'user',
      content: `Write the body of this post. Markdown only — no frontmatter, no H1.

Title:       ${meta.title}
Description: ${meta.description}
Category:    ${meta.category}

Target ${MIN_WORDS}-${MAX_WORDS} words.

These are the actual products that will appear in the block directly beneath
your text. Write about THIS stock — the reader scrolls straight from your words
into these items, so the two should agree. Discuss them by category and feature,
never by exact price:

${inventory}

${RULES}`,
    }],
  });

  const res = await stream.finalMessage();
  if (res.stop_reason === 'refusal') {
    fail(`Model declined the body request (${res.stop_details?.category ?? 'unknown'}).`);
  }
  if (res.stop_reason === 'max_tokens') {
    fail('Body hit max_tokens and is truncated — refusing to publish a cut-off post.');
  }
  return { body: res.content.find((b) => b.type === 'text')?.text ?? '', usage: res.usage };
}

// ── 3 + 4. title, dedupe and match gates, with retries ───────────────────────
let meta = null;
let matched = [];
let titleTokens = { input: 0, output: 0 };
const rejected = [];

for (let attempt = 1; attempt <= TITLE_ATTEMPTS; attempt++) {
  const candidate = await generateTitle(rejected);
  titleTokens.input += candidate.usage?.input_tokens ?? 0;
  titleTokens.output += candidate.usage?.output_tokens ?? 0;
  log(`\nAttempt ${attempt}: "${candidate.title}"  [${candidate.category}]`);

  const dupe = tooSimilar(candidate.title, existingTitles);
  if (dupe) {
    log(`  REJECTED — ${dupe}`);
    rejected.push({ title: candidate.title, why: `too similar to an existing post (${dupe})` });
    continue;
  }

  const picks = boundProducts(candidate, products, 6);
  log(`  binds ${picks.length} product(s): ${picks.map((p) => p.data.type).join(', ') || 'none'}`);

  if (picks.length < MIN_PRODUCTS) {
    log(`  REJECTED — needs at least ${MIN_PRODUCTS}`);
    rejected.push({
      title: candidate.title,
      why: `matched only ${picks.length} products; needs a more concrete product noun or specialty`,
    });
    continue;
  }

  meta = candidate;
  matched = picks;
  log('  ACCEPTED');
  break;
}

if (!meta) {
  fail(`No usable title after ${TITLE_ATTEMPTS} attempts for "${chosen.topic}". Nothing written. ` +
       'The topic may be too vague, or its products may already be well covered.');
}

// ── body + 5. quality gates ──────────────────────────────────────────────────
log('\nWriting body...');
const { body, usage: bodyUsage } = await generateBody(meta, matched);

const problems = bodyProblems(body);
if (problems.length) fail(`Body failed the quality gates:\n  - ${problems.join('\n  - ')}`);

const words = wordCount(body);
log(`Body OK: ${words} words, ${(body.match(/^## /gm) ?? []).length} sections`);

// ── assemble ─────────────────────────────────────────────────────────────────
const date = new Date().toISOString().slice(0, 10);
const slug = meta.title.toLowerCase()
  .replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-')
  .replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 62);
const path = join(BLOG_DIR, `${date}-${slug}.md`);

if (existsSync(path)) fail(`${path} already exists — refusing to overwrite.`);

const esc = (s) => String(s).replace(/"/g, "'").replace(/\s+/g, ' ').trim();
const file = `---
title: "${esc(meta.title)}"
description: "${esc(meta.description)}"
pubDate: ${date}
category: "${meta.category}"
readTime: "${Math.max(3, Math.round(words / 200))} min read"
featured: false
draft: false
---

${body.trim()}
`;

// ── cost ─────────────────────────────────────────────────────────────────────
const inTok = titleTokens.input + (bodyUsage.input_tokens ?? 0);
const outTok = titleTokens.output + (bodyUsage.output_tokens ?? 0);
const cost = (inTok / 1e6) * PRICE.input + (outTok / 1e6) * PRICE.output;

log('\n' + '-'.repeat(62));
log(`Title:    ${meta.title}`);
log(`URL:      /blog/${date}-${slug}/`);
log(`Products: ${matched.length}`);
log(`Tokens:   ${inTok} in / ${outTok} out  (~$${cost.toFixed(3)} on ${MODEL})`);
log('-'.repeat(62));

if (DRY) {
  log('\n--dry-run — nothing written. File would be:\n');
  log(file);
  process.exit(0);
}

writeFileSync(path, file, 'utf8');
log(`\nWrote ${path}`);

// ── mark the backlog row done so next week takes the next topic ──────────────
if (chosen.line) {
  const md = rd(BACKLOG);
  const done = chosen.line
    .replace(`| ${chosen.topic} |`, `| ~~${chosen.topic}~~ |`)
    .replace(/\|([^|]*)\|\s*$/, `| **DONE** ${date} |`);
  writeFileSync(BACKLOG, md.replace(chosen.line, done), 'utf8');
  log(`Marked "${chosen.topic}" done in ${BACKLOG}`);
}

// Consumed by the workflow for the commit message and the run summary.
if (process.env.GITHUB_OUTPUT) {
  writeFileSync(process.env.GITHUB_OUTPUT, [
    `path=${path}`,
    `title=${meta.title}`,
    `slug=${date}-${slug}`,
    `topic=${chosen.topic}`,
    `products=${matched.length}`,
    `words=${words}`,
    `cost=${cost.toFixed(3)}`,
  ].join('\n') + '\n', { flag: 'a' });
}
log(`Remaining backlog topics: ${Math.max(0, backlog.length - 1)}`);
