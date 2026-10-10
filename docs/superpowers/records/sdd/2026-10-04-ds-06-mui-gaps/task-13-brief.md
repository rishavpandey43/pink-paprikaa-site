### Task 13: Storybook kits, docs and authoring docs on the new API

**Files:**
- Modify: `apps/storybook/src/kits/**`, `apps/storybook/src/foundations/**` (any remaining old prop use)
- Create: `apps/storybook/src/foundations/system/system.mdx` + `system.stories.tsx` (title `Foundations/System (sx)`)
- Modify: `packages/ui/AUTHORING.md` (new section "Shared API: sx, surface, color, status, size, Typography"), `docs/superpowers/slim/RULES.md` (add 5 lines; total ≤ 3.5 KB), `CLAUDE.md` "Current state" (one sentence)

- [ ] **Step 1: Grep gate (RED).** Run `grep -rnE "\btone=|<Text\b|atoms/text/text" apps/storybook/src packages/ui/src --include=*.tsx --include=*.mdx | grep -v "^.*//"`. Expected before the fixes: hits. Fix every hit per Task 6. Re-run. Expected: no output.

- [ ] **Step 2: System docs page.** `system.stories.tsx` has one story per key family (Spacing, Display, Size, Flex child, Look, Colour, Responsive). Each renders a labelled live example with the `sx` object printed beside it (`<Typography variant="mono">{JSON.stringify(sx)}</Typography>`). The Responsive story's play asserts the computed margin at the default viewport. `system.mdx` holds prose + `<Canvas of={…}>` only (docs-kit rule: no className in MDX). The text covers why `sx` (MUI v7 reference), that values are tokens only, `bg` vs `surface`, className-wins, and the CSS budget.

- [ ] **Step 3: AUTHORING.md section** (≤ 60 lines). Cover: every component takes `sx` via `withSx(sx, className)` on its outermost slot · `BaseProps<"el">`/`BasePropsWithColor` · `surface` vs `color` vs `status` decision rule with three examples · size scale · text-rooted components inherit `TypographyProps` (Link as the model) · native props + ref always reach the root.

- [ ] **Step 4:** Run `pnpm nx run storybook:test` (whole suite) → PASS.

- [ ] **Step 5: Commit** `docs(storybook): document the shared api and move the kits onto it`.

- [ ] **Step 6: Batch gate 4** → ledger.

---

