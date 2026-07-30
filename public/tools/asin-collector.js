/**
 * ASIN Collector — bookmarklet source.
 *
 * Reads the product page you are already looking at and appends a CSV row to a
 * running list, then puts the whole CSV on your clipboard. Paste into a file and
 * feed it to `node scripts/ingest.mjs --import`.
 *
 * This is NOT a scraper. It does not crawl, fetch, or automate anything: it reads
 * the DOM of a page you deliberately opened in your own browser and writes text
 * to your clipboard. No requests are made, nothing leaves your machine, and no
 * page is visited that you did not visit yourself.
 *
 * Amazon's markup varies by category and A/B test, so every field has several
 * fallbacks and the toast reports anything it could not find rather than silently
 * emitting a broken row.
 *
 * Edit this file; /tools/collector.html builds the bookmarklet from it at load
 * time, so there is one source of truth.
 */
(function () {
  var KEY = '4anurse_collector_rows';
  var HEADER = 'url_or_asin,title,price,image,brand,type,occasion,recipient';

  // ── extraction ───────────────────────────────────────────────────────────
  function firstText(selectors) {
    for (var i = 0; i < selectors.length; i++) {
      var el = document.querySelector(selectors[i]);
      if (el) {
        var t = (el.textContent || '').trim();
        if (t) return t;
      }
    }
    return '';
  }

  function getAsin() {
    // The (?![A-Z0-9]) is load-bearing: without it an 11-char token silently
    // matches its first 10 characters, yielding a valid-looking ASIN for a
    // DIFFERENT product. Better to find nothing than to link to the wrong item.
    var m = location.pathname.match(/\/(?:dp|gp\/product|gp\/aw\/d)\/([A-Z0-9]{10})(?![A-Z0-9])/i);
    if (m) return m[1].toUpperCase();
    var input = document.getElementById('ASIN') || document.querySelector('input[name="ASIN"]');
    var iv = input && input.value && String(input.value).trim();
    if (iv && /^[A-Z0-9]{10}$/i.test(iv)) return iv.toUpperCase();
    var d = document.querySelector('[data-asin]');
    var v = d && d.getAttribute('data-asin');
    return v && /^[A-Z0-9]{10}$/i.test(v) ? v.toUpperCase() : '';
  }

  function getPrice() {
    // Ordered most-specific first. .a-offscreen holds the screen-reader price,
    // which is the cleanest single string Amazon exposes.
    //
    // BOOKS are the important special case and the reason this list is long:
    // book pages have no standard buy box. The price lives in the format-selector
    // swatches (#tmmSwatches / .swatchElement) or a bare #price, so a collector
    // that only knows the buy box returns nothing on every book — which is how a
    // whole batch of study guides and textbooks arrived with empty prices.
    var t = firstText([
      '#corePriceDisplay_desktop_feature_div .a-price .a-offscreen',
      '#corePrice_feature_div .a-price .a-offscreen',
      '#corePrice_desktop .a-price .a-offscreen',
      '.priceToPay .a-offscreen',
      '#priceblock_ourprice',
      '#priceblock_dealprice',
      '#priceblock_saleprice',
      '#price_inside_buybox',
      // book / media format selector
      '#tmmSwatches .swatchElement.selected .a-color-price',
      '#tmmSwatches .a-color-price',
      '#tmm-grid-swatch-PAPERBACK .a-color-price',
      '#tmm-grid-swatch-HARDCOVER .a-color-price',
      '#tmm-grid-swatch-SPIRAL_BOUND .a-color-price',
      '.kindle-price .a-color-price',
      '#price',
      // last resort: any price-shaped string on the page
      '.a-price .a-offscreen',
      '.a-color-price'
    ]);
    var m = t.match(/\$\s?[\d,]+(?:\.\d{2})?/);
    return m ? m[0].replace(/[\s,]/g, function (c) { return c === ',' ? ',' : ''; }) : '';
  }

  function getImage() {
    var img = document.getElementById('landingImage') || document.getElementById('imgBlkFront');
    if (img) {
      var hires = img.getAttribute('data-old-hires');
      if (hires) return hires;
      // data-a-dynamic-image is a JSON map of url -> [w,h]; take the widest.
      var dyn = img.getAttribute('data-a-dynamic-image');
      if (dyn) {
        try {
          var map = JSON.parse(dyn);
          var best = '', bestW = 0;
          for (var url in map) {
            var w = (map[url] && map[url][0]) || 0;
            if (w > bestW) { bestW = w; best = url; }
          }
          if (best) return best;
        } catch (e) { /* fall through to src */ }
      }
      if (img.src) return img.src;
    }
    var og = document.querySelector('meta[property="og:image"]');
    return (og && og.getAttribute('content')) || '';
  }

  function getBrand() {
    // Product pages give "Brand". BOOK pages give a multi-line author block:
    //   "by \n MyNurseNotes.com \n (Author) \n Format: Spiral-bound"
    // Newlines survive into a quoted CSV field and then into YAML frontmatter,
    // so collapse whitespace first and cut at the first role/format marker.
    var t = firstText(['#bylineInfo', '#brand', 'a#bylineInfo', '#bylineContributor'])
      .replace(/\s+/g, ' ')
      .trim();
    if (!t) return '';
    t = t.replace(/^by\s+/i, '');
    t = t.split(/\s*\((?:Author|Editor|Illustrator|Contributor)\)/i)[0];
    t = t.split(/\s*Format:/i)[0];
    return t
      .replace(/^Visit the\s+/i, '')
      .replace(/\s+Store$/i, '')
      .replace(/^Brand:\s*/i, '')
      .replace(/[,;]\s*$/, '')
      .trim()
      .slice(0, 80);
  }

  // ── csv ──────────────────────────────────────────────────────────────────
  function esc(v) {
    // Collapse whitespace before quoting. A field containing newlines is legal
    // CSV, parses fine, and then lands in YAML frontmatter as a multi-line
    // scalar — fragile at best. Normalise at the source instead.
    v = v == null ? '' : String(v).replace(/\s+/g, ' ').trim();
    return /[",]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
  }

  function toRow(p) {
    // Trailing empties are type/occasion/recipient: left blank so the
    // classifier assigns them from the title on import.
    return [esc(p.url), esc(p.title), esc(p.price), esc(p.image), esc(p.brand), '', '', ''].join(',');
  }

  // ── storage ──────────────────────────────────────────────────────────────
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; }
  }
  function save(rows) {
    try { localStorage.setItem(KEY, JSON.stringify(rows)); } catch (e) { /* private mode */ }
  }
  function csv(rows) {
    return HEADER + '\n' + rows.map(function (r) { return r.row; }).join('\n') + '\n';
  }

  // ── clipboard ────────────────────────────────────────────────────────────
  function copy(text, done) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { fallback(); });
    } else fallback();

    function fallback() {
      // execCommand is deprecated but still the only synchronous path when the
      // async API is blocked by permissions policy.
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      done(ok, text);
    }
  }

  // ── toast ────────────────────────────────────────────────────────────────
  function toast(html) {
    var old = document.getElementById('anc-toast');
    if (old) old.remove();
    var d = document.createElement('div');
    d.id = 'anc-toast';
    d.style.cssText = [
      'position:fixed', 'z-index:2147483647', 'right:16px', 'bottom:16px',
      'max-width:380px', 'background:#111', 'color:#fff', 'padding:14px 16px',
      'border-radius:10px', 'font:14px/1.45 -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif',
      'box-shadow:0 6px 28px rgba(0,0,0,.35)'
    ].join(';');
    d.innerHTML = html;
    document.body.appendChild(d);
    var clear = d.querySelector('[data-anc-clear]');
    if (clear) clear.onclick = function (e) {
      e.preventDefault();
      save([]);
      toast('<b>Cleared.</b> 0 products collected.');
    };
    var close = d.querySelector('[data-anc-close]');
    if (close) close.onclick = function (e) { e.preventDefault(); d.remove(); };

    // Download is the reliable route into GitHub: the Actions "paste" box is a
    // SINGLE-LINE input, so a multi-row CSV pasted there loses everything after
    // the first newline. A file has no such limit — drop it into imports/.
    var dl = d.querySelector('[data-anc-download]');
    if (dl) dl.onclick = function (e) {
      e.preventDefault();
      var rows = load();
      if (!rows.length) return;
      var blob = new Blob([csv(rows)], { type: 'text/csv;charset=utf-8' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'products-' + rows.length + '.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
    };
    return d;
  }

  var btn = 'color:#7cc4ff;text-decoration:underline;cursor:pointer';

  // ── run ──────────────────────────────────────────────────────────────────
  var asin = getAsin();
  if (!asin) {
    toast(
      '<b>Not an Amazon product page.</b><br>Open a page with /dp/&lt;ASIN&gt; in the URL, then click again.' +
      '<br><br><a data-anc-close style="' + btn + '">Dismiss</a>'
    );
    return;
  }

  var p = {
    url: 'https://www.amazon.com/dp/' + asin,
    title: firstText(['#productTitle', '#title', 'h1#title span']),
    price: getPrice(),
    image: getImage(),
    brand: getBrand()
  };

  var missing = [];
  if (!p.title) missing.push('title');
  if (!p.price) missing.push('price');
  if (!p.image) missing.push('image');

  var rows = load();
  var dupe = rows.some(function (r) { return r.asin === asin; });
  if (!dupe) {
    rows.push({ asin: asin, row: toRow(p) });
    save(rows);
  }

  var text = csv(rows);
  copy(text, function (ok, raw) {
    var head = dupe
      ? '<b>Already collected.</b> ' + asin
      : '<b>Added.</b> ' + (p.title || asin).slice(0, 60) + (p.price ? ' — ' + p.price : '');

    var warn = missing.length
      ? '<div style="color:#ffd479;margin-top:6px">Could not read: ' + missing.join(', ') +
        '. Fill those cells in by hand before importing.</div>'
      : '';

    var body = missing.length && !p.price
      ? warn
      : warn;

    var tail = ok
      ? '<div style="margin-top:8px;opacity:.85">' + rows.length +
        ' product(s) on your clipboard as CSV.</div>'
      : '<div style="margin-top:8px;color:#ffd479">Clipboard blocked — copy manually:' +
        '<textarea readonly style="width:100%;height:90px;margin-top:6px;font:11px/1.3 monospace">' +
        (raw || text).replace(/</g, '&lt;') + '</textarea></div>';

    toast(
      head + body + tail +
      '<div style="margin-top:10px;display:flex;gap:14px;flex-wrap:wrap">' +
      '<a data-anc-download style="' + btn + ';font-weight:600">⬇ Download CSV (' + rows.length + ')</a>' +
      '<a data-anc-clear style="' + btn + '">Clear list</a>' +
      '<a data-anc-close style="' + btn + '">Dismiss</a></div>'
    );
  });
})();
