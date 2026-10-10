# Plan 3b, Task 0: fold list (BINDING OVERLAY, ruling R43)

The plan file is not patched. Each item below overrides the task brief it names. An implementer
applies it on top of the brief and does not reinterpret it. Base: `a1b3112` (Plans 1, 2a, 2b, 2c,
3a built; Plan 5 foundations live). Every check was run against the tree, not the plan text.
Task 0 made **no code change** (no commit).

## Checks run (Task 0 Steps 1 to 5)

| Step | Result |
| ---- | ------ |
| 1. Dependencies | All present: atoms (30 folders incl. every one Step 2 names), layouts (7), molecules (17, Plan 3a), lib (`heading.ts`, `link-as.ts`, `story-surfaces.tsx`, `control-states.ts`, `symbol-mark.tsx`, `field-status.ts`, `space.ts`). |
| 2. Signatures | `componentVariants`, module consts `TEXT` / `RADIUS` / `SHADOW` / `SPACING` (component-variants.ts:16/87/88/108); `headingTag`, `HeadingLevel`; `LinkAs`, `LinkAsProps`; `controlStates`; `OnSurfaces({ grounds?, children })` (children may be a per-ground function); `@utility autogrid-min-*` (styles.css:188) and `@utility transition-control` (styles.css:238); `fakeRegister` (vitest.setup.ts:34) and `expectNoA11yViolations` (:12). Every atom prop the briefs pass exists with the brief's name and values. |
| 3. Facts a–l | a holds · b holds · c holds · **d differs (item 6)** · e holds · f holds · g holds · h holds · i holds · j holds · k holds · l holds. Detail below. |
| 4. Baseline | Green at `a1b3112`: design-tokens build + 272 tests; ui typecheck, lint, 1088 tests (69 files); Storybook build; `format:check`; `storybook:test` 627 tests (63 files). |
| Radix | `radix-ui` 1.6.7 → `react-toggle-group` 1.1.19, `react-toggle` 1.1.18, `react-roving-focus` 1.1.19, `react-slot` 1.3.3. ToggleGroup single renders `role="radiogroup"` with `role="radio"` + `aria-checked` items; multiple renders `role="toolbar"` with `aria-pressed` buttons — exactly the roles Tasks 6 and 12 query. `ToggleGroup.Root` declares `disabled?: boolean` (no `\| undefined`): Task 12 already defaults it (`disabled = false`). `ToggleGroup.Item` takes React's `disabled?: boolean \| undefined`, so `disabled={option.isDisabled}` compiles. `Slot.Root` / `Slot.Slottable child` as Task 17 uses them (same as Button, Link). |
| Packages | Briefs import only `react`, `radix-ui`, `lucide-react` (1.30.0: `ArrowRight ArrowUpRight BadgeCheck Check Clock Copy Flame Leaf MapPin Plus Search Star Store` all exported), `@pink-paprikaa-web/utils` (`formatRupees` exported), and the test/story packages. Nothing to install. |
| 3a molecules | No 3b brief imports a 3a molecule. Prose references resolve: `QuantityStepper` (T1 `action` JSDoc), `Snackbar` (T9 "pair `onCopy` with a Snackbar"), `Tabs` (T12 docs), `ListRow` (deviation 15: `icon`, `asChild`, `hasChevron` exist). The one same-tier import (`type MenuItemImage` from `../menu-item-row/menu-item-row`, T2/T3) is allowed by `atomic-layering.js` (molecules may import molecules). No brief imports `layouts/` or `organisms/` (R75) or lays out a story with `Stack`/`Cluster`. |
| R13 | Every optional prop in Tasks 1–20 reads `?: T \| undefined` or `?: ReactNode`. Every atom prop the briefs forward (`was`, `src`, `label`, `size`, …) is declared `\| undefined`. Nothing to fold. |
| R15 | No brief reads a file (`new URL`, `readFileSync`, `import.meta` absent). Nothing to fold. |
| R19 | Every `svg` selector hits a lucide glyph (T15 tile icon, T16 ticks, T17 arrow) or, in T5, the `Logo` symbol (inline SVG by R25, `aria-hidden` when `isDecorative`). No brand-diamond assertion reads `svg`. Nothing to fold. |
| Veg (C10) | Holds. DietMark appears only in T1/T2, always rendered, no `diet` prop; the only `egg` is the `diet="egg"` under `@ts-expect-error` that pins it cannot compile. No fixture names a non-veg dish (scanned for egg, chicken, mutton, fish, prawn, meat, …). "Pink Paprikaa" spelled with two a's throughout; no founder names. |
| Traps | `font-normal`: none (T8 uses the `{font-weight.regular}` alias, which exists). Icon `label` vs textContent: no brief puts a name in `<Icon label>` and then reads textContent (T4's external Link name is matched by regex, `/View on Google/`). TS2322 casts: no `as ?? DEFAULT` element; `linkAs: LinkComponent = "a"` (T2, T3, T19) is Pagination's/Breadcrumb's compiling pattern. |

## Overlay items

1. **Commit subjects must start lower-case. Affects Tasks 1–20.** commitlint rejects
   `feat(ui): MenuItemRow molecule`. Use `feat(ui): add the <Name> molecule` (T9: `add the
   CouponTicket molecule`, T20: `add the Table molecule`, …). Bodies unchanged. Trailer: the model
   actually running.

2. **Barrel placement. Affects Tasks 1–20.** The molecule block in `packages/ui/src/index.ts`
   is sorted by path. Insert each export at its sorted place, never at the end: `menu-item-card`
   (T2) and `menu-item-row` (T1) go between `list-row` and `otp-input`; `announcement-bar`
   (T19) before `breadcrumb`; `table` (T20) before `tabs`; and so on. `index.spec.ts` checks each
   folder has its barrel line, a PascalCase export and the `tsx`/`test.tsx`/`stories.tsx` trio;
   `coupon-copy-button.tsx` (T9) and `announcement-expiry.tsx` (T19) are extra files, not exported.

3. **Headings via `createElement` (R83). Affects Tasks 1, 2, 3, 14, 15, 16, 17.**
   `react-hooks/static-components` rejects `const Heading = headingTag(headingLevel)` +
   `<Heading …>`. Replace with
   `{createElement(headingTag(headingLevel), { className: styles.<slot>() }, <children>)}`
   (`import { createElement } from "react"`), with the comment used in `section-header.tsx`:
   `{/* createElement, not \`const Heading = headingTag(…)\` (R83): the React Compiler lint reads a capitalised call result as a component created during render. */}`.
   Where the heading's child is a link (T2, T3 stretched link), the link element is the third
   argument. Tests unchanged.

4. **Story export `OnSurfaces` collides with the imported `OnSurfaces`. Affects Tasks 1, 6, 12,
   13, 14, 15.** `export const OnSurfaces: Story` redeclares the import (TS2440). Write
   `export const OnSurfacesStory: Story = { name: "OnSurfaces", … }`. The story id stays
   `…--on-surfaces` (Task 21's ids unchanged).

5. **360px viewport. Affects Tasks 1, 2, 3, 9.** Write
   `globals: { viewport: { value: "floor360", isRotated: false } }` (2c/3a precedent; the brief's
   `value` alone works, this matches every existing story). `w-90` wrappers stay.

6. **Rating's accessible name prints one decimal (fact d). Affects Task 4.** Rating names itself
   `` `${value.toFixed(1)} out of ${max}` `` (rating.tsx:124), so `rating={5}` is **"5.0 out of 5"**.
   In `review-card.test.tsx` "shows the score…" use `{ name: "5.0 out of 5" }`; the `/out of 5/`
   regex in "omits the score…" stays. In the dev-parity table row "Score named for assistive
   tech", write `("5.0 out of 5")`.

7. **R61 sizing markers. Affects Tasks 8, 9, 20; none for the rest.**
   `apps/storybook/src/docs-kit/catalogue.spec.ts` reads `packages/ui/src` live: a `spacing-*`
   token the library uses only as `size|w|h|min-w|min-h|max-w|max-h` needs
   `"$extensions": { "pink-paprikaa": { "utility": [ … ] } }` equal to exactly those uses, or
   `storybook:test` goes red. Computed from the briefs' component code (script run against every
   `--spacing-*` token plus the new ones):
   - Task 8 `offer-seal`: `["size"]`.
   - Task 9 `coupon-ticket-md`, `coupon-ticket-lg`: `["max-w"]` each; `coupon-ticket-stub-md`,
     `coupon-ticket-stub-lg`: `["w"]` each (`sm:w-…` counts as `w`); `coupon-ticket-notch`: `["size"]`.
   - Task 20 `table-sm`, `table-md`, `table-lg`: `["min-w"]` each.
   - Task 16 `pricing-card-pad` is used as `p-` → **no marker**.
   - No existing marked token changes use (`text-measure-narrow` stays `["max-w"]`,
     `dock-clearance` stays `["bottom"]`).
   Run `pnpm nx run storybook:test` in each task's gate (R77; cold cache: re-run once on "Failed to
   fetch dynamically imported module").

## Notes (no brief change)

- **Struck-price words differ in case.** PriceTag's hidden word is `was ` (lower-case); T10
  ChoiceCardGroup and T16 PricingCard draw their own `<s>` with `Was ` and their tests pin it
  (`"Classic ₹130 Was ₹140"`, `"Was ₹140"`). Built as written; unifying the case is a controller
  call for the 3b final review.
- **Plan 5 hand-offs** (from progress.md): Company details `FactList` → `KeyValueList` after T13
  (remap `article`→`md`, `narrow`→`lg`); `doc-table.tsx` → `Table` after T20.
- **3a's final fix wave** (R89–R91, if any) rides in batch B before T2 (R74 precedent); it may touch
  `component-variants.ts`, `styles.css` or `select.tsx` — rebase appends, never reorder them.

## Pre-flight table

### Pairs of tasks sharing a file or an interface

| Tasks | Producer → consumer | Finding | Verdict |
| ----- | ------------------- | ------- | ------- |
| 1 → 2 | `menu-item.json` text tokens | T2 reuses `text-menu-item-name` (T1 adds it to `TEXT`); T2 adds no second definition. | OK |
| 1 → 2, 3 | `type MenuItemImage` | Same-tier type import, allowed by atomic-layering (molecules → molecules). T1 exports it from the barrel. | OK |
| 1–20 | `component-variants.ts` `TEXT` / `SPACING` / `SHADOW` / `RADIUS` | New names (`menu-item-*`, `offer-seal*`, `coupon-ticket-*`, `choice-card-*`, `selected`, `pricing-card-*`, `table-*`, …) collide with no existing token or each other. `component-variants.spec.ts` fails a task that forgets a name. | OK |
| 8, 10, 20 | `contrast-pairs.json` | New group ids `offer-seal`, `offer-seal-brand`, `choice-card*`, `table-head` are unique. | OK |
| 10 → 11 | `shadow.selected` (semantic) | T10 creates it and registers `selected` in `SHADOW`; T11 consumes it. Batch order D (T10) before E (T11). | OK |
| 15 | `surface/{ink,light}.json` | T15 adds the feature-item tile keys inside `color` and restores them in light (theme.spec). | OK |
| 8, 9, 20 ↔ storybook `catalogue.spec` | spacing markers | Item 7, or `storybook:test` goes red. | OK (after item 7) |
| 1–20 | `index.ts` | Molecule block sorted by path (item 2). | OK (after item 2) |
| 1, 6, 12–15 | `OnSurfaces` import | Story name clash, item 4. | OK (after item 4) |
| 1, 2, 3, 14–17 | `headingTag` | R83 createElement, item 3. | OK (after item 3) |
| 6, 12 → radix | `ToggleGroup` roles / `disabled` | Roles and types verified above. | OK |
| 17 → radix `Slot` | `Slot.Root` + `Slot.Slottable child` | Same pattern as Button, Link, IconButton. | OK |
| 2, 3, 19 → Plan 2a | `LinkAs` default `"a"` | Pagination/Breadcrumb pattern; compiles. | OK |
| 19 → Plan 2b | `Countdown endsAt` | Accepts `Z` (`/(?:Z\|[+-]\d{2}:\d{2})$/`); `toISOString()` fixtures stand. The "expires while open" test pins fake time, so no date bomb. | OK |

8. (controller, R94) Tasks 10, 16 — a struck "was" price reads lower-case "was" like PriceTag (reuse PriceTag's struck price where the brief draws its own); update the tests that pin "Was".

9. (controller, review A) Expect a Prettier class re-sort in new files AND the plan doc whenever a task adds tokens — commit the plan-doc re-sort separately as `docs:` (implementer contract). Briefs' class strings may be stale vs the plan doc; Prettier's order wins.
