// Node-side mirror of priceBand() for scripts. src/lib/taxonomy.ts is the
// canonical version used by Astro; both read the same tag-rules.json.
import rules from '../data/tag-rules.json' with { type: 'json' };
export function priceBand(priceValue) {
  for (const band of rules.price) {
    const okMax = !('max' in band) || priceValue < band.max;
    const okMin = !('min' in band) || priceValue >= band.min;
    if (okMax && okMin) return band.tag;
  }
  return undefined;
}

/** Mirrors AFFILIATE_TAG in taxonomy.ts. Keep the two in sync. */
export const AFFILIATE_TAG = '4anurse05-20';

export function buildAmazonUrl(asin) {
  return `https://www.amazon.com/dp/${asin}/?tag=${AFFILIATE_TAG}`;
}
