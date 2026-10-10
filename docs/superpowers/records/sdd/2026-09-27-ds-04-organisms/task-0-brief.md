### Task 0: Reconcile with the code as built

Plans 2a–3b were written in parallel against the same contracts and executed before this one. This task proves every interface this plan consumes exists as declared and patches this plan's code to reality **before** any organism is written. It changes no product code.

**Files:**

- Read: `packages/ui/src/index.ts`, `packages/ui/src/lib/{component-variants.ts,heading.ts,link-as.ts}`, `packages/ui/src/styles.css`, `packages/ui/eslint.config.mjs`, `packages/ui/vitest.setup.ts`, every consumed component file (list in Step 3), `packages/design-tokens/tokens/component/*.json`, `packages/design-tokens/dist/theme.css`, `apps/storybook/.storybook/preview.tsx`
- Modify (only if a delta is found): this plan file

**Interfaces:**

- Consumes: contracts §1–§6; Plan 1 tokens, utilities, `componentVariants`, `expectNoA11yViolations`, Icon + brand glyphs, Logo.
- Produces: a list of deltas (possibly empty) applied to Tasks 1–15 of this plan, committed before Task 1.

- [ ] **Step 1: Confirm the prerequisite plans are merged and green**

Run:

```bash
git log --oneline | head -60
ls packages/ui/src/atoms packages/ui/src/molecules packages/ui/src/layouts
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache \
  && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static 2>&1 | tail -8
```

Expected: `feat(ui): …` commits for the atoms (2a, 2b), layouts (2c) and molecules (3a, 3b); `packages/ui/src/organisms` does not exist yet; the gate is green. If any prerequisite plan is incomplete, stop — this plan cannot start.

- [ ] **Step 2: Every consumed export exists**

Run:

```bash
node -e '
const fs = require("node:fs");
const index = fs.readFileSync("packages/ui/src/index.ts", "utf8");
const values = ["Text","Link","Logo","Icon","InstagramGlyph","YoutubeGlyph","LinkedinGlyph","PatternField","Button","IconButton","Badge","Card","Divider","ImageSlot","DietMark","PriceTag","StatusDot","Input","Select","Field","SectionHeader","Stat","Accordion","ReviewCard","EmptyState","PriceSummary","QuantityStepper","StepTracker","MenuItemRow","MenuItemCard","FilterBar","Alert","OfferSeal","AnnouncementBar"];
const types = ["IconComponent","ReviewCardProps","AccordionItem","TrackerStep","KeyValueItem","FilterOption","MenuItemImage","StatProps"];
const missing = [...values, ...types].filter((name) => !new RegExp("\\b" + name + "\\b").test(index));
console.log(missing.length ? "MISSING: " + missing.join(", ") : "every consumed export is present");
const lib = ["heading.ts", "link-as.ts", "symbol-mark.tsx", "control-states.ts", "story-surfaces.tsx"].map((f) => "packages/ui/src/lib/" + f);
for (const file of lib) console.log(file, fs.existsSync(file) ? "ok" : "MISSING");
'
rtk proxy grep -n "export" packages/ui/src/lib/heading.ts packages/ui/src/lib/link-as.ts
rtk proxy grep -rln "export interface MenuItemImage\|export interface TrackerStep\|export interface KeyValueItem\|export interface FilterOption\|export interface AccordionItem" packages/ui/src/molecules
```

Expected: "every consumed export is present"; all five lib files ok; `headingTag`, `HeadingLevel`, `LinkAs`, `LinkAsProps`, `SymbolMark` exported. Note the file each molecule type lives in — this plan imports `MenuItemImage` from `molecules/menu-item-row/menu-item-row`, `FilterOption` from `molecules/filter-bar/filter-bar`, `TrackerStep` from `molecules/step-tracker/step-tracker`, `KeyValueItem` from `molecules/key-value-list/key-value-list`, `AccordionItem` from `molecules/accordion/accordion`, `ReviewCardProps` from `molecules/review-card/review-card`. If a type lives elsewhere, replace that import path in every task below.

- [ ] **Step 3: Every consumed prop shape matches the contract**

For each file below, read its exported `…Props` interface (`rtk proxy grep -n "export interface .*Props" -A40 <file>`) and compare with contracts §2–§6. The right column is what this plan relies on beyond the contract — check it in the implementation, not just the type.

