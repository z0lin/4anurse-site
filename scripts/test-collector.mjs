/**
 * Tests public/tools/asin-collector.js against synthetic Amazon-shaped markup.
 *
 * Runs the SHIPPED bookmarklet source (via eval) against a minimal DOM shim, so
 * the thing under test is the same code the browser executes rather than a copy.
 * Amazon's markup varies by category and A/B test, which is exactly the risk this
 * covers: each case below is a real layout variant.
 *
 * Usage: node scripts/test-collector.mjs
 */
import { readFileSync } from 'node:fs';

const SRC = readFileSync('public/tools/asin-collector.js', 'utf8');

// ── minimal DOM shim ────────────────────────────────────────────────────────

function makeEl(spec = {}) {
  return {
    textContent: spec.textContent ?? '',
    value: spec.value,
    src: spec.src,
    _attrs: spec.attrs ?? {},
    getAttribute(n) { return this._attrs[n] ?? null; },
    setAttribute(n, v) { this._attrs[n] = v; },
    remove() {},
    select() {},
    querySelector() { return null; },
    set style(_) {}, get style() { return { cssText: '' }; },
    set innerHTML(v) { this._html = v; }, get innerHTML() { return this._html ?? ''; },
    set onclick(_) {},
  };
}

async function runCollector({ path, byId = {}, bySelector = {}, storage = {} }) {
  const captured = { clipboard: null, toastHtml: null, stored: { ...storage } };
  const created = [];

  const doc = {
    getElementById: (id) => byId[id] ?? null,
    // firstText() reads the title via querySelector('#productTitle'), so plain
    // #id selectors must resolve against byId — not just the explicit map.
    querySelector: (sel) => {
      if (bySelector[sel]) return bySelector[sel];
      const m = /^#([\w-]+)$/.exec(sel);
      if (m && byId[m[1]]) return byId[m[1]];
      return null;
    },
    createElement: (tag) => {
      const el = makeEl();
      el.tagName = tag;
      created.push(el);
      return el;
    },
    body: { appendChild: () => {}, removeChild: () => {} },
    execCommand: () => true,
  };

  const sandbox = {
    location: { pathname: path },
    document: doc,
    localStorage: {
      getItem: (k) => captured.stored[k] ?? null,
      setItem: (k, v) => { captured.stored[k] = v; },
    },
    navigator: {
      clipboard: {
        writeText: (t) => { captured.clipboard = t; return Promise.resolve(); },
      },
    },
    JSON,
    console,
  };

  // eval the IIFE with the shim bound as locals
  const fn = new Function(
    ...Object.keys(sandbox),
    `${SRC}\n;return true;`
  );
  fn(...Object.values(sandbox));

  // The clipboard write resolves in a microtask and the final toast is rendered
  // in its callback, so flush before reading. Without this the harness sees the
  // pre-copy state and reports false failures.
  await Promise.resolve();
  await Promise.resolve();

  // The last element with content is the toast; its innerHTML holds the message.
  captured.toastHtml = created.map((c) => c.innerHTML).filter(Boolean).pop() ?? '';
  return captured;
}

// ── cases ───────────────────────────────────────────────────────────────────

