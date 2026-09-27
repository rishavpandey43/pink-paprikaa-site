# Batch A report — Plan 2a Task 0 (verify) + Task 1 (shared library)

Base `8e736ec`. Branch `feat/design-system`. One commit:

- `97d44b3 feat(ui): shared heading, link-as and symbol-mark library for the atoms`

Status: **DONE_WITH_CONCERNS** (the concerns are small overlay-driven deviations from the brief text, listed below).

---

## Task 0: reconcile (verification only, no files changed)

| Step | Result |
| ---- | ------ |
| 1. Plan 1 commits | All five present: `27bf514` tokens, `80166f4` library core, `d4efadf` token-only classes, `c2b187a` artwork/Icon/Logo, `94ff380` storybook consumes like an app. |
| 2. Barrel, builder, helper, Icon, artwork | Barrel exports `Icon`, `IconComponent`, `IconProps`, the 3 glyphs + `GlyphProps`, `Logo`, `LogoProps`, `RevealObserver`, `RevealObserverProps`. `TEXT`/`SPACING`/`RADIUS`/`SHADOW`/`ANIMATE` consts, `twMergeConfig`, `componentVariants` and `export type { VariantProps }` are present. `expectNoA11yViolations(container: Element, options: RunOptions = {})` is present. Icon `size` xs..xl maps to `size-icon-*`. `Mark`, `Artwork` and `ARTWORK` are exported; there is no data-URI export (R25). `brand-artwork.css` defines `--pp-symbol-mask` (inside `@layer base :root`) and `@utility mask-symbol`. |
| 3. Consumed tokens | `all consumed tokens present`. Surfaces: `brand surface-brand [color, shadow]`, `ink surface-ink [color, shadow]`, `soft surface-soft [color]`, `light surface-light [color, shadow]`. styles.css has `duration-fast`, `duration-base`, `press-scale`, `lift`, `--animate-rotate` and `--animate-dot-pulse`. |
| 4. Nothing pre-created | `lib/` holds only brand-artwork.*, component-variants.*, reveal-observer.*. `atoms/` holds only icon and logo. `tokens/component` holds only `.gitkeep`, icon.json and logo.json. The query for `radius-diamond` / `white-alpha-16/40/90` returned `[]`. |
| 5. Baseline green | `Successfully ran targets typecheck, lint, test for 2 projects and 2 tasks they depend on` (9.3s, --skip-nx-cache). Storybook build: `Storybook build completed successfully` (2 of 3 tasks were cache hits at baseline; it rebuilt fully at the Task 1 gate, 0/3 hit). |
| 6. Dev-parity tables | `13` `**Dev parity:**` tables, and `13` "Implementer: copy this table" lines. |

Result: Plan 1 matched this plan's assumptions. The deltas below come from the overlay (R19, R41, item 8), not from a drift in Plan 1.

### Deltas for later tasks

1. **Task 4, Step 1: skip it.** The nine `pattern-tile-{56..96}` / `pattern-opacity-{default,light,faint}` utilities are already in `styles.css`, verbatim from Task 4's block, placed after `transition-control`. Their tailwind-merge class groups (`pattern-tile`, `pattern-opacity`) are already registered in `component-variants.ts`, and a token-sync test and a merge test exist. The reason for moving them: overlay item 8 puts the twMerge registration and its merge test in Task 1, and `tailwindcss/no-custom-classname` lints `.ts` specs, so the test could not name those classes until the utilities existed. Task 4 must not append them again, and its prettier or `git add` list for styles.css needs no change.
2. **Task 10 (Divider) test, line ~111:** `rule.querySelector("svg")` → `rule.querySelector(".mask-symbol")`. SymbolMark is now `<span aria-hidden="true" class="inline-block shrink-0 mask-symbol …">`. The `size-divider-mark text-divider-mark opacity-90` and `aria-hidden="true"` assertions still hold.
3. **Task 13 (StatusDot) test, line ~134:** `diamond?.querySelector("svg")` → `diamond?.querySelector(".mask-symbol")`. Also, per fold item 4, `rounded-status-dot` → `rounded-diamond` (token `radius.diamond` = 2px) in the test and in the `pulse`/`diamond` slots.
4. **SymbolMark API for every consumer (Tasks 10, 13, and Plan 2b/3/4):** `SymbolMarkProps = Omit<ComponentProps<"span">, "children" | "dangerouslySetInnerHTML">`. Pass `className` (merged through `componentVariants`, so a consumer's `block` replaces the default `inline-block`) and optionally `style` (Plan 2b Rating's `clipTo`). There is no `viewBox`/`fill` and no SVG.
5. **`LinkAsProps` follows R13:** `className?: string | undefined`, `"aria-current"?: "page" | "step" | "true" | undefined`, `onClick?: … | undefined`. `children?: ReactNode` stays as it is, because ReactNode already includes `undefined`.
6. **Atomic layering (R41) is live:** in every tier, `@pink-paprikaa-web/ui` (and any subpath) and `../../../src`, `../../../src/index` and `../../../src/index.ts` are lint errors. Stories and tests in the atom tasks must not import the package by name.

