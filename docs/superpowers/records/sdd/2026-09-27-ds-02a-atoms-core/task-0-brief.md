### Task 0: Reconcile with the code as built

Plan 1 was executed in parallel with the writing of this plan. Every interface this plan consumes is checked here against the tree. If anything differs, patch the later tasks of **this plan** to match reality before starting Task 1, and list each patch in your report.

**Files:** none (read-only).

- [ ] **Step 1: Plan 1 is in the branch**

Run:

```bash
git log --oneline -40 | rtk proxy grep -E "rebuild the token system|library core|token-only classes|brand artwork, Icon and Logo|consume the design system like an app"
```

Expected: all five commits listed. If any is missing, stop — Plan 1 is not done.

- [ ] **Step 2: Barrel, variant builder, test helper, Icon, artwork**

Run:

```bash
cat packages/ui/src/index.ts
rtk proxy grep -nE "^const (TEXT|SPACING|RADIUS|SHADOW|ANIMATE) = |export const (componentVariants|twMergeConfig)|export type \{ VariantProps \}" packages/ui/src/lib/component-variants.ts
rtk proxy grep -n "export async function expectNoA11yViolations" packages/ui/vitest.setup.ts
rtk proxy grep -nE "export (type IconComponent|interface IconProps|function Icon)|xs: \"size-icon-xs\"" packages/ui/src/atoms/icon/icon.tsx
rtk proxy grep -nE "export (type Mark|interface Artwork|const ARTWORK)" packages/ui/src/lib/brand-artwork.ts
rtk proxy grep -n "@utility mask-symbol\|--pp-symbol-mask" packages/ui/src/lib/brand-artwork.css
```

Expected: the barrel exports `Icon`, `IconComponent`, `IconProps`, the three glyphs, `Logo`, `LogoProps` and `RevealObserver`. The five list constants and three exports exist. `expectNoA11yViolations(container: Element, options: RunOptions = {})` is present. `Icon` takes `size: "xs"|"sm"|"md"|"lg"|"xl"` and renders `size-icon-*` classes. `ARTWORK` is exported (there is no JS data-URI export — ruling R25); `brand-artwork.css` defines `--pp-symbol-mask` and `@utility mask-symbol` (R19). (Task 1's `symbol-mark.test.tsx` asserts that the symbol markup carries no `id=`. If that assertion ever fails, `SymbolMark` must replace `__ID__` with a `useId`-derived prefix, as `Logo` does.)

- [ ] **Step 3: Every token and utility this plan consumes exists**

Run:

```bash
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache
node -e '
const c = require("./packages/design-tokens/dist/tokens.json");
const base = new Set(c.filter((e) => e.surface === null).map((e) => e.name));
const need = ["color-pink-50","color-pink-100","color-pink-200","color-pink-500","color-pink-600","color-pink-700","color-pink-800",
 "color-ink-000","color-ink-100","color-ink-200","color-ink-300","color-ink-400","color-ink-600","color-ink-700","color-ink-900",
 "color-white-alpha-70","color-white-alpha-85","color-surface-page","color-surface-page-alt","color-surface-card","color-surface-sunken",
 "color-surface-brand","color-surface-brand-soft","color-surface-inverse","color-surface-glass","color-text-heading","color-text-body",
 "color-text-muted","color-text-subtle","color-text-brand","color-text-on-brand","color-text-on-inverse","color-text-link",
 "color-text-link-hover","color-text-success","color-text-warning","color-text-danger","color-border-subtle","color-border-default",
 "color-brand-hover","color-brand-active","color-status-success","color-status-success-soft","color-status-warning",
 "color-status-warning-soft","color-status-danger","color-status-danger-soft","text-display-1","text-h1","text-h1-fluid","text-body",
 "text-overline","text-mono","text-caption","text-canvas-hero","text-canvas-overline","container-prose","container-prose-narrow",
 "aspect-square","aspect-4-3","aspect-3-4","aspect-4-5","aspect-16-9","aspect-16-10","aspect-wide","radius-md","radius-lg","radius-xl",
 "radius-pill","shadow-1","shadow-2","shadow-3","shadow-brand","blur-glass","pattern-tile-56","pattern-tile-64","pattern-tile-72",
 "pattern-tile-80","pattern-tile-86","pattern-tile-96","pattern-opacity-default","pattern-opacity-light","pattern-opacity-faint",
 "duration-fast","duration-instant","ease-out","motion-press-scale","motion-lift-y"];
const missing = need.filter((n) => !base.has(n));
console.log(missing.length ? "MISSING: " + missing.join(", ") : "all consumed tokens present");
for (const f of ["brand","ink","soft","light"]) { const j = require(`./packages/design-tokens/tokens/surface/${f}.json`); const root = Object.keys(j)[0]; console.log(f, root, Object.keys(j[root])); }
'
rtk proxy grep -nE "@utility (duration-fast|duration-base|press-scale|lift)|--animate-(rotate|dot-pulse):" packages/ui/src/styles.css
```

Expected: `all consumed tokens present`. Each surface file prints `surface-<name>` with keys `[ 'color', 'shadow' ]` (soft: `[ 'color' ]`). The styles grep lists `duration-fast`, `duration-base`, `press-scale`, `lift`, `--animate-rotate` and `--animate-dot-pulse`. A renamed token means updating every class in the tasks below that uses it. A surface file with a different shape means rewriting the surface fragments in Tasks 3, 6, 7, 8, 10 and 12 to that shape.

- [ ] **Step 4: Parallel plans have not already created what this plan creates**

Run:

```bash
ls packages/ui/src/lib packages/ui/src/atoms packages/design-tokens/tokens/component
node -e 'const c=require("./packages/design-tokens/dist/tokens.json"); console.log(c.filter((e)=>/^(radius-diamond|color-white-alpha-(16|40|90))$/.test(e.name)).map((e)=>e.name))'
```

Expected: no `heading.ts`, `link-as.ts`, `symbol-mark.tsx`, `control-states.ts`, `story-surfaces.tsx`, and none of this plan's 13 atom folders. If Plan 2b already landed `symbol-mark.tsx`, `control-states.ts` or `white-alpha-16/40/90`, **reuse theirs** and delete the matching creation step here. If a `radius-diamond` token exists, use `rounded-diamond` in StatusDot (Task 13) instead of adding `radius.status-dot`.

- [ ] **Step 5: Baseline is green**

Run:

```bash
pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static 2>&1 | tail -8
pnpm nx run @pink-paprikaa-web/storybook:build 2>&1 | tail -3
```

Expected: `Successfully ran targets typecheck, lint, test for 2 projects` and a finished Storybook build. Plan 1's `icon.tsx` imports `../../lib/component-variants` and its test imports `../../../vitest.setup`, so a green lint here proves those import shapes pass the atom layering rule.

- [ ] **Step 6: Dev parity tables present on every ported-component task**

Contracts §0.0: every atom here is ported from the `dev` branch. Run:

```bash
rtk proxy grep -c '^\*\*Dev parity:\*\*' docs/superpowers/plans/2026-09-27-ds-02a-atoms-core.md
```

Expected: `13` — one table in each of Tasks 2–14 (Icon and Logo are Plan 1). If a task lacks one, stop and audit it against `git show dev:packages/ui/src/atoms/<name>/<name>.{tsx,test.tsx,stories.tsx}` before it runs.

- [ ] **Step 7: Record**

In the report, list every difference found and the task you patched, or write "Plan 1 matched this plan's assumptions".

---

