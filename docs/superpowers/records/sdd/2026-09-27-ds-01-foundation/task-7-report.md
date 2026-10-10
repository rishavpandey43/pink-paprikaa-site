# Task 7 report: brand artwork, Icon and Logo atoms

**Status:** DONE. Commit `c2b187a` on `feat/design-system`: `feat(ui): brand artwork, Icon and Logo atoms` (27 files, +778 / −2). The commit hooks (lint-staged eslint + prettier, commitlint) passed. `--no-verify` was not used.

## What was built

- **Step 1.** Copied the nine design-system SVGs to `packages/ui/src/assets/brand/`.
- **Step 2.** Added `tokens/component/icon.json` (`icon-xs…xl`: 14/16/20/24/32px) and `tokens/component/logo.json` (`logo-lockup` 240, `logo-wordmark` 180, `logo-symbol` 40), using the brief's values verbatim. Rebuilt the tokens, and `theme.css` now emits `--spacing-icon-*` and `--spacing-logo-*`. Added the eight names to `SPACING` in `component-variants.ts`. Before the names were added, the variant spec failed, because the token build had them and the `SPACING` list did not: `expected Set{ 'gutter', … } to deeply equal Set{ 'icon-xs', … }`. After adding them it passes (36/36).
- **Step 3.** Added `scripts/build-brand-artwork.mjs` and the `"brand-artwork"` script in `package.json`, which Nx infers as a target. Generated `src/lib/brand-artwork.ts` and ran Prettier on it.
- **Step 3b (R19).** The same generator writes `src/lib/brand-artwork.css`. That file holds `--pp-symbol-mask` in `@layer base :root` and `@utility mask-symbol`. `styles.css` imports it directly after the two token imports. The library-stylesheet spec (no literal colour in any CSS file) still passes on the new file.
- **Step 4–5.** Added `atoms/icon/{brand-glyphs.tsx, icon.tsx, icon.test.tsx}`.
- **Step 6–7.** Added `atoms/logo/{logo.tsx, logo.test.tsx}` and kept the `dangerouslySetInnerHTML` safety comment in the Logo's JSDoc. Exported everything from `src/index.ts` exactly as the brief lists it.
- **Step 8.** Added `icon.stories.tsx` and `logo.stories.tsx`. Removed `passWithNoTests` from `apps/storybook/vitest.config.mts`.

### Generator output

```
brand-artwork.ts + brand-artwork.css written: lockup, wordmark, symbol
```

The generated `ARTWORK` has three marks:

| Mark     | viewBox                  | Markup size (raw / gzip) |
| -------- | ------------------------ | ------------------------ |
| lockup   | `9.38 70.13 361.88 190.13` | 59.3 KB / 23.4 KB        |
| wordmark | `4.13 94.13 368.25 193.88` | 51.8 KB / 21.2 KB        |
| symbol   | `12.75 8.63 357.75 357.75` | 4.7 KB / 2.2 KB          |

- The lockup has one `clipPath`. SVGO renames it to `a`, so the compiled markup contains `id="__ID__a"` and one `url(#__ID__a)` reference.
- The wordmark and symbol have no ids.
- The root `<svg>` carries no `fill`. Every visible path had its own fill (10 fills over 11 paths in the lockup; the 11th path is the clip rectangle), so recolouring to `currentColor` is complete.
- `brand-artwork.css` is 5.9 KB (2.7 KB gzip).

## TDD evidence (RED, then GREEN)

| Spec                   | RED                                                                             | GREEN                                                                             |
| ---------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `brand-artwork.spec.ts` | `Error: Failed to resolve import "./brand-artwork" from "src/lib/brand-artwork.spec.ts"` | 7/7 after the generator ran (run together with `styles.spec`: 9/9) |
| `icon.test.tsx`        | `Error: Failed to resolve import "./brand-glyphs" from "src/atoms/icon/icon.test.tsx"` | 11/11                                                                             |
| `logo.test.tsx`        | `Error: Failed to resolve import "./logo" from "src/atoms/logo/logo.test.tsx"`   | 9/9                                                                               |

