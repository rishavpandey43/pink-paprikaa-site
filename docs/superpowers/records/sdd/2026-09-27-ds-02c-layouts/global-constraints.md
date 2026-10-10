# Design System — Plan 2c of 5: Layouts

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the design system's seven layouts — Container, Section, Stack, Cluster, AutoGrid, AppShell, PostFrame (+ `POST_FORMATS`) — and the shared spacing-step map (`lib/space.ts`). Each layout is token-driven and server-first, with behaviour + axe tests and card-parity stories. The five layout failures most likely to ship are also pinned in a real browser.

**Architecture:** Layouts are the top atomic tier (`packages/ui/src/layouts/`). They carry no visual style of their own — only spacing, width and frame — so every class they use is one of three things:

- a spacing step (`GAP_CLASS`),
- a layout token from Plan 1 (`--container-*`, `--spacing-gutter|section|grid-gap`), or
- a new component token (`tokens/component/{section,auto-grid,app-shell,post-frame}.json`).

Section, AppShell and PostFrame each paint the one surface they own and set `data-surface`. Auto-fit tracks come from one functional utility in `styles.css` (`autogrid-min-*`); fixed tracks come from Tailwind's `grid-cols-N` (`repeat(N, minmax(0, 1fr))`, verified in the installed Tailwind 4.3.3). Everything is server-safe except PostFrame's `isFit` measuring leaf. jsdom cannot see layout, so the geometry facts are pinned by story `play` functions that `storybook:test` runs in Chromium at the Storybook viewports: track widths, the 360px gutter, focus-ring room, scaled boxes and nested-surface colours. addon-vitest applies `globals.viewport` through `page.viewport()` — verified in `@storybook/addon-vitest@10.5.7`.

**Tech Stack:** Nx 23 · pnpm 10 · TypeScript 6 · React 19.2 · Tailwind 4.3.3 · tailwind-variants 3.3.1 / tailwind-merge 3.6 · lucide-react 1.30 · Vitest 4 + Testing Library + axe-core 4.13 (jsdom 27) · Storybook 10.5 (`storybook/test`, addon-vitest browser mode).

**Spec:** `docs/superpowers/specs/2026-09-27-design-system-rewrite-design.md`. Read §4 (C8 gutters/rhythm), §6 (tokens), §8 (rules + §8.2 translation), §9.4 (layouts), §10.2 (stories) and §11.1 (definition of done).

**Contracts:** `docs/superpowers/plans/2026-09-27-ds-00-contracts.md` — §1 `lib/space.ts` (this plan creates it), §2 `PatternField` (consumed), §4 the seven layouts (this plan implements them). Deviations are recorded below.

**Depends on:**

- **Plan 1:** tokens, `styles.css` utilities, `componentVariants`, `expectNoA11yViolations`, Icon, Logo and the Storybook consumer contract.
- **Plan 2a:** `PatternField` (used by Section), plus `Text`, `Card`, `Button`, `Tag` and `SocialHeadline` in stories.
- **Plan 2b:** tier order only — no interface consumed.

## Global Constraints

