# Task 13 report — Storybook kits, docs and authoring docs on the new API

Commit (base 1807a28): 1f19df6 docs(storybook): document the shared api and move the kits onto it.

## Grep gate (Review Focus #4)
RED: hits in kits (2× Toast `tone="brand"`), brand.stories (11 captions), type.stories + TypeSpecimen (`tone`), Toast/Snackbar stories/tests/lib comment. GREEN: `grep -rnE '\btone=|<Text\b|atoms/text/text' apps/storybook/src packages/ui/src --include=*.tsx --include=*.mdx` → no output.
- Toast/Snackbar `tone` → `color` (Task 6 table; Task 10 had not done it). ink→neutral. `NotificationTone`→`NotificationColor`.
- brand.stories captions cleared (Task 8 minor); pattern.mdx / body.mdx prose updated.
- TypeSpecimen (docs-kit) `tone` → `color`.

## Added
- `foundations/system/system.{mdx,stories.tsx}` (Foundations/System (sx)): 7 stories (Spacing, Display, Size, FlexChild, Look, Colour, Responsive), sx printed beside each live example; Responsive play asserts computed margin at the 360px floor. MDX has prose + Canvas only. storySort gains "Foundations".
- AUTHORING.md §13 (41 lines ≤ 60). RULES.md 3028 → 3419 B (≤ 3.5 KB), +3 lines. CLAUDE.md: one sentence.

## Gate 4
typecheck, lint, test (ui 1814), build, format:check, sync:check, storybook:test (111 files/1021 tests), guard:founder all green.
First run: storybook `app` kit "Home" toBeVisible on the toast (same animation flake as Tasks 10–12); also fixed a TS error (`as="code"`) and lint (import order, arbitrary grid value) in my new stories; re-run green.

## Concerns
- Commitlint rejected a long single-line body; reworded body, no hook bypass.
- Kit-story toast flake persists (pre-existing, not from this change).
- `docs/superpowers/records/sdd/**` archive still mentions NotificationTone (historical, untouched).