- **Two logos on one page.** This is the review focus Task 7 owns. The test renders two lockups, checks that every `id` is unique, and checks that every `url(#…)` points at an id that exists. The lockup really does contain a clip-path reference, so the test is not passing vacuously.
- **R10.** axe's `region` rule did **not** fire, so `expectNoA11yViolations` was left unchanged.
- **Story a11y is enforced.** As a probe, I temporarily added a Logo story with `title=""`. It failed with `Expected the HTML found at $('.inline-block') to have no violations`. I then removed it; it is not in the commit.

## Stories compared with the card rows

**Icon** (`Icon.card.html` has four rows):

| Card row     | Story                                                                                                                                  |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| —            | `Playground`. The `icon` prop is a select control mapped to real glyphs (a function arg is not editable otherwise).                   |
| size         | `Sizes`: `utensils` at xs–xl, each labelled `size="…"`.                                                                                  |
| currentColor | `CurrentColor`: `flame` in pink-500, ink-900, mint, turmeric and tandoor. **Added for parity.**                                         |
| common set   | `Glyphs`: the card's 12 glyphs, plus MessageCircle, Store and the three brand glyphs.                                                   |
| on dark      | `OnInk`: 4 glyphs on a `data-surface="ink"` panel. **Added for parity.**                                                                |

**Logo** (`Logo.card.html` has nine rows):

| Card row                                   | Story                                                                                                     |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| —                                          | `Playground`                                                                                              |
| lockup · wordmark · symbol                 | `Variants`: the three marks side by side on white, each labelled `variant="…"`.                             |
| lockup white / on ink, wordmark white, symbol white, `tone="badge"` ×3 | `Tones`: pink on page; white (lockup, wordmark, symbol) on a brand panel; white on an ink panel; badge for all three variants. |
| min size                                   | `ClearSpace`: the default 240px lockup beside `className="w-50"` (200px).                                 |

**Not reproduced:** the card's symbol size ramp (48/32/22) and the two wordmark heights. They are sizing demos rather than props, and 22px would need a fractional spacing class.

**Docs descriptions** come from `Icon.prompt.md`, `Logo.prompt.md` and readme §4 plus the Assets section: lockup by default, wordmark only under ~120px, 200/140px minimums, clear space equal to the height of the "P", never recolour or add effects, and never place the pink logo on anything darker than pink-100.

**Visual check.** I screenshotted the built Storybook (Tones, Variants, Glyphs) and compared the badges with the original `*-badge.svg` files. Pink, white-on-brand, white-on-ink and all three badge plates render correctly. The badge insets from the brief (76/76/60) are visually equivalent to the source badges.

## Gate (commands from the brief, all with `--skip-nx-cache`)

```
$ pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache
  ✔︎ dist/theme.css  ✔︎ dist/surfaces.css  ✔︎ dist/tokens.json
  Run duration: 1.8s

$ pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui --skip-nx-cache --outputStyle=static
 ✓ src/styles.spec.ts (2 tests)
 ✓ src/lib/component-variants.spec.ts (36 tests)
 ✓ src/lib/brand-artwork.spec.ts (7 tests)
 ✓ src/lib/reveal-observer.test.tsx (10 tests)
 ✓ src/atoms/icon/icon.test.tsx (11 tests)
 ✓ src/atoms/logo/logo.test.tsx (9 tests)
 Test Files  6 passed (6)
      Tests  75 passed (75)
 NX  Successfully ran targets typecheck, lint, test for project @pink-paprikaa-web/ui and 3 tasks it depends on

$ pnpm nx run @pink-paprikaa-web/storybook:build --skip-nx-cache
 NX  Successfully ran target build for project @pink-paprikaa-web/storybook and 2 tasks it depends on

$ pnpm nx test @pink-paprikaa-web/storybook --skip-nx-cache
 ✓ |storybook (chromium)| ../../packages/ui/src/atoms/icon/icon.stories.tsx (5 tests)
 ✓ |storybook (chromium)| ../../packages/ui/src/atoms/logo/logo.stories.tsx (4 tests)
 Test Files  2 passed (2)
      Tests  9 passed (9)
 NX  Successfully ran target test for project @pink-paprikaa-web/storybook and 1 task it depends on
```

