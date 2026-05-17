import { defineCollection, z } from 'astro:content';

const products = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    image: z.string(),
    amazonUrl: z.string().url(),
    price: z.string().optional(), // e.g. "$24.99"
    priceValue: z.number().optional(), // numeric for filtering, e.g. 24.99
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

const categories = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(), // e.g. "Nursing Graduation Gifts"
    label: z.string(), // e.g. "Graduation" (used in breadcrumb)
    categoryId: z.string(), // must match a product category value
    description: z.string(),
    faq: z.array(
      z.object({
        q: z.string(),
        a: z.string(),
      })
    ).optional(),
  }),
});

export const collections = { products, blog, categories };
