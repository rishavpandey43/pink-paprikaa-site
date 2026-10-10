# Plan 2b, Task 0: fold list (BINDING OVERLAY, ruling R43)

The plan file is not patched. Each item below overrides the task body it names. An implementer
applies it on top of the brief and does not reinterpret it. Base: `dcd18d8` (Plan 2a finished at
`47cdcba`). All checks below were run against the tree, not the plan text.

## Checks run (Task 0 Steps 1 to 5)

| Step | Result |
| ---- | ------ |
| 1. Exports | `componentVariants`, `twMergeConfig`, `export type { VariantProps }`; `ARTWORK` (plus `Mark`, `Artwork`), **no `SYMBOL_DATA_URI_WHITE`** (R25); `SymbolMarkProps = Omit<ComponentProps<"span">, "children" \| "dangerouslySetInnerHTML">` and `SymbolMark`, **a `mask-symbol` span, not inline SVG** (R19); `OnSurfaces({ children })`; `IconComponent`, `IconProps`, `Icon`; `expectNoA11yViolations`; `formatCount, formatRupeeRange, formatRupees`; `@pink-paprikaa-web/utils`, `lucide-react ^1.30.0`, `radix-ui ^1.6.7` in `packages/ui/package.json`; `requiresQuotes` at `naming-convention.js:61`. Also in `src/lib`: `control-states.ts`, `heading.ts`, `link-as.ts`, `symbol-mark.tsx`, `story-surfaces.tsx`. |
| 2. Consumed tokens | All 69 names in the brief are present, plus `radius-diamond`. `color-white-alpha-28` is absent, which is correct: Task 10 adds it. White-alpha primitives present: 06 10 16 22 25 30 40 42 50 70 72 85 90 92. **Surface-overridden shadows: `shadow-focus-ring` (brand, ink, light) and `shadow-button-primary` (brand, light).** Only `shadow-button-primary` has an `@utility`. The styles.css grep finds `transition-control`, `duration-fast/base/slow`, `z-toast`, `--animate-mark-pulse` and `--animate-skeleton`. |
| 3. Shared files | `contrast-pairs.json` pairs `color-text-on-inverse` only with `color-surface-inverse` (line 121), so **Task 14's contrast step stays**. No token name this plan adds collides with a list entry (checked every Append line against `SPACING`, `TEXT`, `SHADOW`, `RADIUS`). There are 13 `**Dev parity:**` tables, 2 `**Dev reference:** none` and 13 "Implementer: copy this table" lines. |
| 4. Class probe | The brief's probe plus `top-0.75 left-0.75 h-17 h-18 w-23 w-90 gap-0.75 gap-1.25 opacity-22 opacity-62 opacity-66 rounded-diamond focus-within:shadow-focus-ring mask-symbol`. **No `tailwindcss/no-custom-classname` error**, so every class exists. The only findings were `no-contradicting-classname`, which the probe causes itself by putting `size-3/4` beside `size-6/7`, `rotate-45` beside `-rotate-45`, and so on, and an `enforces-shorthand` warning for `ps-11 pe-11` on one element. The probe was removed and the tree is clean. |
| 5. Baseline gate | Green. design-tokens 190 tests, ui 386 tests, typecheck and lint pass, Storybook build completed. |

## Overlay items

1. **Stale inline-SVG SymbolMark in the tests (R19/R25). Affects Tasks 2, 8, 11, 12.** `SymbolMark` renders `<span aria-hidden="true" class="inline-block shrink-0 mask-symbol …">`, which contains no `svg`.
   - **Task 2** (`input.test.tsx`) and **Task 8** (`spinner.test.tsx`): replace the `markIn` helper with `const markIn = (root: HTMLElement) => root.querySelector(".mask-symbol");`, fix its doc comment to "(Plan 2a's SymbolMark) is the only `.mask-symbol` element", and **delete the `import { ARTWORK } from "../../lib/brand-artwork";` line**, which would otherwise be unused and fail lint.
   - **Task 11** (`rating.test.tsx`): change every `".bg-pink-500 > svg"` and `".bg-ink-200 > svg"` to `"… > .mask-symbol"`, and `"svg.opacity-22"` to `".mask-symbol.opacity-22"`.
   - **Task 12** (`spice-level.test.tsx`): change `".bg-heat-1 > svg"` and `".bg-ink-200 > svg"` to `"… > .mask-symbol"`.
   - Prose only, no code: plan line 7 ("inline SVG in `currentColor`") and Task 8's Interfaces ("inline SVG in `currentColor`") mean the `mask-symbol` span. Its colour is still `currentColor` (the mask paints `background-color: currentColor`), so a `text-*` tone class still works.
   - Unchanged and still valid: Task 5's `container.querySelector("svg")` "plain hint" assertion (no status glyph is drawn), and Task 13 DietMark's own inline `<svg>`. The DietMark glyph is the veg mark, not the brand symbol, so R19 does not apply to it.

