import { defineCollection, z } from 'astro:content';
import { TYPE_TAGS, OCCASION_TAGS, RECIPIENT_TAGS } from '../lib/taxonomy';

const tuple = (a: string[]) => a as [string, ...string[]];

const products = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),

    // ── Primary key ──────────────────────────────────────────────────────────
    // Everything derives from the ASIN. Storing it (rather than a full URL)
    // guarantees the affiliate tag is always present and correct, makes
    // duplicate detection trivial, and gives the ingestion pipeline a stable
    // key. Build links with buildAmazonUrl() from src/lib/taxonomy.ts.
    asin: z.string().regex(/^[A-Z0-9]{10}$/, 'Must be a 10-character Amazon ASIN'),

    image: z.string(),

    // LEGACY. Superseded by `asin` + buildAmazonUrl(). Retained until Phase 3
    // migrates the components; do not add new links here.
    amazonUrl: z.string().url(),

    price: z.string().optional(), // display string, e.g. "$24.99"

    // Required: powers every price-band facet. An item without it would
    // silently vanish from /gifts/under-25/ and friends.
    priceValue: z.number(),

    // Set by the daily PA-API refresh job (Phase 6) so staleness is visible.
    priceUpdated: z.date().optional(),
    availability: z.enum(['in_stock', 'out_of_stock', 'dead']).optional(),

    // ── Faceted taxonomy ─────────────────────────────────────────────────────
    // `type` is what the product IS. `occasion` and `recipient` are separate
    // facets because a single enum could not express "graduation + jewelry +
    // under $25" — which is why `accessories` had absorbed 41% of the catalog.
    type: z.enum(tuple(TYPE_TAGS)),
    occasion: z.array(z.enum(tuple(OCCASION_TAGS))).default([]),
    recipient: z.array(z.enum(tuple(RECIPIENT_TAGS))).default([]),

    // LEGACY. Still keys the `categories` and `hubs` collections and the
    // /gifts/[category]/ route. Phase 3 switches those to `type` and drops it.
    category: z.enum([
      'graduation',
      'apparel',
      'accessories',
      'drinkware',
      'jewelry',
      'books',
      'home',
      'humor',
      'self-care',
      'other'
    ]).default('other'),

    featured: z.boolean().default(false),
    featuredBadge: z.string().optional(), // e.g. "Top Pick", "Best Value", "Grad Gift"
    blurb: z.string().optional(), // short "why we love it" sentence
    dateAdded: z.date(),
  }),
});

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    heroImage: z.string().optional(),
    tags: z.array(z.string()).default([]),
    category: z.string().optional(), // e.g. "Gift Guide", "Self-Care"
    readTime: z.string().optional(), // e.g. "8 min read"
    featured: z.boolean().default(false), // shown big on blog index
    draft: z.boolean().default(false),
  }),
});

/**
 * Category pages are the URL layer; product facets are the data layer.
 *
 * A page declares which facet values it collects, so a URL can outlive a
 * taxonomy change. /gifts/accessories/ keeps its rankings by aggregating the
 * seven types that `accessories` split into, instead of being redirected, and
 * /gifts/graduation/ collects an OCCASION even though `graduation` is no longer
 * a product type.
 *
 * At least one of types/occasions/recipients must be non-empty — a page that
 * selects nothing would render an empty grid.
 */
const categories = defineCollection({
  type: 'content',
  schema: z
    .object({
      title: z.string(), // e.g. "Nursing Graduation Gifts"
      label: z.string(), // e.g. "Graduation" (used in breadcrumb)
      description: z.string(),

      types: z.array(z.enum(tuple(TYPE_TAGS))).default([]),
      occasions: z.array(z.enum(tuple(OCCASION_TAGS))).default([]),
      recipients: z.array(z.enum(tuple(RECIPIENT_TAGS))).default([]),

      /** Sort weight in the /gifts/ hub. Lower comes first. */
      order: z.number().default(100),

      faq: z.array(
        z.object({
          q: z.string(),
          a: z.string(),
        })
      ).optional(),
    })
    .refine(
      (d) => d.types.length + d.occasions.length + d.recipients.length > 0,
      { message: 'A category page must select at least one type, occasion or recipient' }
    ),
});

// Evergreen occasion/specialty hub pages (pillar pages at root, e.g. /nurses-week-gifts/)
const hubs = defineCollection({
  type: 'content', // markdown body = page intro
  schema: z.object({
    title: z.string(), // SEO <title>
    h1: z.string(),
    description: z.string(),
    breadcrumbLabel: z.string(), // short label, e.g. "Nurses Week Gifts"
    matchKeywords: z.array(z.string()), // match related blog posts by slug
    productCategories: z.array(z.string()).default([]), // pull featured products from these
    faq: z
      .array(z.object({ q: z.string(), a: z.string() }))
      .optional(),
  }),
});

export const collections = { products, blog, categories, hubs };
