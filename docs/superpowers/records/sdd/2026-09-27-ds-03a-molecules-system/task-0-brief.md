### Task 0: Reconcile with the code as built

Plans 1, 2a, 2b and 2c were written in parallel with this one and executed before it. This task proves every interface this plan consumes exists exactly as the code below uses it, and patches the later tasks of **this file** where reality differs — before any molecule is written.

**Files:**

- Modify (only if a check fails): this plan; `packages/ui/src/atoms/input/input.tsx` (+ its test)

**Interfaces:**

- Consumes: everything listed in the Contracts and Depends-on lines above.
- Produces: a green baseline and a "Reconciliation notes" list appended under this task.

- [ ] **Step 1: Baseline is green**

Run:

```bash
git log --oneline | head -60
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache \
  && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static 2>&1 | tail -15 \
  && pnpm nx run @pink-paprikaa-web/storybook:build 2>&1 | tail -5
```

Expected: the Plan 1, 2a, 2b and 2c commits are in the log and every target is green. If anything is red, stop: an earlier plan is unfinished.

- [ ] **Step 2: The library internals this plan reuses exist with the declared shapes**

Run:

```bash
cd packages/ui
rtk proxy grep -n -E "^export (function|const|type|interface) " \
  src/lib/component-variants.ts src/lib/heading.ts src/lib/link-as.ts src/lib/field-status.ts \
  src/lib/field-control.tsx src/lib/choice-control.tsx src/lib/symbol-mark.tsx src/lib/story-surfaces.tsx
rtk proxy grep -n -E "aria-current|export function fakeRegister" src/lib/link-as.ts vitest.setup.ts
rtk proxy grep -rn -E "@utility mask-symbol|--pp-symbol-mask" src/lib/*.css
rtk proxy grep -n -E "@utility (transition-control|z-toast|duration-fast|duration-base|press-scale)|--animate-(toast-pop|sheet-in):" src/styles.css
rtk proxy grep -n -E "^const (TEXT|SPACING) = " src/lib/component-variants.ts
cd ../..
```

Expected, and where each is used:

| Internal                                                                                                                                                                                                                                                                             | Shape relied on                                     | Used by                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `componentVariants`, `TEXT`, `SPACING`                                                                                                                                                                                                                                               | Plan 1                                              | every task                                                                                              |
| `HeadingLevel`, `headingTag`                                                                                                                                                                                                                                                         | Plan 2a                                             | EmptyState, SectionHeader                                                                               |
| `LinkAs`, `LinkAsProps` with `"aria-current"?: "page" \| "step" \| "true" \| undefined` (ruling R13)                                                                                                                                                                                 | Plan 2a                                             | Breadcrumb, Pagination — if the `\| undefined` is missing, Task 13 spreads `aria-current` conditionally |
| `FieldStatus`, `FIELD_STATUS_ICON` (`error` → CircleAlert, `success` → CircleCheck, `warning` → TriangleAlert)                                                                                                                                                                       | Plan 2b                                             | Task 1 `FieldMessage`                                                                                   |
| `FieldControl({ size, status, icon, isLoading, isReadOnly, trailing, className, children: (controlClassName) => … })` — sets `data-surface="light"`, draws the status glyph and the pulsing loading mark; `fieldControlVariants({ size, status }).root(…)` — the same box as classes | Plan 2b `lib/field-control.tsx`                     | SearchField (component), OtpInput (cells, via the variants)                                             |
| `joinIds(...ids)`                                                                                                                                                                                                                                                                    | Plan 2b `lib/choice-control.tsx`                    | SearchField, SlotPicker                                                                                 |
| `OnSurfaces({ children })`                                                                                                                                                                                                                                                           | Plan 2a `lib/story-surfaces.tsx`                    | every `Surfaces`/`OnSurfaces` story                                                                     |
| `SymbolMark({ className })` → `<span aria-hidden="true" class="mask-symbol …">`, painted in `currentColor`, sized by class — ruling R19 (one shared CSS mask, no path data per instance)                                                                                             | Plan 2a `lib/symbol-mark.tsx`, Plan 1 `mask-symbol` | EmptyState, StepTracker                                                                                 |
| `transition-control` utility                                                                                                                                                                                                                                                         | Plan 2a                                             | QuantityStepper                                                                                         |
| `fakeRegister(name)` → `{ name, onChange, onBlur, ref }` spies                                                                                                                                                                                                                       | Plan 2b `vitest.setup.ts`                           | Field                                                                                                   |