---

## Task 1: what was built

- `lib/heading.ts` (+ spec, 6 cases): `HeadingLevel`, `headingTag`. Verbatim.
- `lib/link-as.ts` (+ test, 2 cases): `LinkAsProps`, `LinkAs`, with R13 `| undefined` applied.
- `lib/symbol-mark.tsx` (+ test, 2 cases): **R19 form**, not the brief's inline SVG. It renders `<span aria-hidden="true" className={componentVariants("inline-block shrink-0 mask-symbol")({className})} {...props} />`. The tests assert the SPAN tag, the `mask-symbol` + `size-4` classes, `aria-hidden="true"`, and no `<path` or `<svg` in the HTML. The brief's "no element ids in ARTWORK markup" test was dropped: SymbolMark no longer touches the markup.
- `lib/control-states.ts`, `lib/story-surfaces.tsx` (`OnSurfaces`): verbatim.
- `styles.css`: `@utility transition-control` (verbatim), plus the nine pattern utilities (delta 1).
- `component-variants.ts`: `PATTERN_TILE` / `PATTERN_OPACITY` lists and `pattern-tile` / `pattern-opacity` classGroups. In `component-variants.spec.ts`, `namesIn` now takes a path prefix, and there are two token-sync cases (`pattern.tile`, `pattern.opacity`) plus two consumer-override merge cases. Before registration, `twMerge("pattern-tile-64 pattern-tile-96")` kept both classes (probed with node), so the merge test fails without the groups.
- `index.ts`: exports `HeadingLevel`, `headingTag`, `LinkAs`, `LinkAsProps`. `SymbolMark`, `controlStates` and `OnSurfaces` stay internal.
- `AUTHORING.md`: the "Skins on surfaces" paragraph (verbatim) at the end of §7. In §6's named-utilities list, `transition-control` and the pattern utilities.
- `design-tokens/src/surface-aliases.spec.ts`: verbatim, except the path is built with `join(import.meta.dirname, "../dist/tokens.json")` (R15 style).
- `tools/eslint-config/rules/naming-convention.js`: the `requiresQuotes` typeProperty entry, verbatim.
- `tools/eslint-config/atomic-layering.js` (R41): the barrel regex gains an optional `/src` segment, plus a `selfPackagePattern` (`^@pink-paprikaa-web/ui(?:/|$)`), both in every tier. `atomic-layering.test.mjs` gains probes: 5 new barrel spellings in every tier must error, and `@pink-paprikaa-web/utils` and `@pink-paprikaa-web/design-tokens/tokens.json` must still pass, which guards against the self-name regex matching `ui…` prefixes.

### Evidence

**Step 1, naming probe (before the edit):**
```
2:3  error  Type Property name `aria-current` must match one of the following formats: camelCase, snake_case  @typescript-eslint/naming-convention
3:3  error  Type Property name `bad_Name` must match one of the following formats: camelCase, snake_case      @typescript-eslint/naming-convention
```
**After the edit:**
```
3:3  error  Type Property name `bad_Name` must match one of the following formats: camelCase, snake_case  @typescript-eslint/naming-convention
```
The probe was deleted, and `git status` showed only `naming-convention.js`.

