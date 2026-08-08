<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

## General Guidelines for working with Nx

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

| Document                                                                  | Owns                                                                                                         |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `docs/superpowers/specs/2026-08-07-boilerplate-architecture-design.md`    | **How** it's built — workspace, tooling, CI, design system, phases                                           |
| `docs/superpowers/specs/2026-08-07-pink-paprikaa-site-redesign-design.md` | **What** it must do — pages, content, data model, SEO, success criteria                                      |
| `docs/engineering/README.md`                                              | **The Engineering Handbook** — patterns, naming, configs, gates, AI workflows (authoritative for code shape) |

They are complementary, not competing. When they disagree: architecture spec wins on
build/tooling, product spec wins on content/behaviour, **the engineering handbook wins on how
code is written**. The dated coding-guidelines spec was the handbook's seed and now defers to it.

**AI session contract (binding — docs/engineering/07-ai-workflows.md §1):** read the handbook
README before writing code; look decisions up in its trees instead of re-deriving (02 §5
placement, 03 patterns, 04 naming, 08 recipes); verify APIs against `node_modules`, never
memory; never bypass a gate (`--no-verify`, eslint-disable on LAW rules, budget edits); done =
gates green with evidence. Repeatable workflows are slash commands: `/new-component`,
`/new-feature`, `/pre-merge`.

Two divergences to expect rather than "fix": the product spec writes content paths in the old
repo's layout (`src/data/`, `src/_redirects`) — the architecture spec's `packages/content` and
`apps/web/public/_redirects` win. And the two number their phases differently; `docs/README.md`
reconciles them.

## Hard rules

1. **`Pink Paprikaa` — two `a`s.** Misspelling it is a content bug, not a typo.
2. **No founder identity on the site — ever.** Rishav Pandey must not appear as founder or owner in
   markup, alt text, meta tags, structured data, or commit-authored page copy, and no "from code to
   kitchen" or software-engineering framing. This is conflict-of-interest exposure from a full-time
   MNC role, not a style preference — and it has already regressed once, on the live `/about`. The
   legal entity name (Paprikaa Culinary Ventures Private Limited) stays; that is statutory
   disclosure. Product spec §3.3; a CI grep gate enforces it (§12).
3. **Never write a literal brand hex.** `#EE2C68` exists once, in `packages/design-tokens`.
   Everything else uses the token. A raw hex in `className` or JSX is a lint error.
4. **Never hand-write a dependency version in `package.json`.** Install via `pnpm add`, which
   resolves latest stable. Two deliberate exceptions are documented in §13 of the architecture
   spec, each with a removal criterion:
   - **TypeScript stays on 6.x.** `latest` is 7.0.2 (Go-native), but `typescript-eslint` caps its
     peer range at `<6.1.0` in both stable and canary. On TS 7 every type-aware lint rule silently
     stops running. Do not "helpfully" upgrade this.
   - **`eslint-plugin-jsx-a11y` needs a pnpm peer override** for ESLint 10.
5. **Module boundaries are enforced, not advisory.** The design system may never import app code;
   `web` and `blog` may never import each other. If a boundary is in the way, the design is wrong —
   do not add an eslint-disable.
6. **Atomic layering inside `packages/ui` only goes upward.** An atom cannot import a molecule.
7. **Image originals live in `assets-src/` and are never deployed.** The old site shipped 43 MB of
   raw PNGs; the Lighthouse byte-weight budget exists to make that impossible to repeat.
8. **Conventional Commits.** Author with `pnpm commit` (Commitizen, via `cz-commitlint`); husky's
   `commit-msg` hook runs commitlint against every commit.
9. **Never touch `../pink-paprikaa-site`.** That repo still serves the live site. It is read-only
   reference material until the Phase 6 cutover.

Rules 3, 5 and 6 are wired: `tools/eslint-config` implements `no-raw-hex` (workspace-wide) and
`atomic-layering` (opt-in via `./atomic-layering`, `ui`-only). The acceptance probes that proved
each rule catches its violation live in git history — see commits `5a3e2bb` and `1b79e84`.

