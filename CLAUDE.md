<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->

# Pink Paprikaa — Website Workspace

## What this is

The rebuild of `pinkpaprikaa.com`, the marketing site for **Pink Paprikaa** — a pure-vegetarian
restaurant in Sector 57 / MKM Market, Gurgaon. Nx monorepo, two static-export Next.js apps, a
token-driven design system. No server, no runtime cost.

The site's job is **footfall and orders**, not brochureware. Ordering is handled entirely by
Petpooja on an external domain (see §11 of the product spec for why an iframe is impossible).

## Read these first

| Document                                                                  | Owns                                                                    |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `docs/superpowers/specs/2026-08-07-boilerplate-architecture-design.md`    | **How** it's built — workspace, tooling, CI, design system, phases      |
| `docs/superpowers/specs/2026-08-07-pink-paprikaa-site-redesign-design.md` | **What** it must do — pages, content, data model, SEO, success criteria |

They are complementary, not competing. When they disagree, the architecture spec wins on
build/tooling questions and the product spec wins on content/behaviour questions.

## Hard rules

1. **`Pink Paprikaa` — two `a`s.** Misspelling it is a content bug, not a typo.
2. **Never write a literal brand hex.** `#EE2C68` exists once, in `packages/design-tokens`.
   Everything else uses the token. A raw hex in `className` or JSX is a lint error.
3. **Never hand-write a dependency version in `package.json`.** Install via `pnpm add`, which
   resolves latest stable. Two deliberate exceptions are documented in §13 of the architecture
   spec, each with a removal criterion:
   - **TypeScript stays on 6.x.** `latest` is 7.0.2 (Go-native), but `typescript-eslint` caps its
     peer range at `<6.1.0` in both stable and canary. On TS 7 every type-aware lint rule silently
     stops running. Do not "helpfully" upgrade this.
   - **`eslint-plugin-jsx-a11y` needs a pnpm peer override** for ESLint 10.
4. **Module boundaries are enforced, not advisory.** The design system may never import app code;
   `web` and `blog` may never import each other. If a boundary is in the way, the design is wrong —
   do not add an eslint-disable.
5. **Atomic layering inside `packages/ui` only goes upward.** An atom cannot import a molecule.
6. **Image originals live in `assets-src/` and are never deployed.** The old site shipped 43 MB of
   raw PNGs; the Lighthouse byte-weight budget exists to make that impossible to repeat.
7. **Conventional Commits.** Author with `pnpm commit` so the prompt and the commitlint rules stay
   in sync.
8. **Never touch `../pink-paprikaa-site`.** That repo still serves the live site. It is read-only
   reference material until the Phase 6 cutover.

## Commands

```bash
pnpm install                                  # frozen-lockfile in CI
pnpm nx affected -t typecheck lint test build # what CI runs
pnpm nx format:check                          # Prettier, CI-blocking
pnpm nx sync:check                            # TS project references in sync
pnpm nx graph                                 # visualise the project graph
```

## Conventions

- **Package manager is pnpm**, pinned via `packageManager` + corepack. Never `npm` or `yarn`.
- **Imports cross packages by scope** — `@pink-paprikaa-web/ui`, never a relative path escaping a
  package.
- **Nx inferred tasks (Project Crystal).** Targets come from `next.config.ts`, `vite.config.ts`,
  `eslint.config.mjs` etc. Do not hand-write `project.json` files.
- **Nx Cloud is deliberately off.** Do not add `nx-cloud` steps to CI.

## Current state

**Phase 0 (foundation) is in progress.**

The item-by-item record of what is built and what is not lives in **§15 of the architecture spec**
("Phase 0 progress"). Read it before planning any work, and update it as items land — it is the
only place that state is tracked, so do not duplicate it here.

The working tree is authoritative if it and that table disagree. To establish ground truth:

```bash
pnpm nx format:check && pnpm nx sync:check   # confirm current state is green
git log --oneline                             # commit messages carry the reasoning
```

**§18 records the traps already hit** during setup — Nx and pnpm defaults that contradict this
spec. Read it before running any generator; four of `create-nx-workspace`'s defaults had to be
undone.

Do not start a later phase before its dependencies (§15) are done.
