import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import { z } from "zod";

// The brief's `schema: (z) => ({...})` function-as-schema form is retired in
// this installed version (RetiredFeatureError at build time — see
// https://content-collections.dev/docs/deprecations/schema-as-function).
// `schema` must be a StandardSchema-compliant value directly, so a zod
// object schema is passed as-is instead of built from the callback's `z`.
// `content: z.string()` is likewise explicit rather than left implicit (see
// https://content-collections.dev/docs/deprecations/implicit-content-property)
// — the frontmatter parser always produces a raw-MDX `content` field, and an
// undeclared one now only warns instead of failing the build.
const posts = defineCollection({
  name: "posts",
  directory: "content/posts",
  include: "*.mdx",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    content: z.string(),
  }),
  transform: async (doc, ctx) => ({
    ...doc,
    slug: doc._meta.path,
    body: await compileMDX(ctx, doc),
  }),
});

// The brief's `defineConfig({ collections: [posts] })` uses the deprecated
// property name — this installed version wants `content` (see
// https://content-collections.dev/docs/deprecations/config-collections-property).
export default defineConfig({ content: [posts] });