## Commands

```bash
corepack enable                               # pnpm version comes from packageManager
pnpm install                                  # --frozen-lockfile in CI
pnpm nx affected -t typecheck lint test build # what CI runs
pnpm nx format:check                          # Prettier, CI-blocking
pnpm nx sync:check                            # TS project references in sync
pnpm nx graph                                 # visualise the project graph
pnpm nx show projects                         # 12 projects — see below
```

**12 projects exist**: apps `web`, `blog` + their `web-e2e`, `blog-e2e`; packages `design-tokens`,
`ui`, `content`, `seo`, `utils`; tools `typescript-config`, `eslint-config`, `image-pipeline`.
Tasks are inferred (see Conventions) and scoped per project:

```bash
pnpm nx test ui                       # one project
pnpm nx test ui -- -t "renders long"  # a single Vitest test by name
pnpm nx run-many -t test              # whole workspace, ignoring affected
pnpm nx dev web                       # dev server (localhost:3000) — the target is `dev`, NOT `serve`
pnpm nx dev blog                      # blog dev server (basePath /blog)
pnpm nx serve-static web              # serve the production build
```

`nx affected` compares against `main` by default. Because none of Phase 0 has merged to `main`
yet, it currently reports every project as affected on this branch regardless of what the latest
commit touched — that stops once `feat/phase-0-foundation` merges, after which a docs-only commit
will affect zero projects as intended. CI instead uses `nrwl/nx-set-shas` to diff against the last
successful run, so it does not have this problem.

## Conventions

- **Package manager is pnpm**, pinned via `packageManager` + corepack. Never `npm` or `yarn`.
- **Imports cross packages by scope** — `@pink-paprikaa-web/ui`, never a relative path escaping a
  package.
- **Nx inferred tasks (Project Crystal).** Targets come from `next.config.ts`, `vite.config.ts`,
  `eslint.config.mjs` etc. Do not hand-write `project.json` files.
- **Nx Cloud is deliberately off.** Do not add `nx-cloud` steps to CI.
- **The block at the top of this file is Nx-managed.** It is auto-updated between its
  `<!-- nx configuration start/end -->` markers — keep them intact and add project content below.

## Current state

**Phase 0 (foundation) is complete, pending merge of `feat/phase-0-foundation` into `main`.**

The item-by-item record of what is built and what is deferred lives in **§15 of the architecture
spec** ("Phase 0 progress"). Read it before planning the next phase, and update it as items
land — it is the only place that state is tracked, so do not duplicate it here.

The working tree is authoritative if it and that table disagree. To establish ground truth:

```bash
pnpm nx format:check && pnpm nx sync:check   # confirm current state is green
pnpm nx show projects                         # 12 projects
git log --oneline                             # commit messages carry the reasoning
```

Three more facts that are easy to trip on, all verified against the working tree:

- **No git remote is configured.** The workspace was initialised locally; the remote is pointed at
  GitHub in Phase 6. Nothing pushes anywhere yet, and CI has never actually executed — every
  workflow command in `.github/workflows/ci.yml` was verified locally instead.
- **`main` is no longer the only branch.** This work landed on `feat/phase-0-foundation`; `main`
  still points at the pre-Phase-0 state until that branch is merged. The spec's `dev` integration
  branch (§3) still does not exist.
- **Root `package.json` `scripts` is now real**: `verify`, `verify:all`, `commit` (`cz`), `format`,
  `format:check`, `guard:founder`, `prepare`. `pnpm verify`, `pnpm commit` and `pnpm format` all
  work as described in the architecture spec.

**§18 records the traps already hit** during setup — Nx and pnpm defaults that contradict this
spec. Read it before running any generator; four of `create-nx-workspace`'s defaults had to be
undone.

Do not start a later phase before its dependencies (§15) are done.