- Package manager **pnpm only**; install with `pnpm add` (never hand-write a version in `package.json`). Workspace deps: `pnpm add <pkg> --workspace --filter <project>`.
- TypeScript stays on **6.x** (typescript-eslint caps `<6.1.0`). Node ≥ 24.
- **Never write a literal hex colour** in `.ts/.tsx/.js/.jsx` (`pink-paprikaa/no-raw-hex`, error). Test fixtures that need hex live in `.json` files.
- `#EE2C68` exists once: `packages/design-tokens/tokens/primitive/color.json`.
- **`Pink Paprikaa`** — two `a`s, everywhere. **No founder names** anywhere (source, comments, fixtures, output) — `scripts/check-founder-names.mjs` regex is `/rishav|pandey|anand/i`.
- **Pure veg brand:** nothing non-veg, not even egg (owner, 2026-09-27). Founded **2025**.
- Nx inferred tasks only — **no `project.json`**; per-project overrides go in `package.json` → `"nx"`.
- Named exports, function declarations, **no default exports** (except framework/tool config files). `ref` is a prop (React 19) — **no `forwardRef`**. No TS `enum`; use `as const`.
- Files kebab-case; one primary export per file; booleans prefixed `is/has/should/can/did/will/does`.
- Imports inside `packages/{utils,content,design-tokens}` use `nodenext` resolution → relative imports end in `.js`. Inside `packages/ui` (bundler resolution) relative imports have **no** extension.
- Class names: **only token-backed utilities** — no arbitrary values (`h-[13px]`, `bg-[#…]`, `w-(--x)`); a missing value becomes a token first.
- Commits: Conventional Commits, author with `git commit -m` (commitlint runs in the `commit-msg` hook). Allowed scopes: `web blog storybook ui tokens content seo utils tools ci deps`. Every commit message ends with the `Co-Authored-By:` trailer the harness supplies for the model actually running (the `Claude <model>` in the examples below is a placeholder — substitute it, never commit it literally). **Never `--no-verify`**, never `eslint-disable` a LAW rule.
- Verify APIs against the **installed** package (`node_modules/<pkg>`), never memory.
- A task is done only when its gate command output is green and pasted in the report.

**Tier rules (this plan):**