2. **One diamond corner (R47). Affects Task 11 and, through it, Task 12.** `radius.diamond` (2px) already exists in `tokens/primitive/shape.json`, and `"diamond"` is already in `RADIUS`.
   - Delete the whole `"radius"` group from `brand-diamond.json`. The file keeps only its `spacing` group.
   - Do not append `"brand-diamond"` to `RADIUS`. The Append line keeps its `SPACING` and `TEXT` parts only.
   - In `lib/brand-diamond.tsx`, the `diamond` slot uses `rounded-diamond` in place of `rounded-brand-diamond`.
   - Nothing else in the plan names `radius-status-dot`, `radius-brand-diamond` or `rounded-brand-diamond`. Task 0 Step 3's "keep both" bullet is void.

3. **R21, field text is 16px. Affects Tasks 2 and 4.** The body still sizes the field text at `text-body-sm` / `text-control` (15px).
   - **Task 2** `lib/field-control.tsx`: the size variants become `sm: { root: "h-field-sm text-body" }`, `md: { root: "h-field-md text-body" }`, `lg: { root: "h-field-lg text-body" }`.
   - **Task 2** `input.test.tsx`: the first test expects `"h-field-md", "text-body", …` in place of `"text-control"`. The `it.each` rows become `["sm", "h-field-sm", "text-body"]`, `["md", "h-field-md", "text-body"]` and `["lg", "h-field-lg", "text-body"]`, and the test title reads "renders size %s at %s with the 16px value text %s". That table is R21's required assertion. Select inherits the size from the shared box, so Task 3 needs no change.
   - **Task 2** no longer uses `text-control`. So **Task 2 does not create `control.json` and does not append `"control"` to `TEXT`**, and Step 1's dist check drops `--text-control: 15px;` (the other two checks stay). The `Create:` line and the prettier path list lose `control.json`.
   - **Task 4** creates `control.json` (its "full file after the change" block, verbatim, except that the `control` description reads "The label of a checkbox, radio or switch."). Task 4 appends both `"control"` and `"control-description"` to `TEXT`, and its `Modify: control.json` line becomes `Create:`.

4. **Read-only Select submits its value (controller 2b ruling). Affects Task 3.** The body renders a disabled `<select>` and nothing else.
   - In `select.tsx`, destructure `name` and pass it through to the `<select>` as before (so `register()` still lands). Render the render-prop child as a fragment: the `<select …>`, followed by `{readOnly && name !== undefined ? <input type="hidden" name={name} value={value ?? initialValue ?? ""} /> : null}`.
   - Update the `readOnly` JSDoc: it is "rendered disabled for the visual, with a hidden input carrying `name` and the value, so the form still submits it."
   - Add a test: `render(<Select aria-label="Outlet" name="outlet" readOnly defaultValue="20:00" options={SLOTS} />)`, then `expect(container.querySelector('input[type="hidden"]')).toHaveAttribute("name", "outlet")` and `…toHaveValue("20:00")`. A non-read-only Select renders no hidden input (a second assertion in the same test is enough).
   - Caveat for the controller, which the implementer does not act on: react-hook-form v7 skips a registered field whose ref is `disabled`. So RHF's `handleSubmit` data omits the value either way. The hidden input fixes native form posts.

5. **Surface-overridden shadow guard (routed from 2a). Task 1 implements it.** It fits Task 1: the guard is shared library infrastructure, and it is needed before Task 2 first uses `focus-within:shadow-focus-ring`.
   - Add `@utility shadow-focus-ring { --tw-shadow: var(--shadow-focus-ring); }` to `packages/ui/src/styles.css`, directly after `@utility shadow-button-primary`, and generalise the comment above it to cover both.
   - In `packages/ui/src/styles.spec.ts`, add a case that reads `design-tokens/dist/tokens.json` (via `join(import.meta.dirname, …)`, R15), collects every `shadow` entry whose `surface !== null`, and asserts that `styles.css` contains `@utility shadow-<name> {` with `--tw-shadow: var(--shadow-<name>);`. Before the utility is added, the case fails on `focus-ring`.
   - **Task 2 does nothing extra.** `focus-within:shadow-focus-ring` now reads the variable at the element, so the field's `data-surface="light"` island gets the light ring.
   - **Any later task** that overrides a shadow on a surface adds its `@utility`, and the guard enforces it.

