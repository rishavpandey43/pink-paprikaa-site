# Task 9 report: the authoring contract and the Plan 1 records

**Status:** DONE_WITH_CONCERNS (docs only; no code changed)
**Commit:** `aab7676` docs: the design system authoring contract and plan 1 records (base `99d3050`)
**Files:** 12 changed (+848 / −258), all within the allowed paths.

## Docs changed

| File | Change |
| --- | --- |
| `packages/ui/AUTHORING.md` (new) | The binding contract, in the brief's 12-step order. Sources (the four DS files + spec §9 + contracts), file set and layers with the atom import rule, the canonical shape from the real `icon.tsx`, the §8.2 translation table verbatim, tokens first, no arbitrary values / named utilities / brand mark, surfaces, server-first, the a11y checklist, tests, stories, export and gates. It also carries every rule in controller item 2. |
| `packages/ui/README.md` | Rewritten. Covers the consumer contract (two CSS imports; `transpilePackages` in Next apps, not wired yet) and points to AUTHORING.md. Commands include `ui:brand-artwork`. |
| `apps/storybook/README.md` | Rewritten. Replaced the stale "200 failing" section with the contrast policy: the token gate with its single brand-fill exception, axe `color-contrast` off because axe cannot scope a per-pair exception, and every other axe rule failing the story. Also covers commands (serve/build/serve-static/test/chromatic), the 13 sidebar groups plus Introduction, the consumer path, and how the founder guard covers the build. |
| `.claude/commands/new-component.md` | `expectNoA11yViolations` replaces `axe(...)`, and `componentVariants` replaces `tv()`. Adds reading the four DS sources, tokens first (namespaces, variant lists, contrast pairs, light restore) and card-parity stories. The dead reference to a "03 §1 layer table" now points to AUTHORING §2. |
| `docs/engineering/02-architecture.md` §2 | Layers are `atoms → molecules → organisms → layouts` (D14), with the atom rule. `src/lib/` holds the internals (variant builder, artwork, reveal observer). Links AUTHORING §2. |
| `docs/engineering/03-patterns.md` §1 | Replaced the banned `h-(--button-h-sm)` excerpt with the real Icon excerpt, and notes that Plan 5 swaps in Button. The rules beneath are rewritten per R23: token-backed named utilities only, `componentVariants` never bare `tv`, `data-surface`, Slot `asChild` plus the class rule, `linkAs`, the render-prop Field, native-first, server-first, R13, R15. |
| `docs/engineering/05-tooling-and-config.md` | Registry additions: `contrast-pairs.json` (adding pairs is free; lowering `min` or adding an exception is a decision-log event), `.prettierrc` plugin keys (actual stylesheet `./packages/ui/tailwind.css`), `build-brand-artwork.mjs` and `packages/ui/tailwind.css`. The next.config row now names the real files (`web` .mjs, `blog` .js). Commands add `storybook:test` and `ui:brand-artwork`. |
| `docs/engineering/06-quality-gates.md` §2 | Registry rebuilt. It adds token-only classes (incl. `no-arbitrary-shorthand`), atomic layering, naming at error, the contrast policy, token integrity, variant-builder parity, the no-literal-colour CSS spec, and story tests with their R24 cache inputs. The founder guard now covers `storybook-static`, class order is Prettier's, and `vitest-axe` is fixed to axe-core via `expectNoA11yViolations`. A "Known gaps" list is added (see concerns 1 and 2). |
| `docs/engineering/08-recipes.md` §1, §3 | Recipe 1 now follows AUTHORING, and the stale `axe(...)` call is gone. Recipe 3 covers namespaces, variant lists and contrast pairs. (This file was outside the brief's list; the edit keeps `docs/` honest.) |
| `docs/engineering/01-principles.md` | One word: `tv()` → `componentVariants()`. |
| `docs/engineering/09-decision-log.md` | Adds D1–D18, one line each with a spec link. Adds rulings R13/R15/R19/R21/R23/R25 with reasons, labelled as distinct from the reference `R-nn` rows. P-10 records component tokens in Tailwind namespaces with motion/z as named utilities; P-11 records the hand-listed twMerge lists asserted against the build. P-08 is marked done. The prettier-plugin and naming-promotion drift items are closed. Two new drift items are opened (concerns 3 and 4). |
| `docs/superpowers/specs/2026-09-27-design-system-rewrite-design.md` | 14 in-place amendments, each marked "Amended 2026-09-27 (implementation)". §6.2, §6.4 and §8.3 per the brief. §6.3: durations, z and press/lift are `@utility` classes, and the border widths are `border-default`/`border-strong` (R7). §5.2/§5.3: mint-strong `#186C51`, turmeric-strong `#8A5C00`, ratios re-measured (R8). §5.4 and §6.1: `contrast-pairs.json` is at the package root and uses groups (R9). §7.1: `lib/brand-artwork.ts`, pink-only sources, precision 2. §7.2: one shared CSS mask with no JS data-URI (R19/R25). §8.1: the `(--x)` sketch is superseded, plus R13 and the Slot class rule. §9.1: Logo is sized by classes. D10: Lucide 0.408 glyphs (ISC), not Simple Icons. D18: the real `tailwindStylesheet`. |

## Verification notes (every claim read or run against the tree)

- **Shapes and paths:** read `icon.tsx`, `logo.tsx`, `brand-glyphs.tsx`, `component-variants.ts` and its spec, `styles.css`, `brand-artwork.*`, `reveal-observer.tsx`, `vitest.setup.ts`, the eslint `atomic-layering.js`/`react.js`/`rules/*`, `.prettierrc`, `sd.config.mjs`, the token specs, `contrast-pairs.json`, and the storybook `main.ts`/`preview.tsx`/`vitest.config.mts`/`package.json`. The four-file DS source layout exists at `zip-files/Pink Paprikaa Design System/components/<tier>/`.
- **Radix Slot:** `radix-ui` exports `Slot.{Root,Slot,Slottable}`. `@radix-ui/react-slot` 1.3.3 `Slottable` takes a `child` + render-fn children, and joins `className` with a space (`[slot, child].filter(Boolean).join(" ")`). No tailwind-merge.
- **tailwind-merge:** probed with the installed package. An unlisted colour stays (`bg-button-primary-bg`). An **unlisted** text size is dropped beside a colour (`text-button-md text-button-primary-fg` → only the colour survives). Listing it keeps both.
- **Tailwind border width:** v4 resolves `border-default` through the `--border-width` theme key (read in `tailwindcss/dist/lib.js`).
- **Typography alias:** `sd.config.mjs` `declarations()` emits only `--x: var(--y)` for an alias, with no `--line-height` sub-properties. So a component typography token must be a full composite (documented).
- **Lint claims (probe files created in `src/atoms/zzprobe/`, then deleted, tree clean):**
  - `text-sm`, `shadow-md` and `bg-red-500` fail `no-custom-classname`.
  - `h-[13px]` fails `no-arbitrary-value`, and `w-(--x)` fails `no-arbitrary-shorthand`.
  - Inside `compoundVariants`/`compoundSlots`, a `class:` key **is** checked (`h-[13px]`, `bg-red-500`, `w-[7px]`, `rounded-lgg` all reported). A `className:` key is **not**: 0 errors.
  - `no-arbitrary-shorthand` passes `bg-pink-500/(--alpha)` and `max-(--bp):flex` (Linter API).
- **Storybook docgen:** the built `icon.stories` docgen lists `icon,label,size`, and the Logo docgen lists `title,isDecorative,variant,tone`. So `VariantProps` props do reach the props table.
- **Contrast values:** measured with `packages/design-tokens/src/contrast.ts` on `dist/tokens.json`. `#186C51` is 6.36 on white and 5.57 on mint-soft; `#8A5C00` is 5.81 on white and 5.19 on turmeric-soft. The DS components use `#186C51` 6× and `#8A5C00` 5×, and the handoff values 0×.
- **Commands run:**
  - `pnpm nx run ui:brand-artwork` regenerates byte-identical output after Prettier. Raw output is unformatted, so the Prettier step is documented.
  - `pnpm nx run storybook:test -- icon.stories` runs 1 file with 5 tests passing.
  - Short project names (`ui`, `storybook`, `design-tokens`) resolve in `nx show project`.
  - `.env` and `storybook-static` are gitignored.
- **Founder/brand:** no founder name and no one-`a` misspelling in any added line.

## Final gate (cold)

```
pnpm nx format:check && pnpm nx sync:check \
  && pnpm nx run-many -t typecheck lint test build --skip-nx-cache --outputStyle=static && pnpm guard:founder

[@nx/js:typescript-sync]: All files are up to date.
 NX   Successfully ran targets typecheck, lint, test, build for 12 projects and 1 task they depend on
  Run duration:      26.8s
  Cache:             Skipped (--skip-nx-cache)
run-many exit: 0
> node scripts/check-founder-names.mjs apps/web/out apps/blog/out apps/storybook/storybook-static
Founder-name guard: clean.
guard exit: 0
```

Suites: design-tokens 135, ui 84, content 20, utils 15, storybook 10 (2 files, Chromium), seo 1, image-pipeline 1. All pass. `format:check` was re-run green after the last doc edit.

## Self-review

- Brief steps 1–3 are all done. Controller items 1–6 are all addressed. Item 5's compoundVariants wording was corrected by probe (concern 1).
- AUTHORING marks as illustrative the class names that do not exist yet (`h-button-h-md`, `text-button-md`). Future-plan internals (`lib/link-as.ts`, Field, `lib/field-control.tsx`) are attributed to their owning plan, not claimed as present.
- The 03 §1 excerpt is faithful to `icon.tsx`. `STROKE_WIDTH` and `IconComponent` are omitted, and the doc says so.
- Scope: I did not edit `packages/design-tokens/README.md` or `CLAUDE.md`, both outside the allowed paths. Their staleness is logged instead.

## Concerns

1. **Controller item 5 was partly wrong, and the correction is recorded.** The Task 6 reviewer's "plugin does not check classes inside compoundVariants/compoundSlots" does not match how 4.2.0 behaves. The plugin lists those keys in `ignoredKeys`, which means inside them it checks only the `class` property. So `class:` is checked, but `className:` (also accepted by tailwind-variants) goes unchecked. 06 and AUTHORING §6 record the real gap and the rule "write `class:`". Worth a lint follow-up that bans `className` inside compound entries.
2. **More `no-arbitrary-shorthand` gaps**, recorded in 06: it misses `/(--alpha)` opacity modifiers and `max-(--bp):` variants (confirmed with the Linter API).
3. **R13 isn't applied yet in the Plan 1 components.** `Icon`, `Logo` and `RevealObserver` still declare `?: T`. The docs state this, and a drift item is open (owner: Plan 2a / next touch).
4. **`packages/design-tokens/README.md` is stale.** It says `component/` is empty and that `theme.css` holds only primitive and semantic tokens. I couldn't edit it (outside the allowed paths), so a drift item is logged. `CLAUDE.md`'s current-state section (spec §12) is also stale and out of scope here.
5. **Plan 2a's rationale for spelling variant unions out doesn't hold.** Plan 2a says "never extend `VariantProps` — docgen filters it out", but the current build's docgen does include `VariantProps` props (Icon lists `size`; Logo lists `variant`, `tone`). AUTHORING allows either form. The controller may want to relax that plan line.
6. **Artwork regeneration needs a Prettier pass.** The generator writes unformatted output, so `format:check` fails until Prettier runs; the step is now documented. A one-line fix in the generator (format on write) would remove the step.

## Fix round 1

**Status:** DONE. **Commit:** `0c3724e` docs: correct the plan 1 records from task 9 review (base `aab7676`). Docs only, 8 files.

| # | Finding | Change (file:line) |
| --- | --- | --- |
| 1 | next.config names swapped | `docs/engineering/05-tooling-and-config.md:33`: the row now reads `apps/web/next.config.js`, `apps/blog/next.config.mjs` (`ls` confirmed), with basePath marked "(blog only)" because `web` sets none. The original report's "web .mjs, blog .js" line was wrong. |
| 2 | Aliased component colour pitfall | `packages/ui/AUTHORING.md:212-218`: a new bullet. An alias compiles to `--color-<name>: var(--color-text-link)` on `:root` (Tailwind emits `:root,:host`, confirmed in the storybook build CSS), so it resolves there and does not follow surfaces. Override the component token in `surface/{brand,ink,soft}.json`, restore it in `light.json`, and note that the contrast gate catches a miss only if the pair is listed. |
| 3 | "inset ring" wrong | `AUTHORING.md:286` now says "the 3px focus ring". Spec §5.5 `…design.md:220-222` is amended in place and dated: `shadow-focus-ring` = `0 0 0 3px {color.pink.200}`, an outer spread (`tokens/semantic/shadow.json`), was "the inset focus ring". |
| 4 | Atom LAW stricter than the lint | `AUTHORING.md:39-45`: LAW is what the lint bans (atoms other than Icon, higher layers and the barrel, roundabout paths included). Everything else passes, including `../../assets/*` and `../../styles.css`. The narrower list is labelled CONVENTION. Probed with a temp atom file (then deleted): `../../styles.css`, `../../assets/brand/symbol-pink.svg`, `../../lib/*`, `../../../vitest.setup` and `../icon/icon` pass, while `../logo/logo`, `../../index`, `../../atoms/logo/logo` and `../../molecules/x` fail. The same over-claim is fixed at `docs/engineering/02-architecture.md:26-28` and `06-quality-gates.md:35`. |
| 5 | Slot wording | `AUTHORING.md:121-123`: Slot merges every prop onto the child (read `mergeProps` in `@radix-ui/react-slot` 1.3.3: `{ ...slotProps, ...overrideProps }`, handlers chained, `style`/`className` combined). So when `asChild` is set, do not pass `type`/`disabled`. |
| 6 | Typography `$type` | `AUTHORING.md:182-201`: the composite now requires `"$type": "typography"` (on the token or its group, as `primitive/typography.json` does), explains that `declarations()` branches on it, and adds a JSON example with a `{font-weight.semibold}` reference (a key that exists). |
| 7 | Contract `?: T` | `AUTHORING.md:107-108`: where the contracts file or a DS `.d.ts` writes `label?: string`, implement `label?: string \| undefined` (R13). |
| 8 | Spec §11.2 | `…design.md:788`: a new row, `pink-paprikaa/no-arbitrary-shorthand: error` (R23; _Added 2026-09-27 (implementation)_), where = react preset (ui, web, blog and storybook all compose it). `…design.md:787`: `no-custom-classname` now runs against `packages/ui/tailwind.css` (the `cssConfigPath` in `packages/ui/eslint.config.mjs`), marked amended, was `src/styles.css`. |
| 9 | Spec §6.1 stale | `…design.md:236-238`: the tree lists the real files (primitive: color, typography, space, shape, elevation, motion, breakpoint, canvas, pattern, z-index; semantic: color groups surface/text/border/brand/status/heat/focus, plus shadow). `…design.md:253-263`: a dated amendment records the old names, the real file contents (from each file's top-level keys) and the literal rule. A hex exists only in `primitive/color.json`. A px literal also appears in component files (`icon.json` 14px…) and in the focus-ring composites (`semantic/shadow.json`, `surface/light.json`), as grepped. |
| 10 | Known gaps unowned | `docs/engineering/09-decision-log.md:103`: a drift-ledger row for the lint gaps (compound `className:` and the `/(--alpha)` and `max-(--bp):` misses), Open, owner "Plan 1 final fix wave", with the fix named. `06-quality-gates.md:52` points the Known gaps at the ledger. |
| 11 | Rule count and recipe | `docs/engineering/03-patterns.md:64-68`: "Four rules", adding `pink-paprikaa/no-raw-hex` to match AUTHORING §6, which lists four. `docs/engineering/08-recipes.md:53-55`: recipe 3 adds the `light.json` restore step (`theme.spec.ts` fails until it's there). |

**Gates:** `pnpm nx format:check` exit 0; `pnpm guard:founder` clean, exit 0. The diff has no literal hex, no founder name and no one-`a` spelling.

**Concern:** `docs/superpowers/plans/2026-09-27-ds-05-storybook-kits-docs.md:3750,4073` still says "fields use the inset ring" in Plan 5's foundation-page copy. It is outside this fix's scope, so I left it; the owner should correct it before Plan 5 runs.
