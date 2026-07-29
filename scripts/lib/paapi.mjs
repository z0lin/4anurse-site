/**
 * Amazon Product Advertising API 5.0 client (GetItems + SearchItems).
 *
 * Ported from add-products.py so the automated path runs in Node, matching the
 * repo and the GitHub Actions runner. The Python script still works for one-off
 * manual imports; this is what CI uses.
 *
 * Credentials come from the environment and are never written to disk or logged:
 *   PAAPI_ACCESS_KEY, PAAPI_SECRET_KEY, PAAPI_TAG (defaults to the site tag)
 *
 * Set them as GitHub Actions repository secrets, not in a file.
 */
import { createHmac, createHash } from 'node:crypto';
import { AFFILIATE_TAG } from '../../src/lib/taxonomy-shim.mjs';

const HOST = 'webservices.amazon.com';
const REGION = 'us-east-1';
const SERVICE = 'ProductAdvertisingAPI';
const CONTENT_TYPE = 'application/json; charset=utf-8';

/** PA-API caps GetItems at 10 ASINs per request. */
export const MAX_BATCH = 10;

export const RESOURCES = [
  'Images.Primary.Large',
  'ItemInfo.Title',
  'ItemInfo.ByLineInfo',
  'ItemInfo.Features',
  'Offers.Listings.Price',
  'Offers.Listings.Availability.Message',
  'BrowseNodeInfo.BrowseNodes',
];

export class PaapiNotConfiguredError extends Error {
  constructor() {
    super(
      'PA-API credentials not set. Export PAAPI_ACCESS_KEY and PAAPI_SECRET_KEY ' +
        '(or add them as GitHub Actions secrets).\n' +
        'Access requires an approved Associates account with 3 qualifying sales in 180 days:\n' +
        '  https://affiliate-program.amazon.com/ -> Tools -> Product Advertising API'
    );
    this.name = 'PaapiNotConfiguredError';
  }
}

export function isConfigured() {
  return Boolean(process.env.PAAPI_ACCESS_KEY && process.env.PAAPI_SECRET_KEY);
}

const hmac = (key, msg) => createHmac('sha256', key).update(msg, 'utf8').digest();
const sha256hex = (s) => createHash('sha256').update(s, 'utf8').digest('hex');

function signingKey(secret, dateStamp) {
  let k = hmac(`AWS4${secret}`, dateStamp);
  k = hmac(k, REGION);
  k = hmac(k, SERVICE);
  return hmac(k, 'aws4_request');
}

/** AWS SigV4. Header order and the trailing newline in canonicalHeaders matter. */
function signedHeaders(operation, body) {
  const accessKey = process.env.PAAPI_ACCESS_KEY;
  const secretKey = process.env.PAAPI_SECRET_KEY;
  if (!accessKey || !secretKey) throw new PaapiNotConfiguredError();

  const endpoint = `/paapi5/${operation.toLowerCase()}`;
  const target = `com.amazon.paapi5.v1.ProductAdvertisingAPIv1.${operation}`;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);

  const canonicalHeaders =
    `content-type:${CONTENT_TYPE}\n` +
    `host:${HOST}\n` +
    `x-amz-date:${amzDate}\n` +
    `x-amz-target:${target}\n`;
  const signed = 'content-type;host;x-amz-date;x-amz-target';

  const canonicalRequest = [
    'POST', endpoint, '', canonicalHeaders, signed, sha256hex(body),
  ].join('\n');

  const scope = `${dateStamp}/${REGION}/${SERVICE}/aws4_request`;
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, scope, sha256hex(canonicalRequest)].join('\n');
  const signature = createHmac('sha256', signingKey(secretKey, dateStamp))
    .update(stringToSign, 'utf8')
    .digest('hex');

  return {
    headers: {
      'content-type': CONTENT_TYPE,
      host: HOST,
      'x-amz-date': amzDate,
      'x-amz-target': target,
      Authorization:
        `AWS4-HMAC-SHA256 Credential=${accessKey}/${scope}, ` +
        `SignedHeaders=${signed}, Signature=${signature}`,
    },
    url: `https://${HOST}${endpoint}`,
  };
}

async function call(operation, payload) {
  const body = JSON.stringify({
    ...payload,
    PartnerTag: process.env.PAAPI_TAG || AFFILIATE_TAG,
    PartnerType: 'Associates',
    Marketplace: 'www.amazon.com',
  });
  const { headers, url } = signedHeaders(operation, body);

  const res = await fetch(url, { method: 'POST', headers, body });
  const text = await res.text();
  if (!res.ok) {
    // 429 is the throttle most callers actually hit; surface it distinctly so
    // the caller can back off rather than treating it as a hard failure.
    const err = new Error(`PA-API ${operation} ${res.status}: ${text.slice(0, 400)}`);
    err.status = res.status;
    err.throttled = res.status === 429;
    throw err;
  }
  const data = JSON.parse(text);
  for (const e of data.Errors ?? []) {
    console.warn(`  PA-API note: ${e.Code} — ${e.Message}`);
  }
  return data;
}

/**
 * Fetch full item data for up to MAX_BATCH ASINs.
 * @returns {Promise<Array<object>>} raw PA-API Item objects
 */
export async function getItems(asins) {
  if (asins.length > MAX_BATCH) {
    throw new Error(`getItems accepts at most ${MAX_BATCH} ASINs; got ${asins.length}`);
  }
  const data = await call('GetItems', { ItemIds: asins, Resources: RESOURCES });
  return data.ItemsResult?.Items ?? [];
}

/** Keyword search, for discovery of new candidate ASINs. */
export async function searchItems(keywords, { itemPage = 1, itemCount = 10 } = {}) {
  const data = await call('SearchItems', {
    Keywords: keywords,
    SearchIndex: 'All',
    ItemPage: itemPage,
    ItemCount: itemCount,
    Resources: RESOURCES,
  });
  return data.SearchResult?.Items ?? [];
}

/**
 * Flatten a PA-API Item into the fields the product schema needs.
 *
 * NOTE on images: we keep the CDN URL PA-API returns and hotlink it. That is the
 * licensed pattern — PA-API terms permit display via the returned URLs and
 * restrict re-hosting them locally. The existing 190 images predate this script
 * (they came from a WooCommerce export) and are the reason a refresh pass is
 * needed once credentials exist.
 */
export function normalizeItem(item) {
  const listing = item.Offers?.Listings?.[0];
  const amount = listing?.Price?.Amount;
  return {
    asin: item.ASIN,
    title: item.ItemInfo?.Title?.DisplayValue ?? '',
    brand:
      item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue ??
      item.ItemInfo?.ByLineInfo?.Manufacturer?.DisplayValue ??
      '',
    image: item.Images?.Primary?.Large?.URL ?? '',
    price: listing?.Price?.DisplayAmount ?? '',
    priceValue: typeof amount === 'number' ? amount : null,
    availability: listing ? 'in_stock' : 'out_of_stock',
    features: item.ItemInfo?.Features?.DisplayValues ?? [],
    browseNodes: (item.BrowseNodeInfo?.BrowseNodes ?? []).map((n) => n.DisplayName),
  };
}