6. **R41 over `src/lib/**` (routed from 2a). Task 1 implements it**, because Task 1 adds this plan's first lib file (`field-status.ts`).
   - In `tools/eslint-config/atomic-layering.js`, add a block `{ files: ["**/src/lib/**/*"], rules: { "no-restricted-imports": ["error", { patterns: [barrelPattern, selfPackagePattern] }] } }`. That covers the barrel and the self-package name only. `lib` is not a tier, so no upper-layer zones apply, and `../atoms/icon/icon` stays allowed.
   - Extend the doc comment.
   - In `atomic-layering.test.mjs`, add probes from `src/lib/probe.js`. Each barrel spelling from lib must error once: `..`, `../`, `../index`, `../index.ts`, `../../src`, `../../src/index`, `@pink-paprikaa-web/ui`, `@pink-paprikaa-web/ui/styles.css`. These must pass: `./component-variants`, `../atoms/icon/icon`, `../styles.css`, `../../vitest.setup`, `react`, `@pink-paprikaa-web/utils`.
   - Later tasks' lib files (Task 2 `field-control.tsx`, Task 4 `choice-control.tsx`, Task 11 `brand-diamond.tsx`) already comply.

7. **`z-tooltip` must join the `Z` class group. Affects Task 15.**
   - The body says "No list names (z levels are `@utility` classes, not a Tailwind namespace)". That is wrong for this tree: `component-variants.spec.ts` asserts that class group `z` takes every `z` token, so adding `z.tooltip` without the list entry fails `ui:test`.
   - Task 15 appends `"tooltip"` to `const Z` in `packages/ui/src/lib/component-variants.ts`. Its `Modify:` line already names the file. Keep the `@utility z-tooltip` as written.

8. **Barrel placement. Affects Tasks 2 to 16.**
   - Each atom's export line goes into the **atoms block, sorted by path**, not appended at the end of `index.ts`. The lib exports stay after the atoms. For example, `./atoms/input/input` goes between `image-slot` and `link`, and `./atoms/checkbox/checkbox` goes between `card` and `divider`.
   - Plain string order puts `icon-button/` before `icon/`, as the tree already does.
   - Task 1's `export type { FieldStatus } from "./lib/field-status";` goes in the lib block, before `./lib/heading`.

9. **Commit trailer. Affects every task.** The 18 `Co-Authored-By: Claude <model> <noreply@anthropic.com>` lines are placeholders. Commit with the running model's trailer, never the literal text.

10. **Task 0 body text is stale, with no downstream action.** Step 1 expects `SYMBOL_DATA_URI_WHITE` and an inline-SVG SymbolMark, and Step 3 plans `radius-brand-diamond`. Items 1 and 2 supersede both. Task 0 changed no tracked file, so it made no commit.

## Pre-flight table

### Pairs of tasks sharing a file or an interface

