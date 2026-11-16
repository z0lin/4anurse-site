/**
 * Product (gift) pages: lookup helpers.
 *
 * A product only gets its own page at /gift/<slug>/ when it has ORIGINAL copy
 * in src/content/giftpages/<slug>.json. Products without copy keep working
 * exactly as before: their cards link straight to Amazon. That is the thin page
 * guard for this route; a page made only of an Amazon title would be the kind
 * of duplicate affiliate page Google demotes.
 */
import { getCollection, type CollectionEntry } from 'astro:content';

export type GiftPage = CollectionEntry<'giftpages'>['data'];

let byAsin: Map<string, GiftPage> | null = null;

/** ASIN to gift page copy. Built once per build and reused by every card. */
export async function giftPagesByAsin(): Promise<Map<string, GiftPage>> {
  if (!byAsin) {
    const pages = await getCollection('giftpages');
    byAsin = new Map(pages.map((p) => [p.data.asin, p.data]));
  }
  return byAsin;
}

export const giftPath = (slug: string) => `/gift/${slug}/`;

/** Where hubs and price pages live, so a product page can link up to them. */
export const OCCASION_HUBS: Record<string, { href: string; label: string }> = {
  graduation: { href: '/nurse-graduation-gifts/', label: 'Nurse graduation gifts' },
  'nurses-week': { href: '/nurses-week-gifts/', label: 'Nurses Week gifts' },
  christmas: { href: '/nurse-christmas-gifts/', label: 'Christmas gifts for nurses' },
  retirement: { href: '/nurse-retirement-gifts/', label: 'Nurse retirement gifts' },
};

export const RECIPIENT_HUBS: Record<string, { href: string; label: string }> = {
  er: { href: '/gifts-for-er-nurses/', label: 'Gifts for ER nurses' },
  icu: { href: '/gifts-for-icu-nurses/', label: 'Gifts for ICU nurses' },
};

export function priceHub(priceValue: number): { href: string; label: string } | null {
  if (priceValue > 0 && priceValue < 25) return { href: '/nurse-gifts-under-25/', label: 'Nurse gifts under $25' };
  if (priceValue < 50) return { href: '/nurse-gifts-under-50/', label: 'Nurse gifts under $50' };
  if (priceValue >= 100) return { href: '/luxury-nurse-gifts/', label: 'Luxury nurse gifts' };
  return null;
}
