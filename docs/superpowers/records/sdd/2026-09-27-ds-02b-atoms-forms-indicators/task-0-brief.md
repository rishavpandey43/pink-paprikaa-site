### Task 0: Reconcile with the code as built

Plans 1 and 2a are executed before this one. Before writing anything, prove every interface this plan consumes exists as declared; where it does not, patch the affected later tasks of **this file** to reality first.

**Files:**

- Modify (only if a check fails): this plan.

**Interfaces:**

- Consumes: Plan 1 Task 2 tokens, Task 3 formatters, Task 5 `styles.css` + `componentVariants` + `vitest.setup.ts`, Task 7 `Icon` + `brand-artwork.ts`; Plan 2a Task 1 `SymbolMark`, `OnSurfaces`, `transition-control`, the quoted-key naming escape, and Task 2's `text-measure-prose` token; Plan 2a's edits to the shared files.
- Produces: a green baseline and a plan that matches the code.

- [ ] **Step 1: Plan 1 and Plan 2a exports**

Run:

```bash
rtk proxy grep -n "^export" packages/ui/src/lib/component-variants.ts packages/ui/src/lib/brand-artwork.ts packages/ui/src/lib/symbol-mark.tsx packages/ui/src/lib/story-surfaces.tsx packages/ui/src/atoms/icon/icon.tsx packages/ui/vitest.setup.ts packages/utils/src/index.ts
grep -n '"@pink-paprikaa-web/utils"\|"radix-ui"\|"lucide-react"' packages/ui/package.json
rtk proxy grep -n "requiresQuotes" tools/eslint-config/rules/naming-convention.js
```

Expected: `componentVariants`, `type VariantProps` (re-export), `twMergeConfig`; `ARTWORK`, `SYMBOL_DATA_URI_WHITE`; `type SymbolMarkProps`, `function SymbolMark` (inline SVG, `fill="currentColor"`, `aria-hidden`, spreads `className` and `style`); `function OnSurfaces({ children }: { children: ReactNode })`; `type IconComponent`, `interface IconProps`, `function Icon`; `async function expectNoA11yViolations`; `formatCount, formatRupeeRange, formatRupees`; all three dependencies; the `requiresQuotes` escape.

- [ ] **Step 2: Every token and utility this plan consumes is in the build**

Run:

```bash
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache > /dev/null && node -e '
const catalogue = require("./packages/design-tokens/dist/tokens.json");
const have = new Set(catalogue.filter((e) => e.surface === null).map((e) => e.name));
const need = [
  "color-pink-50", "color-pink-100", "color-pink-200", "color-pink-500", "color-ink-000",
  "color-ink-100", "color-ink-200", "color-ink-300", "color-ink-400", "color-ink-500",
  "color-ink-900", "color-mint", "color-veg", "color-heat-1", "color-heat-2", "color-heat-3",
  "color-heat-4", "color-focus", "color-status-danger", "color-status-danger-soft",
  "color-status-success", "color-status-success-soft", "color-status-warning",
  "color-status-warning-soft", "color-text-body", "color-text-heading", "color-text-muted",
  "color-text-subtle", "color-text-brand", "color-text-link", "color-text-on-inverse",
  "color-text-danger", "color-text-success", "color-text-warning", "color-surface-page",
  "color-surface-page-alt", "color-surface-card", "color-surface-sunken", "color-surface-brand",
  "color-surface-brand-soft", "color-surface-inverse", "color-border-default",
  "color-border-subtle", "color-border-brand", "shadow-1", "shadow-2", "shadow-focus-ring",
  "radius-sm", "radius-md", "radius-lg", "radius-pill", "text-body-sm", "text-caption",
  "text-overline", "text-mono", "text-h3", "text-h4", "text-canvas-h2", "font-body",
  "font-display", "font-mono", "font-weight-regular", "font-weight-medium", "font-weight-bold",
  "font-weight-black", "spacing-icon-xs", "spacing-icon-sm", "spacing-icon-md",
  "spacing-text-measure-prose", "z-toast",
];
const missing = need.filter((name) => !have.has(name));
console.log(missing.length === 0 ? "all consumed tokens present" : "MISSING: " + missing.join(", "));'
rtk proxy grep -n "@utility transition-control\|@utility duration-fast\|@utility duration-base\|@utility duration-slow\|@utility z-toast\|--animate-mark-pulse\|--animate-skeleton" packages/ui/src/styles.css
```

