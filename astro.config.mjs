import { defineConfig } from 'astro/config';

/**
 * Affiliate links written inside blog markdown ("[Click to shop](amazon...)")
 * render as plain <a> tags. Google requires rel="sponsored" (or nofollow) on
 * paid links, so this marks every Amazon link in markdown at build time,
 * covering all existing and future posts without editing them. Dependency free:
 * a small walk over the HTML tree.
 */
function rehypeAffiliateLinks() {
  const isAmazon = (href) => /^https?:\/\/(www\.)?(amazon\.com|amzn\.to)\//i.test(href || '');
  const walk = (node) => {
    if (node.type === 'element' && node.tagName === 'a' && isAmazon(node.properties?.href)) {
      node.properties.rel = ['nofollow', 'sponsored', 'noopener'];
      node.properties.target = '_blank';
    }
    for (const child of node.children ?? []) walk(child);
  };
  return (tree) => walk(tree);
}

export default defineConfig({
  site: 'https://4anurse.com',
  integrations: [],
  markdown: {
    rehypePlugins: [rehypeAffiliateLinks],
  },
  build: {
    inlineStylesheets: 'auto',
  },
  compressHTML: true,
});
