// src/content/config.ts
import { defineCollection, z } from "astro:content";

const blogCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.date(),
    updateDate: z.date().optional(),
    author: z.string().default("Karol Leszczyński"),
    category: z.enum([
      "Strony internetowe",
      "Sklepy internetowe",
      "Aplikacje webowe",
      "Integracje AI",
      "Automatyzacja",
      "Pozycjonowanie",
      "Hosting i infrastruktura",
    ]),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  blog: blogCollection,
};
