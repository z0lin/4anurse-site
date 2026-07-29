/**
 * Canonical taxonomy helpers.
 *
 * Facet values are derived from src/data/tag-rules.json so there is exactly one
 * source of truth shared by the content schema, the page routes, and the
 * ingestion scripts. Do not re-declare these lists anywhere else.
 */
import rules from '../data/tag-rules.json';

/** Amazon Associates tag. The ONLY place this string may appear. */
export const AFFILIATE_TAG = '4anurse05-20';

export const TYPE_TAGS = rules.type.map((r) => r.tag);
export const OCCASION_TAGS = rules.occasion.map((r) => r.tag);
export const RECIPIENT_TAGS = rules.recipient.map((r) => r.tag);
export const PRICE_TAGS = rules.price.map((r) => r.tag);

/** Human-readable labels, keyed by tag, for breadcrumbs and page headings. */
export const LABELS: Record<string, string> = Object.fromEntries(
  [...rules.type, ...rules.occasion, ...rules.recipient, ...rules.price].map((r) => [
    r.tag,
    r.label,
  ])
);

/**
 * Build an affiliate link from an ASIN.
 *
 * Deriving the URL instead of storing it guarantees the tag is present and
 * correct on every outbound link. A missing tag is silent lost revenue, so
 * never hand-write an amazon.com URL in content or components.
 */
export function buildAmazonUrl(asin: string): string {
  return `https://www.amazon.com/dp/${asin}/?tag=${AFFILIATE_TAG}`;
}

/**
 * Lowest price band a value falls into. Bands are ordered cheapest-first in
 * tag-rules.json, and the first match wins, so a $19 item is `under-25` rather
 * than also matching `under-50`.
 */
export function priceBand(priceValue: number): string | undefined {
  for (const band of rules.price) {
    const okMax = !('max' in band) || priceValue < (band as { max: number }).max;
    const okMin = !('min' in band) || priceValue >= (band as { min: number }).min;
    if (okMax && okMin) return band.tag;
  }
  return undefined;
}

/** Build-time guard thresholds for faceted page generation. */
export const PAGE_GUARD = rules.pageGuard;

/**
 * Whether a faceted page has enough products to be worth generating.
 * Prevents thin/doorway pages, which are a manual-action risk.
 */
export function passesGuard(productCount: number, isIntersection: boolean): boolean {
  const min = isIntersection
    ? PAGE_GUARD.minProductsIntersection
    : PAGE_GUARD.minProductsSingleFacet;
  return productCount >= min;
}
