import { getCollection } from 'astro:content';
import { buildAmazonUrl } from '../../lib/taxonomy';
import { giftPagesByAsin, giftPath } from '../../lib/gift-pages';

/**
 * Static catalog feed for the homepage's endless scroll.
 *
 * Emitted at build time (the site is fully static), so this is a plain cached
 * file — not a server call. Fetched lazily on first scroll rather than on page
 * load, which is what keeps the homepage document small while still letting the
 * grid run indefinitely.
 *
 * Only the fields a product card renders. Titles and image URLs dominate the
 * payload, so nothing else is worth shipping.
 */
export async function GET() {
  const products = await getCollection('products');
  // `g` is the product's own page on 4aNurse when it has one; the homepage card
  // links image + title there and keeps `u` (the affiliate link) on the button.
  const pages = await giftPagesByAsin();

  const items = products
    .filter((p) => p.data.availability !== 'dead')
    .map((p) => {
      const page = pages.get(p.data.asin);
      return {
        t: page?.name ?? p.data.title,
        u: buildAmazonUrl(p.data.asin),
        i: p.data.image,
        p: p.data.price ?? '',
        c: p.data.type,
        a: p.data.asin,
        ...(page && { g: giftPath(page.slug) }),
      };
    });

  return new Response(JSON.stringify(items), {
    headers: {
      'Content-Type': 'application/json',
      // Static asset; the deploy rsync replaces it, so a long cache is safe.
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
