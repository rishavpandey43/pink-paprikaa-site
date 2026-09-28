# Plan 2b final-review fix wave (rides in 2c batch B, ruling R69) — do FIRST, fix commits, report in W2/batch-B-report.md "2b fix wave" section
## Must fix (Important)
1. packages/ui/src/lib/field-control.tsx:24,26,58,201 — `has-[>:disabled]` also matches a disabled TRAILING button (direct child of the box) → whole Input paints disabled. Target the control: `has-[>:is(input,textarea,select):disabled]` (+ the `group-has-…/field` forms). Story with a disabled trailing button asserting computed text colour = text-body.
2. packages/ui/src/atoms/radio/radio.tsx:37-39 (+ Text tone="danger" from 2a) — `text-text-{danger,success,warning}` not overridden on brand/ink and absent from contrast-pairs → 1.33–1.57:1 on brand, 2.89–3.42:1 on ink. Add the three status text colours to the ink + brand contrast groups (see them fail), then add brand/ink surface overrides (light restores automatically via sd.config). Add an errored-group row to Radio's OnSurfaces story.
3. Ruling R67 not applied: let `OnSurfaces` (packages/ui/src/lib/story-surfaces.tsx) take the grounds to show; Checkbox/Radio/Switch OnSurfaces drop the brand row; ProgressBar's brand row uses tone="inverse".
## Early ride-along (do now)
4. field-control.tsx:87 read-only Select fill: add `has-[>:disabled]:bg-surface-sunken` (don't rely on ink-100 == surface-sunken).
5. field-control.tsx:15 — add a test: a disabled <fieldset> greys its fields.
6. rating.tsx:138 — accessible name uses toFixed(1) too ("4.0 out of 5").
7. tools/eslint-config/atomic-layering.js:83 — lib/ block bans importing molecules/organisms and non-Icon atoms; tests.
8. apps/storybook/src/docs-kit/library-source.ts — exclude `!**/story-*.tsx`.
9. spinner.tsx:48 — remove `aria-label` from SpinnerProps (Omit), so it can't be silently outranked.
10. radio.tsx:84 — blank message ("" / false) treated as none per R48 (and the type requires a non-blank string or element).
11. packages/ui/src/styles.spec.ts:50 — assert the it.each list is non-empty; loosen the exact-format string match to a regex.
12. packages/ui/src/index.ts:40-41 — path order.
