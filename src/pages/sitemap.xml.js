import { getCollection } from 'astro:content';

const SITE = 'https://4anurse.com';

function url(path, lastmod) {
  const loc = path.endsWith('/') ? path : `${path}/`;
  return `<url><loc>${SITE}${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`;
}

export async function GET() {
  const products = await getCollection('products');
  const posts = await getCollection('blog', (p) => !p.data.draft);
  const categories = await getCollection('categories');
  const hubs = await getCollection('hubs');
  // Product pages, only for live products that have original copy (the same
  // rule src/pages/gift/[slug].astro uses to generate them).
  const live = new Map(products.filter((p) => p.data.availability !== 'dead').map((p) => [p.data.asin, p]));
  const giftpages = (await getCollection('giftpages')).filter((g) => live.has(g.data.asin));

  const urls = [
    url('/', new Date().toISOString().slice(0, 10)),
    url('/gifts'),
    url('/blog'),
    url('/about'),
    url('/contact'),
    url('/disclosure'),
    url('/privacy'),
    url('/terms'),
    url('/nurse-gifts-under-25'),
    url('/nurse-gifts-under-50'),
    url('/luxury-nurse-gifts'),
    url('/best-stethoscope-for-nurses'),
    url('/best-nursing-shoes'),
    url('/best-compression-socks-for-nurses'),
    url('/best-nurse-watch'),
    ...hubs.map((h) => url(`/${h.slug}`)),
    ...categories.map((c) => url(`/gifts/${c.slug}`)),
    ...giftpages.map((g) =>
      url(`/gift/${g.data.slug}`, (g.data.updated ?? live.get(g.data.asin).data.dateAdded)?.toISOString().slice(0, 10))
    ),
    ...posts.map((p) => url(`/blog/${p.slug}`, p.data.pubDate?.toISOString().slice(0, 10))),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
