# Pink Paprikaa — Website

Monorepo for [pinkpaprikaa.com](https://pinkpaprikaa.com) — the marketing site for Pink Paprikaa, a
pure-vegetarian restaurant in Sector 57 / MKM Market, Gurgaon.

Two static-export Next.js applications and a token-driven design system, built with Nx and pnpm.
No server, no runtime cost.

> **Status: Phase 0 — foundation.** The workspace and tooling exist; apps and packages do not yet.
> The live site is still served from the separate `pink-paprikaa-site` repository until the Phase 6
> cutover.

## Getting started

```bash
corepack enable      # pnpm version comes from the packageManager field
pnpm install
```

Node version is pinned in `.nvmrc`.

## Commands

| Command                                         | Does                                               |
| ----------------------------------------------- | -------------------------------------------------- |
| `pnpm nx affected -t typecheck lint test build` | Everything CI runs, on changed projects only       |
| `pnpm nx format:check` / `format:write`         | Prettier — `format:check` blocks CI                |
| `pnpm nx sync:check`                            | Verifies TypeScript project references are in sync |
| `pnpm nx graph`                                 | Opens the interactive project graph                |

## Architecture

| Doc                                                                                              | Covers                                                         |
| ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| [Boilerplate architecture](docs/superpowers/specs/2026-08-07-boilerplate-architecture-design.md) | **How** — workspace, tooling, CI, design system, phase roadmap |
| [Product requirements](docs/superpowers/specs/2026-08-07-pink-paprikaa-site-redesign-design.md)  | **What** — pages, content, data model, SEO, success criteria   |

Planned shape:

```
apps/web        Next.js · static export        → pinkpaprikaa.com
apps/blog       Next.js · basePath /blog       → proxied onto the apex domain
packages/       design-tokens · ui · content · seo · utils
tools/          eslint-config · typescript-config · image-pipeline
```

Key decisions and their rationale — including why Gatsby was rejected, why TypeScript is pinned to
6.x, and why hosting is Netlify rather than Vercel — are recorded in the architecture spec. It also
documents what each decision costs, not just what it buys.

## Conventions

- **pnpm only.** Pinned via `packageManager` and corepack.
- **Conventional Commits**, authored with `pnpm commit`.
- **No hand-written dependency versions.** Install through `pnpm add`; the two deliberate exceptions
  are documented in §13 of the architecture spec with removal criteria.
- **Module boundaries are lint-enforced.** The design system cannot import app code; the two apps
  cannot import each other.
- **Nx Cloud is off** by choice — local caching is sufficient for a single maintainer.

## Licence

Private. All rights reserved.
