### Task 1: Tokens: state layer, scrollbar, press scales, spacing, pop-in

**Files:** `packages/design-tokens/tokens/primitive/{color,motion,space}.json`, `tokens/semantic/color.json`, `tokens/surface/{brand,ink,soft}.json` (descriptions only, R137), `contrast-pairs.json`, `packages/ui/src/lib/component-variants.ts`, `packages/ui/src/styles.css`, the design-tokens specs, `apps/storybook/src/foundations/spacing/layout-rhythm.mdx`.
**Source:** audit-foundations §Tokens (Missing + Different value) · audit-atoms §Cross-cutting (state layer, scales, pop-in) · audit-organisms §Cross-cutting (token list).

- [ ] **Step 1: Failing token specs.** In the design-tokens package spec, assert that each new token exists with its value:

```ts
it.each([
  ["--color-state-hover", "var(--color-pink-50)"], ["--color-state-press", "var(--color-pink-100)"],
  ["--color-state-hover-neutral", "var(--color-ink-100)"], ["--color-state-press-neutral", "var(--color-ink-200)"],
  ["--color-state-press-danger", "#f8d4d4"], ["--color-state-hover-on-color", "var(--color-white-alpha-16)"],
  ["--color-state-press-on-color", "var(--color-white-alpha-28)"], ["--color-state-hover-tint", "rgba(26, 18, 22, 0.06)"],
  ["--color-state-press-tint", "rgba(26, 18, 22, 0.12)"], ["--color-state-disabled-fill", "var(--color-ink-100)"],
  ["--color-state-disabled-ink", "var(--color-ink-400)"],
  ["--color-scrollbar-thumb", "var(--color-pink-200)"], ["--color-scrollbar-thumb-hover", "var(--color-pink-300)"],
  ["--color-scrollbar-track", "transparent"], ["--spacing-scrollbar", "8px"],
  ["--motion-press-scale-icon", "0.92"], ["--motion-press-scale-page", "0.94"], ["--motion-press-scale-card", "0.99"],
  ["--motion-press-scale-stepper", "0.9"],
  ["--spacing-gutter-mobile", "20px"], ["--spacing-section-y-mobile", "56px"],
])("%s = %s", (name, value) => expect(themeVar(name)).toBe(value));
```
Use whatever helper the existing token spec uses to read built variables (`themeVar` is a placeholder for that helper; find it in `packages/design-tokens/src/*.spec.ts`). Adjust the reference format to how the build emits aliases (literal hex or `var(--…)`): the value must equal the handoff's `DS/tokens/colors.css:116-136`. Also assert `--spacing-gutter-fluid` = `clamp(20px, 4vw, 40px)` and `--spacing-section-y-fluid` = `clamp(56px, 7vw, 96px)`. Run `pnpm nx test design-tokens` → FAIL.
- [ ] **Step 2: Add the tokens** exactly as audit-foundations §Tokens/Missing specifies:
  - `ink-alpha.06` and `.12`, and the `danger-press` primitive;
  - the semantic `color.state.*` and `color.scrollbar.*` groups (surface-aware where the audit says: on brand/ink, `hover-on-color`/`press-on-color` apply);
  - the press-scale ladder in `motion.json`;
  - gutter/section values in `space.json` (remove the "Handoff value (spec C8)" description).

  Add R137 `$description`s on the kept colours. Run → PASS.
- [ ] **Step 3: Utilities and keyframes** in `styles.css`:
  - `@utility press-scale-icon|page|card|stepper` beside `press-scale`;
  - `@keyframes pp-pop-in { from { opacity: 0; transform: translateY(-4px) scale(.98) } }` + `--animate-pop-in: pp-pop-in var(--motion-duration-fast) var(--motion-ease-out)` in `@theme`, with the exact timings from `DS/tokens/base.css:47`.

  Register every new class name in `lib/component-variants.ts` (state colours in the colour group, press scales and `animate-pop-in` in their groups). Unit: `componentVariants` keeps `bg-state-press` when merged after `bg-surface-card`.
- [ ] **Step 4:** `layout-rhythm.mdx` prose → 20/56. Run `pnpm nx run storybook:test -- foundations` → PASS (the specimens read live tokens).
- [ ] **Step 5: Commit** `feat(tokens): add the handoff's state layer, scrollbar, press scales and pop-in`.

