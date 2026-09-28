### Task 14: Docs and records

Every edit below is exact text. "Replace section X" means from that heading to the next heading of the same or higher level. Plan 1 Task 9 already touched 02/05/06/09; this task sets their **final** state, so check each file first and replace rather than append where Plan 1's text overlaps. Never write the git remote's URL anywhere (it contains a name the founder guard bans) — say "`origin` (GitHub)".

**Files:**

- Modify: `docs/engineering/{02-architecture,03-patterns,04-naming-conventions,05-tooling-and-config,06-quality-gates,09-decision-log}.md`, `docs/superpowers/specs/2026-08-07-boilerplate-architecture-design.md`, `docs/superpowers/specs/2026-09-27-design-system-rewrite-design.md` (status line), `CLAUDE.md`, `docs/README.md`
- Replace: `apps/storybook/README.md`, `packages/ui/README.md`

**Dev reference:** `git show dev:apps/storybook/README.md`

**Dev parity:**

| Dev item                                                                                                        | Ruling  | Where / spec clause                                                                                            |
| --------------------------------------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------- |
| Run every CLI command from `apps/storybook`; the root fails with `SB_CORE-SERVER_0006 MainFileMissingError`     | ADD     | Step 9 README (the error code was dropped)                                                                     |
| Commands table incl. story tests, watch mode, one story file, Chromatic                                         | ALREADY | Step 9 README                                                                                                  |
| Story tests: render → `play` → axe; headless Chromium via Playwright, not jsdom, and why; jsdom suite separate  | ADD     | Step 9 README "Story tests"                                                                                    |
| Watch mode starts a dev server on 6006 so failures deep-link to the story                                       | ADD     | Step 9 README "Story tests"                                                                                    |
| "Current state: this target is red" — 200/441 failing, the ten failing contrast pairs                           | DROP    | Spec §5.2–§5.4, C13: text tokens re-pointed; `design-tokens:test` measures every pair; the suite must be green |
| Structural findings `landmark-unique`, `landmark-no-duplicate-banner`, `scrollable-region-focusable`            | ALREADY | Owned by the components (cross-plan); checked before the kits compose them — Task 0 A21, A10                   |
| "The brand pink is not negotiable; text-on-pink is a separate, one-token decision"                              | ALREADY | D3; Step 9 "Accessibility policy"; Colors → Contrast "Changing it"                                             |
| Visual tests (Chromatic) section                                                                                | ALREADY | Step 9 README, verbatim                                                                                        |
| (Plan 1's README, not dev) "The founder guard covers this build" — `relativeDocgenPaths()`, blanked `NODE_PATH` | ADD     | Step 9 README — the replacement would otherwise delete it                                                      |

Implementer: copy this table into your report, extended with anything the plan missed.

**Nothing vanishes (controller ruling R28).** Steps 9 and 10 _replace_ two READMEs. Before replacing
either, diff the current file against the replacement. Every paragraph of the current README that
the replacement lacks is carried over unless it is now false; each one dropped is named in the report
with the reason. Known carry-overs in `apps/storybook/README.md` that are not in the replacement
text above:

- the Fontsource / `@source` scope paragraph;
- the `build` / `serve-static` `nx:noop` alias paragraph.

**Interfaces:** Consumes the built system (Tasks 0–13). Produces the records spec §12 lists.

- [ ] **Step 1: `03-patterns.md` §1 — the canonical component from the real Button**

Replace section `## 1. Component (the base form)` with:

````md
## 1. Component (the base form)

The reference shape is the real Button, `packages/ui/src/atoms/button/button.tsx`, copied here
verbatim when the design system was completed (2026-09-27). If that file changes shape, this
excerpt changes in the same PR.

```tsx
BUTTON_SOURCE;
```

Encoded rules — all CONVENTION unless marked:

- `componentVariants()` owns every class decision; no conditional string concatenation in JSX.
  **Never import `tv` from `tailwind-variants` directly** (LAW-in-practice): the bare instance
  merges against stock Tailwind scales and silently deletes token classes — `text-h1` is read as a
  colour and disappears next to `text-text-muted`. `packages/ui/src/lib/component-variants.ts` is
  the configured instance, and its spec asserts the scale lists against the generated tokens.
- **Only token classes exist** (LAW: `tailwindcss/no-arbitrary-value`, `tailwindcss/no-custom-classname`,
  `pink-paprikaa/no-raw-hex`). `packages/design-tokens` clears the stock scales it replaces, so
  `rounded-lg` is the system's 16px, and `shadow-md`, `bg-red-500` or `max-w-prose` compile to
  nothing or to the wrong thing. A value the scales lack becomes a token first — component tokens
  live in `packages/design-tokens/tokens/component/<name>.json` (`packages/ui/AUTHORING.md`).
- Extend native element props; spread last; `className` merges through `componentVariants()`.
  Every optional custom prop accepts `undefined` (`name?: T | undefined`), so callers can pass an
  optional field straight through under `exactOptionalPropertyTypes`.
- `ref` is a plain prop (React 19) — **no `forwardRef`** (R-03).
- **Named exports, function declarations. No default exports** (R-02) — except framework
  contracts (`page.tsx`, `layout.tsx`, config files, CSF `export default meta`).
- **Surfaces are CSS, not props.** A component that paints a field sets `data-surface`
  (`brand | ink | soft | light`); everything inside re-reads the semantic tokens. Never an
  `on="brand"` prop (spec D5).
- **`asChild` for links and custom elements.** Button, IconButton, Link, Card, LinkCard, ListRow and
  TabBar items take `asChild` (Radix `Slot`), so the app passes `next/link`, a `wa.me` link or `tel:`
  without the system knowing about routers (D8). Components that render **lists** of links take
  `linkAs` (default `"a"`).
- **`Field` wires a control by render prop:** `<Field label hint status message>{(control) => <Input {...control} />}</Field>`
  — `control` is `{ id, "aria-describedby", "aria-invalid", required }`; no context, so Field stays
  server-safe. With react-hook-form, native-backed controls take `{...register("name")}` and
  value-based controls take `<Controller>` (Storybook → Molecules → Field → React Hook Form + Zod).
- **Native first, then Radix.** `<select>`, `<input type="range|date|checkbox|radio">` and
  `<details name>` before any library; Radix only for Dialog/Sheet, Tabs, Tooltip, Toast,
  ToggleGroup and `Slot` (D7). Hand-rolled behaviour is a review reject.
- **Server-first.** `"use client"` only in the smallest file that owns state, effects or browser
  APIs (D6); hover, press and focus are CSS.
- No boolean render forks — `{isX ? <A/> : <B/>}` spanning whole render paths means two components
  or a variant.
- Multi-part components use `componentVariants()` **slots** (the reason tailwind-variants was chosen
  over CVA).
````

Then fill the fence from the real file — the excerpt is canonical because it _is_ the file:

```bash
node -e 'const fs = require("fs"); const doc = "docs/engineering/03-patterns.md";
const source = fs.readFileSync("packages/ui/src/atoms/button/button.tsx", "utf8").trimEnd();
fs.writeFileSync(doc, fs.readFileSync(doc, "utf8").replace("BUTTON_SOURCE", () => source));'
grep -c "BUTTON_SOURCE" docs/engineering/03-patterns.md   # prints 0
```

(Keep §2 onwards; in §2 replace `(\`expect(await axe(container)).toHaveNoViolations()\`)`-style wording, if any survives, with `await expectNoA11yViolations(container)`.)

- [ ] **Step 2: `02-architecture.md` — layers, `lib/`, Storybook**

In §1's table, replace the `packages/ui` row and add an `apps/storybook` row directly after the `apps/web, apps/blog` row:

```md
| `apps/storybook` | The design system's workbench: foundation docs (MDX + specimens), docs-kit helpers, reference kits, patterns. Local + static build only. | `ui`, `content`, `utils`, `design-tokens` |
| `packages/ui` | Presentational components (atoms, molecules, organisms, layouts), `src/lib/` internals, and their stories | `ui` (upward only — LAW; atoms import only `atoms/icon` + `lib`), `utils`, `design-tokens` |
```

Replace section `## 2. Atomic layers inside \`packages/ui\`` with:

```md
## 2. Atomic layers inside `packages/ui` (LAW — `atomic-layering` lint)

`atoms → molecules → organisms → layouts`, imports upward only, and **an atom imports nothing but
`atoms/icon` and `lib/`** — the design system's tier rule, now a gate. `src/lib/` holds library
internals every layer may use: `component-variants.ts` (the configured tailwind-variants),
`brand-artwork.ts` (generated logo paths), `reveal-observer.tsx`, `heading.ts`, `link-as.ts`,
`field-status.ts` and `space.ts`. `src/index.ts` is the one public barrel. Pages are **not** in the
design system — apps (and Storybook's reference kits) compose organisms and layouts with real
content.
```

In §4 "Data flow", add as the first bullet:

```md
- **Design tokens:** `packages/design-tokens/tokens/**` (DTCG) → Style Dictionary → `theme.css`
  (Tailwind `@theme static`), `surfaces.css` (`data-surface` remaps) and `tokens.json` (the
  catalogue) → `packages/ui/src/styles.css`, the one stylesheet consumers import, and Storybook's
  foundation pages. `contrast-pairs.json` is measured on every `design-tokens:test`.
```

In §5, replace item 1 with:

```md
1. Visual building block, reusable, presentational → `packages/ui`, correct atomic layer.
   Docs-only helpers (swatches, token tables, specimens) → `apps/storybook/src/docs-kit`, never
   `packages/ui`.
```

- [ ] **Step 3: `04-naming-conventions.md` — the prop translation table**

Append a new section after §5:

```md
## 6. Props — translating a design-system `.d.ts` (LAW for booleans; CONVENTION otherwise)

Every design-system prop keeps its name and meaning except these translations (spec §8.2):

| Design system prop pattern                               | This system                                                                             |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `icon?: string` (a Lucide name)                          | `icon?: IconComponent` — a `lucide-react` icon or a brand glyph                         |
| `style?: CSSProperties`                                  | `className?: string` (+ native props)                                                   |
| `on?: "light" \| "brand"`                                | removed — surface-aware through `data-surface` (D5)                                     |
| `base?: string` (asset folder)                           | removed — artwork is inlined                                                            |
| boolean `fullWidth`, `loading`, `selected`, `chevron`, … | `isFullWidth`, `isLoading`, `isSelected`, `hasChevron`, … (`is/has` prefixes — LAW)     |
| numeric px `size`/`width`/`min`/`tile`                   | token-backed enums (`size: "sm" \| "md" \| "lg"`, AutoGrid `min: "xs" … "2xl"`)         |
| free CSS strings (`radius`, a tone colour, `measure`)    | token enums only                                                                        |
| `onClick` used for navigation                            | `href` / `asChild`                                                                      |
| `onChange(value)`                                        | `onValueChange(value)` (native-backed controls keep native `onChange` for `register()`) |
| `open` + `onClose`                                       | `open` / `defaultOpen` / `onOpenChange`                                                 |
| `error?: boolean \| string` on a control                 | control `status` + `aria-invalid`; the message is rendered by `Field`                   |
| string-or-object option lists                            | object lists only (`{ value, label }`) — strings are not control flow                   |

Controlled/uncontrolled pairs follow Radix: `value`/`defaultValue`/`onValueChange`,
`checked`/`defaultChecked`/`onCheckedChange`, `open`/`defaultOpen`/`onOpenChange`. Titled
components take `headingLevel`.
```

- [ ] **Step 4: `05-tooling-and-config.md` — registry rows**

Add to the §1 table (keep Plan 1's rows; add only what is missing):

```md
| `packages/design-tokens/contrast-pairs.json` | The contrast policy — every text/background pair the components paint | Adding pairs is free; lowering a `min` is a decision-log event |
| `apps/storybook/.storybook/{main.ts,preview.tsx}` | Stories globs, docs addons, a11y policy, sidebar order, viewports | Sidebar order follows the design system's tab groups; the a11y rule list changes only with spec §5 |
| `apps/storybook/vitest.config.mts` | Story tests in headless Chromium (addon-vitest) | One project; docs-kit contract tests are stories, not a second config |
```

- [ ] **Step 5: `06-quality-gates.md` §2 — the final gate registry**

Replace the §2 table with:

```md
| Gate                   | Tool                                                                                                                                                                                                                                                                                                                                                                                                                   | Blocking where       |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| Types                  | `tsc` strict (max flags)                                                                                                                                                                                                                                                                                                                                                                                               | verify, pre-push, CI |
| Lint policy (all LAWs) | ESLint 10 flat config — boundaries, `no-raw-hex`, `atomic-layering` (atoms → molecules → organisms → layouts; atoms import only Icon + lib), `naming-convention` (error), `tailwindcss/no-arbitrary-value` + `no-custom-classname` (token classes only)                                                                                                                                                                | verify, pre-push, CI |
| Unit/component tests   | Vitest + Testing Library + axe (`expectNoA11yViolations` — every rule but `color-contrast`)                                                                                                                                                                                                                                                                                                                            | verify, pre-push, CI |
| Story tests            | `storybook:test` — every story in headless Chromium (`@storybook/addon-vitest`), axe `test: "error"` (every rule but `color-contrast`), `play` interactions; includes the foundation specimens (a missing token fails), Company details (every null fact listed), the Contrast matrix (the exception shown as an exception), the kits at 360px (no sideways scroll) and the React Hook Form + Zod form (keyboard only) | verify, CI           |
| Contrast policy        | `design-tokens:test` over `contrast-pairs.json` — ≥ 4.5, or ≥ 3 only for `brand-fill` over the brand pink                                                                                                                                                                                                                                                                                                              | verify, CI           |
| Token build contract   | `design-tokens:test` (`theme.spec.ts`: namespace resets, references kept, light island restores every override)                                                                                                                                                                                                                                                                                                        | verify, CI           |
| Stylesheet literals    | `ui:test` (`styles.spec.ts`) — no hex/rgb/hsl/oklch in `packages/ui/src/**/*.css`                                                                                                                                                                                                                                                                                                                                      | verify, CI           |
| Brand facts            | `content:test` — the two-`a` literal, GSTIN/FSSAI/CIN/PAN/phone formats, nulls not TODOs, no founder names                                                                                                                                                                                                                                                                                                             | verify, CI           |
| Build                  | `next build` static exports + package builds + `storybook:build`                                                                                                                                                                                                                                                                                                                                                       | verify, pre-push, CI |
| Formatting             | Prettier via `nx format:check`, with `prettier-plugin-tailwindcss` class order                                                                                                                                                                                                                                                                                                                                         | CI, lint-staged      |
| TS project references  | `nx sync:check`                                                                                                                                                                                                                                                                                                                                                                                                        | CI                   |
| E2E + a11y             | Playwright + @axe-core (vs the real export)                                                                                                                                                                                                                                                                                                                                                                            | CI                   |
| Performance/a11y/SEO   | Lighthouse budgets (perf ≥ 0.95, a11y = 1, SEO = 1, LCP ≤ 2.5s, CLS ≤ 0.1, TBT ≤ 200ms, ≤ 1MB total, ≤ 600KB images)                                                                                                                                                                                                                                                                                                   | CI                   |
| Founder-name ban       | `guard:founder` over `apps/web/out`, `apps/blog/out`, `apps/storybook/storybook-static` (incl. sourcemaps, extensionless, svg)                                                                                                                                                                                                                                                                                         | CI                   |
| Commit hygiene         | commitlint + Commitizen                                                                                                                                                                                                                                                                                                                                                                                                | commit-msg hook      |
| Package manager        | only-allow + engines + workspace protocol                                                                                                                                                                                                                                                                                                                                                                              | preinstall           |
```

- [ ] **Step 6: `09-decision-log.md` — final entries and the drift ledger's final state**

First confirm Plan 1 Task 9's rows D1–D18 exist (`grep -cE '^\| D([1-9]|1[0-8]) ' docs/engineering/09-decision-log.md` → `18`); add any missing one from spec §3.1 as a one-line row with the spec link.

Append this section before `## Drift ledger`:

```md
## Design system rewrite — Storybook, kits and records (2026-09-27, Plan 5)

| #    | Decision                                                                                                                                                                                                                                        | Where                                             |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| S-01 | Foundation visuals are hidden specimen stories (`!dev`, `!autodocs`) embedded in MDX, so every docs visual runs in `storybook:test` (axe + `play`); MDX holds prose and blocks only                                                             | `apps/storybook/README.md`                        |
| S-02 | Docs read token values only through `docs-kit/catalogue.ts`; a missing name throws, so a renamed token fails the suite instead of rendering blank                                                                                               | `apps/storybook/src/docs-kit/catalogue.ts`        |
| S-03 | One contrast evaluator (`evaluateContrastPolicy`, `design-tokens/src/contrast.ts`) serves the gate and the Contrast page; `contrast-pairs.json` and the catalogue type are package exports                                                      | spec §5.4                                         |
| S-04 | Docs-kit helpers live in `apps/storybook`, never `packages/ui`; their contract tests are hidden stories in the one story runner — no second Vitest config                                                                                       | handbook 02 §5                                    |
| S-05 | Kits compose only public ui exports; facts from `@pink-paprikaa-web/content`; the four verified Google reviews verbatim (one elision where a guest misspelt the brand); no invented rating or testimonial; every kit badged and tested at 360px | spec §10.1, `apps/storybook/src/kits/fixtures.ts` |
| S-06 | `react-hook-form`, `@hookform/resolvers` and `zod` are Storybook devDependencies only; the "React Hook Form + Zod" story's keyboard-only `play` is the D17 compatibility gate                                                                   | spec D17                                          |
| S-07 | The JSON token files are typed by ambient module declarations (no `resolveJsonModule`), so Storybook's typecheck never depends on `dist/`                                                                                                       | `apps/storybook/src/docs-kit/token-files.d.ts`    |
```

Replace the `## Drift ledger` table with its final state:

```md
| Item                                                                                                               | State                                                                                  | Owner phase           |
| ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- | --------------------- |
| `tools/typescript-config` presets unconsumed — wire or retire                                                      | Open                                                                                   | step 2 (web-app spec) |
| `prettier-plugin-tailwindcss` (class sorting) not installed                                                        | Closed 2026-09-27 — installed and configured (D18)                                     | —                     |
| naming-convention promotion warn → error                                                                           | Closed 2026-09-27 — error (P-08)                                                       | —                     |
| eslint-config cleanup cluster (unused eslint-plugin-import, ts-node; .js/.mjs config files carry no TS-lint rules) | Open                                                                                   | step 2 (web-app spec) |
| Interactive `pnpm commit` never smoke-tested end-to-end (inquirer peer)                                            | Open                                                                                   | next touch            |
| Content-integrity gate (link/asset checker beyond Zod)                                                             | Deferred                                                                               | step 2 (web app)      |
| Reference component + real tokens + Storybook stories glob widened already                                         | Closed 2026-09-27 — 90 components, rebuilt tokens, Storybook indexes both source trees | —                     |
| Storybook public hosting                                                                                           | Deferred (D16)                                                                         | Phase 6               |
| `PriceTag` has no canvas size (marketing boards use `SocialHeadline` + `formatRupees`)                             | Open — owner decision                                                                  | step 2                |
```

- [ ] **Step 7: Architecture spec — §8 amendment and §15 Phase 1 progress**

In `docs/superpowers/specs/2026-08-07-boilerplate-architecture-design.md`, insert directly under `## 8. Design system`:

```md
> **Amended 2026-09-27** by the [design system rewrite spec](2026-09-27-design-system-rewrite-design.md),
> implemented on `feat/design-system`. Where this section and that spec disagree, the spec wins:
>
> - Outputs are `theme.css`, `surfaces.css` (the `data-surface` remaps) and `tokens.json`; no
>   `tokens.ts` is produced (no JavaScript consumer — spec §3.3).
> - Tiers are primitive → semantic → component, plus **surface** overrides; the contrast policy
>   (`contrast-pairs.json`) is part of `design-tokens:test`.
> - Atomic layers are `atoms → molecules → organisms → layouts` (not `templates`), with `src/lib/`
>   internals; atoms import only Icon.
> - Native elements first; Radix only for Dialog/Sheet, Tabs, Tooltip, Toast, ToggleGroup and `Slot`.
> - Storybook is its own app (`apps/storybook`), local + static build only — no Netlify site in this
>   phase (D16).
> - The system is 90 components (74 from the design system, 16 derived from the handoff), 33
>   foundation cards across the Brand … Marketing groups, and three reference kits.
```

In §15, directly under the `### Phase 0 progress` paragraph that begins "Phase 0 is complete", add:

```md
_Amended 2026-09-27:_ the branch and remote facts in this subsection are historical. Current branch
and remote state lives in `CLAUDE.md` → Current state.
```

Then insert a new subsection after the Phase 0 progress table's closing paragraphs (before `---` / `## 16`):

```md
### Phase 1 progress

Phase 1 runs in two steps (design system spec, header). Step 1 is complete on
`feat/design-system`, pending the owner's merge decision.

| Item                                                                                                                                                                                                       | Status  | Notes                                                     |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | --------------------------------------------------------- |
| Tokens — primitive, semantic, component, surface; contrast policy gate                                                                                                                                     | ✅ done | spec §5–§6; `design-tokens:test`                          |
| Library core — `styles.css` consumer contract, `componentVariants`, lint gates, class order                                                                                                                | ✅ done | spec §6.5, §8.3, §11.2                                    |
| Brand facts (`packages/content`) and formatters (`packages/utils`)                                                                                                                                         | ✅ done | spec §7.3–§7.4                                            |
| 90 components in `packages/ui` — 30 atoms, 38 molecules, 15 organisms, 7 layouts                                                                                                                           | ✅ done | each with test (behaviour + axe) and card-parity stories  |
| Storybook — 13 groups, 33 foundation cards as docs pages, Contrast / Voice & content / Iconography / Utility classes / Section reveal pages, Website / App / Marketing kits, React Hook Form + Zod pattern | ✅ done | `apps/storybook`; local + static build (D16)              |
| Step 2 — the web app (the handoff's nine routes, rates, calculators, SEO, `next/font`, Netlify)                                                                                                            | ⏳ next | its own spec; carried items in the design system spec §16 |
```

And in the §15 roadmap table's Phase 1 row, change the "Contents" cell to `Design tokens populated + full component library — **step 1 done** (see Phase 1 progress); step 2 is the web app`.

- [ ] **Step 8: `CLAUDE.md` — current state (inside the project section only)**

Leave everything between `<!-- nx configuration start-->` and `<!-- nx configuration end-->` untouched. In `## Commands`, add after the `storybook:serve` line:

```bash
pnpm nx run storybook:test            # every story in headless Chromium, axe on
```

and replace the paragraph beginning "`nx affected` compares against `main` by default." with:

```md
`nx affected` compares against `main` by default, so on a feature branch it reports everything that
differs from `main`. CI instead uses `nrwl/nx-set-shas` to diff against the last successful run.
```

Replace section `## Current state` with:

````md
## Current state

**Phase 0 (foundation) is complete. Phase 1 step 1 — the design system — is complete** on
`feat/design-system` (branched from `dev`), pending the owner's merge decision: tokens with the
contrast policy, 90 components in `packages/ui`, and Storybook (`apps/storybook`) with the 13
design-system groups, 33 foundation cards as docs pages, the Website / App / Marketing reference
kits and the React Hook Form + Zod pattern. Spec:
`docs/superpowers/specs/2026-09-27-design-system-rewrite-design.md`. Step 2 (the web app) gets its
own spec.

The item-by-item record lives in **§15 of the architecture spec** ("Phase 0 progress", "Phase 1
progress"). Read it before planning the next step, and update it as items land — it is the only
place that state is tracked, so do not duplicate it here.

The working tree is authoritative if it and that table disagree. To establish ground truth:

```bash
pnpm nx format:check && pnpm nx sync:check   # confirm current state is green
pnpm nx show projects                         # 13 projects
git log --oneline                             # commit messages carry the reasoning
```

Facts that are easy to trip on, all verified against the working tree:

- **Branches:** `main` holds the live site; `dev` is the integration branch; the design system is on
  `feat/design-system`. Nothing merges without `/pre-merge`.
- **`origin` (GitHub) is configured.** CI (`.github/workflows/ci.yml`) runs on pushes to `main` and on
  pull requests; every workflow command is also verified locally before it lands.
- **Storybook:** `pnpm nx run storybook:serve` (6006), `storybook:build`, `storybook:test` (every story in
  headless Chromium, axe on) — local and static build only; public hosting waits for Phase 6.
- **Root `package.json` scripts:** `verify`, `verify:all`, `commit` (`cz`), `format`, `format:check`,
  `guard:founder` (scans `apps/{web,blog}/out` and `apps/storybook/storybook-static`), `prepare`.

**§18 records the traps already hit** during setup — Nx and pnpm defaults that contradict this
spec. Read it before running any generator; four of `create-nx-workspace`'s defaults had to be
undone.

Do not start a later phase before its dependencies (§15) are done.
````

Verify the facts before committing, and correct the text if any differ: `git branch --list main dev feat/design-system`, `git remote` (prints `origin`), `node -p "require('./package.json').scripts['guard:founder']"`.

- [ ] **Step 9: `apps/storybook/README.md`**

Replace the file with (its `## Visual tests (Chromatic)` section is the current file's, unchanged):

````md
# Storybook — the Pink Paprikaa Design System tab

`apps/storybook` is the design system's workbench and its documentation: the thirteen groups of the
design-system folder's "Design System tab", in the same order. Component stories live beside their
components in `packages/ui/src`; everything else lives here. Local and static build only — public
hosting waits for the Phase 6 cutover (spec D16).

Every Storybook CLI command must run from **this directory** (or be given `--config-dir`); there is
no `.storybook` at the workspace root, so `npx storybook <cmd>` from the root fails with
`SB_CORE-SERVER_0006 MainFileMissingError`. The Nx targets below already set `cwd`.

## Commands

| What                                     | Command                                                                        |
| ---------------------------------------- | ------------------------------------------------------------------------------ |
| Dev server (port 6006)                   | `pnpm nx run @pink-paprikaa-web/storybook:serve`                               |
| Static build (`storybook-static/`)       | `pnpm nx run @pink-paprikaa-web/storybook:build`                               |
| Serve the static build                   | `pnpm nx run @pink-paprikaa-web/storybook:serve-static`                        |
| Story tests (every story, once)          | `pnpm nx run @pink-paprikaa-web/storybook:test`                                |
| Story tests, watch mode                  | `pnpm nx run @pink-paprikaa-web/storybook:test -- --watch`                     |
| One story file                           | `pnpm nx run @pink-paprikaa-web/storybook:test -- forms.stories`               |
| Visual tests (Chromatic) — needs a token | `CHROMATIC_PROJECT_TOKEN=… pnpm nx run @pink-paprikaa-web/storybook:chromatic` |

Story tests run in headless Chromium; install it once with `pnpm exec playwright install chromium`.

## Story tests (`@storybook/addon-vitest`)

`vitest.config.mts` turns every story into a Vitest test: it renders the story, runs its `play`
function if it has one, then runs axe against the rendered DOM. The tests run in **headless
Chromium via Playwright**, not jsdom, because focus visibility and computed roles and names need
real layout and a resolved stylesheet. The library's own jsdom suite (`pnpm nx test ui`) is
separate; the two complement each other and neither config touches the other. The `test` target's
cache inputs include `^default`, so a change to any `packages/ui` component or story re-runs it.
Watch mode also starts a Storybook dev server (if none is on port 6006), so failure output can
deep-link to the failing story.

## Groups and where they live

| Group                                                         | Source                                                                                                       |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Introduction                                                  | `src/docs/introduction.mdx`                                                                                  |
| Brand · Colors · Type · Spacing · Layout · Motion · Marketing | `src/foundations/<group>/*.mdx`, with the group's specimens in `src/foundations/<group>/<group>.stories.tsx` |
| Atoms · Molecules · Organisms · Layouts                       | `packages/ui/src/<layer>/<name>/<name>.stories.tsx`                                                          |
| Molecules → Field → React Hook Form + Zod                     | `src/patterns/forms.stories.tsx`                                                                             |
| Website · App · Marketing → Kit                               | `src/kits/{website,app,marketing}/`                                                                          |

## Foundation pages

- **Values are read, never typed.** Every token value reaches a page through
  `src/docs-kit/catalogue.ts`, which reads `@pink-paprikaa-web/design-tokens/tokens.json`.
  `token()` and `tokensWithPrefix()` throw on a missing name, so a renamed token fails
  `storybook:test` on the specimen that asked for it.
- **Every live visual is a specimen story.** MDX holds prose and
  `<Canvas of={Specimens.X} meta={Specimens} sourceState="none" />`; the story sits in the group's
  hidden CSF file (`tags: ["!dev", "!autodocs"]` — out of the sidebar, still rendered and tested).
  Keep `className` out of MDX: ESLint cannot see it there.
- **The docs-kit is docs-only** — `Swatch`, `Swatches`, `TokenTable`, `TypeSpecimen`,
  `ContrastMatrix`, `SpacingScale`, `RadiusScale`, `ShadowLadder`, `MotionDemo`, `SpecimenRow`,
  `SpecimenTile`. `packages/ui` never imports it. Its contract tests are
  `src/docs-kit/docs-kit.stories.tsx`.
- Inline `style` here may reference only a token's custom property (`var(--…)` from the catalogue)
  or a value computed from `tokens.json` — never a literal.
- Every design-system guideline card maps to a page, named in a `{/* source: guidelines/<card>.card.html */}`
  comment. Check from the workspace root:

  ```bash
  diff <(ls "zip-files/Pink Paprikaa Design System/guidelines" | sed 's/\.card\.html$//' | sort) \
       <(grep -rhoE 'guidelines/[a-z0-9-]+\.card\.html' apps/storybook/src/foundations | sed -E 's#guidelines/##; s#\.card\.html##' | sort -u)
  ```

## Reference kits

- Composed only from `@pink-paprikaa-web/ui` public exports.
- Facts — year, address, hours, legal lines, contact, outlet — come from `@pink-paprikaa-web/content`;
  the only reviews are the four verified Google reviews, as the guests wrote them
  (`src/kits/fixtures.ts`). No invented testimonial, no rating the business has not been given,
  nothing non-veg — not even egg.
- Every kit page carries the "Reference kit — not production copy" notice and a 360px story whose
  test fails on any sideways scroll.

## Accessibility policy (spec §5)

`preview.tsx` sets `parameters.a11y.test = "error"`: an axe violation fails the story test. Every
rule runs except `color-contrast` — axe cannot scope an exception to the brand's single declared
pair (white on the brand pink, held at the AA-large 3:1 floor). Contrast is owned by the token
policy instead: `packages/design-tokens/contrast-pairs.json`, measured on every
`design-tokens:test` run by the same evaluator that renders **Colors → Contrast**. Storybook itself
disables `region` (stories are fragments, not pages).

## The founder guard covers this build

`pnpm guard:founder` scans `storybook-static` along with the apps' output. Two things would
otherwise leak the builder's home directory into the build, and `.storybook/main.ts` handles both:

- `relativeDocgenPaths()` rewrites react-docgen-typescript's absolute `filePath` to a
  workspace-relative one.
- `env` blanks `NODE_PATH`, which pnpm's bin shims export and Storybook bakes into the manager
  bundles.

Never narrow the guard to make a build pass.

## Visual tests (Chromatic)

The addon is registered and appears in the Storybook sidebar; the `chromatic` target builds
Storybook and hands the static output to the Chromatic CLI. Everything up to the network call is
wired. What is **not** wired, because it cannot be created from here, is the project token.

To take the first baseline:

1. Sign in at <https://www.chromatic.com/start> and create a project for this repository.
2. Copy the project token from the project's **Manage** screen.
3. Put it where the tooling looks for it. Either is fine; `.env` is gitignored:

   ```bash
   # apps/storybook/.env
   CHROMATIC_PROJECT_TOKEN=<token>
   ```

   …or export `CHROMATIC_PROJECT_TOKEN` in the shell / add it as a CI secret.

4. Run the first baseline from the workspace root:

   ```bash
   pnpm nx run @pink-paprikaa-web/storybook:chromatic
   ```

   The first build accepts every snapshot as the baseline; later runs diff against it.

The in-Storybook **Visual Tests** panel uses the same token — open Storybook, click the panel, and
paste the token when it asks. It writes a `chromatic.config.json` here containing the `projectId`
(not the token); that file is safe to commit once it exists. Nothing in this repo fabricates a
token or a project id.
````

- [ ] **Step 10: `packages/ui/README.md` — the consumer contract**

Replace the file with:

````md
# @pink-paprikaa-web/ui

The Pink Paprikaa design system: 90 React 19 components — atoms, molecules, organisms, layouts —
token-driven and server-first. How to author one: [`AUTHORING.md`](AUTHORING.md) (binding).

## Consume it

1. Depend on it: `pnpm add @pink-paprikaa-web/ui --workspace --filter <app>`.
2. Import one stylesheet, after Tailwind — nothing else. The library scans its own sources, so the
   app adds no `@source` for it:

   ```css
   @import "tailwindcss";
   @import "@pink-paprikaa-web/ui/styles.css";
   ```

3. Next.js: add `transpilePackages: ["@pink-paprikaa-web/ui"]` (the package ships TypeScript source).
4. Load the fonts in the app — Poppins 400–800 (+ 600 italic, with the Devanagari subset), DM Sans
   400/500/700 (+ 400 italic), Space Mono 400/700. The font tokens read `var(--font-poppins,
"Poppins")` and friends, so `next/font` variables and Fontsource both work.
5. Import components by name from the one barrel: `import { Button, Field, Input } from "@pink-paprikaa-web/ui";`

## The contract

- **Content arrives as props.** The system has no copy, prices or brand facts of its own —
  `@pink-paprikaa-web/content` holds those, and the app binds them.
- **Surfaces:** a flooded field sets `data-surface="brand" | "ink" | "soft" | "light"`; text, links,
  borders, focus and skins follow. Components that paint a field set it themselves.
- **Navigation:** `asChild` on Button, IconButton, Link, Card, LinkCard, ListRow and TabBar items;
  `linkAs` on components that render lists of links. Pass `next/link`.
- **Forms:** native-backed controls take `{...register("name")}`; value-based controls take
  `<Controller>`; `Field` renders the message. See Storybook → Molecules → Field → React Hook Form + Zod.
- **Client boundary:** only components that own state or effects are `"use client"`; everything else
  renders on the server and ships no JavaScript.

## Develop

| What                         | Command                                                                                   |
| ---------------------------- | ----------------------------------------------------------------------------------------- |
| Tests (jsdom + axe)          | `pnpm nx test @pink-paprikaa-web/ui`                                                      |
| Lint (token classes, layers) | `pnpm nx lint @pink-paprikaa-web/ui`                                                      |
| Stories                      | beside each component here; Storybook is `apps/storybook` — `pnpm nx run storybook:serve` |
| Regenerate the logo artwork  | `pnpm nx run @pink-paprikaa-web/ui:brand-artwork`                                         |

`tailwind.css` at this package's root is not bundled by anything; it exists so ESLint's and
Prettier's Tailwind integrations have a stylesheet to resolve.
````

- [ ] **Step 11: `docs/README.md` and the spec's status line**

In `docs/README.md`'s spec table, set the design-system row's Status cell to `Implemented 2026-09-27 — pending owner merge` and its Scope cell to `**Step 1 of the build** — tokens, 90 components, Storybook (foundations, kits, RHF pattern); sources of truth, conflicts resolved, a11y balance policy`.

In `docs/superpowers/specs/2026-09-27-design-system-rewrite-design.md`, replace the line `**Status:** Draft — awaiting owner review` with `**Status:** Implemented on \`feat/design-system\` (Plans 1–5, 2026-09-27) — awaiting the owner's merge decision`.

- [ ] **Step 12: Gate and commit**

```bash
grep -rniE 'rishav|pandey|anand' CLAUDE.md docs/engineering apps/storybook/README.md packages/ui/README.md docs/README.md; echo "founder grep exit $? (1 = clean)"
grep -n "nx configuration" CLAUDE.md
pnpm nx format:check && pnpm nx sync:check
```

Expected: founder grep exit `1`; both Nx markers still present on their original lines; format and sync green.

```bash
git add CLAUDE.md docs apps/storybook/README.md packages/ui/README.md
git commit -m "docs: record the finished design system

Handbook 02/03/04/05/06/09 at their final state (layers and lib, the real
Button as the canonical component, the prop translation table, the gate
registry, Plan 5 decisions and the closed drift items), the architecture
spec's section 8 amendment and Phase 1 progress, CLAUDE.md's current state,
the Storybook and ui READMEs, and the spec marked implemented.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