Also green: `pnpm nx format:check` (exit 0) and `pnpm nx sync:check` (all files up to date). `apps/blog/next-env.d.ts` was not rewritten by any run, so nothing needed reverting. Chromium was already installed.

## Files changed

- **Created**
  - `packages/design-tokens/tokens/component/{icon,logo}.json`
  - `packages/ui/scripts/build-brand-artwork.mjs`
  - `packages/ui/src/assets/brand/*.svg` (9 files)
  - `packages/ui/src/lib/{brand-artwork.ts, brand-artwork.css, brand-artwork.spec.ts}`
  - `packages/ui/src/atoms/icon/{icon.tsx, brand-glyphs.tsx, icon.test.tsx, icon.stories.tsx}`
  - `packages/ui/src/atoms/logo/{logo.tsx, logo.test.tsx, logo.stories.tsx}`
- **Modified**
  - `packages/ui/package.json` (script)
  - `packages/ui/src/index.ts`
  - `packages/ui/src/lib/component-variants.ts` (8 spacing names)
  - `packages/ui/src/styles.css` (one `@import`)
  - `apps/storybook/vitest.config.mts` (removed `passWithNoTests`)

## Where I departed from the brief

All departures are behaviour-preserving.

1. **`IconComponent` is written differently.** The brief's type literal declares `"aria-hidden"?: boolean`. The `@typescript-eslint/naming-convention` LAW rejects that key: `Type Property name 'aria-hidden' must match one of the following formats: camelCase, snake_case` (the error is reproduced). The type is now:

   ```ts
   ComponentType<Pick<SVGProps<SVGSVGElement>, "strokeWidth" | "aria-hidden" | "focusable"> & { size?: number | string }>
   ```

   These are React's own types, so the hyphenated key is never declared. `LucideIcon` (`ForwardRefExoticComponent<Omit<LucideProps,'ref'> & RefAttributes>`, checked in `packages/ui/node_modules/lucide-react/dist/lucide-react.d.ts`) and the brand glyphs both typecheck against it with no casts.

2. **The generator computes the data URI once.** The brief's CSS template used `JSON.parse(JSON.stringify(x))`, which returns `x` unchanged. The generator now builds `symbolDataUri` once and reuses it for both the TS constant and the CSS custom property, so the output is identical.

3. **No double space in the white symbol.** When `fill="currentColor"` is stripped from the white symbol, the generator also removes the leading space (`' fill="currentColor"'`), so the data URI has no `%20%20`.

4. **The spec builds paths with `join(import.meta.dirname, …)`** for both file reads, per R15.

5. **Stories go beyond the brief's list.** `CurrentColor`, `OnInk`, the expanded `Glyphs` set and the `icon` select control were added for card parity (see the story tables above).

## Self-review

- **Icon**
  - It is decorative by default (`aria-hidden`). With a `label` it becomes `role="img"` with an `aria-label`.
  - The inner glyph is always `aria-hidden` and `focusable="false"`.
  - Stroke width follows the size rule (2 at ≤16px, 1.75 above).
  - It uses token classes only.
- **Logo**
  - Each instance's ids come from `useId`, stripped of non-word characters.
  - `isDecorative` hides it from assistive tech.
  - A consumer's `className` wins over the default width: `w-50` replaces `w-logo-lockup`, which tailwind-merge knows because the names are in `SPACING`.
  - The badge is a nested `<svg>` on a `fill-pink-500` plate.
  - It needs no `"use client"`, so it works as a server component.
- **Lint.** All token/LAW rules pass for these files: no-arbitrary-value, no-custom-classname, no-arbitrary-shorthand, no-raw-hex, naming-convention and atomic layering. Atoms import only `../../lib/*` and packages; the tests import `../../../vitest.setup`.
- **Founder guard.** No founder names appear in the source I wrote.