| Tasks | Producer → consumer | Finding | Verdict |
| ----- | ------------------- | ------- | ------- |
| 1 → 2, 3, 5 | `FieldStatus`, `FIELD_STATUS_ICON` (error CircleAlert, success CircleCheck, warning TriangleAlert) | FieldControl `trailingGlyph` and Radio's group message index the map by status, and the tests query `.lucide-circle-alert`, `.lucide-circle-check` and `.lucide-triangle-alert`. These match lucide 1.30's class names. | OK |
| 1 → 2, 3, 4, 5, 6, 7 | `fakeRegister(name)` → `{ name, onChange, onBlur, ref }` spies | Each control test spreads it and asserts `ref` gets the native element. The shape matches RHF's `register()`. | OK |
| 1 → 2 | `@utility shadow-focus-ring` + guard (item 5) → `focus-within:shadow-focus-ring` | Task 2 consumes the class unchanged. | OK (after item 5) |
| 2 → 3 | `FieldControl` (`control="select"`, `affordance`, `isReadOnly`, `hasIcon` → `ps-11`) | Select's code passes exactly these props, and its assertions (`ps-11`, overlay `absolute inset-0 size-full truncate`, box `w-full min-w-0`) are in FieldControl's slots. R21's size text is inherited. The read-only hidden input is added in Select only (item 4). | OK (after items 3, 4) |
| 2 ↔ 4 | `control.json` / `text-control` | The body has Task 2 create it for field text and Task 4 rewrite it. After R21 only Task 4 consumes it, so Task 4 creates it (item 3). | CONFLICT → resolved by item 3 |
| 4 → 5, 6 | `ChoiceControl`, `choiceVariants`, `joinIds` | Radio and Switch import from `../../lib/choice-control` and use `type`, `control`, `label`, `description`, `isInvalid`, `placement` and `isLabelHidden` as Task 4 declares them. | OK |
| 11 → 12 | `BrandDiamond`, `BrandDiamondSize`, `brand-diamond.json` sizes 12/14/20 | SpiceLevel uses `"12px" \| "14px" \| "20px"`, which are all declared. The corner token moves to `rounded-diamond` (item 2), and the test selectors move to `.mask-symbol` (item 1). | OK (after items 1, 2) |
| 2a lib → 2, 8, 11, 12 | `SymbolMark` (a `.mask-symbol` span, `className` + `style` spread) | Spinner merges `block` over `inline-block`, and Rating passes `style={clipTo(fill)}`. Both are supported. The tests are stale (item 1). | CONFLICT → resolved by item 1 |
| 10 ↔ primitive `color.json` | `white-alpha-28` inserted between `25` and `30` | Both neighbours exist, and 28 does not yet. | OK |
| 14 ↔ `contrast-pairs.json` | on-inverse × brand group | Not already paired, so the step stays. | OK |
| 15 ↔ `component-variants.ts` / `z-index.json` / `styles.css` | `z.tooltip` + `@utility z-tooltip` | The `Z` list must gain `tooltip` (item 7). | CONFLICT → resolved by item 7 |
| 2, 4, 6, 8, 10, 11, 13, 14, 15 ↔ `component-variants.ts` | list appends | None of the appended names collide. Each appends to a different list position. Resolve merge order by appending in task order. | OK |
| 1–16 ↔ `index.ts` | export lines | Sorted insertion into the atoms block (item 8). No two tasks add the same line. | OK |

### Each task against itself (its tests vs its code; the files it creates vs the files it touches)

A script extracted every `toHaveClass`, `it.each` class and `querySelector` class from each task's test blocks and looked for it in the task's implementation blocks (or an earlier task's lib). The only misses were caller-supplied `className` inputs (`w-60`, `gap-6`, `gap-8`, `mt-6`, `max-w-text-measure-prose`, `text-canvas-h2`), which are expected, and the `.lucide-*` glyph classes, which lucide emits.

| Task | Verdict |
| ---- | ------- |
| 1 | OK. The test pins the map, and `fakeRegister` is exercised from Task 2 on. |
| 2 | CONFLICT, resolved: tests query an `svg` (item 1), field text and `control.json` (item 3). The Files list otherwise matches `git add -A packages/ui packages/design-tokens`. |
| 3 | CONFLICT, resolved: read-only hidden input missing (item 4). Otherwise consistent. |
| 4 | OK after item 3 (`control.json` becomes Create). |
| 5 | OK. |
| 6 | OK. |
| 7 | OK. |
| 8 | CONFLICT, resolved: `svg` query (item 1). |
| 9 | OK. |
| 10 | OK. |
| 11 | CONFLICT, resolved: `svg` queries (item 1), radius token (item 2). |
| 12 | CONFLICT, resolved: `svg` queries (item 1). |
| 13 | OK. Its inline `<svg>` is its own veg glyph. |
| 14 | OK. The contrast step stays. |
| 15 | CONFLICT, resolved: `Z` list (item 7). Its Files line already lists `component-variants.ts`. `delayDuration={0}` already matches the ruling. |
| 16 | OK. |
| 17 | OK. Its temp file is never committed. |

No task mandates a rubric defect. No test asserts nothing, and no logic block is duplicated verbatim. Rating and SpiceLevel share `BrandDiamond` rather than copying it.

11. (controller, R52) Task 3 read-only Select: keep disabled trigger + hidden input; do not claim or test that react-hook-form's handleSubmit receives the read-only value — document in JSDoc that the value is caller-owned.
12. (controller) Item 11 (R52) wins over item 4's JSDoc wording: the hidden input serves native posts only; the value is caller-owned.
