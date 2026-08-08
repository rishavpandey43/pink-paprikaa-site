# 02 — Architecture

**Universal rules:** code is organised in layers with a machine-enforced dependency direction;
features co-locate everything only they use; promotion between layers is a deliberate,
single-purpose change; placement is looked up in a decision tree, never re-derived. The tables
below are **this repo's binding** of those rules.

## 1. The layer map (LAW — `@nx/enforce-module-boundaries`)

| Layer                    | Holds                                                    | May import                                         |
| ------------------------ | -------------------------------------------------------- | -------------------------------------------------- |
| `apps/web`, `apps/blog`  | Routes, pages, feature modules, app composition. Thin.   | `ui`, `content`, `seo`, `utils`, `design-tokens`   |
| `packages/ui`            | Presentational components (atomic layers) + Storybook    | `ui` (upward only — LAW), `utils`, `design-tokens` |
| `packages/content`       | Zod schemas + typed site data — the single content truth | `utils`                                            |
| `packages/seo`           | JSON-LD builders, metadata helpers                       | `content` types, `utils`                           |
| `packages/utils`         | Framework-agnostic pure functions                        | `utils`                                            |
| `packages/design-tokens` | Token source → generated theme. Imports nothing (LAW).   | —                                                  |
| `tools/*`                | Build/lint/pipeline tooling                              | (unconstrained; not imported by app code)          |

Apps never import each other (LAW). Deep imports into another package's `src/` are boundary
violations — cross-package traffic goes through the package's public surface only.

## 2. Atomic layers inside `packages/ui` (LAW — `atomic-layering` lint)

`atoms → molecules → organisms → templates`, imports upward only. Definitions and this site's
concrete examples: [coding patterns §1](03-patterns.md). Pages are NOT in the design system —
apps bind `content` data to templates.

## 3. Feature-module structure inside apps (CONVENTION)

Adopted from the reference architecture's strongest idea — **a feature is a folder that
co-locates everything only it uses** — adapted to the Next.js App Router:

```
apps/web/src/
├── app/                          # Next routes ONLY — thin composition roots
│   ├── layout.tsx  page.tsx  global.css
│   └── menu/
│       ├── page.tsx              # composes features/menu; no logic beyond binding
│       └── [category]/page.tsx
├── features/                     # feature modules — the unit of ownership
│   └── menu/
│       ├── components/           # feature-private components (menu-hero.tsx, …)
│       ├── hooks/                # feature-private hooks (use-menu-filter.ts)
│       ├── menu-constants.ts     # constants-as-data (03-patterns §5)
│       ├── menu-transformer.ts   # pure wire/URL ↔ view mapping (03-patterns §4)
│       └── menu-utils.ts         # pure helpers
├── components/                   # app-wide (≥2 features) but not design-system-worthy
├── hooks/                        # app-wide hooks
├── constants/routes.ts           # every route path/builder — never inline strings
└── env.ts                        # the ONLY process.env reader (validated)
```

Rules that keep this predictable:

- **`app/` files stay thin (CONVENTION):** a `page.tsx` reads params, calls the feature, binds
  content. Fetch-shaping, filtering, and mapping live in the feature's transformer/hooks — never
  in JSX.
- **Promotion ladder (CONVENTION):** feature-private → `src/components|hooks` on the 2nd
  consumer → `packages/ui` only when a 2nd _app or context_ (Storybook counts) needs it AND it
  is purely presentational. Promotion is a deliberate move, done alone (not smuggled into a
  feature PR).
- **No `index.ts` barrels inside features or layers (LAW-by-precedent, R-04):** import files
  directly (`@/features/menu/menu-transformer`). The reference codebase's barrels rotted into
  decoys (4-of-40-exports "public" APIs, asymmetric folder imports); the packages here each have
  exactly one public barrel (`packages/*/src/index.ts`) and nothing else.

## 4. Data flow (the whole site, one line each)

- **Build-time content:** `packages/content` data → Zod parse (build fails on violation) → typed
  import in a feature → transformer (if shaping needed) → components. No runtime fetching.
- **Blog:** `content/posts/*.mdx` → Content Collections (schema-validated) → `allPosts` →
  page binding.
- **Interactivity (client islands):** smallest-leaf `"use client"` components; state per the
  ladder ([03-patterns §6](03-patterns.md)); URL is the state home for anything shareable.
- **Structured data:** `content` types → `packages/seo` builders → JSON-LD in layouts. Same
  source renders the page and the metadata — they cannot drift.
- **Images (Phase 3):** `assets-src/` originals → `tools/image-pipeline` (AVIF/WebP ladder,
  LQIP, hashed manifest) → `<Picture>` in `ui`.

## 5. Where does new code live? (decision tree — follow, don't re-derive)

1. Visual building block, reusable, presentational → `packages/ui`, correct atomic layer.
2. Business data or its schema → `packages/content`.
3. Pure function, no React/framework → `packages/utils`.
4. SEO/structured-data → `packages/seo`.
5. Colour/spacing/font/radius value → token in `packages/design-tokens`. Never a literal (LAW).
6. Belongs to exactly one feature → that feature's folder (`features/<name>/…`).
7. Used by 2+ features of one app → `apps/<app>/src/components|hooks`.
8. Genuinely unsure → **the feature folder** (most-local home wins); promotion is cheap,
   demotion is not.

## 6. Route & URL rules

- Every path lives in `constants/routes.ts` as an `as const` object with builder functions for
  dynamic segments (`ROUTES.menu(category)`) — inline route strings are a review reject.
- Internal navigation: `next/link`. External (ordering → Petpooja): plain
  `<a target="_blank" rel="noreferrer">` — never an iframe (product spec §11, tested fact).
- Anything a user could want to share or back-button through lives in the URL, not in state.