## Concerns (for the controller; none of them block this task)

1. **Nx can replay a stale pass for Storybook tests.** The inferred inputs of `@pink-paprikaa-web/storybook:test` are `default` plus `^production`. `production` excludes `**/*.stories.*`, so changing a story in `packages/ui` does not change the test task's hash. My a11y probe caused exactly this: Nx reported the task as flaky because the same hash had passed and then failed. `build-storybook` already overrides its inputs to `^default`; `test` needs the same override in `apps/storybook/package.json` → `nx.targets.test.inputs`. I did not change it because it is outside the brief. The gate was unaffected because it used `--skip-nx-cache`.
2. **The built Storybook contains absolute local paths.** react-docgen-typescript embeds `filePath: "/Users/<user>/Professional/…"` into `storybook-static/assets/{icon,logo}.stories-*.js`, and that path contains the machine username. A CI build would contain `/home/runner/…` instead. But if anyone publishes Chromatic from a laptop, the username ships with it. `guard:founder` only scans `apps/web/out` and `apps/blog/out`, so it would not catch this. It is worth adding `storybook-static` to the guard, or stripping `filePath`, before any Chromatic publish.
3. **The inline logo is heavy.** The lockup is about 59 KB raw (23 KB gzip) per instance. A header plus a footer lockup adds roughly 118 KB of HTML (about 46 KB gzip, because the two copies are further apart than deflate's 32 KB window). Setting SVGO's `floatPrecision` to 2, or referencing one shared `<symbol>`/`<use>`, would cut this. This matters for the Lighthouse byte budget when the web shell lands.
4. **The source SVGs carry C2PA manifests.** The committed `src/assets/brand/*.svg` include the vendor's C2PA metadata (the decoded strings name "Claude" / "Anthropic Files"; they contain no founder names). SVGO strips it from the compiled artwork, so nothing ships, but the source files keep it.
5. **The readme's "egg-containing bakes" line is stale.** Readme §4 still mentions a turmeric dot for egg-containing bakes, which contradicts the owner's 2026-09-27 ruling that the menu is pure veg with no egg. It does not affect this task; flagging it for DietMark later.

---

# Fix round 1 (ruling R25)

**Status:** DONE, with one departure from the ruling on F1. Commit `d25519d perf(ui): lighter logo artwork and a stricter artwork generator` (7 files, `packages/ui` only). Hooks and commitlint passed; `--no-verify` was not used.

## F1: I used precision 2, not 1

**The param shape** (checked in the installed svgo 4.0.2 source):

- `{ name: "preset-default", params: { floatPrecision } }` sets a global override that every plugin in the preset reads (`lib/svgo/plugins.js` `createPreset` → `globalOverrides.floatPrecision`).
- That override also rounds the viewBox, which breaks the viewBox-equality spec: at precision 1 the lockup's viewBox becomes `9.4 70.1 361.9 190.1`.
- The generator therefore also passes `overrides: { cleanupNumericValues: { floatPrecision: 3 } }`. Numeric attributes (the viewBox and the clip rect) keep 3 places, so every viewBox is byte-identical to its source.
- `transformPrecision` is not needed. The only transform left after optimisation is the lockup's integer `translate(165 230)`, and nothing is scaled.

**Why precision 1 was rejected.** I rendered the source SVG and each svgo variant at 480px wide on a 4× screen, then diffed each against the source render. A pixel counts as an outlier when it falls outside what its before-neighbourhood covers, with a ±8 tolerance. The 3×3 neighbourhood allows a 1-device-pixel edge shift; the 5×5 allows 2.

| mark     | precision | raw     | gzip   | px Δ>32 | outside 1 device px | outside 2 device px |
| -------- | --------- | ------- | ------ | ------- | ------------------- | ------------------- |
| lockup   | 3 (old)   | 59,301  | 23,486 | 257     | 13                  | 4                   |
| lockup   | **2**     | 37,542  | 14,826 | 1,792   | 127                 | 31                  |
| lockup   | 1         | 19,108  | 7,304  | 12,671  | 380                 | 238                 |
| wordmark | 3 (old)   | 51,829  | 21,293 | 74      | 10                  | 4                   |
| wordmark | **2**     | 32,211  | 13,139 | 1,730   | 169                 | 89                  |
| wordmark | 1         | 15,515  | 6,154  | 14,266  | 423                 | 254                 |
| symbol   | **2**     | 3,611   | 1,674  | 431     | 0                   | 0                   |
| symbol   | 1         | 2,550   | 1,180  | 6,195   | 12                  | 0                   |

(Sizes in this table are for the whole optimised file; the committed-markup sizes are in the next table.)

- At precision 1, the outliers cluster on the **hairline lotus ring around the "i" dots** (see `task-7-fix1-evidence/idot-source-vs-fp2-vs-fp1.png`). The ring's petals come out uneven, one petal opens a gap, and the left side gets heavier.
- The cause is coordinate rounding itself: turning off svgo's curve simplifications (`straightCurves`, `makeArcs`, `curveSmoothShorthands`) left it just as bad.
- The design system says the marks scale up to a 1080px canvas, where this distortion would be plain to see.
- At precision 2 the same crop cannot be told apart from the source.

**Decision needed from you:** switching to precision 1 is a single-value change in `scripts/build-brand-artwork.mjs` (`floatPrecision: 2` → `1`) if you accept that ornament change for about 7.5 KB less gzip per lockup.

### Committed markup sizes (bytes, before → after)

| mark                 | raw before | raw after | gzip before | gzip after |
| -------------------- | ---------- | --------- | ----------- | ---------- |
| lockup               | 59,282     | 37,523    | 23,443      | 14,763     |
| wordmark             | 51,793     | 32,175    | 21,218      | 13,071     |
| symbol               | 4,742      | 3,555     | 2,201       | 1,612      |
| `brand-artwork.css`  | 5,952      | 4,737     | 2,738       | 2,100      |
| `brand-artwork.ts`   | 122,423    | 74,044    | —           | —          |

That is 37% less per inline lockup: about 8.7 KB less gzip per instance, and about 17 KB less once the RSC payload duplicates it.

### Visual diff in the Storybook browser

Before is `c2b187a` (precision 3) and after is `d25519d` (precision 2), both from `storybook-static` served locally. Playwright Chromium captured element screenshots at DSF 4. The "-480" rows are the Playground story with the logo's width set inline to 480px, larger than any story size. The `tones-*` and `variants-*` rows are every logo in those two stories at their own story size.

```
image                        size    max Δ  px Δ>0  px Δ>32  px Δ>64  % Δ>32 | outside 1-device-px tolerance
badge-lockup-480-0.png    1920x1920    96   14429      673       25  0.018% | 112
badge-symbol-480-0.png    1920x1920    80    3687      149        1  0.004% |   0
badge-wordmark-480-0.png  1920x1920    91   12385      926       11  0.025% |  46
lockup-480-0.png          1920x1016   102   22345     1170       68  0.060% | 199
symbol-480-0.png          1920x1920    88   10933      254       16  0.007% |   0
wordmark-480-0.png        1920x1016   104   19968     1784       36  0.091% | 180
tones-0 … tones-8, variants-0 … variants-2 (story sizes)   ≤ 0.095% Δ>32; ≤ 50 px outside 1 device px each
```

- No image changed size.
- The ×8-amplified diff sheets (`task-7-fix1-evidence/before-after-diffx8-*.png`) show only anti-aliasing along the outlines, with no change of shape.
- The densest outlier window (`lockup-worst-window-fp3-vs-fp2.png`) is single scattered pixels on the sub-pixel lotus hairline. Before and after look identical in it.

## M2: no `width`/`height` props; size by class

- `LogoProps` now omits `"children" | "viewBox" | "width" | "height"`.
- The JSDoc says to size with classes only: `w-50` sets the width, and `h-12 w-auto` sets a header height with the width following the artwork.
- New story `HeaderHeight`: `className="h-10 w-auto"` inside a 64px `h-header-compact` row. The rendered box is **76.125 × 40**, a ratio of 1.903, which matches the artwork's 361.88 / 190.13 = 1.9033. Screenshot: `task-7-fix1-evidence/header-height-story.png`.

## M3: generator hardening

- The hex replace and the hex check both use `#[\da-f]{3,8}`.
- The generator now throws if:
  - the root `<svg>` was not stripped (the markup starts with `<svg`),
  - any `href="#` remains,
  - the width or height parsed from the viewBox is not finite.
- The Logo sets `fill="currentColor"` on the plain root `<svg>` and on the badge's inner `<svg>`.

## M4, M5, M6

- **M4:** the two-logos test now also asserts `ids.length > 0`.
- **M5:** new tests check that the symbol badge's inner `<svg>` has `x="20" y="20" width="60"`, and that the lockup badge's inner `<svg>` has `width="76"`.
- **M6:** `SYMBOL_DATA_URI_WHITE` is gone from the generator, from `brand-artwork.ts` and from the spec; it was never re-exported. `git grep SYMBOL_DATA_URI -- packages apps` finds nothing. The white tile now exists only as `--pp-symbol-mask` / `mask-symbol` in `brand-artwork.css`.

## Covering tests (RED, then GREEN)

**`brand-artwork.spec.ts`: 12 tests (was 7).**

- Hex check widened to `{3,8}`.
- New: inner markup only, with no `href="#`.
- New: finite, positive width and height.
- New: per-mark size budgets (lockup < 40,000, wordmark < 34,000, symbol < 4,000 characters).
- New: the module exports only `["ARTWORK"]`.
- Removed: the data-URI test.
- RED against the old output: 4 failed (the three budgets, plus the exports check).

**`logo.test.tsx`: 13 tests (was 9).**

- Root `fill="currentColor"` on the default logo and on the badge's inner svg.
- Symbol badge inset 20/20/60, and lockup badge width 76.
- `ids.length > 0` in the two-logos test.
- `h-10 w-auto` header sizing replaces `h-auto` and `w-logo-lockup`.
- `expectTypeOf<LogoProps>().not.toHaveProperty("width" | "height")`.
- RED against the old Logo: 3 runtime failures (the default-logo fill, the badge fill, and an interim width-attribute check that I later replaced with the type test), plus 2 type errors from the `expectTypeOf` checks (TS2554, surfaced by typecheck).

## Commands and output

```
$ pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache
  ✔︎ dist/theme.css ✔︎ dist/surfaces.css ✔︎ dist/tokens.json — Successfully ran target build

$ pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui --skip-nx-cache --outputStyle=static
 ✓ src/styles.spec.ts (2) ✓ src/lib/component-variants.spec.ts (36) ✓ src/lib/brand-artwork.spec.ts (12)
 ✓ src/lib/reveal-observer.test.tsx (10) ✓ src/atoms/icon/icon.test.tsx (11) ✓ src/atoms/logo/logo.test.tsx (13)
 Test Files 6 passed (6)   Tests 84 passed (84)
 NX Successfully ran targets typecheck, lint, test for project @pink-paprikaa-web/ui and 3 tasks it depends on

$ pnpm nx run @pink-paprikaa-web/storybook:build
 NX Successfully ran target build for project @pink-paprikaa-web/storybook and 2 tasks it depends on

$ pnpm nx test @pink-paprikaa-web/storybook --skip-nx-cache
 ✓ logo.stories.tsx (5 tests)  ✓ icon.stories.tsx (5 tests)
 Test Files 2 passed (2)   Tests 10 passed (10)

$ pnpm nx format:check   → exit 0
```

`apps/blog/next-env.d.ts` was not touched, so nothing needed reverting. The probe scripts I used were temporary; all were deleted, and none is in the commit.
