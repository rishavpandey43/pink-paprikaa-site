# Task 7 report — Atoms A get sx + shared prop names

Commits (base 425aafe): fd76fc4 button · 6ce1f07 icon-button · d6ec3d5 badge · e0eb8ce tag · 7e200c9 card · 71e3ca9 avatar · 0b7b901 divider · 6af007a skeleton

## TDD
- RED (all 8 test files edited first): `pnpm nx test ui -- button icon-button badge tag card avatar divider skeleton` → 8 files failed, 24 tests failed (sx class missing / old class not replaced; Badge `color`/`variant`, Tag `color`, Card `surface` not applied).
- GREEN per component after implementing; final `ui:test` 112 files / 1732 tests; `storybook:test` 110 files / 1005 tests; typecheck + lint (ui, storybook) clean; format:check and sync:check clean.
- Button: `sx={{ px: 8, mt: 4 }}` asserts `px-8 mt-4` present AND `px-5` absent (withSx puts sx before className; tailwind-merge keeps the last conflicting class).
- Parity: Badge/Tag/Card variant-map strings were moved, not retyped; Badge uses compoundVariants from the old tone strings (brand→brand/solid, soft→brand/soft, ink→neutral/solid, neutral→neutral/soft, status→soft). Tests assert the old class strings.

## Call sites
Badge `tone` rewritten in 19 files (stories, kits, filter-bar, menu-item-card/row, review-card, order-tracker doc comment, contrast-matrix `VERDICT_COLOR`). Tag `tone` → `color` (stories). Card brand/ink → `surface` (card stories, layout stories, app-screens kit; loyalty-card). `tagVariants` users (chip-group, filter-bar) unaffected.

## Stories
Button `Sx` story (mt 4, w full); Badge `Tones`→`Colors` (color × variant) + `StatusColors` + `Sx`; Tag `Tones`→`Colors`; Card `BrandInk` uses surface.

## Rulings
See ledger: Badge status colours soft-only; Card `surface` typed brand|ink and replaces variant; LoyaltyCard call-site adaptation.

## Notes
- Plan's filter `atoms/(button|…)` for storybook:test is not a regex in vitest; ran by path substrings and the full suite (110 files pass).
- Lint (perfectionist/sort-imports) caught import order in avatar/divider/skeleton before commit; fixed via `ui:lint --fix`.