Expected: `all consumed tokens present`; the grep lists every utility and both animations.

- [ ] **Step 3: What Plan 2a changed in the shared files**

Run:

```bash
ls packages/ui/src/lib packages/ui/src/atoms packages/design-tokens/tokens/component
rtk proxy grep -n "color-text-on-inverse" packages/design-tokens/contrast-pairs.json
sed -n '/^const SPACING/,/^];/p;/^const TEXT/,/^];/p;/^const SHADOW/,/^];/p;/^const RADIUS/,/^];/p' packages/ui/src/lib/component-variants.ts
cat packages/ui/src/index.ts
```

Apply, then note each decision in the report:

- If `contrast-pairs.json` already pairs `color-text-on-inverse` with `color-surface-brand`, delete Task 14's contrast step.
- If a token name this plan adds already exists in a list (a Plan 2a collision), prefix this plan's token with its component name in every task that uses it — never let one token carry two meanings.
- Plan 2a's StatusDot owns `radius-status-dot` (2px); this plan's `radius-brand-diamond` is the same corner for the diamonds Rating and SpiceLevel draw. Keep both (one meaning each) and record it in the report for a later consolidation.
- Append this plan's export lines where Plan 2a's `index.ts` convention puts them (grouped by tier, sorted by path).
- **Dev parity tables present on every ported-component task** (contracts §0.0). `rtk proxy grep -c '^\*\*Dev parity:\*\*' docs/superpowers/plans/2026-09-27-ds-02b-atoms-forms-indicators.md` prints `13` (Tasks 2–6, 8–15) and `rtk proxy grep -c '^\*\*Dev reference:\*\* none' docs/superpowers/plans/2026-09-27-ds-02b-atoms-forms-indicators.md` prints `2` (Slider, Countdown). A missing table stops the plan until it is written.

- [ ] **Step 4: Probe the class vocabulary this plan relies on**

Create `packages/ui/src/atoms/probe/probe.tsx`:

```tsx
export function Probe() {
  return (
    <label className="group/choice relative has-disabled:text-ink-400">
      Probe
      <input className="peer sr-only" type="checkbox" />
      <span className="order-last ms-auto size-3/4 size-6/7 max-w-56 max-w-none translate-x-4.5 -rotate-45 rotate-45 appearance-none truncate border-6 ps-11 pe-11 font-regular tabular-nums accent-pink-500 opacity-85 group-has-checked/choice:bg-pink-500 group-has-focus-visible/choice:outline-2 group-has-checked/choice:group-has-disabled/choice:text-ink-400 group-has-aria-invalid/choice:border-status-danger placeholder:text-text-subtle read-only:cursor-default in-aria-invalid:border-status-danger motion-safe:animate-mark-pulse starting:opacity-0" />
    </label>
  );
}
```

Run: `pnpm nx lint @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -15`
Expected: no `tailwindcss/*` error for the probe. If one class is rejected, find its Tailwind 4.3 spelling (`node_modules/tailwindcss/dist/lib.d.ts`, or compile a one-line candidate), then patch every task below that uses it. Then remove the probe: `rm -r packages/ui/src/atoms/probe && git status --short` (nothing from the probe remains).

- [ ] **Step 5: Baseline gate**

Run the gate. Expected: green — so any later red is this plan's.

- [ ] **Step 6: Commit only if this plan was patched**

```bash
git add docs/superpowers/plans/2026-09-27-ds-02b-atoms-forms-indicators.md
git commit -m "docs: reconcile plan 2b with the code plans 1 and 2a produced

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