(Plan 2b also exports an internal `FieldControlProps` from `lib/field-control.tsx`; this plan's public `FieldControlProps` lives in `molecules/field/field.tsx`. No file imports both, so the names never meet.)

- [ ] **Step 3: The atoms this plan composes behave as the code below assumes**

Read each file and tick the row, or patch the named task:

| Atom file (`packages/ui/src/atoms/…`)  | This plan relies on                                                                                                                                                                                                                           | If different, patch                                                                                                                                                                                                  |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `icon/icon.tsx`                        | `Icon({ icon, size: "xs"…"xl", label?, className })`; `className` merges through `componentVariants` (so `size-10`, `size-3` override the size class); unlabelled icons are `aria-hidden`; lucide adds `lucide-<name>` classes to the `<svg>` | every task                                                                                                                                                                                                           |
| `price-tag/price-tag.tsx`              | the default `ink` tone paints the amount `text-text-heading` (follows the surface)                                                                                                                                                            | Task 18: if not, pass the total `className="text-text-heading"`                                                                                                                                                      |
| `input/input.tsx`                      | spreads `id`, `aria-describedby`, `aria-invalid`, `required`, `name`, `onChange`, `onBlur`, `ref` onto the `<input>`; a passed `aria-invalid` survives when `status` is `default`                                                             | if `status` overwrites a passed `aria-invalid`, change Input to `aria-invalid={props["aria-invalid"] ?? (status === "error" ? true : undefined)}` with a test, commit `fix(ui): input keeps a caller's aria-invalid` |
| `select/select.tsx`                    | `Select({ options, placeholder, status, defaultValue })`                                                                                                                                                                                      | Task 2 stories                                                                                                                                                                                                       |
| `switch/switch.tsx`                    | `Switch({ label, isLabelHidden, defaultChecked })`                                                                                                                                                                                            | Task 17 stories                                                                                                                                                                                                      |
| `badge/badge.tsx`, `button/button.tsx` | `Badge({ tone: "soft" })`; `Button({ variant: "ghost" \| "primary" \| "secondary", size: "sm", iconAfter })`                                                                                                                                  | stories                                                                                                                                                                                                              |

- [ ] **Step 4: Every token the code below names exists**

Run:

```bash
node -e '
const t = require("./packages/design-tokens/dist/tokens.json");
const names = new Set(t.filter((e) => e.surface === null).map((e) => e.name));
const need = ["color-text-body","color-text-heading","color-text-muted","color-text-subtle","color-text-brand",
  "color-text-on-brand","color-text-on-inverse","color-text-success","color-text-warning","color-text-danger",
  "color-text-info","color-surface-page","color-surface-page-alt","color-surface-card","color-surface-sunken",
  "color-surface-brand","color-surface-brand-soft","color-surface-inverse","color-border-subtle",
  "color-border-default","color-border-brand","color-border-brand-soft","color-brand-hover","color-status-success",
  "color-status-success-soft","color-status-warning","color-status-warning-soft","color-status-danger",
  "color-status-danger-soft","color-status-info","color-status-info-soft","color-mint-strong","color-pink-300",
  "color-pink-500","color-pink-700","color-pink-800","color-ink-000","color-ink-200","color-ink-400",
  "color-ink-700","color-white-alpha-25","color-white-alpha-50","color-white-alpha-70","color-focus","shadow-3",
  "shadow-focus-ring","spacing-hit","spacing-dock-clearance","spacing-text-measure-narrow","radius-xs",
  "radius-sm","radius-md","radius-lg","radius-xl","radius-pill","text-h2-fluid","text-h3","text-h4",
  "text-body-lg","text-body","text-body-sm","text-caption","text-overline","text-mono","font-weight-bold",
  "font-weight-black"];
const missing = need.filter((n) => !names.has(n));
console.log(missing.length ? "MISSING: " + missing.join(", ") : "all tokens present");
for (const f of ["brand", "ink", "light"]) {
  const j = require(`./packages/design-tokens/tokens/surface/${f}.json`);
  const root = Object.keys(j)[0];
  console.log(f, root, Object.keys(j[root]));
}
'
```

Expected: `all tokens present`, and each surface file prints `surface-<name>` with a `color` group (this plan adds component skins inside it). A missing name means an earlier plan renamed it: patch every occurrence in this file.

- [ ] **Step 5: Lint escapes the contract types need**

`FieldControlProps` declares the quoted property `"aria-describedby"`. Run:

```bash
rtk proxy grep -n -A3 "requiresQuotes" tools/eslint-config/rules/naming-convention.js
```

Expected: Plan 2a's `typeProperty` + `requiresQuotes` escape. If it is missing, stop — Plan 2a Task 1 is unfinished.

- [ ] **Step 6: Story tooling**

Run:

```bash
node -e "console.log(require.resolve('storybook/test', { paths: ['packages/ui'] }))"
rtk proxy grep -rln "storybook/test" packages/ui/src | head -3
rtk proxy grep -n -E "viewports|mobile1|defaultViewport" apps/storybook/.storybook/preview.tsx | head -5
```

Expected: `storybook/test` resolves (root devDependency) and earlier stories already import it; note the id of the 360px viewport (Task 12's `Long` story uses `mobile1`).

- [ ] **Step 7: Dev parity tables present on every ported-component task**

Contracts §0.0: every molecule here is ported from `dev`. Run:

```bash
rtk proxy grep -n -E "^### Task|^\*\*Dev (reference|parity)" docs/superpowers/plans/2026-09-27-ds-03a-molecules-system.md
```

Expected: Tasks 2–19 each carry a `**Dev reference:**` line and a `**Dev parity:**` table (Task 1 carries the `FieldMessage` table). A missing one means the task was edited after the dev-parity audit — restore it from `.superpowers/sdd/dev-parity/03a-audit.md` before executing. Rows ruled `DELTA` wait on the controller's contract ruling: implement them only if the contracts file has gained the prop.

- [ ] **Step 8: Record and commit the reconciliation**

Append a `**Reconciliation notes:**` list under this task (one line per patch made, or "none"). If this file changed, commit it:

```bash
git add docs/superpowers/plans/2026-09-27-ds-03a-molecules-system.md
git commit -m "docs: reconcile plan 3a with the code as built

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