- Layouts live in `packages/ui/src/layouts/<kebab>/`. They are the top tier: they may import atoms and `lib/`. Nothing imports a layout except other layouts, stories and the barrel.
- **A layout carries no visual style of its own — only spacing, width and frame** (design-system rule). The only fills are the surfaces Section, AppShell and PostFrame own; each is a token (`bg-surface-*`) and sets `data-surface`. There are no shadows, borders or type choices beyond the frame chrome AppShell and PostFrame define.
- **Every length is a step or a token.** Gaps come from `GAP_CLASS` (the design system's step scale). Widths come from `--container-*`, gutters and rhythm from `--spacing-gutter`/`--spacing-section`, and component dimensions from `tokens/component/<name>.json`. The only inline styles are PostFrame's computed geometry: numbers from `POST_FORMATS` × `scale`, which are not classes.
- **Never a bare `1fr` track** (readme §3.10). Use `grid-cols-N` (`repeat(N, minmax(0, 1fr))`) or the auto-fit min pattern `minmax(min(step, 100%), 1fr)`.
- **Every design survives 360px.** Each layout with responsive behaviour has a story at the `floor360` viewport.
- **Server-first.** The only `"use client"` file in this plan is `layouts/post-frame/post-frame-scaler.tsx`.
- **Defaults live in one place:** the destructured prop defaults. No `defaultVariants` in layouts, so a default can never disagree with its documentation.
- No new text/background pairs are introduced (every surface used is already in `contrast-pairs.json`), so the contrast policy file is untouched.

## Review Focus

1. **A long unbreakable word in an AutoGrid cell must not widen tracks.** Every track floor is `min(step, 100%)` or `0`, never content-based, so the word overflows its cell instead of pushing its column wider. Owned by **Task 5**:
   - jsdom asserts the utility definition and the `grid-cols-N` mapping;
   - the `LongWordHoldsTracks` and `NarrowerThanMinAt360` story `play` functions measure track widths in Chromium.

   Stack gets the same guarantee in **Task 3** (`LongWordAt360`).

2. **A Section nested inside another Section must reset its surface.** A light band inside an ink band sets `data-surface="light"` and shows dark text again (the light island). Owned by **Task 6**: jsdom checks attributes; the `NestedSurfaces` story compares computed colours.
3. **A scrollable Cluster must stay keyboard-scrollable and never clip focus rings.** Owned by **Task 4**:
   - jsdom checks the tab stop and the ring-room classes;
   - the `ScrollableRailAt360` story checks that Tab reaches the rail, and that there is ≥ 4px of ring room at the start, top and bottom, and at the far end after focus-scrolling.
4. **Container at 360px keeps the 16px gutter.** Owned by **Task 2**:
   - jsdom evaluates the gutter token's clamp at 360 → 16 and 1280 → 40;
   - the `AtTheFloor` story checks a computed 16px padding and no horizontal page scroll.
5. **PostFrame at scale must not overflow its parent.** Owned by **Task 8**:
   - jsdom checks the scaled box, the clip and the fit maths;
   - the `FitsItsParentAt360` story checks three things. The reserved box is `w × s`. A fit frame fills its parent's width at the canvas's aspect ratio. Neither parent scrolls, and neither does the page.

## Contract deviations

Each is justified against the design-system sources. All are **additive or stricter**: every call that is valid under the contracts file still compiles.

1. **AutoGrid gains `space?: SpaceStep`** (a gap override; default: the fluid `--spacing-grid-gap`). The design system's `AutoGrid.d.ts` has `space` ("Gap override; defaults to --gap-grid") and spec §9.4 lists a "`gap` token". The contract omitted it. It is named `space` for consistency with Stack and Cluster.
2. **`PostFrameProps` is a type alias** whose union makes `scale` and `isFit` mutually exclusive: `{ scale?: number; isFit?: false } | { isFit: true; scale?: never }`. The contract lists both as optional on one interface. `PostFrame.jsx` silently let `scale` win when both were passed; here, passing both is a type error. `tone` defaults to `"light"` — the design system's default background is `ink-000`.
3. **PostFrame `tone` gains `alt`** (pink-50, `bg-surface-page-alt`, `data-surface="light"`), alongside brand/ink/soft/light (controller ruling, 2026-09-27). The readme §4b composition rule names pink-50 _and_ pink-100 as the light, product-led fields, and the marketing kit (`ui_kits/marketing/FeedArtboards.jsx`) ships a pink-50 feed post. This is additive; Plan 5's marketing kit uses `tone="alt"` for that board.
4. **`GAP_CLASS` is `Readonly<Record<SpaceStep, string>>`** (the contract says `Record<SpaceStep, string>`). The read-only type is assignable to the contract type; it only stops a consumer from mutating the shared map.

Resolutions between design-system sources (not contract changes; recorded so reviewers do not "fix" them back):

5. **PostFrame `padding="default"` depends on the format.**
   - 1080-wide canvases and the 1920 screen get `--canvas-pad` (72px).
   - Landscape 1200×628 gets `--canvas-pad-tight` (48px). The readme §4b rule is "`--canvas-pad-tight` 48px on 1200×628"; `PostFrame.jsx` used 72px, and the readme wins.
   - `mpu` and `leaderboard` get 20px (`p-5`, from `PostFrame.jsx`).
6. **AppShell `size="phone-sm"` is 360×780.** This is the system's 360px floor and the Storybook `floor360` viewport. The contract names the value but not its dimensions.
7. **AppShell `statusTone="light"` floods the status row with the brand surface.** The zip draws white text on the white frame, which is invisible. Both light-status screens in `ui_kits/app/index.html` open on a brand `PatternField`, so the row floods to meet them.
8. **AppShell wraps `children` in the frame's scroll body** (`flex-1 overflow-y-auto`). This follows `.d.ts` ("The scrolling screen body."); the zip left the scroll container to each screen.
9. **Section `pattern` renders `PatternField` as an `aria-hidden` layer behind the content,** made transparent. The band keeps its own surface colour, so `alt` and `sunken` bands can carry the pattern too; PatternField itself has no `alt` or `sunken` tone.
10. **Stack is one `minmax(0, 1fr)` column** (`grid-cols-1`). The zip used an implicit `auto` column, which has a min-content floor — the exact bug readme §3.10 forbids.
11. **Cluster `isScrollable` is a tab stop (`tabIndex={0}`) with 4px of ring room.** The zip's rail was neither keyboard-reachable nor safe for focus rings. A consumer whose items are all focusable passes `tabIndex={-1}`.

## Hand-offs to later plans

- **Portals (controller ruling):** Plan 4 gives Dialog a `portalContainer` prop, and Plan 3a gives ToastProvider a viewport that can sit inside a container. AppShell's frame is their intended container. It is `position: relative` (plus `contain-layout`), and it is one stable element: the root `<div>` takes a `ref` (React 19 prop), and the `overlay` slot renders inside it. A caller passes that ref's element as `portalContainer`, and the sheet or toast stays inside the phone. Task 7 pins the ref.
- **Stand-ins (controller ruling):** the AppShell and PostFrame stories use atom stand-ins where the cards show later-tier components: TabBar, Dialog, FilterBar, MenuItemRow, LoyaltyCard, LogoLockup and OfferSeal. They are temporary. **Plan 4's final task** replaces them with the real components. Plan 5's kits show the full compositions.
- **Plan 5 (marketing kit):** the pink-50 feed board uses PostFrame `tone="alt"` (deviation 3).

---

## File map (this plan)

```
packages/design-tokens/tokens/component/{section,auto-grid,app-shell,post-frame}.json   C
packages/ui/src/
  styles.css                                  M  @utility autogrid-min-*
  index.ts                                    M  layout + space exports
  lib/space.ts, lib/space.spec.ts             C
  lib/component-variants.ts                   M  SPACING / RADIUS / TEXT names
  layouts/container/{container.tsx,container.test.tsx,container.stories.tsx}   C
  layouts/stack/{stack.tsx,stack.test.tsx,stack.stories.tsx}                   C
  layouts/cluster/{cluster.tsx,cluster.test.tsx,cluster.stories.tsx}           C
  layouts/auto-grid/{auto-grid.tsx,auto-grid.test.tsx,auto-grid.stories.tsx}   C
  layouts/section/{section.tsx,section.test.tsx,section.stories.tsx}           C
  layouts/app-shell/{app-shell.tsx,app-shell.test.tsx,app-shell.stories.tsx}   C
  layouts/post-frame/{post-formats.ts,post-formats.spec.ts,post-frame.tsx,
                      post-frame-scaler.tsx,post-frame.test.tsx,post-frame.stories.tsx}  C
```

**The standard gate** (every component task ends with it; referred to below as _the gate_):

```bash
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache \
  && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static \
  && pnpm nx run @pink-paprikaa-web/storybook:build \
  && pnpm nx test @pink-paprikaa-web/storybook --skip-nx-cache \
  && pnpm nx format:check
```

`storybook:test` is part of the gate because the Review Focus `play` functions live there. If a failure is in another plan's story, report it — do not fix it here.

---


## Controller amendments (2026-09-27)

- **Container `size="prose"` uses `max-w-text-measure-prose`**, the spacing token Plan 2a Task 2 creates (`--spacing-text-measure-prose: var(--container-prose)`). Tailwind 4.3's static `max-w-prose` (65ch) shadows the `--container-prose` (64ch) theme value, so it must never be used. Task 0 confirms the token exists before Task 2 starts.
- **Ruling R13 — optional props accept `undefined`.** Every optional custom prop is declared `name?: T | undefined` (matching React's own DOM prop types) so compositions can forward a possibly-undefined value under `exactOptionalPropertyTypes`. Apply this to every `…Props` interface in this plan.
- **Ruling R15 — file paths in tests.** Any spec/test in `packages/ui` that reads a file builds its path with `join(import.meta.dirname, "…")` (`node:path`), never `new URL("…", import.meta.url)`: under Vitest's jsdom environment Vite rewrites the latter to an `http://localhost` URL and `readFileSync` fails (found in Plan 1 Task 5).