| File                                                                          | This plan relies on                                                                                                                                                                                                                                                                                                                                                           |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `atoms/text/text.tsx`                                                         | `variant` incl. `overline` (renders uppercase), `display-1`, `display-2`, `h2`, `h3`, `body-lg`, `body`, `body-sm`, `caption`, `mono`; `isFluid` → the `-fluid` class (`text-display-2-fluid`); `as` incl. `h1`–`h6`, `span`, `div`; `tone` `brand`/`muted`/`subtle`; `weight="bold"`; `measure="narrow"`; `isBalanced`; **resets the base `p` margin** (`m-0`) and max-width |
| `atoms/pattern-field/pattern-field.tsx`                                       | renders correctly as an **empty** decorative layer with `className="absolute inset-0"` (children optional; its own positioning classes merge away); `tone` brand/ink/soft/light; `tile` 56/64/72/80/86; `density` default/faint                                                                                                                                               |
| `atoms/button/button.tsx`                                                     | `asChild` places `icon`/`iconAfter` inside the child `<a>`; `variant` primary/secondary/ghost/inverse; `size` sm/md/lg; `isFullWidth`                                                                                                                                                                                                                                         |
| `atoms/icon-button/icon-button.tsx`                                           | `asChild` places the icon inside a childless `<a aria-label>`; sizes sm 32 / md 40 / lg 48; variants primary/secondary/ghost; spreads `aria-disabled`, `onClick`, Radix trigger props                                                                                                                                                                                         |
| `atoms/link/link.tsx`                                                         | `isExternal` adds `target="_blank"`, `rel` and the arrow glyph                                                                                                                                                                                                                                                                                                                |
| `atoms/card/card.tsx` · `atoms/divider/divider.tsx` · `atoms/badge/badge.tsx` | Card `variant="quiet" padding="sm"`; Divider `variant="diamond"`, `label`; Badge `tone` ink/soft/success/brand with icon children                                                                                                                                                                                                                                             |
| `molecules/section-header/section-header.tsx`                                 | `overline`, `title`, `headingLevel`, `lede`, `action`                                                                                                                                                                                                                                                                                                                         |
| `molecules/accordion/accordion.tsx`                                           | first item open by default; single-open items share a `name`; `isMultiple` omits it                                                                                                                                                                                                                                                                                           |
| `molecules/review-card/review-card.tsx`                                       | `<figure>` root; `variant="brand"` sets `data-surface="brand"`; `isVerified`, `source`                                                                                                                                                                                                                                                                                        |
| `molecules/filter-bar/filter-bar.tsx`                                         | Radix ToggleGroup `type="single"` → a `radiogroup` named by `label`, options `role="radio"`; re-pressing the chosen option is ignored by FilterBar itself (never reports `""`)                                                                                                                                                                                                |
| `molecules/quantity-stepper/quantity-stepper.tsx`                             | DOM order: decrease button, value, increase button (CartPanel's test clicks the last button of a line)                                                                                                                                                                                                                                                                        |
| `molecules/step-tracker/step-tracker.tsx`                                     | `<ol>`; the current step's `<li>` carries `aria-current="step"`                                                                                                                                                                                                                                                                                                               |
| `molecules/stat/stat.tsx` · `molecules/price-summary/price-summary.tsx`       | Stat `tone` brand/inverse, `align="center"`; PriceSummary renders a `<dl>` with `totalLabel` and `note`                                                                                                                                                                                                                                                                       |
| every consumed `…Props` and `lib/link-as.ts`                                  | ruling R13: optional props declared `?: T \| undefined` — this plan forwards possibly-`undefined` values directly (`aria-current`, `href`, `label`, `isExternal`, spread dish fields). Where one is not, add `\| undefined` to that interface (its owning plan's rule) rather than a conditional spread here                                                                  |
| `molecules/offer-seal/offer-seal.tsx`                                         | `size="md"` is the 156px handoff hero seal; `corner` + `bleed="none"` position it in a `relative` container                                                                                                                                                                                                                                                                   |
| `lib/symbol-mark.tsx` · `lib/control-states.ts`                               | `SymbolMark` is decorative (`aria-hidden`) and sized by class; IconButton's `aria-disabled` look comes from `controlStates`                                                                                                                                                                                                                                                   |

Record every delta in a scratch list: `<task> — <what the plan assumed> — <what exists> — <patch>`.

- [ ] **Step 4: Tokens, utilities, conventions**

Run:

```bash
for token in spacing-header spacing-header-compact spacing-tabbar spacing-dock-clearance z-header z-dock z-overlay blur-glass color-surface-glass color-surface-overlay color-surface-page-alt color-surface-brand-soft; do
  printf "%-26s " "$token"; rtk proxy grep -c -- "--$token:" packages/design-tokens/dist/theme.css
done
rtk proxy grep -n "@utility \(container-page\|section-y\|autogrid\|z-header\|z-dock\|z-overlay\|duration-base\|duration-fast\)\|--animate-sheet-in" packages/ui/src/styles.css
ls packages/design-tokens/tokens/component/
rtk proxy grep -n "^const [A-Z_]* = \[" packages/ui/src/lib/component-variants.ts
rtk proxy grep -n "floor360\|  md:\|  lg:\|  xl:\|Organisms" apps/storybook/.storybook/preview.tsx
rtk proxy grep -n "no-noninteractive-tabindex" packages/ui/eslint.config.mjs
```

Expected: every token count is `1`; all eight utilities and `--animate-sheet-in` exist; component token files follow `<component>-<part>` names in `spacing`/`text` (read one, e.g. `button.json`, and match its shape); `component-variants.ts` has `SPACING` and `TEXT` arrays (if Plans 2–3 added other arrays — e.g. `COLOR` — note it; this plan adds no colour tokens); the preview's viewport keys include `floor360`, `md`, `lg`, `xl` and `storySort` contains `Organisms`. Note whether `jsx-a11y/no-noninteractive-tabindex` is already configured (Plan 3b's Table scroll wrapper may have allowed `region`) — Task 13 Step 1 is skipped if so.

- [ ] **Step 4a: Dev parity tables present on every ported-component task**

Run: `rtk proxy grep -c "^\*\*Dev parity:\*\*" docs/superpowers/plans/2026-09-27-ds-04-organisms.md && rtk proxy grep -c "^\*\*Dev reference:\*\* none (handoff component)" docs/superpowers/plans/2026-09-27-ds-04-organisms.md`
Expected: `12`, then `3` — a parity table on each task that ports a `dev` organism (Tasks 1–5, 7, 8, 10–12, 14, 15; contracts §0.0) and the handoff marker on Tasks 6, 9 and 13. A missing table is a delta: stop and report it. Rows marked "pending contract delta" are built only if the controller has ruled them in.

- [ ] **Step 5: Apply the deltas to this plan and commit**

For each recorded delta, edit the affected task's code in this file (import path, prop name, class name, test selector). Then:

```bash
git add docs/superpowers/plans/2026-09-27-ds-04-organisms.md
git commit -m "docs: reconcile plan 4 with the built atoms and molecules

<one line per delta: task — assumed — actual — patch>

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

If there are no deltas, skip the commit and say so in the report.

---