let pass = 0, fail = 0;
const check = (name, cond, detail = '') => {
  if (cond) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name}${detail ? `\n          ${detail}` : ''}`); }
};

console.log('\n1. Modern buy-box layout (corePriceDisplay), dynamic image map\n');
{
  const img = makeEl({
    src: 'https://m.media-amazon.com/images/I/small._AC_SX200_.jpg',
    attrs: {
      'data-a-dynamic-image': JSON.stringify({
        'https://m.media-amazon.com/images/I/mid._SX679_.jpg': [679, 679],
        'https://m.media-amazon.com/images/I/big._SL1500_.jpg': [1500, 1500],
      }),
    },
  });
  const r = await runCollector({
    path: '/3M-Littmann/dp/B0ABCDEFGH/ref=sr_1_3',
    byId: {
      productTitle: makeEl({ textContent: '  3M Littmann Classic III Stethoscope, 5633, "Rainbow", 27 inch  ' }),
      bylineInfo: makeEl({ textContent: 'Visit the 3M Littmann Store' }),
      landingImage: img,
    },
    bySelector: {
      '#corePriceDisplay_desktop_feature_div .a-price .a-offscreen': makeEl({ textContent: '$118.25' }),
    },
  });
  const csv = r.clipboard ?? '';
  const row = csv.split('\n')[1] ?? '';
  check('ASIN from /Name/dp/ASIN/ref= URL', row.includes('https://www.amazon.com/dp/B0ABCDEFGH'), row);
  check('title trimmed', row.includes('3M Littmann Classic III'));
  check('title quoted (contains commas)', row.startsWith('https://www.amazon.com/dp/B0ABCDEFGH,"'), row.slice(0, 60));
  check('internal quotes doubled', row.includes('""Rainbow""'), row);
  check('price extracted', row.includes('$118.25'));
  check('widest image chosen over src and mid', row.includes('big._SL1500_.jpg'), row);
  check('brand cleaned of Visit the / Store', row.includes(',3M Littmann,'), row);
  check('header row present', csv.startsWith('url_or_asin,title,price,image,brand,type,occasion,recipient'));
  check('facet columns left blank for classifier', row.endsWith(',,,'), row.slice(-20));
}

console.log('\n2. Legacy layout (priceblock_ourprice), hires image, hidden ASIN input\n');
{
  const r = await runCollector({
    path: '/some/other/path',
    byId: {
      productTitle: makeEl({ textContent: 'Nurse Badge Reel' }),
      ASIN: makeEl({ value: 'b0lower123' }),
      landingImage: makeEl({ attrs: { 'data-old-hires': 'https://m.media-amazon.com/images/I/hires.jpg' } }),
      priceblock_ourprice: makeEl({ textContent: '$8.99' }),
    },
    bySelector: { '#priceblock_ourprice': makeEl({ textContent: '$8.99' }) },
  });
  const row = (r.clipboard ?? '').split('\n')[1] ?? '';
  check('falls back to #ASIN input', row.includes('B0LOWER123'), row);
  check('uppercases lowercase ASIN', row.includes('B0LOWER123') && !row.includes('b0lower123'));
  check('data-old-hires preferred', row.includes('hires.jpg'), row);
  check('legacy price selector works', row.includes('$8.99'), row);
}

console.log('\n3. Missing fields are reported, not silently blank\n');
{
  const r = await runCollector({
    path: '/dp/B0NOPRICE1',
    byId: { productTitle: makeEl({ textContent: 'Item With No Price Or Image' }) },
  });
  check('warns about missing price', /Could not read:.*price/.test(r.toastHtml), r.toastHtml.slice(0, 120));
  check('warns about missing image', /Could not read:.*image/.test(r.toastHtml));
  check('still emits a row to fix by hand', (r.clipboard ?? '').split('\n').length >= 2);
}

console.log('\n4. Non-product page is rejected\n');
{
  const r = await runCollector({ path: '/gp/cart/view.html', byId: {} });
  check('no ASIN -> refuses', /Not an Amazon product page/.test(r.toastHtml), r.toastHtml.slice(0, 80));
  check('nothing copied', r.clipboard === null);
}

console.log('\n4b. Malformed ASIN is rejected, NOT truncated\n');
{
  // Regression: an 11-char token used to match its first 10 characters, giving a
  // valid-looking ASIN for a different product — a live affiliate link to the
  // wrong item. Found by feeding the importer bad test data.
  const r = await runCollector({
    path: '/dp/B0TOOLONG123',
    byId: { productTitle: makeEl({ textContent: 'Eleven Char Asin Product' }) },
  });
  check('11-char ASIN in URL is not truncated', r.clipboard === null, String(r.clipboard).slice(0, 60));
  check('reports it as not a product page', /Not an Amazon product page/.test(r.toastHtml));

  const short = await runCollector({
    path: '/dp/B0SHORT',
    byId: { productTitle: makeEl({ textContent: 'Too Short Asin' }) },
  });
  check('9-char ASIN also rejected', short.clipboard === null);
}

console.log('\n5. Accumulation and de-duplication across clicks\n');
{
  const first = await runCollector({
    path: '/dp/B0FIRST001',
    byId: { productTitle: makeEl({ textContent: 'First Product Here' }) },
    bySelector: { '.a-price .a-offscreen': makeEl({ textContent: '$10.00' }) },
  });
  const second = await runCollector({
    path: '/dp/B0SECOND02',
    byId: { productTitle: makeEl({ textContent: 'Second Product Here' }) },
    bySelector: { '.a-price .a-offscreen': makeEl({ textContent: '$20.00' }) },
    storage: first.stored,
  });
  const dupe = await runCollector({
    path: '/dp/B0FIRST001',
    byId: { productTitle: makeEl({ textContent: 'First Product Here' }) },
    bySelector: { '.a-price .a-offscreen': makeEl({ textContent: '$10.00' }) },
    storage: second.stored,
  });
  const lines = (l) => (l ?? '').trim().split('\n').length - 1; // minus header
  check('first click -> 1 row', lines(first.clipboard) === 1, String(lines(first.clipboard)));
  check('second click -> 2 rows (accumulates)', lines(second.clipboard) === 2, String(lines(second.clipboard)));
  check('re-clicking same product does not duplicate', lines(dupe.clipboard) === 2, String(lines(dupe.clipboard)));
  check('duplicate is reported to the user', /Already collected/.test(dupe.toastHtml), dupe.toastHtml.slice(0, 60));
}

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