**Step 3, RED:**
```
FAIL  src/lib/heading.spec.ts      Error: Failed to resolve import "./heading"
FAIL  src/lib/symbol-mark.test.tsx Error: Failed to resolve import "./symbol-mark"
Test Files  2 failed | 8 passed (10)
design-tokens: ✓ src/surface-aliases.spec.ts (4 tests) — Test Files 4 passed (4)
```
`link-as.test.tsx` did not go RED at runtime: it has a type-only import, which esbuild erases. The typecheck is its real gate. `ui:typecheck` passed in GREEN with `"a"` and a router component both assignable to `LinkAs`.

**Step 5, GREEN:**
```
✓ src/lib/heading.spec.ts (6 tests)
✓ src/lib/component-variants.spec.ts (40 tests)
✓ src/lib/symbol-mark.test.tsx (2 tests)
✓ src/lib/link-as.test.tsx (2 tests)
Test Files  10 passed (10)   Tests  107 passed (107)
```
**Alias-guard probe** (`tokens/component/probe.json` → `{color.text.link}`):
```
❯ src/surface-aliases.spec.ts (4 tests | 4 failed)
AssertionError: expected [ 'color-probe → color.text.link' ] to deeply equal []
Test Files  1 failed | 3 passed (4)   Tests  4 failed | 135 passed (139)
```
With the probe removed: `Test Files 4 passed (4)  Tests 139 passed (139)`.

**R41 RED:** with the HEAD `atomic-layering.js` and the new test file:
```
✖ no tier imports the package barrel, by any spelling
AssertionError [ERR_ASSERTION]: atoms importing "../../../src"
ℹ pass 3  ℹ fail 1
```
With the new rule: `ℹ pass 4 ℹ fail 0`.

**Step 8, gate:** tokens build, then `run-many -t typecheck lint test -p ui design-tokens eslint-config utils --skip-nx-cache`:
```
NX   Successfully ran targets typecheck, lint, test for 4 projects and 1 task they depend on
Run duration: 11.6s   Cache: Skipped (--skip-nx-cache)
```
(ui 107 tests, design-tokens 139, utils 18, eslint-config node tests pass 6 / fail 0.) After a final comment re-wrap, the ui run went green again: `Successfully ran targets typecheck, lint, test for project @pink-paprikaa-web/ui`. `prettier --check` reported `All matched files use Prettier code style!`.

**Storybook build:** `Storybook build completed successfully`; `Successfully ran target build for project @pink-paprikaa-web/storybook` (Cache 0/3 hit).

### Files changed (commit 97d44b3)
A `packages/design-tokens/src/surface-aliases.spec.ts`
A `packages/ui/src/lib/{heading.ts,heading.spec.ts,link-as.ts,link-as.test.tsx,symbol-mark.tsx,symbol-mark.test.tsx,control-states.ts,story-surfaces.tsx}`
M `packages/ui/{AUTHORING.md,src/index.ts,src/styles.css,src/lib/component-variants.ts,src/lib/component-variants.spec.ts}`
M `tools/eslint-config/{atomic-layering.js,atomic-layering.test.mjs,rules/naming-convention.js}`

### Dev parity
Task 1 is a shared-library task: dev's `lib/` has none of these files, and the brief says "Dev reference: none". No table applies.

### Rulings I needed
- **R-A1: pattern utilities moved into Task 1** (delta 1). Overlay item 8 puts the twMerge change and its merge test here, and the lint's `no-custom-classname` would reject those class names before the utilities exist. This was the smallest consistent choice.
- **R-A2: SymbolMark base classes `inline-block shrink-0`.** A bare inline span ignores `size-*`, so a mark outside a flex or grid parent would collapse to 0×0. Consumers can override through tailwind-merge.
- **R-A3: the atomic-layering R41 scope is the four tiers only**, as the fold list says ("in every tier"). `src/lib/*` files are not covered by the `atomicLayering` `files` globs, and I left it that way.

### Concerns
- The naming-rule change is workspace-wide (base preset). It only relaxes quoted type-property names; unquoted names stay strict (the probe proves this).
- The brief's Step 3 expected `./link-as` to fail at runtime. It cannot, because of the type-only import. This is noted rather than contrived.
