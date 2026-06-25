import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const postCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/post' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    description: z.string().optional(),
    image: z.string().optional(),
  }),
});

const pageCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/page' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    image: z.string().optional(),
    logo: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    blurb: z.object({ heading: z.string(), text: z.string() }).optional(),
    intro: z.object({
      heading: z.string(),
      text: z.string().optional(),
      description: z.string().optional(),
      blurbs: z.array(z.object({ image: z.string(), text: z.string() })).optional(),
    }).optional(),
    values: z.any().optional(),
    contact_entries: z.array(z.object({ heading: z.string(), text: z.string() })).optional(),
    main: z.any().optional(),
    testimonials: z.array(z.any()).optional(),
    full_image: z.string().optional(),
    pricing: z.any().optional(),
  }),
});

export const collections = {
  post: postCollection,
  page: pageCollection,
};
