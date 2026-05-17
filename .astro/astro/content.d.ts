declare module 'astro:content' {
	interface RenderResult {
		Content: import('astro/runtime/server/index.js').AstroComponentFactory;
		headings: import('astro').MarkdownHeading[];
		remarkPluginFrontmatter: Record<string, any>;
	}
	interface Render {
		'.md': Promise<RenderResult>;
	}

	export interface RenderedContent {
		html: string;
		metadata?: {
			imagePaths: Array<string>;
			[key: string]: unknown;
		};
	}
}

declare module 'astro:content' {
	type Flatten<T> = T extends { [K: string]: infer U } ? U : never;

	export type CollectionKey = keyof AnyEntryMap;
	export type CollectionEntry<C extends CollectionKey> = Flatten<AnyEntryMap[C]>;

	export type ContentCollectionKey = keyof ContentEntryMap;
	export type DataCollectionKey = keyof DataEntryMap;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	/** @deprecated Use `getEntry` instead. */
	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E,
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	/** @deprecated Use `getEntry` instead. */
	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E,
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E,
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown,
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		slug: E,
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(
		collection: C,
		id: E,
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[],
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[],
	): Promise<CollectionEntry<C>[]>;

	export function render<C extends keyof AnyEntryMap>(
		entry: AnyEntryMap[C][string],
	): Promise<RenderResult>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C,
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
				}
			: {
					collection: C;
					id: keyof DataEntryMap[C];
				}
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C,
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		"blog": {
"2026-05-03-what-to-buy-grad.md": {
	id: "2026-05-03-what-to-buy-grad.md";
  slug: "2026-05-03-what-to-buy-grad";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-05-10-top-25-gifts.md": {
	id: "2026-05-10-top-25-gifts.md";
  slug: "2026-05-10-top-25-gifts";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
};
"categories": {
"graduation.md": {
	id: "graduation.md";
  slug: "graduation";
  body: string;
  collection: "categories";
  data: InferEntrySchema<"categories">
} & { render(): Render[".md"] };
};
"products": {
"1-x-im-a-nurse-superpower-light-blue-18-oz-mug.md": {
	id: "1-x-im-a-nurse-superpower-light-blue-18-oz-mug.md";
  slug: "1-x-im-a-nurse-superpower-light-blue-18-oz-mug";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"10-pack-hand-cream-for-dry-cracked-handsmothers-day-gif.md": {
	id: "10-pack-hand-cream-for-dry-cracked-handsmothers-day-gif.md";
  slug: "10-pack-hand-cream-for-dry-cracked-handsmothers-day-gif";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"100-pcs-funny-nurse-stickers-medical-stickers-nursing-a.md": {
	id: "100-pcs-funny-nurse-stickers-medical-stickers-nursing-a.md";
  slug: "100-pcs-funny-nurse-stickers-medical-stickers-nursing-a";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"101-blessings-for-nurses-inspirational-scripture-cards-.md": {
	id: "101-blessings-for-nurses-inspirational-scripture-cards-.md";
  slug: "101-blessings-for-nurses-inspirational-scripture-cards-";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"12-pack-mini-funny-nurse-sticky-notes-nurse-notepad-med.md": {
	id: "12-pack-mini-funny-nurse-sticky-notes-nurse-notepad-med.md";
  slug: "12-pack-mini-funny-nurse-sticky-notes-nurse-notepad-med";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"200-pcs-funny-nurse-stickers-nursing-stickers-gifts-for.md": {
	id: "200-pcs-funny-nurse-stickers-nursing-stickers-gifts-for.md";
  slug: "200-pcs-funny-nurse-stickers-nursing-stickers-gifts-for";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"25pcs-positive-crochet-animals-employee-teacher-appreci.md": {
	id: "25pcs-positive-crochet-animals-employee-teacher-appreci.md";
  slug: "25pcs-positive-crochet-animals-employee-teacher-appreci";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"3-pack-badge-reel-with-badge-holder-retractable-clip-fo.md": {
	id: "3-pack-badge-reel-with-badge-holder-retractable-clip-fo.md";
  slug: "3-pack-badge-reel-with-badge-holder-retractable-clip-fo";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"30-vertical-nursing-badge-reference-cards-lab-values-ek.md": {
	id: "30-vertical-nursing-badge-reference-cards-lab-values-ek.md";
  slug: "30-vertical-nursing-badge-reference-cards-lab-values-ek";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"3m-littmann-cardiology-iv-diagnostic-stethoscope-6200-m.md": {
	id: "3m-littmann-cardiology-iv-diagnostic-stethoscope-6200-m.md";
  slug: "3m-littmann-cardiology-iv-diagnostic-stethoscope-6200-m";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"3m-littmann-cardiology-iv-diagnostic-stethoscope-6201-m.md": {
	id: "3m-littmann-cardiology-iv-diagnostic-stethoscope-6201-m.md";
  slug: "3m-littmann-cardiology-iv-diagnostic-stethoscope-6201-m";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"3m-littmann-cardiology-iv-diagnostic-stethoscope-limite.md": {
	id: "3m-littmann-cardiology-iv-diagnostic-stethoscope-limite.md";
  slug: "3m-littmann-cardiology-iv-diagnostic-stethoscope-limite";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"3m-littmann-cardiology-ivtm-27-stethoscope-hunter-green.md": {
	id: "3m-littmann-cardiology-ivtm-27-stethoscope-hunter-green.md";
  slug: "3m-littmann-cardiology-ivtm-27-stethoscope-hunter-green";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"3m-littmann-classic-ii-infant-stethoscope-2157-stainles.md": {
	id: "3m-littmann-classic-ii-infant-stethoscope-2157-stainles.md";
  slug: "3m-littmann-classic-ii-infant-stethoscope-2157-stainles";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"3m-littmann-classic-ii-pediatric-stethoscope-2119-stain.md": {
	id: "3m-littmann-classic-ii-pediatric-stethoscope-2119-stain.md";
  slug: "3m-littmann-classic-ii-pediatric-stethoscope-2119-stain";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"3m-littmann-classic-ii-pediatric-stethoscope-2153-stain.md": {
	id: "3m-littmann-classic-ii-pediatric-stethoscope-2153-stain.md";
  slug: "3m-littmann-classic-ii-pediatric-stethoscope-2153-stain";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"3m-littmann-classic-iii-monitoring-stethoscope-5622-mor.md": {
	id: "3m-littmann-classic-iii-monitoring-stethoscope-5622-mor.md";
  slug: "3m-littmann-classic-iii-monitoring-stethoscope-5622-mor";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"3m-littmann-classic-iii-monitoring-stethoscope-5633-mor.md": {
	id: "3m-littmann-classic-iii-monitoring-stethoscope-5633-mor.md";
  slug: "3m-littmann-classic-iii-monitoring-stethoscope-5633-mor";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"3m-littmann-classic-iii-monitoring-stethoscope-5806-mor.md": {
	id: "3m-littmann-classic-iii-monitoring-stethoscope-5806-mor.md";
  slug: "3m-littmann-classic-iii-monitoring-stethoscope-5806-mor";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"3m-littmann-classic-iii-monitoring-stethoscope-5870-mor.md": {
	id: "3m-littmann-classic-iii-monitoring-stethoscope-5870-mor.md";
  slug: "3m-littmann-classic-iii-monitoring-stethoscope-5870-mor";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"3m-littmann-lightweight-ii-se-stethoscope-2456-28-pearl.md": {
	id: "3m-littmann-lightweight-ii-se-stethoscope-2456-28-pearl.md";
  slug: "3m-littmann-lightweight-ii-se-stethoscope-2456-28-pearl";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"3pcs-the-nurse-tarot-vinyl-sticker-the-nurse-tarot-card.md": {
	id: "3pcs-the-nurse-tarot-vinyl-sticker-the-nurse-tarot-card.md";
  slug: "3pcs-the-nurse-tarot-vinyl-sticker-the-nurse-tarot-card";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"49-horizontal-nursing-badge-reference-cards-nursing-sch.md": {
	id: "49-horizontal-nursing-badge-reference-cards-nursing-sch.md";
  slug: "49-horizontal-nursing-badge-reference-cards-nursing-sch";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"49-nursing-badge-reference-cards-nursing-school-essenti.md": {
	id: "49-nursing-badge-reference-cards-nursing-school-essenti.md";
  slug: "49-nursing-badge-reference-cards-nursing-school-essenti";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"50-pcs-nurse-stickers-nursing-stickers-nurses-day-decal.md": {
	id: "50-pcs-nurse-stickers-nursing-stickers-nurses-day-decal.md";
  slug: "50-pcs-nurse-stickers-nursing-stickers-nurses-day-decal";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"6-pack-copper-compression-socks-for-women-and-men-circu.md": {
	id: "6-pack-copper-compression-socks-for-women-and-men-circu.md";
  slug: "6-pack-copper-compression-socks-for-women-and-men-circu";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"8-pack-mini-funny-nurse-sticky-notes-nursing-student-es.md": {
	id: "8-pack-mini-funny-nurse-sticky-notes-nursing-student-es.md";
  slug: "8-pack-mini-funny-nurse-sticky-notes-nursing-student-es";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"8-pcs-badge-reel-retractable-id-badge-holders-funny-nur.md": {
	id: "8-pcs-badge-reel-retractable-id-badge-holders-funny-nur.md";
  slug: "8-pcs-badge-reel-retractable-id-badge-holders-funny-nur";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"8-pcs-nurse-badge-reels-cute-felt-retractable-badge-ree.md": {
	id: "8-pcs-nurse-badge-reels-cute-felt-retractable-badge-ree.md";
  slug: "8-pcs-nurse-badge-reels-cute-felt-retractable-badge-ree";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"a-nurses-touch-a-prayer-and-devotional-for-nurses-paper.md": {
	id: "a-nurses-touch-a-prayer-and-devotional-for-nurses-paper.md";
  slug: "a-nurses-touch-a-prayer-and-devotional-for-nurses-paper";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"adc-603imca-adscope-model-603-premium-stainless-steel-c.md": {
	id: "adc-603imca-adscope-model-603-premium-stainless-steel-c.md";
  slug: "adc-603imca-adscope-model-603-premium-stainless-steel-c";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"badge-reels-retractable-2pack-heavy-duty-badge-reel-wit.md": {
	id: "badge-reels-retractable-2pack-heavy-duty-badge-reel-wit.md";
  slug: "badge-reels-retractable-2pack-heavy-duty-badge-reel-wit";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"badgeguru-nursing-badge-reference-cards-33-double-sided.md": {
	id: "badgeguru-nursing-badge-reference-cards-33-double-sided.md";
  slug: "badgeguru-nursing-badge-reference-cards-33-double-sided";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"before-after-patients-set-11oz-coffee-mug-15oz-wine-gla.md": {
	id: "before-after-patients-set-11oz-coffee-mug-15oz-wine-gla.md";
  slug: "before-after-patients-set-11oz-coffee-mug-15oz-wine-gla";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"best-gifts-for-nurses-new-nurse-gifts-for-women-nursing.md": {
	id: "best-gifts-for-nurses-new-nurse-gifts-for-women-nursing.md";
  slug: "best-gifts-for-nurses-new-nurse-gifts-for-women-nursing";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"best-nurse-mug-11-ounce-nurse-gift-mug-gifts-nurses-bes.md": {
	id: "best-nurse-mug-11-ounce-nurse-gift-mug-gifts-nurses-bes.md";
  slug: "best-nurse-mug-11-ounce-nurse-gift-mug-gifts-nurses-bes";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"bigmouth-inc-prescription-coffee-mug-large-funny-prescr.md": {
	id: "bigmouth-inc-prescription-coffee-mug-large-funny-prescr.md";
  slug: "bigmouth-inc-prescription-coffee-mug-large-funny-prescr";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"black-cat-badge-reel.md": {
	id: "black-cat-badge-reel.md";
  slug: "black-cat-badge-reel";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"brand-new-nurse-surviving-your-first-day-on-the-job-pap.md": {
	id: "brand-new-nurse-surviving-your-first-day-on-the-job-pap.md";
  slug: "brand-new-nurse-surviving-your-first-day-on-the-job-pap";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"brooke-jess-designs-coffee-scrubs-14-oz-coffee-cup-tumb.md": {
	id: "brooke-jess-designs-coffee-scrubs-14-oz-coffee-cup-tumb.md";
  slug: "brooke-jess-designs-coffee-scrubs-14-oz-coffee-cup-tumb";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"bulbacraft-100pcs-funny-nurse-stickers-funny-nurse-gift.md": {
	id: "bulbacraft-100pcs-funny-nurse-stickers-funny-nurse-gift.md";
  slug: "bulbacraft-100pcs-funny-nurse-stickers-funny-nurse-gift";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"burts-bees-gifts-ideas-hand-repair-set-3-hand-creams-pl.md": {
	id: "burts-bees-gifts-ideas-hand-repair-set-3-hand-creams-pl.md";
  slug: "burts-bees-gifts-ideas-hand-repair-set-3-hand-creams-pl";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"chicken-soup-for-the-nurses-soul-stories-to-celebrate-h.md": {
	id: "chicken-soup-for-the-nurses-soul-stories-to-celebrate-h.md";
  slug: "chicken-soup-for-the-nurses-soul-stories-to-celebrate-h";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"chicken-soup-for-the-soul-inspiration-for-nurses-101-st.md": {
	id: "chicken-soup-for-the-soul-inspiration-for-nurses-101-st.md";
  slug: "chicken-soup-for-the-soul-inspiration-for-nurses-101-st";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"christian-art-gifts-ceramic-coffee-mug-12-oz-microwave-.md": {
	id: "christian-art-gifts-ceramic-coffee-mug-12-oz-microwave-.md";
  slug: "christian-art-gifts-ceramic-coffee-mug-12-oz-microwave-";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"christian-art-gifts-ceramic-coffee-mug-15-oz-microwave-.md": {
	id: "christian-art-gifts-ceramic-coffee-mug-15-oz-microwave-.md";
  slug: "christian-art-gifts-ceramic-coffee-mug-15-oz-microwave-";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"core-500-digital-stethoscope-40x-amplification-active-n.md": {
	id: "core-500-digital-stethoscope-40x-amplification-active-n.md";
  slug: "core-500-digital-stethoscope-40x-amplification-active-n";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"custom-nurse-sweatshirt-with-name-on-sleeve-new-nurse-g.md": {
	id: "custom-nurse-sweatshirt-with-name-on-sleeve-new-nurse-g.md";
  slug: "custom-nurse-sweatshirt-with-name-on-sleeve-new-nurse-g";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"daviss-drug-guide-for-nurses-nineteenth-edition.md": {
	id: "daviss-drug-guide-for-nurses-nineteenth-edition.md";
  slug: "daviss-drug-guide-for-nurses-nineteenth-edition";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"ddaowanx-gel-pens-6-pcs-05mm-quick-dry-black-ink-pens-f.md": {
	id: "ddaowanx-gel-pens-6-pcs-05mm-quick-dry-black-ink-pens-f.md";
  slug: "ddaowanx-gel-pens-6-pcs-05mm-quick-dry-black-ink-pens-f";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"dicksons-god-took-best-angels-made-nurses-white-8-inch-.md": {
	id: "dicksons-god-took-best-angels-made-nurses-white-8-inch-.md";
  slug: "dicksons-god-took-best-angels-made-nurses-white-8-inch-";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"dicksons-nurses-are-angels-without-wings-blue-6-inch-re.md": {
	id: "dicksons-nurses-are-angels-without-wings-blue-6-inch-re.md";
  slug: "dicksons-nurses-are-angels-without-wings-blue-6-inch-re";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"dixie-ems-blood-pressure-and-sprague-stethoscope-kit-te.md": {
	id: "dixie-ems-blood-pressure-and-sprague-stethoscope-kit-te.md";
  slug: "dixie-ems-blood-pressure-and-sprague-stethoscope-kit-te";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"elseviers-2025-intravenous-medications-a-handbook-for-n.md": {
	id: "elseviers-2025-intravenous-medications-a-handbook-for-n.md";
  slug: "elseviers-2025-intravenous-medications-a-handbook-for-n";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"enesco-our-name-is-mud-nurse-uniform-16-oz-stoneware-mu.md": {
	id: "enesco-our-name-is-mud-nurse-uniform-16-oz-stoneware-mu.md";
  slug: "enesco-our-name-is-mud-nurse-uniform-16-oz-stoneware-mu";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"er-nurses-walk-my-rounds-with-me-true-stories-from-amer.md": {
	id: "er-nurses-walk-my-rounds-with-me-true-stories-from-amer.md";
  slug: "er-nurses-walk-my-rounds-with-me-true-stories-from-amer";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"erhachaijia-its-fine-funny-black-cat-retractable-badge-.md": {
	id: "erhachaijia-its-fine-funny-black-cat-retractable-badge-.md";
  slug: "erhachaijia-its-fine-funny-black-cat-retractable-badge-";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"erhachaijia-its-fine-funny-dumpster-fire-retractable-ba.md": {
	id: "erhachaijia-its-fine-funny-dumpster-fire-retractable-ba.md";
  slug: "erhachaijia-its-fine-funny-dumpster-fire-retractable-ba";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"erhachaijia-sure-is-quiet-funny-retractable-badge-reel-.md": {
	id: "erhachaijia-sure-is-quiet-funny-retractable-badge-reel-.md";
  slug: "erhachaijia-sure-is-quiet-funny-retractable-badge-reel-";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"etronik-lunch-backpack-156-inch-laptop-backpack-with-us.md": {
	id: "etronik-lunch-backpack-156-inch-laptop-backpack-with-us.md";
  slug: "etronik-lunch-backpack-156-inch-laptop-backpack-with-us";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"fashion-clipboard-cute-pattern-decorative-clipboards-cu.md": {
	id: "fashion-clipboard-cute-pattern-decorative-clipboards-cu.md";
  slug: "fashion-clipboard-cute-pattern-decorative-clipboards-cu";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"fast-facts-for-the-er-nurse-fourth-edition-guide-to-a-s.md": {
	id: "fast-facts-for-the-er-nurse-fourth-edition-guide-to-a-s.md";
  slug: "fast-facts-for-the-er-nurse-fourth-edition-guide-to-a-s";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"first-year-nurse-advice-on-working-with-doctors-priorit.md": {
	id: "first-year-nurse-advice-on-working-with-doctors-priorit.md";
  slug: "first-year-nurse-advice-on-working-with-doctors-priorit";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"fkovcdy-gifts-for-nurses-nicu-nurse-definition-makeup-b.md": {
	id: "fkovcdy-gifts-for-nurses-nicu-nurse-definition-makeup-b.md";
  slug: "fkovcdy-gifts-for-nurses-nicu-nurse-definition-makeup-b";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"funny-angry-goose-badge-reel-retractable-rn-nurse-docto.md": {
	id: "funny-angry-goose-badge-reel-retractable-rn-nurse-docto.md";
  slug: "funny-angry-goose-badge-reel-retractable-rn-nurse-docto";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"funny-nurse-gifts-cosmetic-bag-nurse-nursing-gifts-for-.md": {
	id: "funny-nurse-gifts-cosmetic-bag-nurse-nursing-gifts-for-.md";
  slug: "funny-nurse-gifts-cosmetic-bag-nurse-nursing-gifts-for-";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"funny-nurse-gifts-for-women-men-natural-soy-wax-lavende.md": {
	id: "funny-nurse-gifts-for-women-men-natural-soy-wax-lavende.md";
  slug: "funny-nurse-gifts-for-women-men-natural-soy-wax-lavende";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"funny-silly-goose-badge-reel-retractable-for-nurses-cut.md": {
	id: "funny-silly-goose-badge-reel-retractable-for-nurses-cut.md";
  slug: "funny-silly-goose-badge-reel-retractable-for-nurses-cut";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"funny-turtle-nurse-badge-reel-cute-work-badge-holder-wi.md": {
	id: "funny-turtle-nurse-badge-reel-cute-work-badge-holder-wi.md";
  slug: "funny-turtle-nurse-badge-reel-cute-work-badge-holder-wi";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"gel-pens-12-pcs-smooth-writing-pens-no-bleed-smear-blac.md": {
	id: "gel-pens-12-pcs-smooth-writing-pens-no-bleed-smear-blac.md";
  slug: "gel-pens-12-pcs-smooth-writing-pens-no-bleed-smear-blac";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"gifts-for-women-14k-white-gold-plated-dainty-love-knot-.md": {
	id: "gifts-for-women-14k-white-gold-plated-dainty-love-knot-.md";
  slug: "gifts-for-women-14k-white-gold-plated-dainty-love-knot-";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"godmerch-personalized-embroidered-nurse-sweatshirt-cust.md": {
	id: "godmerch-personalized-embroidered-nurse-sweatshirt-cust.md";
  slug: "godmerch-personalized-embroidered-nurse-sweatshirt-cust";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"gossby-positive-sunflower-doll-crochet-with-card-this-i.md": {
	id: "gossby-positive-sunflower-doll-crochet-with-card-this-i.md";
  slug: "gossby-positive-sunflower-doll-crochet-with-card-this-i";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"grace-stella-award-winning-under-eye-mask-reduce-dark-c.md": {
	id: "grace-stella-award-winning-under-eye-mask-reduce-dark-c.md";
  slug: "grace-stella-award-winning-under-eye-mask-reduce-dark-c";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"greys-anatomy-complete-series-1-17-94-disc.md": {
	id: "greys-anatomy-complete-series-1-17-94-disc.md";
  slug: "greys-anatomy-complete-series-1-17-94-disc";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"highland-cow-nurse-badge-reel-cute-work-badge-holder-wi.md": {
	id: "highland-cow-nurse-badge-reel-cute-work-badge-holder-wi.md";
  slug: "highland-cow-nurse-badge-reel-cute-work-badge-holder-wi";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"hope-love-shine-sterling-silver-nurse-graduation-neckla.md": {
	id: "hope-love-shine-sterling-silver-nurse-graduation-neckla.md";
  slug: "hope-love-shine-sterling-silver-nurse-graduation-neckla";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"i-wasnt-strong-like-this-when-i-started-out-true-storie.md": {
	id: "i-wasnt-strong-like-this-when-i-started-out-true-storie.md";
  slug: "i-wasnt-strong-like-this-when-i-started-out-true-storie";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"illumivein-high-powered-red-led-flashlight-torch-transi.md": {
	id: "illumivein-high-powered-red-led-flashlight-torch-transi.md";
  slug: "illumivein-high-powered-red-led-flashlight-torch-transi";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"illumivein-vein-finder.md": {
	id: "illumivein-vein-finder.md";
  slug: "illumivein-vein-finder";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"im-trying-my-best-funny-badge-reel-retractable-for-nurs.md": {
	id: "im-trying-my-best-funny-badge-reel-retractable-for-nurs.md";
  slug: "im-trying-my-best-funny-badge-reel-retractable-for-nurs";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"jiojio-chan-nurse-wine-bags-graduation-lpn-gifts-for-ap.md": {
	id: "jiojio-chan-nurse-wine-bags-graduation-lpn-gifts-for-ap.md";
  slug: "jiojio-chan-nurse-wine-bags-graduation-lpn-gifts-for-ap";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"kolewo4ever-8-pieces-nurse-survival-kit-makeup-bags-nur.md": {
	id: "kolewo4ever-8-pieces-nurse-survival-kit-makeup-bags-nur.md";
  slug: "kolewo4ever-8-pieces-nurse-survival-kit-makeup-bags-nur";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"lab-value-reference-card-quick-clinical-guide-fits-hori.md": {
	id: "lab-value-reference-card-quick-clinical-guide-fits-hori.md";
  slug: "lab-value-reference-card-quick-clinical-guide-fits-hori";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"lab-values-horizontal-badge-id-card-pocket-reference-gu.md": {
	id: "lab-values-horizontal-badge-id-card-pocket-reference-gu.md";
  slug: "lab-values-horizontal-badge-id-card-pocket-reference-gu";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"ledx-vein-finder-sclerotherapy-varicose-vein-mapping-an.md": {
	id: "ledx-vein-finder-sclerotherapy-varicose-vein-mapping-an.md";
  slug: "ledx-vein-finder-sclerotherapy-varicose-vein-mapping-an";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"letters-to-a-young-nurse-encouragement-resilience-and-w.md": {
	id: "letters-to-a-young-nurse-encouragement-resilience-and-w.md";
  slug: "letters-to-a-young-nurse-encouragement-resilience-and-w";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"littmann-cardiology-iv-stethoscope-6168-navyblack.md": {
	id: "littmann-cardiology-iv-stethoscope-6168-navyblack.md";
  slug: "littmann-cardiology-iv-stethoscope-6168-navyblack";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"littmann-classic-ii-se-lightweight-stethoscope-black.md": {
	id: "littmann-classic-ii-se-lightweight-stethoscope-black.md";
  slug: "littmann-classic-ii-se-lightweight-stethoscope-black";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"littmann-stethoscope.md": {
	id: "littmann-stethoscope.md";
  slug: "littmann-stethoscope";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"lovevook-laptop-backpack-for-women-156-inch-teacher-nur.md": {
	id: "lovevook-laptop-backpack-for-women-156-inch-teacher-nur.md";
  slug: "lovevook-laptop-backpack-for-women-156-inch-teacher-nur";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"lovevook-laptop-backpack-for-women-156-inch-work-busine.md": {
	id: "lovevook-laptop-backpack-for-women-156-inch-work-busine.md";
  slug: "lovevook-laptop-backpack-for-women-156-inch-work-busine";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"lovevook-teacher-tote-bag-for-women-work-nurse-laptop-b.md": {
	id: "lovevook-teacher-tote-bag-for-women-work-nurse-laptop-b.md";
  slug: "lovevook-teacher-tote-bag-for-women-work-nurse-laptop-b";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"madison-supply-75-inches-premium-stainless-steel-nurse-.md": {
	id: "madison-supply-75-inches-premium-stainless-steel-nurse-.md";
  slug: "madison-supply-75-inches-premium-stainless-steel-nurse-";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"magnetic-stethoscope-holder-hip-clip-for-3m-littmann-st.md": {
	id: "magnetic-stethoscope-holder-hip-clip-for-3m-littmann-st.md";
  slug: "magnetic-stethoscope-holder-hip-clip-for-3m-littmann-st";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"mdf-instruments-acoustica-lightweight-stethoscope-for-d-2.md": {
	id: "mdf-instruments-acoustica-lightweight-stethoscope-for-d-2.md";
  slug: "mdf-instruments-acoustica-lightweight-stethoscope-for-d-2";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"mdf-instruments-acoustica-lightweight-stethoscope-for-d.md": {
	id: "mdf-instruments-acoustica-lightweight-stethoscope-for-d.md";
  slug: "mdf-instruments-acoustica-lightweight-stethoscope-for-d";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"mdf-instruments-calibra-aneroid-premium-professional-sp.md": {
	id: "mdf-instruments-calibra-aneroid-premium-professional-sp.md";
  slug: "mdf-instruments-calibra-aneroid-premium-professional-sp";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"mdf-instruments-engravable-mdf-rosegold-md-one-stainles.md": {
	id: "mdf-instruments-engravable-mdf-rosegold-md-one-stainles.md";
  slug: "mdf-instruments-engravable-mdf-rosegold-md-one-stainles";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"mdf-instruments-mermaid-kaleidoscope-procardial-cardiol.md": {
	id: "mdf-instruments-mermaid-kaleidoscope-procardial-cardiol.md";
  slug: "mdf-instruments-mermaid-kaleidoscope-procardial-cardiol";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"mdf-instruments-pulse-time-2-in-1-digital-lcd-clock-and.md": {
	id: "mdf-instruments-pulse-time-2-in-1-digital-lcd-clock-and.md";
  slug: "mdf-instruments-pulse-time-2-in-1-digital-lcd-clock-and";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"mdf-instruments-rosegold-md-one-stainless-steel-stethos-2.md": {
	id: "mdf-instruments-rosegold-md-one-stainless-steel-stethos-2.md";
  slug: "mdf-instruments-rosegold-md-one-stainless-steel-stethos-2";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"mdf-instruments-rosegold-md-one-stainless-steel-stethos.md": {
	id: "mdf-instruments-rosegold-md-one-stainless-steel-stethos.md";
  slug: "mdf-instruments-rosegold-md-one-stainless-steel-stethos";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"medical-terminology-the-best-and-most-effective-way-to-.md": {
	id: "medical-terminology-the-best-and-most-effective-way-to-.md";
  slug: "medical-terminology-the-best-and-most-effective-way-to-";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"meuut-15-pcs-stethoscope-case-kit-perfect-nurse-gift-in.md": {
	id: "meuut-15-pcs-stethoscope-case-kit-perfect-nurse-gift-in.md";
  slug: "meuut-15-pcs-stethoscope-case-kit-perfect-nurse-gift-in";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"meuut-3-pack-pen-light-medical-scissors-one-pantented-t.md": {
	id: "meuut-3-pack-pen-light-medical-scissors-one-pantented-t.md";
  slug: "meuut-3-pack-pen-light-medical-scissors-one-pantented-t";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"meuut-3-pack-pen-lights-for-nurses-with-6-batteries-med.md": {
	id: "meuut-3-pack-pen-lights-for-nurses-with-6-batteries-med.md";
  slug: "meuut-3-pack-pen-lights-for-nurses-with-6-batteries-med";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"meuut-3-pack-penlight-medical-scissors-one-8-inches-pat.md": {
	id: "meuut-3-pack-penlight-medical-scissors-one-8-inches-pat.md";
  slug: "meuut-3-pack-penlight-medical-scissors-one-8-inches-pat";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"mini-funny-nurse-sticky-notes-cna-gifts-nursing-essenti.md": {
	id: "mini-funny-nurse-sticky-notes-cna-gifts-nursing-essenti.md";
  slug: "mini-funny-nurse-sticky-notes-cna-gifts-nursing-essenti";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"mini-funny-turtle-gifts-mothers-day-teacher-appreciatio.md": {
	id: "mini-funny-turtle-gifts-mothers-day-teacher-appreciatio.md";
  slug: "mini-funny-turtle-gifts-mothers-day-teacher-appreciatio";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"missdaisy-trust-me-i-watch-greys-anatomy-im-basically-a.md": {
	id: "missdaisy-trust-me-i-watch-greys-anatomy-im-basically-a.md";
  slug: "missdaisy-trust-me-i-watch-greys-anatomy-im-basically-a";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"mkony-greys-anatomy-pillow-cover-gifts-trust-me-i-watch.md": {
	id: "mkony-greys-anatomy-pillow-cover-gifts-trust-me-i-watch.md";
  slug: "mkony-greys-anatomy-pillow-cover-gifts-trust-me-i-watch";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"monopoly-greys-anatomy-board-game-featuring-ferry-boat-.md": {
	id: "monopoly-greys-anatomy-board-game-featuring-ferry-boat-.md";
  slug: "monopoly-greys-anatomy-board-game-featuring-ferry-boat-";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"my-mommy-is-a-nurse-paperback-september-11-2018.md": {
	id: "my-mommy-is-a-nurse-paperback-september-11-2018.md";
  slug: "my-mommy-is-a-nurse-paperback-september-11-2018";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"nicu-nurse-gifts-nurse-practitioner-gifts-for-women-nur.md": {
	id: "nicu-nurse-gifts-nurse-practitioner-gifts-for-women-nur.md";
  slug: "nicu-nurse-gifts-nurse-practitioner-gifts-for-women-nur";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"nurse-coffee-mug-cup-nurse-appreciation-gifts-nursing-n.md": {
	id: "nurse-coffee-mug-cup-nurse-appreciation-gifts-nursing-n.md";
  slug: "nurse-coffee-mug-cup-nurse-appreciation-gifts-nursing-n";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"nurse-coloring-book-40-coloring-pages-of-nurse-life-quo.md": {
	id: "nurse-coloring-book-40-coloring-pages-of-nurse-life-quo.md";
  slug: "nurse-coloring-book-40-coloring-pages-of-nurse-life-quo";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"nurse-coloring-book-for-adults-and-kids-bold-and-easy-d.md": {
	id: "nurse-coloring-book-for-adults-and-kids-bold-and-easy-d.md";
  slug: "nurse-coloring-book-for-adults-and-kids-bold-and-easy-d";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"nurse-coloring-book-nurse-life-more-than-30-funny-snark.md": {
	id: "nurse-coloring-book-nurse-life-more-than-30-funny-snark.md";
  slug: "nurse-coloring-book-nurse-life-more-than-30-funny-snark";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"nurse-coloring-book-sweary-midnight-edition-a-totally-r.md": {
	id: "nurse-coloring-book-sweary-midnight-edition-a-totally-r.md";
  slug: "nurse-coloring-book-sweary-midnight-edition-a-totally-r";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"nurse-daily-affirmations-for-home-office-hospital-desk-.md": {
	id: "nurse-daily-affirmations-for-home-office-hospital-desk-.md";
  slug: "nurse-daily-affirmations-for-home-office-hospital-desk-";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"nurse-gifts-for-women-funny-nurse-mug-with-gold-print-n.md": {
	id: "nurse-gifts-for-women-funny-nurse-mug-with-gold-print-n.md";
  slug: "nurse-gifts-for-women-funny-nurse-mug-with-gold-print-n";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"nurse-gifts-for-women-funny-unique-school-nurse-practit.md": {
	id: "nurse-gifts-for-women-funny-unique-school-nurse-practit.md";
  slug: "nurse-gifts-for-women-funny-unique-school-nurse-practit";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"nurse-gifts-for-women-nurse-appreciation-gifts-set-nurs.md": {
	id: "nurse-gifts-for-women-nurse-appreciation-gifts-set-nurs.md";
  slug: "nurse-gifts-for-women-nurse-appreciation-gifts-set-nurs";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"nurse-gifts-for-women-nurses-week-gifts-2025-nurse-rn-l.md": {
	id: "nurse-gifts-for-women-nurses-week-gifts-2025-nurse-rn-l.md";
  slug: "nurse-gifts-for-women-nurses-week-gifts-2025-nurse-rn-l";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"nurse-gifts-for-women-nurses-week-gifts-gift-for-nurses.md": {
	id: "nurse-gifts-for-women-nurses-week-gifts-gift-for-nurses.md";
  slug: "nurse-gifts-for-women-nurses-week-gifts-gift-for-nurses";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"nurse-gifts-for-women30-oz-nurse-tumbler-with-handlenur.md": {
	id: "nurse-gifts-for-women30-oz-nurse-tumbler-with-handlenur.md";
  slug: "nurse-gifts-for-women30-oz-nurse-tumbler-with-handlenur";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"nurse-graduation-gifts-for-women-please-do-not-confuse-.md": {
	id: "nurse-graduation-gifts-for-women-please-do-not-confuse-.md";
  slug: "nurse-graduation-gifts-for-women-please-do-not-confuse-";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"nurse-graduation-gifts-nurse-necklaces-for-women-cross-.md": {
	id: "nurse-graduation-gifts-nurse-necklaces-for-women-cross-.md";
  slug: "nurse-graduation-gifts-nurse-necklaces-for-women-cross-";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"nurse-keychain-gifts-medical-doctor-graduation-gifts-fo.md": {
	id: "nurse-keychain-gifts-medical-doctor-graduation-gifts-fo.md";
  slug: "nurse-keychain-gifts-medical-doctor-graduation-gifts-fo";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"nurse-life-funny-nurses-cosmetic-bag-for-travel-toiletr.md": {
	id: "nurse-life-funny-nurses-cosmetic-bag-for-travel-toiletr.md";
  slug: "nurse-life-funny-nurses-cosmetic-bag-for-travel-toiletr";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"nurse-makeup-bagsnurse-gifts-for-womennurse-cosmetic-ba.md": {
	id: "nurse-makeup-bagsnurse-gifts-for-womennurse-cosmetic-ba.md";
  slug: "nurse-makeup-bagsnurse-gifts-for-womennurse-cosmetic-ba";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"nurse-mug-for-women-scrub-life-mug-with-gift-box-cute-c.md": {
	id: "nurse-mug-for-women-scrub-life-mug-with-gift-box-cute-c.md";
  slug: "nurse-mug-for-women-scrub-life-mug-with-gift-box-cute-c";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"nurse-pharmacology-coloring-book-the-complete-series-bu.md": {
	id: "nurse-pharmacology-coloring-book-the-complete-series-bu.md";
  slug: "nurse-pharmacology-coloring-book-the-complete-series-bu";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"nurse-puzzle-activity-book-75-fun-challenging-nurse-the.md": {
	id: "nurse-puzzle-activity-book-75-fun-challenging-nurse-the.md";
  slug: "nurse-puzzle-activity-book-75-fun-challenging-nurse-the";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"nurse-resin-doll-hand-painted-59-inch-nurse-figurine-lo.md": {
	id: "nurse-resin-doll-hand-painted-59-inch-nurse-figurine-lo.md";
  slug: "nurse-resin-doll-hand-painted-59-inch-nurse-figurine-lo";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"nurse-resin-doll.md": {
	id: "nurse-resin-doll.md";
  slug: "nurse-resin-doll";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"nurse-tote-bag-for-women-nursing-clinical-bag-accordion.md": {
	id: "nurse-tote-bag-for-women-nursing-clinical-bag-accordion.md";
  slug: "nurse-tote-bag-for-women-nursing-clinical-bag-accordion";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"nurse-tote-bag-nurse-gifts-rn-nursing-bag-for-work-shop.md": {
	id: "nurse-tote-bag-nurse-gifts-rn-nursing-bag-for-work-shop.md";
  slug: "nurse-tote-bag-nurse-gifts-rn-nursing-bag-for-work-shop";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"nurse-week-gifts-for-women-empowering-scented-candle-fo.md": {
	id: "nurse-week-gifts-for-women-empowering-scented-candle-fo.md";
  slug: "nurse-week-gifts-for-women-empowering-scented-candle-fo";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"nurses-are-angels-sun-catcher-saying-printed-on-heart-s.md": {
	id: "nurses-are-angels-sun-catcher-saying-printed-on-heart-s.md";
  slug: "nurses-are-angels-sun-catcher-saying-printed-on-heart-s";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"nurses-pocket-guide-diagnoses-prioritized-interventions.md": {
	id: "nurses-pocket-guide-diagnoses-prioritized-interventions.md";
  slug: "nurses-pocket-guide-diagnoses-prioritized-interventions";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"nurses-week-gifts-funny-scented-candle-for-rn-appreciat.md": {
	id: "nurses-week-gifts-funny-scented-candle-for-rn-appreciat.md";
  slug: "nurses-week-gifts-funny-scented-candle-for-rn-appreciat";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"nurses-week-gifts-nurse-gifts-for-women-best-nurse-ever.md": {
	id: "nurses-week-gifts-nurse-gifts-for-women-best-nurse-ever.md";
  slug: "nurses-week-gifts-nurse-gifts-for-women-best-nurse-ever";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"nursing-clipboard-foldable-clipboard-medical-edition-ch.md": {
	id: "nursing-clipboard-foldable-clipboard-medical-edition-ch.md";
  slug: "nursing-clipboard-foldable-clipboard-medical-edition-ch";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"nursing-clipboard-foldable-foldable-clipboard-wnursing-.md": {
	id: "nursing-clipboard-foldable-foldable-clipboard-wnursing-.md";
  slug: "nursing-clipboard-foldable-foldable-clipboard-wnursing-";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"nursing-clipboard-foldable-nurse-clipboard-medical-fold.md": {
	id: "nursing-clipboard-foldable-nurse-clipboard-medical-fold.md";
  slug: "nursing-clipboard-foldable-nurse-clipboard-medical-fold";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"nursing-clipboard-foldable-pocket-size-nursing-edition-.md": {
	id: "nursing-clipboard-foldable-pocket-size-nursing-edition-.md";
  slug: "nursing-clipboard-foldable-pocket-size-nursing-edition-";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"nursing-clipboard-with-nursing-and-medical-edition-chea.md": {
	id: "nursing-clipboard-with-nursing-and-medical-edition-chea.md";
  slug: "nursing-clipboard-with-nursing-and-medical-edition-chea";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"nursing-mnemonics-108-memory-tricks-to-demolish-nursing.md": {
	id: "nursing-mnemonics-108-memory-tricks-to-demolish-nursing.md";
  slug: "nursing-mnemonics-108-memory-tricks-to-demolish-nursing";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"nursing-narrative-note-examples-to-save-your-license-ch.md": {
	id: "nursing-narrative-note-examples-to-save-your-license-ch.md";
  slug: "nursing-narrative-note-examples-to-save-your-license-ch";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"nursing-school-coloring-book-for-adults-snarky-and-rela.md": {
	id: "nursing-school-coloring-book-for-adults-snarky-and-rela.md";
  slug: "nursing-school-coloring-book-for-adults-snarky-and-rela";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"nursing-success-bundle-400-page-handwritten-notes-desig.md": {
	id: "nursing-success-bundle-400-page-handwritten-notes-desig.md";
  slug: "nursing-success-bundle-400-page-handwritten-notes-desig";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"nursing2025-2026-drug-handbook-nursing-drug-handbooks-f.md": {
	id: "nursing2025-2026-drug-handbook-nursing-drug-handbooks-f.md";
  slug: "nursing2025-2026-drug-handbook-nursing-drug-handbooks-f";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"occupation-angel-figurine-nurse.md": {
	id: "occupation-angel-figurine-nurse.md";
  slug: "occupation-angel-figurine-nurse";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"ocj-nurse-gifts-stethoscope-necklace-925-sterling-silve.md": {
	id: "ocj-nurse-gifts-stethoscope-necklace-925-sterling-silve.md";
  slug: "ocj-nurse-gifts-stethoscope-necklace-925-sterling-silve";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"ospelelf-clipboard-with-storage-85-x-11padfolio-organiz.md": {
	id: "ospelelf-clipboard-with-storage-85-x-11padfolio-organiz.md";
  slug: "ospelelf-clipboard-with-storage-85-x-11padfolio-organiz";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"ospelelf-foldable-spiral-clipboard-folio-with-storage-z.md": {
	id: "ospelelf-foldable-spiral-clipboard-folio-with-storage-z.md";
  slug: "ospelelf-foldable-spiral-clipboard-folio-with-storage-z";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"pink-bow-stethoscope-badge-reel-retractable-for-nurse-n.md": {
	id: "pink-bow-stethoscope-badge-reel-retractable-for-nurse-n.md";
  slug: "pink-bow-stethoscope-badge-reel-retractable-for-nurse-n";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"plifal-nicu-badge-reel-holder-retractable-with-id-clip-.md": {
	id: "plifal-nicu-badge-reel-holder-retractable-with-id-clip-.md";
  slug: "plifal-nicu-badge-reel-holder-retractable-with-id-clip-";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"plifal-nurse-badge-buddy-card-nursing-accessories-glitt.md": {
	id: "plifal-nurse-badge-buddy-card-nursing-accessories-glitt.md";
  slug: "plifal-nurse-badge-buddy-card-nursing-accessories-glitt";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"premium-vein-finder-new-model-fda-registered.md": {
	id: "premium-vein-finder-new-model-fda-registered.md";
  slug: "premium-vein-finder-new-model-fda-registered";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"primacare-dl-9223-pack-of-6-disposable-diagnostic-penli.md": {
	id: "primacare-dl-9223-pack-of-6-disposable-diagnostic-penli.md";
  slug: "primacare-dl-9223-pack-of-6-disposable-diagnostic-penli";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"primitives-by-kathy-31137-polka-dot-trimmed-box-sign-4-.md": {
	id: "primitives-by-kathy-31137-polka-dot-trimmed-box-sign-4-.md";
  slug: "primitives-by-kathy-31137-polka-dot-trimmed-box-sign-4-";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"rechargeable-vein-finder-for-iv-access-oncovein-pro-led.md": {
	id: "rechargeable-vein-finder-for-iv-access-oncovein-pro-led.md";
  slug: "rechargeable-vein-finder-for-iv-access-oncovein-pro-led";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"rechargeable-vein-finder-viewer-for-iv-access-phlebotom.md": {
	id: "rechargeable-vein-finder-viewer-for-iv-access-phlebotom.md";
  slug: "rechargeable-vein-finder-viewer-for-iv-access-phlebotom";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"retractable-badge-reel-cute-badge-reels-for-nurse-badge.md": {
	id: "retractable-badge-reel-cute-badge-reels-for-nurse-badge.md";
  slug: "retractable-badge-reel-cute-badge-reels-for-nurse-badge";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"rogue-river-tactical-funny-nurse-coffee-mug-keep-calm-n.md": {
	id: "rogue-river-tactical-funny-nurse-coffee-mug-keep-calm-n.md";
  slug: "rogue-river-tactical-funny-nurse-coffee-mug-keep-calm-n";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"sandjest-nurse-gift-for-women-nutrition-facts-tumbler-w.md": {
	id: "sandjest-nurse-gift-for-women-nutrition-facts-tumbler-w.md";
  slug: "sandjest-nurse-gift-for-women-nutrition-facts-tumbler-w";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"sandjest-nurse-gift-tumbler-40oz-with-handle-and-straw--2.md": {
	id: "sandjest-nurse-gift-tumbler-40oz-with-handle-and-straw--2.md";
  slug: "sandjest-nurse-gift-tumbler-40oz-with-handle-and-straw--2";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"sandjest-nurse-gift-tumbler-40oz-with-handle-and-straw-.md": {
	id: "sandjest-nurse-gift-tumbler-40oz-with-handle-and-straw-.md";
  slug: "sandjest-nurse-gift-tumbler-40oz-with-handle-and-straw-";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"sandjest-nurse-gifts-for-women-nutrition-facts-water-bo.md": {
	id: "sandjest-nurse-gifts-for-women-nutrition-facts-water-bo.md";
  slug: "sandjest-nurse-gifts-for-women-nutrition-facts-water-bo";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"sandjest-nurse-tumbler-20oz-stainless-steel-insulated-c.md": {
	id: "sandjest-nurse-tumbler-20oz-stainless-steel-insulated-c.md";
  slug: "sandjest-nurse-tumbler-20oz-stainless-steel-insulated-c";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"sandjest-nurse-tumbler-40oz-cool-club-coffee-travel-mug.md": {
	id: "sandjest-nurse-tumbler-40oz-cool-club-coffee-travel-mug.md";
  slug: "sandjest-nurse-tumbler-40oz-cool-club-coffee-travel-mug";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"sandjest-nurse-tumbler-cup-nutritional-facts-travel-cof.md": {
	id: "sandjest-nurse-tumbler-cup-nutritional-facts-travel-cof.md";
  slug: "sandjest-nurse-tumbler-cup-nutritional-facts-travel-cof";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"seamoon-nurse-nursing-rn-graduation-gifts-for-women-new.md": {
	id: "seamoon-nurse-nursing-rn-graduation-gifts-for-women-new.md";
  slug: "seamoon-nurse-nursing-rn-graduation-gifts-for-women-new";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"self-care-for-nurses-100-ways-to-rest-reset-and-feel-yo.md": {
	id: "self-care-for-nurses-100-ways-to-rest-reset-and-feel-yo.md";
  slug: "self-care-for-nurses-100-ways-to-rest-reset-and-feel-yo";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"sharpie-mini-permanent-markers-with-golf-keychain-clips.md": {
	id: "sharpie-mini-permanent-markers-with-golf-keychain-clips.md";
  slug: "sharpie-mini-permanent-markers-with-golf-keychain-clips";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"smilebelle-nurse-graduation-gifts-for-women-nurse-neckl.md": {
	id: "smilebelle-nurse-graduation-gifts-for-women-nurse-neckl.md";
  slug: "smilebelle-nurse-graduation-gifts-for-women-nurse-neckl";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"sooez-clipboards-with-storage-plastic-clip-boards-85x11.md": {
	id: "sooez-clipboards-with-storage-plastic-clip-boards-85x11.md";
  slug: "sooez-clipboards-with-storage-plastic-clip-boards-85x11";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"start-exploring-grays-anatomy-a-fact-filled-coloring-bo.md": {
	id: "start-exploring-grays-anatomy-a-fact-filled-coloring-bo.md";
  slug: "start-exploring-grays-anatomy-a-fact-filled-coloring-bo";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"sterling-silver-stethoscope-cross-necklace-earrings-bra.md": {
	id: "sterling-silver-stethoscope-cross-necklace-earrings-bra.md";
  slug: "sterling-silver-stethoscope-cross-necklace-earrings-bra";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"stethoscope-medical-notebook-journal-doctor-nurse-noteb.md": {
	id: "stethoscope-medical-notebook-journal-doctor-nurse-noteb.md";
  slug: "stethoscope-medical-notebook-journal-doctor-nurse-noteb";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"stickers-for-the-tv-show-greys-anatomy-funny-pack-of-50.md": {
	id: "stickers-for-the-tv-show-greys-anatomy-funny-pack-of-50.md";
  slug: "stickers-for-the-tv-show-greys-anatomy-funny-pack-of-50";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"swig-life-24oz-party-cup-stackable-insulated-travel-cof.md": {
	id: "swig-life-24oz-party-cup-stackable-insulated-travel-cof.md";
  slug: "swig-life-24oz-party-cup-stackable-insulated-travel-cof";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"swig-life-30oz-mega-mug-30-oz-tumbler-with-handle-and-s.md": {
	id: "swig-life-30oz-mega-mug-30-oz-tumbler-with-handle-and-s.md";
  slug: "swig-life-30oz-mega-mug-30-oz-tumbler-with-handle-and-s";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"thank-you-gifts-for-women-spa-thoughtful-unique-office-.md": {
	id: "thank-you-gifts-for-women-spa-thoughtful-unique-office-.md";
  slug: "thank-you-gifts-for-women-spa-thoughtful-unique-office-";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"the-batclip-black-premium-leather-handmade-clip-on-stet.md": {
	id: "the-batclip-black-premium-leather-handmade-clip-on-stet.md";
  slug: "the-batclip-black-premium-leather-handmade-clip-on-stet";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"the-er-nurse-coloring-book-relaxing-patterns-designs-an.md": {
	id: "the-er-nurse-coloring-book-relaxing-patterns-designs-an.md";
  slug: "the-er-nurse-coloring-book-relaxing-patterns-designs-an";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"the-good-nurse-a-true-story-of-medicine-madness-and-mur.md": {
	id: "the-good-nurse-a-true-story-of-medicine-madness-and-mur.md";
  slug: "the-good-nurse-a-true-story-of-medicine-madness-and-mur";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"the-icu-survival-book.md": {
	id: "the-icu-survival-book.md";
  slug: "the-icu-survival-book";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"the-nurse-leader-coach-become-the-boss-no-one-wants-to-.md": {
	id: "the-nurse-leader-coach-become-the-boss-no-one-wants-to-.md";
  slug: "the-nurse-leader-coach-become-the-boss-no-one-wants-to-";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"the-nurse-paperback-september-13-2022.md": {
	id: "the-nurse-paperback-september-13-2022.md";
  slug: "the-nurse-paperback-september-13-2022";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"the-nurses-a-year-of-secrets-drama-and-miracles-with-th.md": {
	id: "the-nurses-a-year-of-secrets-drama-and-miracles-with-th.md";
  slug: "the-nurses-a-year-of-secrets-drama-and-miracles-with-th";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"the-nurses-secret-a-thrilling-historical-novel-of-the-d.md": {
	id: "the-nurses-secret-a-thrilling-historical-novel-of-the-d.md";
  slug: "the-nurses-secret-a-thrilling-historical-novel-of-the-d";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"the-perfect-nurse-a-totally-addictive-and-unputdownable.md": {
	id: "the-perfect-nurse-a-totally-addictive-and-unputdownable.md";
  slug: "the-perfect-nurse-a-totally-addictive-and-unputdownable";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"the-shift-one-nurse-twelve-hours-four-patients-lives-pa.md": {
	id: "the-shift-one-nurse-twelve-hours-four-patients-lives-pa.md";
  slug: "the-shift-one-nurse-twelve-hours-four-patients-lives-pa";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"the-ultimate-nurse-activity-book-fun-puzzles-crosswords.md": {
	id: "the-ultimate-nurse-activity-book-fun-puzzles-crosswords.md";
  slug: "the-ultimate-nurse-activity-book-fun-puzzles-crosswords";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"topdesign-utility-water-resistant-tote-bag-with-13-pock.md": {
	id: "topdesign-utility-water-resistant-tote-bag-with-13-pock.md";
  slug: "topdesign-utility-water-resistant-tote-bag-with-13-pock";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"tote-bag-for-women-with-compartmentslarge-canvas-tote-w.md": {
	id: "tote-bag-for-women-with-compartmentslarge-canvas-tote-w.md";
  slug: "tote-bag-for-women-with-compartmentslarge-canvas-tote-w";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"tribe-rn-nursing-clipboard-with-storage-medical-clipboa.md": {
	id: "tribe-rn-nursing-clipboard-with-storage-medical-clipboa.md";
  slug: "tribe-rn-nursing-clipboard-with-storage-medical-clipboa";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"vizuzi-funny-nurse-desk-decor-inspirational-plaque-for-.md": {
	id: "vizuzi-funny-nurse-desk-decor-inspirational-plaque-for-.md";
  slug: "vizuzi-funny-nurse-desk-decor-inspirational-plaque-for-";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"what-it-means-to-be-a-nurse-a-celebration-of-the-humor-.md": {
	id: "what-it-means-to-be-a-nurse-a-celebration-of-the-humor-.md";
  slug: "what-it-means-to-be-a-nurse-a-celebration-of-the-humor-";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"what-nurses-really-want-to-say-but-cant-swear-word-colo.md": {
	id: "what-nurses-really-want-to-say-but-cant-swear-word-colo.md";
  slug: "what-nurses-really-want-to-say-but-cant-swear-word-colo";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"willow-tree-angel-of-healing-sculpted-hand-painted-figu.md": {
	id: "willow-tree-angel-of-healing-sculpted-hand-painted-figu.md";
  slug: "willow-tree-angel-of-healing-sculpted-hand-painted-figu";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"winnicaca-nurse-gifts-nurse-pendant-sterling-silver-nur.md": {
	id: "winnicaca-nurse-gifts-nurse-pendant-sterling-silver-nur.md";
  slug: "winnicaca-nurse-gifts-nurse-pendant-sterling-silver-nur";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"winnicaca-nurse-graduation-necklace-mothers-day-gifts-f.md": {
	id: "winnicaca-nurse-graduation-necklace-mothers-day-gifts-f.md";
  slug: "winnicaca-nurse-graduation-necklace-mothers-day-gifts-f";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"with-love-nurses-mug-coffee-scrubs-rubber-gloves-teal-f.md": {
	id: "with-love-nurses-mug-coffee-scrubs-rubber-gloves-teal-f.md";
  slug: "with-love-nurses-mug-coffee-scrubs-rubber-gloves-teal-f";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"would-you-rather-for-nurses-175-funny-snarky-makes-you-.md": {
	id: "would-you-rather-for-nurses-175-funny-snarky-makes-you-.md";
  slug: "would-you-rather-for-nurses-175-funny-snarky-makes-you-";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"yfn-sterling-silver-caduceus-angel-nursing-themed-penda.md": {
	id: "yfn-sterling-silver-caduceus-angel-nursing-themed-penda.md";
  slug: "yfn-sterling-silver-caduceus-angel-nursing-themed-penda";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"yoke-style-stethoscope-name-tag-personalized-custom-ste.md": {
	id: "yoke-style-stethoscope-name-tag-personalized-custom-ste.md";
  slug: "yoke-style-stethoscope-name-tag-personalized-custom-ste";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"zbcfscsb-dont-be-tachy-funny-black-glitter-badge-scroll.md": {
	id: "zbcfscsb-dont-be-tachy-funny-black-glitter-badge-scroll.md";
  slug: "zbcfscsb-dont-be-tachy-funny-black-glitter-badge-scroll";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"zonon-5-pieces-cute-nurse-badge-reels-felt-retractable-.md": {
	id: "zonon-5-pieces-cute-nurse-badge-reels-felt-retractable-.md";
  slug: "zonon-5-pieces-cute-nurse-badge-reels-felt-retractable-";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
"zyrev-zetalife-otoscope-ear-scope-with-light-ear-infect.md": {
	id: "zyrev-zetalife-otoscope-ear-scope-with-light-ear-infect.md";
  slug: "zyrev-zetalife-otoscope-ear-scope-with-light-ear-infect";
  body: string;
  collection: "products";
  data: InferEntrySchema<"products">
} & { render(): Render[".md"] };
};

	};

	type DataEntryMap = {
		
	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	export type ContentConfig = typeof import("../../src/content/config.js");
}
