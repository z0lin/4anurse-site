import { getCollection } from 'astro:content';
import { buildAmazonUrl } from '../../lib/taxonomy';

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

  const items = products
    .filter((p) => p.data.availability !== 'dead')
    .map((p) => ({
      t: p.data.title,
      u: buildAmazonUrl(p.data.asin),
      i: p.data.image,
      p: p.data.price ?? '',
      c: p.data.type,
      a: p.data.asin,
    }));

  return new Response(JSON.stringify(items), {
    headers: {
      'Content-Type': 'application/json',
      // Static asset; the deploy rsync replaces it, so a long cache is safe.
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
