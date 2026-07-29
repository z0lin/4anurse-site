/** Posts shown per blog index page. */
export const POSTS_PER_PAGE = 24;

/**
 * Pagination lives at /blog/page/2/, not /blog/2/.
 *
 * Astro's `paginate()` on a `blog/[...page].astro` route would generate /blog/2/,
 * which collides with the existing `blog/[slug].astro` route for individual
 * posts — every post URL is already /blog/<slug>/. Nesting under /page/ keeps the
 * two namespaces separate and leaves /blog/ itself unchanged.
 */
export function pageHref(n: number): string {
  return n <= 1 ? '/blog/' : `/blog/page/${n}/`;
}

export function totalPages(postCount: number): number {
  return Math.max(1, Math.ceil(postCount / POSTS_PER_PAGE));
}
