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
"2025-05-12-10-nurse-appreciation-gifts-to-say-thank-you.md": {
	id: "2025-05-12-10-nurse-appreciation-gifts-to-say-thank-you.md";
  slug: "2025-05-12-10-nurse-appreciation-gifts-to-say-thank-you";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-05-12-the-ultimate-guide-to-nurse-graduation-gifts.md": {
	id: "2025-05-12-the-ultimate-guide-to-nurse-graduation-gifts.md";
  slug: "2025-05-12-the-ultimate-guide-to-nurse-graduation-gifts";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-05-12-top-25-thoughtful-gifts-for-nurses-in-2025.md": {
	id: "2025-05-12-top-25-thoughtful-gifts-for-nurses-in-2025.md";
  slug: "2025-05-12-top-25-thoughtful-gifts-for-nurses-in-2025";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-05-14-why-finding-the-perfect-gift-for-your-nurse-friend-really-ma.md": {
	id: "2025-05-14-why-finding-the-perfect-gift-for-your-nurse-friend-really-ma.md";
  slug: "2025-05-14-why-finding-the-perfect-gift-for-your-nurse-friend-really-ma";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-05-18-what-is-a-good-gift-to-give-a-nurse-15-thoughtful-ideas-that.md": {
	id: "2025-05-18-what-is-a-good-gift-to-give-a-nurse-15-thoughtful-ideas-that.md";
  slug: "2025-05-18-what-is-a-good-gift-to-give-a-nurse-15-thoughtful-ideas-that";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-05-31-be-the-hero-of-2025-top-gift-picks-for-nurses.md": {
	id: "2025-05-31-be-the-hero-of-2025-top-gift-picks-for-nurses.md";
  slug: "2025-05-31-be-the-hero-of-2025-top-gift-picks-for-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-06-01-must-have-gifts-every-nurse-will-heartbeat-over.md": {
	id: "2025-06-01-must-have-gifts-every-nurse-will-heartbeat-over.md";
  slug: "2025-06-01-must-have-gifts-every-nurse-will-heartbeat-over";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-06-02-thoughtful-gifts-nurses-actually-crave.md": {
	id: "2025-06-02-thoughtful-gifts-nurses-actually-crave.md";
  slug: "2025-06-02-thoughtful-gifts-nurses-actually-crave";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-06-03-discover-unique-nurse-gift-ideas-you-havent-thought-of.md": {
	id: "2025-06-03-discover-unique-nurse-gift-ideas-you-havent-thought-of.md";
  slug: "2025-06-03-discover-unique-nurse-gift-ideas-you-havent-thought-of";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-06-04-lol-worthy-gifts-thatll-have-nurses-in-stitches.md": {
	id: "2025-06-04-lol-worthy-gifts-thatll-have-nurses-in-stitches.md";
  slug: "2025-06-04-lol-worthy-gifts-thatll-have-nurses-in-stitches";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-06-05-unwrap-the-unexpected-gifts-for-nurses-who-have-everything.md": {
	id: "2025-06-05-unwrap-the-unexpected-gifts-for-nurses-who-have-everything.md";
  slug: "2025-06-05-unwrap-the-unexpected-gifts-for-nurses-who-have-everything";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-06-06-top-amazon-finds-must-have-gifts-for-nurses-that-theyll-love.md": {
	id: "2025-06-06-top-amazon-finds-must-have-gifts-for-nurses-that-theyll-love.md";
  slug: "2025-06-06-top-amazon-finds-must-have-gifts-for-nurses-that-theyll-love";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-06-07-affordable-and-awesome-nurse-gift-ideas-under-25.md": {
	id: "2025-06-07-affordable-and-awesome-nurse-gift-ideas-under-25.md";
  slug: "2025-06-07-affordable-and-awesome-nurse-gift-ideas-under-25";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-06-08-beat-the-coffee-craze-non-caffeinated-gifts-nurses-will-love.md": {
	id: "2025-06-08-beat-the-coffee-craze-non-caffeinated-gifts-nurses-will-love.md";
  slug: "2025-06-08-beat-the-coffee-craze-non-caffeinated-gifts-nurses-will-love";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-06-09-gender-neutral-nurse-gift-ideas-perfect-presents-for-every-h.md": {
	id: "2025-06-09-gender-neutral-nurse-gift-ideas-perfect-presents-for-every-h.md";
  slug: "2025-06-09-gender-neutral-nurse-gift-ideas-perfect-presents-for-every-h";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-06-10-budget-friendly-bliss-gifts-for-nurses-under-10.md": {
	id: "2025-06-10-budget-friendly-bliss-gifts-for-nurses-under-10.md";
  slug: "2025-06-10-budget-friendly-bliss-gifts-for-nurses-under-10";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-06-11-budget-friendly-finds-best-nurse-gifts-under-20.md": {
	id: "2025-06-11-budget-friendly-finds-best-nurse-gifts-under-20.md";
  slug: "2025-06-11-budget-friendly-finds-best-nurse-gifts-under-20";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-06-12-spoil-your-favorite-nurse-premium-gifts-over-100-to-make-the.md": {
	id: "2025-06-12-spoil-your-favorite-nurse-premium-gifts-over-100-to-make-the.md";
  slug: "2025-06-12-spoil-your-favorite-nurse-premium-gifts-over-100-to-make-the";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-06-13-penny-pinching-presents-diy-nurse-gift-ideas-that-wow.md": {
	id: "2025-06-13-penny-pinching-presents-diy-nurse-gift-ideas-that-wow.md";
  slug: "2025-06-13-penny-pinching-presents-diy-nurse-gift-ideas-that-wow";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-06-14-luxurious-gifts-that-will-make-your-favorite-nurse-feel-like.md": {
	id: "2025-06-14-luxurious-gifts-that-will-make-your-favorite-nurse-feel-like.md";
  slug: "2025-06-14-luxurious-gifts-that-will-make-your-favorite-nurse-feel-like";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-06-15-cheers-to-new-beginnings-the-ultimate-nurse-graduation-gift-.md": {
	id: "2025-06-15-cheers-to-new-beginnings-the-ultimate-nurse-graduation-gift-.md";
  slug: "2025-06-15-cheers-to-new-beginnings-the-ultimate-nurse-graduation-gift-";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-06-16-first-day-magic-perfect-gifts-for-the-newbie-nurse.md": {
	id: "2025-06-16-first-day-magic-perfect-gifts-for-the-newbie-nurse.md";
  slug: "2025-06-16-first-day-magic-perfect-gifts-for-the-newbie-nurse";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-06-17-nursing-their-way-to-relaxation-retirement-gift-ideas-for-nu.md": {
	id: "2025-06-17-nursing-their-way-to-relaxation-retirement-gift-ideas-for-nu.md";
  slug: "2025-06-17-nursing-their-way-to-relaxation-retirement-gift-ideas-for-nu";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-06-18-top-farewell-gifts-that-will-make-your-favorite-nurse-miss-y.md": {
	id: "2025-06-18-top-farewell-gifts-that-will-make-your-favorite-nurse-miss-y.md";
  slug: "2025-06-18-top-farewell-gifts-that-will-make-your-favorite-nurse-miss-y";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-06-19-unforgettable-thank-you-gifts-for-nurses-creative-ways-to-sh.md": {
	id: "2025-06-19-unforgettable-thank-you-gifts-for-nurses-creative-ways-to-sh.md";
  slug: "2025-06-19-unforgettable-thank-you-gifts-for-nurses-creative-ways-to-sh";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-06-20-birthday-gifts-for-nurses-theyll-actually-use-our-top-picks.md": {
	id: "2025-06-20-birthday-gifts-for-nurses-theyll-actually-use-our-top-picks.md";
  slug: "2025-06-20-birthday-gifts-for-nurses-theyll-actually-use-our-top-picks";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-06-21-love-and-stethoscopes-anniversary-gift-ideas-for-nurse-coupl.md": {
	id: "2025-06-21-love-and-stethoscopes-anniversary-gift-ideas-for-nurse-coupl.md";
  slug: "2025-06-21-love-and-stethoscopes-anniversary-gift-ideas-for-nurse-coupl";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-06-22-promotion-celebration-perfect-gifts-for-the-new-nurse-manage.md": {
	id: "2025-06-22-promotion-celebration-perfect-gifts-for-the-new-nurse-manage.md";
  slug: "2025-06-22-promotion-celebration-perfect-gifts-for-the-new-nurse-manage";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-06-23-healing-with-humor-the-ultimate-get-well-soon-gifts-for-your.md": {
	id: "2025-06-23-healing-with-humor-the-ultimate-get-well-soon-gifts-for-your.md";
  slug: "2025-06-23-healing-with-humor-the-ultimate-get-well-soon-gifts-for-your";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-06-24-unpack-the-perfect-housewarming-gifts-for-travel-nurses-on-t.md": {
	id: "2025-06-24-unpack-the-perfect-housewarming-gifts-for-travel-nurses-on-t.md";
  slug: "2025-06-24-unpack-the-perfect-housewarming-gifts-for-travel-nurses-on-t";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-06-25-er-nurses-deserve-a-medaland-these-perfect-gifts.md": {
	id: "2025-06-25-er-nurses-deserve-a-medaland-these-perfect-gifts.md";
  slug: "2025-06-25-er-nurses-deserve-a-medaland-these-perfect-gifts";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-06-26-critical-care-kudos-the-best-gifts-for-icu-nurses.md": {
	id: "2025-06-26-critical-care-kudos-the-best-gifts-for-icu-nurses.md";
  slug: "2025-06-26-critical-care-kudos-the-best-gifts-for-icu-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-06-27-the-ultimate-gift-guide-for-labor-delivery-nurses-bringing-j.md": {
	id: "2025-06-27-the-ultimate-gift-guide-for-labor-delivery-nurses-bringing-j.md";
  slug: "2025-06-27-the-ultimate-gift-guide-for-labor-delivery-nurses-bringing-j";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-06-28-gifts-for-pediatric-nurses-fun-finds-for-those-who-heal-tiny.md": {
	id: "2025-06-28-gifts-for-pediatric-nurses-fun-finds-for-those-who-heal-tiny.md";
  slug: "2025-06-28-gifts-for-pediatric-nurses-fun-finds-for-those-who-heal-tiny";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-06-29-telecommuting-in-style-telehealth-nurse-gift-ideas-to-bright.md": {
	id: "2025-06-29-telecommuting-in-style-telehealth-nurse-gift-ideas-to-bright.md";
  slug: "2025-06-29-telecommuting-in-style-telehealth-nurse-gift-ideas-to-bright";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-06-30-oncology-nurse-gifts-that-show-you-truly-care-thoughtful-pic.md": {
	id: "2025-06-30-oncology-nurse-gifts-that-show-you-truly-care-thoughtful-pic.md";
  slug: "2025-06-30-oncology-nurse-gifts-that-show-you-truly-care-thoughtful-pic";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-07-01-a-gifts-for-school-nurses-making-the-grade-in-thoughtful-gif.md": {
	id: "2025-07-01-a-gifts-for-school-nurses-making-the-grade-in-thoughtful-gif.md";
  slug: "2025-07-01-a-gifts-for-school-nurses-making-the-grade-in-thoughtful-gif";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-07-02-the-nurse-case-manager-gift-guide-making-their-day-with-thou.md": {
	id: "2025-07-02-the-nurse-case-manager-gift-guide-making-their-day-with-thou.md";
  slug: "2025-07-02-the-nurse-case-manager-gift-guide-making-their-day-with-thou";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-07-03-scalpel-available-gifts-perfect-picks-for-or-nurses.md": {
	id: "2025-07-03-scalpel-available-gifts-perfect-picks-for-or-nurses.md";
  slug: "2025-07-03-scalpel-available-gifts-perfect-picks-for-or-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-07-04-top-gifts-for-nurse-educators-a-prescription-for-joy-and-app.md": {
	id: "2025-07-04-top-gifts-for-nurse-educators-a-prescription-for-joy-and-app.md";
  slug: "2025-07-04-top-gifts-for-nurse-educators-a-prescription-for-joy-and-app";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-07-05-the-ultimate-guide-to-spoiling-your-nurse-wife-gift-ideas-sh.md": {
	id: "2025-07-05-the-ultimate-guide-to-spoiling-your-nurse-wife-gift-ideas-sh.md";
  slug: "2025-07-05-the-ultimate-guide-to-spoiling-your-nurse-wife-gift-ideas-sh";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-07-06-nurturing-love-gift-ideas-for-your-nurse-husband.md": {
	id: "2025-07-06-nurturing-love-gift-ideas-for-your-nurse-husband.md";
  slug: "2025-07-06-nurturing-love-gift-ideas-for-your-nurse-husband";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-07-07-unwrap-joy-the-ultimate-gift-guide-for-your-nurse-bff.md": {
	id: "2025-07-07-unwrap-joy-the-ultimate-gift-guide-for-your-nurse-bff.md";
  slug: "2025-07-07-unwrap-joy-the-ultimate-gift-guide-for-your-nurse-bff";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-07-08-cracking-the-code-perfect-gifts-for-your-nurse-coworker.md": {
	id: "2025-07-08-cracking-the-code-perfect-gifts-for-your-nurse-coworker.md";
  slug: "2025-07-08-cracking-the-code-perfect-gifts-for-your-nurse-coworker";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-07-09-nurse-appreciation-gifts-from-patients-a-token-of-gratitude-.md": {
	id: "2025-07-09-nurse-appreciation-gifts-from-patients-a-token-of-gratitude-.md";
  slug: "2025-07-09-nurse-appreciation-gifts-from-patients-a-token-of-gratitude-";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-07-10-adorable-nurse-gift-ideas-from-kids-tiny-tokens-of-big-appre.md": {
	id: "2025-07-10-adorable-nurse-gift-ideas-from-kids-tiny-tokens-of-big-appre.md";
  slug: "2025-07-10-adorable-nurse-gift-ideas-from-kids-tiny-tokens-of-big-appre";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-07-11-crafting-care-diy-gifts-thatll-make-your-nurse-moms-scrubs-s.md": {
	id: "2025-07-11-crafting-care-diy-gifts-thatll-make-your-nurse-moms-scrubs-s.md";
  slug: "2025-07-11-crafting-care-diy-gifts-thatll-make-your-nurse-moms-scrubs-s";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-07-12-the-ultimate-gift-guide-for-the-charge-nurse-who-takes-charg.md": {
	id: "2025-07-12-the-ultimate-gift-guide-for-the-charge-nurse-who-takes-charg.md";
  slug: "2025-07-12-the-ultimate-gift-guide-for-the-charge-nurse-who-takes-charg";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-07-13-elevate-your-nurse-boss-gifting-game-classy-ideas-to-impress.md": {
	id: "2025-07-13-elevate-your-nurse-boss-gifting-game-classy-ideas-to-impress.md";
  slug: "2025-07-13-elevate-your-nurse-boss-gifting-game-classy-ideas-to-impress";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-07-14-team-spirit-group-gift-ideas-thatll-make-your-floor-scrub-up.md": {
	id: "2025-07-14-team-spirit-group-gift-ideas-thatll-make-your-floor-scrub-up.md";
  slug: "2025-07-14-team-spirit-group-gift-ideas-thatll-make-your-floor-scrub-up";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-07-15-jingle-bells-and-nurse-smells-a-holiday-gift-guide-for-nurse.md": {
	id: "2025-07-15-jingle-bells-and-nurse-smells-a-holiday-gift-guide-for-nurse.md";
  slug: "2025-07-15-jingle-bells-and-nurse-smells-a-holiday-gift-guide-for-nurse";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-07-16-stocking-stuffers-thatll-make-nurses-smile-the-ultimate-chee.md": {
	id: "2025-07-16-stocking-stuffers-thatll-make-nurses-smile-the-ultimate-chee.md";
  slug: "2025-07-16-stocking-stuffers-thatll-make-nurses-smile-the-ultimate-chee";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-07-17-love-at-first-scrub-valentines-day-gifts-for-your-favorite-n.md": {
	id: "2025-07-17-love-at-first-scrub-valentines-day-gifts-for-your-favorite-n.md";
  slug: "2025-07-17-love-at-first-scrub-valentines-day-gifts-for-your-favorite-n";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-07-18-egg-cellent-easter-basket-ideas-for-nurses-hoppy-surprises-t.md": {
	id: "2025-07-18-egg-cellent-easter-basket-ideas-for-nurses-hoppy-surprises-t.md";
  slug: "2025-07-18-egg-cellent-easter-basket-ideas-for-nurses-hoppy-surprises-t";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-07-19-boo-tiful-halloween-themed-gifts-that-nurses-will-absolutely.md": {
	id: "2025-07-19-boo-tiful-halloween-themed-gifts-that-nurses-will-absolutely.md";
  slug: "2025-07-19-boo-tiful-halloween-themed-gifts-that-nurses-will-absolutely";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-07-20-gobble-up-these-thanksgiving-appreciation-gifts-for-nurses.md": {
	id: "2025-07-20-gobble-up-these-thanksgiving-appreciation-gifts-for-nurses.md";
  slug: "2025-07-20-gobble-up-these-thanksgiving-appreciation-gifts-for-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-07-21-unwrap-the-fun-secret-santa-gift-ideas-for-nurses.md": {
	id: "2025-07-21-unwrap-the-fun-secret-santa-gift-ideas-for-nurses.md";
  slug: "2025-07-21-unwrap-the-fun-secret-santa-gift-ideas-for-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-07-22-bell-ringing-back-to-school-gifts-for-your-favorite-school-n.md": {
	id: "2025-07-22-bell-ringing-back-to-school-gifts-for-your-favorite-school-n.md";
  slug: "2025-07-22-bell-ringing-back-to-school-gifts-for-your-favorite-school-n";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-07-23-beating-the-heat-summer-survival-gift-ideas-for-nurses.md": {
	id: "2025-07-23-beating-the-heat-summer-survival-gift-ideas-for-nurses.md";
  slug: "2025-07-23-beating-the-heat-summer-survival-gift-ideas-for-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-07-24-craft-the-perfect-nurse-friendly-fall-gift-basket-cozy-essen.md": {
	id: "2025-07-24-craft-the-perfect-nurse-friendly-fall-gift-basket-cozy-essen.md";
  slug: "2025-07-24-craft-the-perfect-nurse-friendly-fall-gift-basket-cozy-essen";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-07-25-chic-on-the-cheap-easy-diy-gifts-for-nurses-that-look-luxe.md": {
	id: "2025-07-25-chic-on-the-cheap-easy-diy-gifts-for-nurses-that-look-luxe.md";
  slug: "2025-07-25-chic-on-the-cheap-easy-diy-gifts-for-nurses-that-look-luxe";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-07-26-diy-your-way-to-a-nurses-heart-homemade-personalized-gifts.md": {
	id: "2025-07-26-diy-your-way-to-a-nurses-heart-homemade-personalized-gifts.md";
  slug: "2025-07-26-diy-your-way-to-a-nurses-heart-homemade-personalized-gifts";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-07-27-crafting-the-perfect-diy-care-package-for-our-heroic-nurses.md": {
	id: "2025-07-27-crafting-the-perfect-diy-care-package-for-our-heroic-nurses.md";
  slug: "2025-07-27-crafting-the-perfect-diy-care-package-for-our-heroic-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-07-28-build-the-ultimate-nurse-survival-kit-the-gift-that-keeps-on.md": {
	id: "2025-07-28-build-the-ultimate-nurse-survival-kit-the-gift-that-keeps-on.md";
  slug: "2025-07-28-build-the-ultimate-nurse-survival-kit-the-gift-that-keeps-on";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-07-30-crafting-compassion-best-cricut-projects-for-nurse-gifts.md": {
	id: "2025-07-30-crafting-compassion-best-cricut-projects-for-nurse-gifts.md";
  slug: "2025-07-30-crafting-compassion-best-cricut-projects-for-nurse-gifts";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-07-31-brew-tiful-coffee-gifts-for-nurses-who-run-on-caffeine-liter.md": {
	id: "2025-07-31-brew-tiful-coffee-gifts-for-nurses-who-run-on-caffeine-liter.md";
  slug: "2025-07-31-brew-tiful-coffee-gifts-for-nurses-who-run-on-caffeine-liter";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-08-01-snack-time-savvy-healthy-snack-box-ideas-for-nurses-on-the-g.md": {
	id: "2025-08-01-snack-time-savvy-healthy-snack-box-ideas-for-nurses-on-the-g.md";
  slug: "2025-08-01-snack-time-savvy-healthy-snack-box-ideas-for-nurses-on-the-g";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-08-02-sip-sip-hooray-the-tea-lover-gift-guide-for-nurses.md": {
	id: "2025-08-02-sip-sip-hooray-the-tea-lover-gift-guide-for-nurses.md";
  slug: "2025-08-02-sip-sip-hooray-the-tea-lover-gift-guide-for-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-08-03-sip-sip-hooray-the-ultimate-guide-to-water-bottles-and-hydra.md": {
	id: "2025-08-03-sip-sip-hooray-the-ultimate-guide-to-water-bottles-and-hydra.md";
  slug: "2025-08-03-sip-sip-hooray-the-ultimate-guide-to-water-bottles-and-hydra";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-08-04-lunch-bags-meal-prep-magic-gifts-nurses-will-love.md": {
	id: "2025-08-04-lunch-bags-meal-prep-magic-gifts-nurses-will-love.md";
  slug: "2025-08-04-lunch-bags-meal-prep-magic-gifts-nurses-will-love";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-08-05-on-the-road-essentials-perfect-gifts-for-nurses-who-travel.md": {
	id: "2025-08-05-on-the-road-essentials-perfect-gifts-for-nurses-who-travel.md";
  slug: "2025-08-05-on-the-road-essentials-perfect-gifts-for-nurses-who-travel";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-08-06-jet-setting-essentials-must-have-gadgets-for-on-the-go-trave.md": {
	id: "2025-08-06-jet-setting-essentials-must-have-gadgets-for-on-the-go-trave.md";
  slug: "2025-08-06-jet-setting-essentials-must-have-gadgets-for-on-the-go-trave";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-08-07-jet-set-in-scrubs-the-ultimate-luggage-travel-accessories-fo.md": {
	id: "2025-08-07-jet-set-in-scrubs-the-ultimate-luggage-travel-accessories-fo.md";
  slug: "2025-08-07-jet-set-in-scrubs-the-ultimate-luggage-travel-accessories-fo";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-08-08-unbox-happiness-subscription-boxes-travel-nurses-will-adore.md": {
	id: "2025-08-08-unbox-happiness-subscription-boxes-travel-nurses-will-adore.md";
  slug: "2025-08-08-unbox-happiness-subscription-boxes-travel-nurses-will-adore";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-08-09-airbnb-or-hotel-gift-cards-the-ultimate-debate-for-travel-nu.md": {
	id: "2025-08-09-airbnb-or-hotel-gift-cards-the-ultimate-debate-for-travel-nu.md";
  slug: "2025-08-09-airbnb-or-hotel-gift-cards-the-ultimate-debate-for-travel-nu";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-08-10-remote-telehealth-nurses-deserve-the-best-perfect-gift-ideas.md": {
	id: "2025-08-10-remote-telehealth-nurses-deserve-the-best-perfect-gift-ideas.md";
  slug: "2025-08-10-remote-telehealth-nurses-deserve-the-best-perfect-gift-ideas";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-08-11-tech-gadgets-that-make-nurses-scrubs-look-like-superhero-cap.md": {
	id: "2025-08-11-tech-gadgets-that-make-nurses-scrubs-look-like-superhero-cap.md";
  slug: "2025-08-11-tech-gadgets-that-make-nurses-scrubs-look-like-superhero-cap";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-08-12-home-office-must-haves-for-nurses-headsets-cameras-more.md": {
	id: "2025-08-12-home-office-must-haves-for-nurses-headsets-cameras-more.md";
  slug: "2025-08-12-home-office-must-haves-for-nurses-headsets-cameras-more";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-08-13-eye-celebrate-perfect-eye-friendly-gifts-for-nurses.md": {
	id: "2025-08-13-eye-celebrate-perfect-eye-friendly-gifts-for-nurses.md";
  slug: "2025-08-13-eye-celebrate-perfect-eye-friendly-gifts-for-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-08-14-supercharge-a-nurses-day-top-productivity-tools-for-wfh-hero.md": {
	id: "2025-08-14-supercharge-a-nurses-day-top-productivity-tools-for-wfh-hero.md";
  slug: "2025-08-14-supercharge-a-nurses-day-top-productivity-tools-for-wfh-hero";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-08-15-self-care-savior-thoughtful-gifts-for-burned-out-nurses.md": {
	id: "2025-08-15-self-care-savior-thoughtful-gifts-for-burned-out-nurses.md";
  slug: "2025-08-15-self-care-savior-thoughtful-gifts-for-burned-out-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-08-16-uplifting-gifts-for-nurses-a-mental-health-boost-they-deserv.md": {
	id: "2025-08-16-uplifting-gifts-for-nurses-a-mental-health-boost-they-deserv.md";
  slug: "2025-08-16-uplifting-gifts-for-nurses-a-mental-health-boost-they-deserv";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-08-17-unwind-with-delight-spa-relaxation-gifts-every-nurse-will-sw.md": {
	id: "2025-08-17-unwind-with-delight-spa-relaxation-gifts-every-nurse-will-sw.md";
  slug: "2025-08-17-unwind-with-delight-spa-relaxation-gifts-every-nurse-will-sw";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-08-18-a-whiff-of-relief-essential-oils-aromatherapy-gifts-for-nurs.md": {
	id: "2025-08-18-a-whiff-of-relief-essential-oils-aromatherapy-gifts-for-nurs.md";
  slug: "2025-08-18-a-whiff-of-relief-essential-oils-aromatherapy-gifts-for-nurs";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-08-19-sweet-dreams-gifts-weighted-blankets-and-sleep-surprises-for.md": {
	id: "2025-08-19-sweet-dreams-gifts-weighted-blankets-and-sleep-surprises-for.md";
  slug: "2025-08-19-sweet-dreams-gifts-weighted-blankets-and-sleep-surprises-for";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-08-20-stress-less-gift-more-the-best-subscription-boxes-for-nurses.md": {
	id: "2025-08-20-stress-less-gift-more-the-best-subscription-boxes-for-nurses.md";
  slug: "2025-08-20-stress-less-gift-more-the-best-subscription-boxes-for-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-08-21-perk-up-their-day-coffee-club-subscriptions-every-nurse-will.md": {
	id: "2025-08-21-perk-up-their-day-coffee-club-subscriptions-every-nurse-will.md";
  slug: "2025-08-21-perk-up-their-day-coffee-club-subscriptions-every-nurse-will";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-08-22-pamper-prosper-the-best-wellness-subscription-boxes-for-nurs.md": {
	id: "2025-08-22-pamper-prosper-the-best-wellness-subscription-boxes-for-nurs.md";
  slug: "2025-08-22-pamper-prosper-the-best-wellness-subscription-boxes-for-nurs";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-08-23-book-clubs-reading-subscriptions-the-perfect-prescription-fo.md": {
	id: "2025-08-23-book-clubs-reading-subscriptions-the-perfect-prescription-fo.md";
  slug: "2025-08-23-book-clubs-reading-subscriptions-the-perfect-prescription-fo";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-08-24-scrub-box-subscriptions-the-perfect-fit-or-dusty-folly.md": {
	id: "2025-08-24-scrub-box-subscriptions-the-perfect-fit-or-dusty-folly.md";
  slug: "2025-08-24-scrub-box-subscriptions-the-perfect-fit-or-dusty-folly";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-08-25-beyond-the-books-gift-ideas-for-nursing-students-that-make-t.md": {
	id: "2025-08-25-beyond-the-books-gift-ideas-for-nursing-students-that-make-t.md";
  slug: "2025-08-25-beyond-the-books-gift-ideas-for-nursing-students-that-make-t";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-08-26-page-turners-for-nurses-must-read-books-theyll-love.md": {
	id: "2025-08-26-page-turners-for-nurses-must-read-books-theyll-love.md";
  slug: "2025-08-26-page-turners-for-nurses-must-read-books-theyll-love";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-08-27-ace-nursing-school-with-these-study-supplies-perfect-for-fut.md": {
	id: "2025-08-27-ace-nursing-school-with-these-study-supplies-perfect-for-fut.md";
  slug: "2025-08-27-ace-nursing-school-with-these-study-supplies-perfect-for-fut";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-08-28-the-ultimate-gift-guide-for-new-nurses-starting-residency.md": {
	id: "2025-08-28-the-ultimate-gift-guide-for-new-nurses-starting-residency.md";
  slug: "2025-08-28-the-ultimate-gift-guide-for-new-nurses-starting-residency";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-08-29-empowering-gifts-professional-development-tools-every-nurse-.md": {
	id: "2025-08-29-empowering-gifts-professional-development-tools-every-nurse-.md";
  slug: "2025-08-29-empowering-gifts-professional-development-tools-every-nurse-";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-08-30-are-gag-gifts-okay-for-nurses-laughter-levity-and-considerat.md": {
	id: "2025-08-30-are-gag-gifts-okay-for-nurses-laughter-levity-and-considerat.md";
  slug: "2025-08-30-are-gag-gifts-okay-for-nurses-laughter-levity-and-considerat";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-08-31-funny-vs-functional-gifts-whats-the-best-prescription-for-a-.md": {
	id: "2025-08-31-funny-vs-functional-gifts-whats-the-best-prescription-for-a-.md";
  slug: "2025-08-31-funny-vs-functional-gifts-whats-the-best-prescription-for-a-";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-09-01-best-nurse-t-shirts-that-are-anything-but-cringe-flaunt-your.md": {
	id: "2025-09-01-best-nurse-t-shirts-that-are-anything-but-cringe-flaunt-your.md";
  slug: "2025-09-01-best-nurse-t-shirts-that-are-anything-but-cringe-flaunt-your";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-09-02-how-to-gift-a-nurse-without-giving-another-mug-unwrapped-awe.md": {
	id: "2025-09-02-how-to-gift-a-nurse-without-giving-another-mug-unwrapped-awe.md";
  slug: "2025-09-02-how-to-gift-a-nurse-without-giving-another-mug-unwrapped-awe";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-09-03-what-not-to-gift-a-nurse-avoid-these-gifting-pitfalls.md": {
	id: "2025-09-03-what-not-to-gift-a-nurse-avoid-these-gifting-pitfalls.md";
  slug: "2025-09-03-what-not-to-gift-a-nurse-avoid-these-gifting-pitfalls";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-09-04-the-top-nurse-gifts-of-the-year-unwrapping-joy-and-a-dash-of.md": {
	id: "2025-09-04-the-top-nurse-gifts-of-the-year-unwrapping-joy-and-a-dash-of.md";
  slug: "2025-09-04-the-top-nurse-gifts-of-the-year-unwrapping-joy-and-a-dash-of";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-09-05-nurse-gift-trends-to-watch-in-2025-what-every-nurse-secretly.md": {
	id: "2025-09-05-nurse-gift-trends-to-watch-in-2025-what-every-nurse-secretly.md";
  slug: "2025-09-05-nurse-gift-trends-to-watch-in-2025-what-every-nurse-secretly";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-09-06-shop-til-you-drop-a-stethoscope-where-to-buy-the-best-nurse-.md": {
	id: "2025-09-06-shop-til-you-drop-a-stethoscope-where-to-buy-the-best-nurse-.md";
  slug: "2025-09-06-shop-til-you-drop-a-stethoscope-where-to-buy-the-best-nurse-";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-09-07-etsy-vs-amazon-the-ultimate-showdown-for-nurse-gifts.md": {
	id: "2025-09-07-etsy-vs-amazon-the-ultimate-showdown-for-nurse-gifts.md";
  slug: "2025-09-07-etsy-vs-amazon-the-ultimate-showdown-for-nurse-gifts";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-09-08-the-psychology-of-gifting-nurses-why-thoughtful-gifts-hit-th.md": {
	id: "2025-09-08-the-psychology-of-gifting-nurses-why-thoughtful-gifts-hit-th.md";
  slug: "2025-09-08-the-psychology-of-gifting-nurses-why-thoughtful-gifts-hit-th";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-09-13-practical-presents-best-gifts-for-nurses-theyll-actually-use.md": {
	id: "2025-09-13-practical-presents-best-gifts-for-nurses-theyll-actually-use.md";
  slug: "2025-09-13-practical-presents-best-gifts-for-nurses-theyll-actually-use";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-09-13-unwrap-the-fun-unique-gift-ideas-for-nurses-who-have-everyth.md": {
	id: "2025-09-13-unwrap-the-fun-unique-gift-ideas-for-nurses-who-have-everyth.md";
  slug: "2025-09-13-unwrap-the-fun-unique-gift-ideas-for-nurses-who-have-everyth";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-09-14-personalized-nurse-gifts-that-show-you-care-make-it-personal.md": {
	id: "2025-09-14-personalized-nurse-gifts-that-show-you-care-make-it-personal.md";
  slug: "2025-09-14-personalized-nurse-gifts-that-show-you-care-make-it-personal";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-09-15-unwrap-joy-the-best-christmas-gifts-for-nurses-in-2023.md": {
	id: "2025-09-15-unwrap-joy-the-best-christmas-gifts-for-nurses-in-2023.md";
  slug: "2025-09-15-unwrap-joy-the-best-christmas-gifts-for-nurses-in-2023";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-09-16-budget-friendly-bliss-gifts-for-nurses-under-25.md": {
	id: "2025-09-16-budget-friendly-bliss-gifts-for-nurses-under-25.md";
  slug: "2025-09-16-budget-friendly-bliss-gifts-for-nurses-under-25";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-09-17-splurge-worthy-luxury-gifts-for-the-nurse-who-deserves-the-w.md": {
	id: "2025-09-17-splurge-worthy-luxury-gifts-for-the-nurse-who-deserves-the-w.md";
  slug: "2025-09-17-splurge-worthy-luxury-gifts-for-the-nurse-who-deserves-the-w";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-09-18-hilarious-nurse-gifts-guaranteed-giggles-after-grueling-shif.md": {
	id: "2025-09-18-hilarious-nurse-gifts-guaranteed-giggles-after-grueling-shif.md";
  slug: "2025-09-18-hilarious-nurse-gifts-guaranteed-giggles-after-grueling-shif";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-09-19-everyday-essentials-practical-nurse-gifts-theyll-use-and-lov.md": {
	id: "2025-09-19-everyday-essentials-practical-nurse-gifts-theyll-use-and-lov.md";
  slug: "2025-09-19-everyday-essentials-practical-nurse-gifts-theyll-use-and-lov";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-09-20-celebrate-success-the-best-graduation-gifts-for-new-nurses.md": {
	id: "2025-09-20-celebrate-success-the-best-graduation-gifts-for-new-nurses.md";
  slug: "2025-09-20-celebrate-success-the-best-graduation-gifts-for-new-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-09-21-celebrate-their-legacy-the-best-retirement-gifts-for-nurses-.md": {
	id: "2025-09-21-celebrate-their-legacy-the-best-retirement-gifts-for-nurses-.md";
  slug: "2025-09-21-celebrate-their-legacy-the-best-retirement-gifts-for-nurses-";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-09-22-crafty-compassion-creative-diy-nurse-gift-ideas-you-can-make.md": {
	id: "2025-09-22-crafty-compassion-creative-diy-nurse-gift-ideas-you-can-make.md";
  slug: "2025-09-22-crafty-compassion-creative-diy-nurse-gift-ideas-you-can-make";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-09-23-10-best-back-to-school-gifts-to-wow-your-favorite-nursing-st.md": {
	id: "2025-09-23-10-best-back-to-school-gifts-to-wow-your-favorite-nursing-st.md";
  slug: "2025-09-23-10-best-back-to-school-gifts-to-wow-your-favorite-nursing-st";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-09-24-nurse-appreciation-week-gift-ideas-thatll-make-them-feel-lik.md": {
	id: "2025-09-24-nurse-appreciation-week-gift-ideas-thatll-make-them-feel-lik.md";
  slug: "2025-09-24-nurse-appreciation-week-gift-ideas-thatll-make-them-feel-lik";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-09-25-heartfelt-valentines-day-gifts-for-nurses-that-show-love-and.md": {
	id: "2025-09-25-heartfelt-valentines-day-gifts-for-nurses-that-show-love-and.md";
  slug: "2025-09-25-heartfelt-valentines-day-gifts-for-nurses-that-show-love-and";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-09-26-beyond-bandages-the-best-birthday-gifts-for-nurses-for-a-dos.md": {
	id: "2025-09-26-beyond-bandages-the-best-birthday-gifts-for-nurses-for-a-dos.md";
  slug: "2025-09-26-beyond-bandages-the-best-birthday-gifts-for-nurses-for-a-dos";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-09-27-quirky-cool-unique-gifts-for-male-nurses-that-break-the-mold.md": {
	id: "2025-09-27-quirky-cool-unique-gifts-for-male-nurses-that-break-the-mold.md";
  slug: "2025-09-27-quirky-cool-unique-gifts-for-male-nurses-that-break-the-mold";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-09-28-pediatric-nurse-presents-unwrap-the-joy-with-these-thoughtfu.md": {
	id: "2025-09-28-pediatric-nurse-presents-unwrap-the-joy-with-these-thoughtfu.md";
  slug: "2025-09-28-pediatric-nurse-presents-unwrap-the-joy-with-these-thoughtfu";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-09-29-life-savers-delight-top-gifts-for-er-nurses-who-make-a-diffe.md": {
	id: "2025-09-29-life-savers-delight-top-gifts-for-er-nurses-who-make-a-diffe.md";
  slug: "2025-09-29-life-savers-delight-top-gifts-for-er-nurses-who-make-a-diffe";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-09-30-heartfelt-gifts-for-icu-nurses-honor-the-heroes-in-scrubs.md": {
	id: "2025-09-30-heartfelt-gifts-for-icu-nurses-honor-the-heroes-in-scrubs.md";
  slug: "2025-09-30-heartfelt-gifts-for-icu-nurses-honor-the-heroes-in-scrubs";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-10-01-jet-set-cures-the-best-gifts-for-travel-nurses-on-the-go.md": {
	id: "2025-10-01-jet-set-cures-the-best-gifts-for-travel-nurses-on-the-go.md";
  slug: "2025-10-01-jet-set-cures-the-best-gifts-for-travel-nurses-on-the-go";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-10-02-virtual-heroes-the-best-gifts-for-telehealth-nurses-working-.md": {
	id: "2025-10-02-virtual-heroes-the-best-gifts-for-telehealth-nurses-working-.md";
  slug: "2025-10-02-virtual-heroes-the-best-gifts-for-telehealth-nurses-working-";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-10-03-night-shift-nurses-deserve-the-brightest-stars-unique-gift-i.md": {
	id: "2025-10-03-night-shift-nurses-deserve-the-brightest-stars-unique-gift-i.md";
  slug: "2025-10-03-night-shift-nurses-deserve-the-brightest-stars-unique-gift-i";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-10-04-stuff-your-stockings-with-nurse-friendly-treats-holiday-gift.md": {
	id: "2025-10-04-stuff-your-stockings-with-nurse-friendly-treats-holiday-gift.md";
  slug: "2025-10-04-stuff-your-stockings-with-nurse-friendly-treats-holiday-gift";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-10-05-self-care-secrets-pamper-the-nurse-in-your-life.md": {
	id: "2025-10-05-self-care-secrets-pamper-the-nurse-in-your-life.md";
  slug: "2025-10-05-self-care-secrets-pamper-the-nurse-in-your-life";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-10-06-chill-pills-relaxation-gifts-every-nurse-needs.md": {
	id: "2025-10-06-chill-pills-relaxation-gifts-every-nurse-needs.md";
  slug: "2025-10-06-chill-pills-relaxation-gifts-every-nurse-needs";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-10-07-perfectly-curated-nurse-gift-baskets-for-every-occasion.md": {
	id: "2025-10-07-perfectly-curated-nurse-gift-baskets-for-every-occasion.md";
  slug: "2025-10-07-perfectly-curated-nurse-gift-baskets-for-every-occasion";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-10-09-amazon-finds-delightful-gifts-for-nurses-thatll-make-their-d.md": {
	id: "2025-10-09-amazon-finds-delightful-gifts-for-nurses-thatll-make-their-d.md";
  slug: "2025-10-09-amazon-finds-delightful-gifts-for-nurses-thatll-make-their-d";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-10-10-personalized-perfection-top-etsy-nurse-gifts-with-a-heartfel.md": {
	id: "2025-10-10-personalized-perfection-top-etsy-nurse-gifts-with-a-heartfel.md";
  slug: "2025-10-10-personalized-perfection-top-etsy-nurse-gifts-with-a-heartfel";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-10-11-the-ultimate-2025-tech-gift-guide-for-nurses-gadgets-thatll-.md": {
	id: "2025-10-11-the-ultimate-2025-tech-gift-guide-for-nurses-gadgets-thatll-.md";
  slug: "2025-10-11-the-ultimate-2025-tech-gift-guide-for-nurses-gadgets-thatll-";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-10-12-toe-tally-awesome-gifts-comfort-treats-for-nurses-aching-fee.md": {
	id: "2025-10-12-toe-tally-awesome-gifts-comfort-treats-for-nurses-aching-fee.md";
  slug: "2025-10-12-toe-tally-awesome-gifts-comfort-treats-for-nurses-aching-fee";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-10-13-brew-tiful-surprises-best-coffee-related-gifts-for-nurses.md": {
	id: "2025-10-13-brew-tiful-surprises-best-coffee-related-gifts-for-nurses.md";
  slug: "2025-10-13-brew-tiful-surprises-best-coffee-related-gifts-for-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-10-14-pour-some-happiness-top-gifts-for-nurses-who-love-wine.md": {
	id: "2025-10-14-pour-some-happiness-top-gifts-for-nurses-who-love-wine.md";
  slug: "2025-10-14-pour-some-happiness-top-gifts-for-nurses-who-love-wine";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-10-15-adorn-your-favorite-nurse-unique-jewelry-gifts-that-sparkle-.md": {
	id: "2025-10-15-adorn-your-favorite-nurse-unique-jewelry-gifts-that-sparkle-.md";
  slug: "2025-10-15-adorn-your-favorite-nurse-unique-jewelry-gifts-that-sparkle-";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-10-16-totes-adored-personalized-tote-bags-nurses-will-love.md": {
	id: "2025-10-16-totes-adored-personalized-tote-bags-nurses-will-love.md";
  slug: "2025-10-16-totes-adored-personalized-tote-bags-nurses-will-love";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-10-17-dress-to-impress-the-best-scrubs-and-apparel-gifts-for-nurse.md": {
	id: "2025-10-17-dress-to-impress-the-best-scrubs-and-apparel-gifts-for-nurse.md";
  slug: "2025-10-17-dress-to-impress-the-best-scrubs-and-apparel-gifts-for-nurse";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-10-18-practical-gadgets-nurses-swear-by-the-healthcare-heroes-ulti.md": {
	id: "2025-10-18-practical-gadgets-nurses-swear-by-the-healthcare-heroes-ulti.md";
  slug: "2025-10-18-practical-gadgets-nurses-swear-by-the-healthcare-heroes-ulti";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-10-19-nurses-need-love-too-inspirational-gifts-to-boost-their-spir.md": {
	id: "2025-10-19-nurses-need-love-too-inspirational-gifts-to-boost-their-spir.md";
  slug: "2025-10-19-nurses-need-love-too-inspirational-gifts-to-boost-their-spir";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-10-20-cute-and-quirky-gifts-thatll-make-nursing-students-heart-you.md": {
	id: "2025-10-20-cute-and-quirky-gifts-thatll-make-nursing-students-heart-you.md";
  slug: "2025-10-20-cute-and-quirky-gifts-thatll-make-nursing-students-heart-you";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-10-21-make-their-new-place-feel-like-home-the-best-housewarming-gi.md": {
	id: "2025-10-21-make-their-new-place-feel-like-home-the-best-housewarming-gi.md";
  slug: "2025-10-21-make-their-new-place-feel-like-home-the-best-housewarming-gi";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-10-22-say-i-do-to-these-unique-wedding-gifts-for-nurses.md": {
	id: "2025-10-22-say-i-do-to-these-unique-wedding-gifts-for-nurses.md";
  slug: "2025-10-22-say-i-do-to-these-unique-wedding-gifts-for-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-10-23-pump-up-the-scrubs-best-gifts-for-fitness-loving-nurses.md": {
	id: "2025-10-23-pump-up-the-scrubs-best-gifts-for-fitness-loving-nurses.md";
  slug: "2025-10-23-pump-up-the-scrubs-best-gifts-for-fitness-loving-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-10-24-unwind-and-unplug-spa-and-relaxation-gift-ideas-for-nurses.md": {
	id: "2025-10-24-unwind-and-unplug-spa-and-relaxation-gift-ideas-for-nurses.md";
  slug: "2025-10-24-unwind-and-unplug-spa-and-relaxation-gift-ideas-for-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-10-25-booked-and-beautiful-perfect-reads-to-gift-your-favorite-nur.md": {
	id: "2025-10-25-booked-and-beautiful-perfect-reads-to-gift-your-favorite-nur.md";
  slug: "2025-10-25-booked-and-beautiful-perfect-reads-to-gift-your-favorite-nur";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-10-26-surprise-surprise-subscription-boxes-nurses-will-love.md": {
	id: "2025-10-26-surprise-surprise-subscription-boxes-nurses-will-love.md";
  slug: "2025-10-26-surprise-surprise-subscription-boxes-nurses-will-love";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-10-27-high-tech-helpers-the-best-gadgets-for-nurses-always-on-the-.md": {
	id: "2025-10-27-high-tech-helpers-the-best-gadgets-for-nurses-always-on-the-.md";
  slug: "2025-10-27-high-tech-helpers-the-best-gadgets-for-nurses-always-on-the-";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-10-28-spruce-up-their-scrubs-holiday-ornament-gifts-for-nurses.md": {
	id: "2025-10-28-spruce-up-their-scrubs-holiday-ornament-gifts-for-nurses.md";
  slug: "2025-10-28-spruce-up-their-scrubs-holiday-ornament-gifts-for-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-10-29-nurse-your-celebration-top-graduation-party-gifts-for-nurses.md": {
	id: "2025-10-29-nurse-your-celebration-top-graduation-party-gifts-for-nurses.md";
  slug: "2025-10-29-nurse-your-celebration-top-graduation-party-gifts-for-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-10-30-oh-baby-the-best-baby-shower-gifts-for-nurse-moms.md": {
	id: "2025-10-30-oh-baby-the-best-baby-shower-gifts-for-nurse-moms.md";
  slug: "2025-10-30-oh-baby-the-best-baby-shower-gifts-for-nurse-moms";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-10-31-love-in-scrubs-unique-valentines-day-gifts-for-nurse-couples.md": {
	id: "2025-10-31-love-in-scrubs-unique-valentines-day-gifts-for-nurse-couples.md";
  slug: "2025-10-31-love-in-scrubs-unique-valentines-day-gifts-for-nurse-couples";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-11-01-10-stocking-stuffers-to-make-any-nurses-christmas-extra-merr.md": {
	id: "2025-11-01-10-stocking-stuffers-to-make-any-nurses-christmas-extra-merr.md";
  slug: "2025-11-01-10-stocking-stuffers-to-make-any-nurses-christmas-extra-merr";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-11-02-a-gifts-end-of-year-teacher-style-surprises-for-nurses.md": {
	id: "2025-11-02-a-gifts-end-of-year-teacher-style-surprises-for-nurses.md";
  slug: "2025-11-02-a-gifts-end-of-year-teacher-style-surprises-for-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-11-03-sizzling-gift-ideas-for-nurses-who-love-to-cook-stirring-up-.md": {
	id: "2025-11-03-sizzling-gift-ideas-for-nurses-who-love-to-cook-stirring-up-.md";
  slug: "2025-11-03-sizzling-gift-ideas-for-nurses-who-love-to-cook-stirring-up-";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-11-04-green-thumbs-stethoscopes-best-gifts-for-nurses-who-love-to-.md": {
	id: "2025-11-04-green-thumbs-stethoscopes-best-gifts-for-nurses-who-love-to-.md";
  slug: "2025-11-04-green-thumbs-stethoscopes-best-gifts-for-nurses-who-love-to-";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-11-05-unique-art-decor-gifts-for-nurses-add-a-dose-of-style.md": {
	id: "2025-11-05-unique-art-decor-gifts-for-nurses-add-a-dose-of-style.md";
  slug: "2025-11-05-unique-art-decor-gifts-for-nurses-add-a-dose-of-style";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-11-06-practical-gifts-for-nurses-on-the-go-commuter-must-haves-tha.md": {
	id: "2025-11-06-practical-gifts-for-nurses-on-the-go-commuter-must-haves-tha.md";
  slug: "2025-11-06-practical-gifts-for-nurses-on-the-go-commuter-must-haves-tha";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-11-07-nurse-notes-that-rock-discover-the-best-journals-and-noteboo.md": {
	id: "2025-11-07-nurse-notes-that-rock-discover-the-best-journals-and-noteboo.md";
  slug: "2025-11-07-nurse-notes-that-rock-discover-the-best-journals-and-noteboo";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-11-08-page-turning-presents-top-gifts-for-nurses-who-love-to-read.md": {
	id: "2025-11-08-page-turning-presents-top-gifts-for-nurses-who-love-to-read.md";
  slug: "2025-11-08-page-turning-presents-top-gifts-for-nurses-who-love-to-read";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-11-09-tracking-steps-saving-lives-the-best-fitness-trackers-and-sm.md": {
	id: "2025-11-09-tracking-steps-saving-lives-the-best-fitness-trackers-and-sm.md";
  slug: "2025-11-09-tracking-steps-saving-lives-the-best-fitness-trackers-and-sm";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-11-10-snuggle-up-cozy-gift-ideas-for-nurses-who-deserve-rest.md": {
	id: "2025-11-10-snuggle-up-cozy-gift-ideas-for-nurses-who-deserve-rest.md";
  slug: "2025-11-10-snuggle-up-cozy-gift-ideas-for-nurses-who-deserve-rest";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-11-11-brew-tiful-gifts-for-nurses-who-love-coffee-shops.md": {
	id: "2025-11-11-brew-tiful-gifts-for-nurses-who-love-coffee-shops.md";
  slug: "2025-11-11-brew-tiful-gifts-for-nurses-who-love-coffee-shops";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-11-12-holiday-gift-baskets-that-will-make-your-favorite-nurse-jing.md": {
	id: "2025-11-12-holiday-gift-baskets-that-will-make-your-favorite-nurse-jing.md";
  slug: "2025-11-12-holiday-gift-baskets-that-will-make-your-favorite-nurse-jing";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-11-13-nursing-pins-and-wishes-perfect-graduation-keepsake-gifts-fo.md": {
	id: "2025-11-13-nursing-pins-and-wishes-perfect-graduation-keepsake-gifts-fo.md";
  slug: "2025-11-13-nursing-pins-and-wishes-perfect-graduation-keepsake-gifts-fo";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-11-14-sip-in-style-unique-nurse-mug-ideas-for-every-personality.md": {
	id: "2025-11-14-sip-in-style-unique-nurse-mug-ideas-for-every-personality.md";
  slug: "2025-11-14-sip-in-style-unique-nurse-mug-ideas-for-every-personality";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-11-15-pin-spiration-the-best-pins-and-badges-for-nurse-gifts.md": {
	id: "2025-11-15-pin-spiration-the-best-pins-and-badges-for-nurse-gifts.md";
  slug: "2025-11-15-pin-spiration-the-best-pins-and-badges-for-nurse-gifts";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-11-16-stay-hydrated-the-best-water-bottles-for-nurses-on-long-shif.md": {
	id: "2025-11-16-stay-hydrated-the-best-water-bottles-for-nurses-on-long-shif.md";
  slug: "2025-11-16-stay-hydrated-the-best-water-bottles-for-nurses-on-long-shif";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-11-17-purrfect-presents-top-gifts-for-nurses-who-adore-their-pets.md": {
	id: "2025-11-17-purrfect-presents-top-gifts-for-nurses-who-adore-their-pets.md";
  slug: "2025-11-17-purrfect-presents-top-gifts-for-nurses-who-adore-their-pets";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-11-18-jet-set-and-ready-top-travel-accessories-for-the-on-the-go-n.md": {
	id: "2025-11-18-jet-set-and-ready-top-travel-accessories-for-the-on-the-go-n.md";
  slug: "2025-11-18-jet-set-and-ready-top-travel-accessories-for-the-on-the-go-n";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-11-19-unique-personalized-stethoscope-ideas-hear-the-heartbeats-of.md": {
	id: "2025-11-19-unique-personalized-stethoscope-ideas-hear-the-heartbeats-of.md";
  slug: "2025-11-19-unique-personalized-stethoscope-ideas-hear-the-heartbeats-of";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-11-20-sole-mates-the-best-compression-socks-to-keep-nurses-on-thei.md": {
	id: "2025-11-20-sole-mates-the-best-compression-socks-to-keep-nurses-on-thei.md";
  slug: "2025-11-20-sole-mates-the-best-compression-socks-to-keep-nurses-on-thei";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-11-21-sole-mates-the-best-shoes-for-nurses-thatll-keep-them-on-the.md": {
	id: "2025-11-21-sole-mates-the-best-shoes-for-nurses-thatll-keep-them-on-the.md";
  slug: "2025-11-21-sole-mates-the-best-shoes-for-nurses-thatll-keep-them-on-the";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-11-22-tickle-their-funny-bone-top-10-hilarious-nurse-t-shirt-ideas.md": {
	id: "2025-11-22-tickle-their-funny-bone-top-10-hilarious-nurse-t-shirt-ideas.md";
  slug: "2025-11-22-tickle-their-funny-bone-top-10-hilarious-nurse-t-shirt-ideas";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-11-23-the-best-tech-gadgets-every-nurse-will-heartbeat-for.md": {
	id: "2025-11-23-the-best-tech-gadgets-every-nurse-will-heartbeat-for.md";
  slug: "2025-11-23-the-best-tech-gadgets-every-nurse-will-heartbeat-for";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-11-24-bag-it-up-practical-organizers-and-bags-every-nurse-needs.md": {
	id: "2025-11-24-bag-it-up-practical-organizers-and-bags-every-nurse-needs.md";
  slug: "2025-11-24-bag-it-up-practical-organizers-and-bags-every-nurse-needs";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-11-25-gift-cards-thatll-make-a-nurses-heart-rate-race-the-best-pic.md": {
	id: "2025-11-25-gift-cards-thatll-make-a-nurses-heart-rate-race-the-best-pic.md";
  slug: "2025-11-25-gift-cards-thatll-make-a-nurses-heart-rate-race-the-best-pic";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-11-26-bling-it-on-the-best-personalized-jewelry-for-nurses.md": {
	id: "2025-11-26-bling-it-on-the-best-personalized-jewelry-for-nurses.md";
  slug: "2025-11-26-bling-it-on-the-best-personalized-jewelry-for-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-11-27-illuminate-your-favorite-nurses-day-top-relaxing-candle-gift.md": {
	id: "2025-11-27-illuminate-your-favorite-nurses-day-top-relaxing-candle-gift.md";
  slug: "2025-11-27-illuminate-your-favorite-nurses-day-top-relaxing-candle-gift";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-11-28-pamper-that-saint-in-scrubs-best-luxury-spa-gifts-for-nurses.md": {
	id: "2025-11-28-pamper-that-saint-in-scrubs-best-luxury-spa-gifts-for-nurses.md";
  slug: "2025-11-28-pamper-that-saint-in-scrubs-best-luxury-spa-gifts-for-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-11-29-sweet-relief-holiday-cookie-and-treat-gift-ideas-for-nurses.md": {
	id: "2025-11-29-sweet-relief-holiday-cookie-and-treat-gift-ideas-for-nurses.md";
  slug: "2025-11-29-sweet-relief-holiday-cookie-and-treat-gift-ideas-for-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-11-30-handmade-with-love-the-best-gifts-for-nurses.md": {
	id: "2025-11-30-handmade-with-love-the-best-gifts-for-nurses.md";
  slug: "2025-11-30-handmade-with-love-the-best-gifts-for-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-12-01-top-gift-picks-for-male-nursing-students-practical-fun-ideas.md": {
	id: "2025-12-01-top-gift-picks-for-male-nursing-students-practical-fun-ideas.md";
  slug: "2025-12-01-top-gift-picks-for-male-nursing-students-practical-fun-ideas";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-12-02-gift-shopping-made-easy-top-picks-for-the-fabulous-female-nu.md": {
	id: "2025-12-02-gift-shopping-made-easy-top-picks-for-the-fabulous-female-nu.md";
  slug: "2025-12-02-gift-shopping-made-easy-top-picks-for-the-fabulous-female-nu";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-12-03-unique-thank-you-gifts-for-nurses-show-some-love-with-a-twis.md": {
	id: "2025-12-03-unique-thank-you-gifts-for-nurses-show-some-love-with-a-twis.md";
  slug: "2025-12-03-unique-thank-you-gifts-for-nurses-show-some-love-with-a-twis";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-12-04-unveiling-the-best-first-job-gifts-for-new-nurses-a-sassy-gu.md": {
	id: "2025-12-04-unveiling-the-best-first-job-gifts-for-new-nurses-a-sassy-gu.md";
  slug: "2025-12-04-unveiling-the-best-first-job-gifts-for-new-nurses-a-sassy-gu";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-12-05-spruce-up-that-space-best-desk-accessories-for-telehealth-nu.md": {
	id: "2025-12-05-spruce-up-that-space-best-desk-accessories-for-telehealth-nu.md";
  slug: "2025-12-05-spruce-up-that-space-best-desk-accessories-for-telehealth-nu";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-12-06-spatulas-stethoscopes-practical-kitchen-gadgets-for-nurse-fo.md": {
	id: "2025-12-06-spatulas-stethoscopes-practical-kitchen-gadgets-for-nurse-fo.md";
  slug: "2025-12-06-spatulas-stethoscopes-practical-kitchen-gadgets-for-nurse-fo";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-12-07-stretch-smile-namaste-perfect-gifts-for-yoga-loving-nurses.md": {
	id: "2025-12-07-stretch-smile-namaste-perfect-gifts-for-yoga-loving-nurses.md";
  slug: "2025-12-07-stretch-smile-namaste-perfect-gifts-for-yoga-loving-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-12-08-wrap-up-the-perfect-gift-top-cozy-blanket-gifts-for-nurses.md": {
	id: "2025-12-08-wrap-up-the-perfect-gift-top-cozy-blanket-gifts-for-nurses.md";
  slug: "2025-12-08-wrap-up-the-perfect-gift-top-cozy-blanket-gifts-for-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-12-09-dreamland-awaits-the-best-sleep-aids-for-night-shift-nurses.md": {
	id: "2025-12-09-dreamland-awaits-the-best-sleep-aids-for-night-shift-nurses.md";
  slug: "2025-12-09-dreamland-awaits-the-best-sleep-aids-for-night-shift-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-12-10-uplifting-vibes-best-motivational-wall-art-for-your-favorite.md": {
	id: "2025-12-10-uplifting-vibes-best-motivational-wall-art-for-your-favorite.md";
  slug: "2025-12-10-uplifting-vibes-best-motivational-wall-art-for-your-favorite";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-12-11-timeless-gifts-the-best-watches-for-nurses-in-2025.md": {
	id: "2025-12-11-timeless-gifts-the-best-watches-for-nurses-in-2025.md";
  slug: "2025-12-11-timeless-gifts-the-best-watches-for-nurses-in-2025";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-12-12-reel-y-good-gifts-best-badge-reels-for-nurses.md": {
	id: "2025-12-12-reel-y-good-gifts-best-badge-reels-for-nurses.md";
  slug: "2025-12-12-reel-y-good-gifts-best-badge-reels-for-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-12-13-unleash-the-charm-unique-keychain-gifts-for-nurses.md": {
	id: "2025-12-13-unleash-the-charm-unique-keychain-gifts-for-nurses.md";
  slug: "2025-12-13-unleash-the-charm-unique-keychain-gifts-for-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-12-14-sip-sip-hooray-the-best-travel-mugs-for-nurses-on-the-go.md": {
	id: "2025-12-14-sip-sip-hooray-the-best-travel-mugs-for-nurses-on-the-go.md";
  slug: "2025-12-14-sip-sip-hooray-the-best-travel-mugs-for-nurses-on-the-go";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-12-15-dial-up-delight-unique-phone-accessories-for-nurse-gifts.md": {
	id: "2025-12-15-dial-up-delight-unique-phone-accessories-for-nurse-gifts.md";
  slug: "2025-12-15-dial-up-delight-unique-phone-accessories-for-nurse-gifts";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-12-16-top-car-gadgets-every-commuting-nurse-needs-for-a-smooth-rid.md": {
	id: "2025-12-16-top-car-gadgets-every-commuting-nurse-needs-for-a-smooth-rid.md";
  slug: "2025-12-16-top-car-gadgets-every-commuting-nurse-needs-for-a-smooth-rid";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-12-17-nurses-dream-escape-the-best-weekend-getaway-gifts.md": {
	id: "2025-12-17-nurses-dream-escape-the-best-weekend-getaway-gifts.md";
  slug: "2025-12-17-nurses-dream-escape-the-best-weekend-getaway-gifts";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-12-18-pamper-the-unsung-heroes-memorable-experience-gifts-for-nurs.md": {
	id: "2025-12-18-pamper-the-unsung-heroes-memorable-experience-gifts-for-nurs.md";
  slug: "2025-12-18-pamper-the-unsung-heroes-memorable-experience-gifts-for-nurs";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-12-19-top-subscription-services-that-will-make-nurses-love-you-mor.md": {
	id: "2025-12-19-top-subscription-services-that-will-make-nurses-love-you-mor.md";
  slug: "2025-12-19-top-subscription-services-that-will-make-nurses-love-you-mor";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-12-20-stream-your-heart-out-top-streaming-subscriptions-for-nurses.md": {
	id: "2025-12-20-stream-your-heart-out-top-streaming-subscriptions-for-nurses.md";
  slug: "2025-12-20-stream-your-heart-out-top-streaming-subscriptions-for-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-12-21-unique-handmade-jewelry-for-nurses-dazzle-with-thoughtful-bl.md": {
	id: "2025-12-21-unique-handmade-jewelry-for-nurses-dazzle-with-thoughtful-bl.md";
  slug: "2025-12-21-unique-handmade-jewelry-for-nurses-dazzle-with-thoughtful-bl";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-12-22-tote-ally-perfect-personalized-tote-bags-every-nurse-will-lo.md": {
	id: "2025-12-22-tote-ally-perfect-personalized-tote-bags-every-nurse-will-lo.md";
  slug: "2025-12-22-tote-ally-perfect-personalized-tote-bags-every-nurse-will-lo";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-12-23-frame-it-the-best-nurse-graduation-frames-and-plaques-to-mak.md": {
	id: "2025-12-23-frame-it-the-best-nurse-graduation-frames-and-plaques-to-mak.md";
  slug: "2025-12-23-frame-it-the-best-nurse-graduation-frames-and-plaques-to-mak";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-12-24-deck-the-halls-with-unique-christmas-ornaments-for-nurses.md": {
	id: "2025-12-24-deck-the-halls-with-unique-christmas-ornaments-for-nurses.md";
  slug: "2025-12-24-deck-the-halls-with-unique-christmas-ornaments-for-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-12-25-uplift-your-favorite-nurse-with-these-inspirational-quote-gi.md": {
	id: "2025-12-25-uplift-your-favorite-nurse-with-these-inspirational-quote-gi.md";
  slug: "2025-12-25-uplift-your-favorite-nurse-with-these-inspirational-quote-gi";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-12-26-perfectly-planned-top-10-nurse-planner-and-organizer-gifts-t.md": {
	id: "2025-12-26-perfectly-planned-top-10-nurse-planner-and-organizer-gifts-t.md";
  slug: "2025-12-26-perfectly-planned-top-10-nurse-planner-and-organizer-gifts-t";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-12-27-unwind-like-a-pro-top-stress-relief-toys-and-gadgets-for-nur.md": {
	id: "2025-12-27-unwind-like-a-pro-top-stress-relief-toys-and-gadgets-for-nur.md";
  slug: "2025-12-27-unwind-like-a-pro-top-stress-relief-toys-and-gadgets-for-nur";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-12-28-whisk-y-business-top-kitchenware-gifts-for-nurse-foodies.md": {
	id: "2025-12-28-whisk-y-business-top-kitchenware-gifts-for-nurse-foodies.md";
  slug: "2025-12-28-whisk-y-business-top-kitchenware-gifts-for-nurse-foodies";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-12-29-top-5-nurse-gift-sets-under-50-that-will-make-you-the-hero-o.md": {
	id: "2025-12-29-top-5-nurse-gift-sets-under-50-that-will-make-you-the-hero-o.md";
  slug: "2025-12-29-top-5-nurse-gift-sets-under-50-that-will-make-you-the-hero-o";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-12-30-joyful-stocking-stuffers-unique-holiday-gifts-for-nurses.md": {
	id: "2025-12-30-joyful-stocking-stuffers-unique-holiday-gifts-for-nurses.md";
  slug: "2025-12-30-joyful-stocking-stuffers-unique-holiday-gifts-for-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025-12-31-prime-time-top-nurse-gift-ideas-youll-find-on-amazon-prime.md": {
	id: "2025-12-31-prime-time-top-nurse-gift-ideas-youll-find-on-amazon-prime.md";
  slug: "2025-12-31-prime-time-top-nurse-gift-ideas-youll-find-on-amazon-prime";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-01-01-unwind-and-unplug-the-best-relaxation-gifts-for-nurse-moms.md": {
	id: "2026-01-01-unwind-and-unplug-the-best-relaxation-gifts-for-nurse-moms.md";
  slug: "2026-01-01-unwind-and-unplug-the-best-relaxation-gifts-for-nurse-moms";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-01-02-crowning-the-mentors-best-gifts-for-preceptor-nurses.md": {
	id: "2026-01-02-crowning-the-mentors-best-gifts-for-preceptor-nurses.md";
  slug: "2026-01-02-crowning-the-mentors-best-gifts-for-preceptor-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-01-03-unique-gifts-for-nursing-mentors-show-appreciation-with-a-tw.md": {
	id: "2026-01-03-unique-gifts-for-nursing-mentors-show-appreciation-with-a-tw.md";
  slug: "2026-01-03-unique-gifts-for-nursing-mentors-show-appreciation-with-a-tw";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-01-04-nurse-party-perfect-best-holiday-gifts-for-our-medical-marve.md": {
	id: "2026-01-04-nurse-party-perfect-best-holiday-gifts-for-our-medical-marve.md";
  slug: "2026-01-04-nurse-party-perfect-best-holiday-gifts-for-our-medical-marve";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-01-05-scent-sational-candle-sets-nurses-will-love.md": {
	id: "2026-01-05-scent-sational-candle-sets-nurses-will-love.md";
  slug: "2026-01-05-scent-sational-candle-sets-nurses-will-love";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-01-06-top-funny-nurse-meme-gifts-laughter-is-the-best-medicine.md": {
	id: "2026-01-06-top-funny-nurse-meme-gifts-laughter-is-the-best-medicine.md";
  slug: "2026-01-06-top-funny-nurse-meme-gifts-laughter-is-the-best-medicine";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-01-07-sip-in-style-the-best-personalized-tumblers-for-nurses.md": {
	id: "2026-01-07-sip-in-style-the-best-personalized-tumblers-for-nurses.md";
  slug: "2026-01-07-sip-in-style-the-best-personalized-tumblers-for-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-01-08-sparkle-stethoscopes-best-jewelry-boxes-for-nurses.md": {
	id: "2026-01-08-sparkle-stethoscopes-best-jewelry-boxes-for-nurses.md";
  slug: "2026-01-08-sparkle-stethoscopes-best-jewelry-boxes-for-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-01-09-best-desk-plants-for-nurses-bringing-life-to-your-home-offic.md": {
	id: "2026-01-09-best-desk-plants-for-nurses-bringing-life-to-your-home-offic.md";
  slug: "2026-01-09-best-desk-plants-for-nurses-bringing-life-to-your-home-offic";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-01-10-say-thank-you-in-style-the-best-gratitude-gifts-for-nurse-le.md": {
	id: "2026-01-10-say-thank-you-in-style-the-best-gratitude-gifts-for-nurse-le.md";
  slug: "2026-01-10-say-thank-you-in-style-the-best-gratitude-gifts-for-nurse-le";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-01-11-empower-their-pen-the-best-customized-stationery-for-nurses.md": {
	id: "2026-01-11-empower-their-pen-the-best-customized-stationery-for-nurses.md";
  slug: "2026-01-11-empower-their-pen-the-best-customized-stationery-for-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-01-12-pen-tastic-gifts-unique-writing-tools-for-nurses-who-deserve.md": {
	id: "2026-01-12-pen-tastic-gifts-unique-writing-tools-for-nurses-who-deserve.md";
  slug: "2026-01-12-pen-tastic-gifts-unique-writing-tools-for-nurses-who-deserve";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-01-13-unwind-in-style-top-gadgets-to-help-nurses-relax-at-home.md": {
	id: "2026-01-13-unwind-in-style-top-gadgets-to-help-nurses-relax-at-home.md";
  slug: "2026-01-13-unwind-in-style-top-gadgets-to-help-nurses-relax-at-home";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-01-14-spatulas-at-the-ready-top-kitchen-gifts-for-busy-nurses.md": {
	id: "2026-01-14-spatulas-at-the-ready-top-kitchen-gifts-for-busy-nurses.md";
  slug: "2026-01-14-spatulas-at-the-ready-top-kitchen-gifts-for-busy-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-01-15-jet-setting-nurses-top-travel-themed-gifts-theyll-love.md": {
	id: "2026-01-15-jet-setting-nurses-top-travel-themed-gifts-theyll-love.md";
  slug: "2026-01-15-jet-setting-nurses-top-travel-themed-gifts-theyll-love";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-01-16-lanyard-love-top-personalized-lanyards-for-nurses.md": {
	id: "2026-01-16-lanyard-love-top-personalized-lanyards-for-nurses.md";
  slug: "2026-01-16-lanyard-love-top-personalized-lanyards-for-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-01-17-pack-it-like-a-pro-best-weekend-bags-for-nurses-on-the-go.md": {
	id: "2026-01-17-pack-it-like-a-pro-best-weekend-bags-for-nurses-on-the-go.md";
  slug: "2026-01-17-pack-it-like-a-pro-best-weekend-bags-for-nurses-on-the-go";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-01-18-tasty-tidings-best-holiday-treat-boxes-for-nurses.md": {
	id: "2026-01-18-tasty-tidings-best-holiday-treat-boxes-for-nurses.md";
  slug: "2026-01-18-tasty-tidings-best-holiday-treat-boxes-for-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-01-19-unwind-in-style-the-best-relaxation-subscriptions-for-nurses.md": {
	id: "2026-01-19-unwind-in-style-the-best-relaxation-subscriptions-for-nurses.md";
  slug: "2026-01-19-unwind-in-style-the-best-relaxation-subscriptions-for-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-01-20-piece-your-way-to-perfect-unique-puzzles-and-games-for-nurse.md": {
	id: "2026-01-20-piece-your-way-to-perfect-unique-puzzles-and-games-for-nurse.md";
  slug: "2026-01-20-piece-your-way-to-perfect-unique-puzzles-and-games-for-nurse";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-01-21-game-night-revival-top-board-games-nurses-will-love-off-duty.md": {
	id: "2026-01-21-game-night-revival-top-board-games-nurses-will-love-off-duty.md";
  slug: "2026-01-21-game-night-revival-top-board-games-nurses-will-love-off-duty";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-01-22-harmonize-happiness-ultimate-music-related-gifts-for-nurses.md": {
	id: "2026-01-22-harmonize-happiness-ultimate-music-related-gifts-for-nurses.md";
  slug: "2026-01-22-harmonize-happiness-ultimate-music-related-gifts-for-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-01-23-stethoscopes-and-silly-putty-unique-hobby-gifts-for-nurses.md": {
	id: "2026-01-23-stethoscopes-and-silly-putty-unique-hobby-gifts-for-nurses.md";
  slug: "2026-01-23-stethoscopes-and-silly-putty-unique-hobby-gifts-for-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-01-24-crafty-nurses-unleash-your-inner-artist-with-these-creative-.md": {
	id: "2026-01-24-crafty-nurses-unleash-your-inner-artist-with-these-creative-.md";
  slug: "2026-01-24-crafty-nurses-unleash-your-inner-artist-with-these-creative-";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-01-25-wall-decor-wonders-best-gifts-for-nurses-to-spruce-up-their-.md": {
	id: "2026-01-25-wall-decor-wonders-best-gifts-for-nurses-to-spruce-up-their-.md";
  slug: "2026-01-25-wall-decor-wonders-best-gifts-for-nurses-to-spruce-up-their-";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-01-26-spice-up-that-scrub-cubicle-unique-office-supplies-for-nurse.md": {
	id: "2026-01-26-spice-up-that-scrub-cubicle-unique-office-supplies-for-nurse.md";
  slug: "2026-01-26-spice-up-that-scrub-cubicle-unique-office-supplies-for-nurse";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-01-27-get-fit-while-taking-vitals-the-best-fitness-accessories-for.md": {
	id: "2026-01-27-get-fit-while-taking-vitals-the-best-fitness-accessories-for.md";
  slug: "2026-01-27-get-fit-while-taking-vitals-the-best-fitness-accessories-for";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-01-28-gratitude-journaling-the-pen-to-a-nurses-soul.md": {
	id: "2026-01-28-gratitude-journaling-the-pen-to-a-nurses-soul.md";
  slug: "2026-01-28-gratitude-journaling-the-pen-to-a-nurses-soul";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-01-29-zen-spirited-gifts-perfect-picks-for-meditation-loving-nurse.md": {
	id: "2026-01-29-zen-spirited-gifts-perfect-picks-for-meditation-loving-nurse.md";
  slug: "2026-01-29-zen-spirited-gifts-perfect-picks-for-meditation-loving-nurse";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-01-30-bling-it-on-best-nurse-graduation-jewelry-ideas.md": {
	id: "2026-01-30-bling-it-on-best-nurse-graduation-jewelry-ideas.md";
  slug: "2026-01-30-bling-it-on-best-nurse-graduation-jewelry-ideas";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-01-31-unique-personalized-scrubs-stitching-style-into-a-nurses-dai.md": {
	id: "2026-01-31-unique-personalized-scrubs-stitching-style-into-a-nurses-dai.md";
  slug: "2026-01-31-unique-personalized-scrubs-stitching-style-into-a-nurses-dai";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-02-01-keepsake-boxes-a-nurses-treasure-chest-of-memories.md": {
	id: "2026-02-01-keepsake-boxes-a-nurses-treasure-chest-of-memories.md";
  slug: "2026-02-01-keepsake-boxes-a-nurses-treasure-chest-of-memories";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-02-02-mark-the-date-best-personalized-calendars-for-nurses-to-stay.md": {
	id: "2026-02-02-mark-the-date-best-personalized-calendars-for-nurses-to-stay.md";
  slug: "2026-02-02-mark-the-date-best-personalized-calendars-for-nurses-to-stay";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-02-03-tick-tock-doc-unique-clock-gifts-every-nurse-will-love.md": {
	id: "2026-02-03-tick-tock-doc-unique-clock-gifts-every-nurse-will-love.md";
  slug: "2026-02-03-tick-tock-doc-unique-clock-gifts-every-nurse-will-love";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-02-04-wrap-them-in-warmth-top-personalized-blankets-for-nurses.md": {
	id: "2026-02-04-wrap-them-in-warmth-top-personalized-blankets-for-nurses.md";
  slug: "2026-02-04-wrap-them-in-warmth-top-personalized-blankets-for-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-02-05-snap-tastic-memories-the-best-photo-album-gifts-for-nursing-.md": {
	id: "2026-02-05-snap-tastic-memories-the-best-photo-album-gifts-for-nursing-.md";
  slug: "2026-02-05-snap-tastic-memories-the-best-photo-album-gifts-for-nursing-";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-02-06-plaque-it-up-unique-personalized-plaques-for-the-superhero-n.md": {
	id: "2026-02-06-plaque-it-up-unique-personalized-plaques-for-the-superhero-n.md";
  slug: "2026-02-06-plaque-it-up-unique-personalized-plaques-for-the-superhero-n";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-02-07-the-best-badge-holders-for-nurses-stylish-functional-and-fun.md": {
	id: "2026-02-07-the-best-badge-holders-for-nurses-stylish-functional-and-fun.md";
  slug: "2026-02-07-the-best-badge-holders-for-nurses-stylish-functional-and-fun";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-02-08-time-to-care-best-personalized-nurse-watches-for-your-favori.md": {
	id: "2026-02-08-time-to-care-best-personalized-nurse-watches-for-your-favori.md";
  slug: "2026-02-08-time-to-care-best-personalized-nurse-watches-for-your-favori";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-02-09-crafty-creations-unique-handmade-gifts-that-nurses-will-ador.md": {
	id: "2026-02-09-crafty-creations-unique-handmade-gifts-that-nurses-will-ador.md";
  slug: "2026-02-09-crafty-creations-unique-handmade-gifts-that-nurses-will-ador";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-02-10-unleash-your-gratitude-the-best-thank-you-cards-for-nurse-gi.md": {
	id: "2026-02-10-unleash-your-gratitude-the-best-thank-you-cards-for-nurse-gi.md";
  slug: "2026-02-10-unleash-your-gratitude-the-best-thank-you-cards-for-nurse-gi";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-02-11-paging-through-inspiration-perfect-book-gifts-for-nurses.md": {
	id: "2026-02-11-paging-through-inspiration-perfect-book-gifts-for-nurses.md";
  slug: "2026-02-11-paging-through-inspiration-perfect-book-gifts-for-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-02-12-the-ultimate-guide-to-choosing-the-perfect-work-bag-for-nurs.md": {
	id: "2026-02-12-the-ultimate-guide-to-choosing-the-perfect-work-bag-for-nurs.md";
  slug: "2026-02-12-the-ultimate-guide-to-choosing-the-perfect-work-bag-for-nurs";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-02-13-deck-the-halls-with-holly-jolly-nursing-sweaters-the-best-ho.md": {
	id: "2026-02-13-deck-the-halls-with-holly-jolly-nursing-sweaters-the-best-ho.md";
  slug: "2026-02-13-deck-the-halls-with-holly-jolly-nursing-sweaters-the-best-ho";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-02-14-gadgets-galore-the-best-practical-gifts-for-nurse-moms.md": {
	id: "2026-02-14-gadgets-galore-the-best-practical-gifts-for-nurse-moms.md";
  slug: "2026-02-14-gadgets-galore-the-best-practical-gifts-for-nurse-moms";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-02-15-nurse-approved-birthday-cakes-sweet-ideas-for-sweet-caregive.md": {
	id: "2026-02-15-nurse-approved-birthday-cakes-sweet-ideas-for-sweet-caregive.md";
  slug: "2026-02-15-nurse-approved-birthday-cakes-sweet-ideas-for-sweet-caregive";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-02-16-brew-tiful-coffee-subscription-gifts-for-nurses-keep-the-ene.md": {
	id: "2026-02-16-brew-tiful-coffee-subscription-gifts-for-nurses-keep-the-ene.md";
  slug: "2026-02-16-brew-tiful-coffee-subscription-gifts-for-nurses-keep-the-ene";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-02-17-pour-it-up-the-best-wine-subscription-gifts-to-nurse-their-s.md": {
	id: "2026-02-17-pour-it-up-the-best-wine-subscription-gifts-to-nurse-their-s.md";
  slug: "2026-02-17-pour-it-up-the-best-wine-subscription-gifts-to-nurse-their-s";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-02-18-brew-tiful-gifts-the-best-tea-sets-for-nurses-to-feel-un-tea.md": {
	id: "2026-02-18-brew-tiful-gifts-the-best-tea-sets-for-nurses-to-feel-un-tea.md";
  slug: "2026-02-18-brew-tiful-gifts-the-best-tea-sets-for-nurses-to-feel-un-tea";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-02-19-stress-busting-spa-weekend-gift-ideas-for-nurses-pamper-unpl.md": {
	id: "2026-02-19-stress-busting-spa-weekend-gift-ideas-for-nurses-pamper-unpl.md";
  slug: "2026-02-19-stress-busting-spa-weekend-gift-ideas-for-nurses-pamper-unpl";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-02-20-calm-in-the-chaos-the-best-meditation-apps-to-gift-a-nurse.md": {
	id: "2026-02-20-calm-in-the-chaos-the-best-meditation-apps-to-gift-a-nurse.md";
  slug: "2026-02-20-calm-in-the-chaos-the-best-meditation-apps-to-gift-a-nurse";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-02-21-unbox-relaxation-top-self-care-subscription-boxes-for-nurses.md": {
	id: "2026-02-21-unbox-relaxation-top-self-care-subscription-boxes-for-nurses.md";
  slug: "2026-02-21-unbox-relaxation-top-self-care-subscription-boxes-for-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-02-22-journey-in-style-top-experience-gifts-for-travel-nurses.md": {
	id: "2026-02-22-journey-in-style-top-experience-gifts-for-travel-nurses.md";
  slug: "2026-02-22-journey-in-style-top-experience-gifts-for-travel-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-02-23-stay-hydrated-in-style-the-best-personalized-water-bottles-f.md": {
	id: "2026-02-23-stay-hydrated-in-style-the-best-personalized-water-bottles-f.md";
  slug: "2026-02-23-stay-hydrated-in-style-the-best-personalized-water-bottles-f";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-02-24-brighten-their-nights-best-night-shift-survival-kits-for-nur.md": {
	id: "2026-02-24-brighten-their-nights-best-night-shift-survival-kits-for-nur.md";
  slug: "2026-02-24-brighten-their-nights-best-night-shift-survival-kits-for-nur";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-02-25-toe-tally-awesome-unique-funny-socks-every-nurse-will-love.md": {
	id: "2026-02-25-toe-tally-awesome-unique-funny-socks-every-nurse-will-love.md";
  slug: "2026-02-25-toe-tally-awesome-unique-funny-socks-every-nurse-will-love";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-02-26-snuggle-season-best-holiday-pajama-gifts-for-nurses.md": {
	id: "2026-02-26-snuggle-season-best-holiday-pajama-gifts-for-nurses.md";
  slug: "2026-02-26-snuggle-season-best-holiday-pajama-gifts-for-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-02-27-crafting-care-top-diy-nurse-appreciation-gift-ideas.md": {
	id: "2026-02-27-crafting-care-top-diy-nurse-appreciation-gift-ideas.md";
  slug: "2026-02-27-crafting-care-top-diy-nurse-appreciation-gift-ideas";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-02-28-sparkle-scrubs-discover-the-best-handmade-jewelry-nurse-gift.md": {
	id: "2026-02-28-sparkle-scrubs-discover-the-best-handmade-jewelry-nurse-gift.md";
  slug: "2026-02-28-sparkle-scrubs-discover-the-best-handmade-jewelry-nurse-gift";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-03-01-the-a-b-cs-of-monogrammed-gifts-perfect-picks-for-your-favor.md": {
	id: "2026-03-01-the-a-b-cs-of-monogrammed-gifts-perfect-picks-for-your-favor.md";
  slug: "2026-03-01-the-a-b-cs-of-monogrammed-gifts-perfect-picks-for-your-favor";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-03-02-backpacks-that-have-nurses-backs-must-have-bags-for-healthca.md": {
	id: "2026-03-02-backpacks-that-have-nurses-backs-must-have-bags-for-healthca.md";
  slug: "2026-03-02-backpacks-that-have-nurses-backs-must-have-bags-for-healthca";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-03-03-tech-savvy-nurse-discover-the-best-bags-for-managing-gadgets.md": {
	id: "2026-03-03-tech-savvy-nurse-discover-the-best-bags-for-managing-gadgets.md";
  slug: "2026-03-03-tech-savvy-nurse-discover-the-best-bags-for-managing-gadgets";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-03-04-make-their-badge-stand-out-unique-personalized-badges-for-nu.md": {
	id: "2026-03-04-make-their-badge-stand-out-unique-personalized-badges-for-nu.md";
  slug: "2026-03-04-make-their-badge-stand-out-unique-personalized-badges-for-nu";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-03-05-celebrate-in-frame-perfect-nurse-graduation-keepsakes.md": {
	id: "2026-03-05-celebrate-in-frame-perfect-nurse-graduation-keepsakes.md";
  slug: "2026-03-05-celebrate-in-frame-perfect-nurse-graduation-keepsakes";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-03-06-celebrate-their-legacy-top-retirement-plaques-and-awards-for.md": {
	id: "2026-03-06-celebrate-their-legacy-top-retirement-plaques-and-awards-for.md";
  slug: "2026-03-06-celebrate-their-legacy-top-retirement-plaques-and-awards-for";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-03-07-wall-art-wonders-the-best-nurse-appreciation-gifts.md": {
	id: "2026-03-07-wall-art-wonders-the-best-nurse-appreciation-gifts.md";
  slug: "2026-03-07-wall-art-wonders-the-best-nurse-appreciation-gifts";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-03-08-best-inspirational-journals-for-nurses-write-your-heart-out.md": {
	id: "2026-03-08-best-inspirational-journals-for-nurses-write-your-heart-out.md";
  slug: "2026-03-08-best-inspirational-journals-for-nurses-write-your-heart-out";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-03-09-nifty-nurse-crossbody-bags-chic-companions-for-every-shift.md": {
	id: "2026-03-09-nifty-nurse-crossbody-bags-chic-companions-for-every-shift.md";
  slug: "2026-03-09-nifty-nurse-crossbody-bags-chic-companions-for-every-shift";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-03-10-affordable-adorable-budget-friendly-gifts-nurses-will-love.md": {
	id: "2026-03-10-affordable-adorable-budget-friendly-gifts-nurses-will-love.md";
  slug: "2026-03-10-affordable-adorable-budget-friendly-gifts-nurses-will-love";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-03-11-bling-it-on-luxe-jewelry-gifts-for-nurse-leaders.md": {
	id: "2026-03-11-bling-it-on-luxe-jewelry-gifts-for-nurse-leaders.md";
  slug: "2026-03-11-bling-it-on-luxe-jewelry-gifts-for-nurse-leaders";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-03-12-unbox-relaxation-top-spa-subscription-boxes-for-nurses.md": {
	id: "2026-03-12-unbox-relaxation-top-spa-subscription-boxes-for-nurses.md";
  slug: "2026-03-12-unbox-relaxation-top-spa-subscription-boxes-for-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-03-13-the-ultimate-holiday-basket-bonanza-perfect-picks-for-nurse-.md": {
	id: "2026-03-13-the-ultimate-holiday-basket-bonanza-perfect-picks-for-nurse-.md";
  slug: "2026-03-13-the-ultimate-holiday-basket-bonanza-perfect-picks-for-nurse-";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-03-14-desk-glam-essential-office-supplies-for-telehealth-nurses.md": {
	id: "2026-03-14-desk-glam-essential-office-supplies-for-telehealth-nurses.md";
  slug: "2026-03-14-desk-glam-essential-office-supplies-for-telehealth-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-03-16-laugh-your-scrubs-off-best-funny-novelty-nurse-gifts.md": {
	id: "2026-03-16-laugh-your-scrubs-off-best-funny-novelty-nurse-gifts.md";
  slug: "2026-03-16-laugh-your-scrubs-off-best-funny-novelty-nurse-gifts";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-03-17-wristful-thinking-unique-nurse-bracelet-gift-ideas-to-charm-.md": {
	id: "2026-03-17-wristful-thinking-unique-nurse-bracelet-gift-ideas-to-charm-.md";
  slug: "2026-03-17-wristful-thinking-unique-nurse-bracelet-gift-ideas-to-charm-";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-03-18-jet-set-gifts-top-picks-for-male-travel-nurses-on-the-move.md": {
	id: "2026-03-18-jet-set-gifts-top-picks-for-male-travel-nurses-on-the-move.md";
  slug: "2026-03-18-jet-set-gifts-top-picks-for-male-travel-nurses-on-the-move";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-03-19-brew-tiful-gifts-top-coffee-makers-for-nurses-who-need-a-per.md": {
	id: "2026-03-19-brew-tiful-gifts-top-coffee-makers-for-nurses-who-need-a-per.md";
  slug: "2026-03-19-brew-tiful-gifts-top-coffee-makers-for-nurses-who-need-a-per";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-03-20-steep-dreams-perfect-tea-accessories-for-nurses-who-love-to-.md": {
	id: "2026-03-20-steep-dreams-perfect-tea-accessories-for-nurses-who-love-to-.md";
  slug: "2026-03-20-steep-dreams-perfect-tea-accessories-for-nurses-who-love-to-";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-03-21-light-up-a-nurses-life-unique-candle-gifts-with-nurse-themes.md": {
	id: "2026-03-21-light-up-a-nurses-life-unique-candle-gifts-with-nurse-themes.md";
  slug: "2026-03-21-light-up-a-nurses-life-unique-candle-gifts-with-nurse-themes";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-03-22-top-gifts-for-nurse-moms-balancing-scrubs-and-snuggles.md": {
	id: "2026-03-22-top-gifts-for-nurse-moms-balancing-scrubs-and-snuggles.md";
  slug: "2026-03-22-top-gifts-for-nurse-moms-balancing-scrubs-and-snuggles";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-03-23-a-essentials-craft-the-perfect-back-to-school-kits-for-nursi.md": {
	id: "2026-03-23-a-essentials-craft-the-perfect-back-to-school-kits-for-nursi.md";
  slug: "2026-03-23-a-essentials-craft-the-perfect-back-to-school-kits-for-nursi";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-03-24-unwrap-joy-unique-personalized-holiday-gifts-for-the-nurse-i.md": {
	id: "2026-03-24-unwrap-joy-unique-personalized-holiday-gifts-for-the-nurse-i.md";
  slug: "2026-03-24-unwrap-joy-unique-personalized-holiday-gifts-for-the-nurse-i";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-03-25-nurse-worthy-nooks-home-decor-gifts-for-nurses-that-heal-the.md": {
	id: "2026-03-25-nurse-worthy-nooks-home-decor-gifts-for-nurses-that-heal-the.md";
  slug: "2026-03-25-nurse-worthy-nooks-home-decor-gifts-for-nurses-that-heal-the";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-03-26-tick-tock-goes-the-clock-the-best-wall-clocks-for-nurse-work.md": {
	id: "2026-03-26-tick-tock-goes-the-clock-the-best-wall-clocks-for-nurse-work.md";
  slug: "2026-03-26-tick-tock-goes-the-clock-the-best-wall-clocks-for-nurse-work";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-03-27-scrap-that-creating-unique-personalized-scrapbook-gifts-for-.md": {
	id: "2026-03-27-scrap-that-creating-unique-personalized-scrapbook-gifts-for-.md";
  slug: "2026-03-27-scrap-that-creating-unique-personalized-scrapbook-gifts-for-";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-03-28-keep-calm-and-snuggle-on-best-winter-gift-ideas-for-nurses.md": {
	id: "2026-03-28-keep-calm-and-snuggle-on-best-winter-gift-ideas-for-nurses.md";
  slug: "2026-03-28-keep-calm-and-snuggle-on-best-winter-gift-ideas-for-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-03-29-spritz-glitz-and-glamour-holiday-beauty-gifts-for-nurses.md": {
	id: "2026-03-29-spritz-glitz-and-glamour-holiday-beauty-gifts-for-nurses.md";
  slug: "2026-03-29-spritz-glitz-and-glamour-holiday-beauty-gifts-for-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-03-30-spice-up-a-nurses-kitchen-unique-personalized-gifts-theyll-l.md": {
	id: "2026-03-30-spice-up-a-nurses-kitchen-unique-personalized-gifts-theyll-l.md";
  slug: "2026-03-30-spice-up-a-nurses-kitchen-unique-personalized-gifts-theyll-l";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-03-31-craft-the-perfect-diy-relaxation-kit-for-nurses-unwind-recha.md": {
	id: "2026-03-31-craft-the-perfect-diy-relaxation-kit-for-nurses-unwind-recha.md";
  slug: "2026-03-31-craft-the-perfect-diy-relaxation-kit-for-nurses-unwind-recha";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-04-01-unwind-unplug-top-tech-headphones-nurses-will-love-off-shift.md": {
	id: "2026-04-01-unwind-unplug-top-tech-headphones-nurses-will-love-off-shift.md";
  slug: "2026-04-01-unwind-unplug-top-tech-headphones-nurses-will-love-off-shift";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-04-02-picture-perfect-unique-photo-gifts-for-nurse-appreciation.md": {
	id: "2026-04-02-picture-perfect-unique-photo-gifts-for-nurse-appreciation.md";
  slug: "2026-04-02-picture-perfect-unique-photo-gifts-for-nurse-appreciation";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-04-03-surprising-nurses-with-the-best-birthday-gifts-a-fun-guide-t.md": {
	id: "2026-04-03-surprising-nurses-with-the-best-birthday-gifts-a-fun-guide-t.md";
  slug: "2026-04-03-surprising-nurses-with-the-best-birthday-gifts-a-fun-guide-t";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-04-04-essential-work-must-haves-for-the-freshly-minted-nurse.md": {
	id: "2026-04-04-essential-work-must-haves-for-the-freshly-minted-nurse.md";
  slug: "2026-04-04-essential-work-must-haves-for-the-freshly-minted-nurse";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-04-05-double-duty-delight-unique-nurse-couple-gift-ideas.md": {
	id: "2026-04-05-double-duty-delight-unique-nurse-couple-gift-ideas.md";
  slug: "2026-04-05-double-duty-delight-unique-nurse-couple-gift-ideas";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-04-06-celebrate-love-perfect-anniversary-gifts-for-nurse-couples.md": {
	id: "2026-04-06-celebrate-love-perfect-anniversary-gifts-for-nurse-couples.md";
  slug: "2026-04-06-celebrate-love-perfect-anniversary-gifts-for-nurse-couples";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-04-07-unwrap-the-joy-best-holiday-party-swap-gifts-for-nurses.md": {
	id: "2026-04-07-unwrap-the-joy-best-holiday-party-swap-gifts-for-nurses.md";
  slug: "2026-04-07-unwrap-the-joy-best-holiday-party-swap-gifts-for-nurses";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-04-08-the-ultimate-group-gift-guide-for-your-favorite-nurse-squad.md": {
	id: "2026-04-08-the-ultimate-group-gift-guide-for-your-favorite-nurse-squad.md";
  slug: "2026-04-08-the-ultimate-group-gift-guide-for-your-favorite-nurse-squad";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-04-09-budget-friendly-stocking-stuffers-nurse-gifts-that-are-a-hit.md": {
	id: "2026-04-09-budget-friendly-stocking-stuffers-nurse-gifts-that-are-a-hit.md";
  slug: "2026-04-09-budget-friendly-stocking-stuffers-nurse-gifts-that-are-a-hit";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-04-10-treat-the-nurse-in-your-life-to-bliss-top-wellness-retreat-g.md": {
	id: "2026-04-10-treat-the-nurse-in-your-life-to-bliss-top-wellness-retreat-g.md";
  slug: "2026-04-10-treat-the-nurse-in-your-life-to-bliss-top-wellness-retreat-g";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-04-11-namaste-nurse-unique-personalized-yoga-mats-that-make-perfec.md": {
	id: "2026-04-11-namaste-nurse-unique-personalized-yoga-mats-that-make-perfec.md";
  slug: "2026-04-11-namaste-nurse-unique-personalized-yoga-mats-that-make-perfec";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-04-12-scrubs-scribbles-best-personalized-journals-with-nurse-theme.md": {
	id: "2026-04-12-scrubs-scribbles-best-personalized-journals-with-nurse-theme.md";
  slug: "2026-04-12-scrubs-scribbles-best-personalized-journals-with-nurse-theme";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-04-13-upgrade-their-downtime-the-best-digital-gadgets-nurses-love-.md": {
	id: "2026-04-13-upgrade-their-downtime-the-best-digital-gadgets-nurses-love-.md";
  slug: "2026-04-13-upgrade-their-downtime-the-best-digital-gadgets-nurses-love-";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-04-14-last-minute-nurse-gifts-amazon-finds-to-the-rescue.md": {
	id: "2026-04-14-last-minute-nurse-gifts-amazon-finds-to-the-rescue.md";
  slug: "2026-04-14-last-minute-nurse-gifts-amazon-finds-to-the-rescue";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-04-15-chalk-it-up-to-good-taste-teacher-style-gifts-thatll-pass-an.md": {
	id: "2026-04-15-chalk-it-up-to-good-taste-teacher-style-gifts-thatll-pass-an.md";
  slug: "2026-04-15-chalk-it-up-to-good-taste-teacher-style-gifts-thatll-pass-an";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-04-16-weekend-thrills-unforgettable-experience-gifts-for-your-nurs.md": {
	id: "2026-04-16-weekend-thrills-unforgettable-experience-gifts-for-your-nurs.md";
  slug: "2026-04-16-weekend-thrills-unforgettable-experience-gifts-for-your-nurs";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
};
"categories": {
"accessories.md": {
	id: "accessories.md";
  slug: "accessories";
  body: string;
  collection: "categories";
  data: InferEntrySchema<"categories">
} & { render(): Render[".md"] };
"apparel.md": {
	id: "apparel.md";
  slug: "apparel";
  body: string;
  collection: "categories";
  data: InferEntrySchema<"categories">
} & { render(): Render[".md"] };
"books.md": {
	id: "books.md";
  slug: "books";
  body: string;
  collection: "categories";
  data: InferEntrySchema<"categories">
} & { render(): Render[".md"] };
"drinkware.md": {
	id: "drinkware.md";
  slug: "drinkware";
  body: string;
  collection: "categories";
  data: InferEntrySchema<"categories">
} & { render(): Render[".md"] };
"graduation.md": {
	id: "graduation.md";
  slug: "graduation";
  body: string;
  collection: "categories";
  data: InferEntrySchema<"categories">
} & { render(): Render[".md"] };
"home.md": {
	id: "home.md";
  slug: "home";
  body: string;
  collection: "categories";
  data: InferEntrySchema<"categories">
} & { render(): Render[".md"] };
"humor.md": {
	id: "humor.md";
  slug: "humor";
  body: string;
  collection: "categories";
  data: InferEntrySchema<"categories">
} & { render(): Render[".md"] };
"jewelry.md": {
	id: "jewelry.md";
  slug: "jewelry";
  body: string;
  collection: "categories";
  data: InferEntrySchema<"categories">
} & { render(): Render[".md"] };
"self-care.md": {
	id: "self-care.md";
  slug: "self-care";
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
"enesco-our-name-is-mud-nurse-uniform-16-oz-stoneware-mu.md": {
	id: "enesco-our-name-is-mud-nurse-uniform-16-oz-stoneware-mu.md";
  slug: "enesco-our-name-is-mud-nurse-uniform-16-oz-stoneware-mu";
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
