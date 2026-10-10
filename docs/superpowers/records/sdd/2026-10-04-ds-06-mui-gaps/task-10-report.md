# Task 10 report — Molecules A get native props, ref and sx

Commits (base 1fac245), one per component: a2effe1 tabs · ee89e3c toast (+ lib/notification) · 1159c82 snackbar · 34f165c chip-group · 29ab752 filter-bar · b6070ec otp-input · 69f6c9e quantity-stepper · 14b2d5d search-field · 8679f06 slot-picker · c3645c4 dialog.

## Built
- Tabs, FilterBar: `BaseProps<"div">` on the root (Tabs: Radix Root), `ref` is a plain prop, `sx` via `withSx`.
- Toast, Snackbar: `NotificationProps` now extends `BaseProps<"li">` (minus onPause/onResume); spread on `RadixToast.Root`. Toast merges the caller ref with its own; both compose caller onFocus/onBlur with `useFocusReturn`. Sx goes on the pill/bar (Snackbar: not the anchor).
- ChipGroup, OtpInput, QuantityStepper: `BaseProps<"div">` minus the props that already mean something on the control; spread on the outer wrapper/group. See Rulings.
- SearchField: `sx` on the wrapper (native props already went to the input). SlotPicker: `BaseProps<"fieldset">` + sx.
- Dialog: `BaseProps<"div">` minus title/children on the Content panel; Root props destructured explicitly (exactOptionalPropertyTypes-safe).
- All existing props kept; no stories changed (no Sx stories added — brief asked for tests only).

## TDD
RED: 14 failing tests across 10 files (ref null / classes missing) before implementation; GREEN after. Each component also has an sx+className merge assertion.
Gate: ui 112 files/1772 tests; typecheck + lint (ui) green; prettier clean; storybook:test 110 files/1014 tests (first cold --skip-nx-cache run failed 2 kit stories — app Home, website Homepage at 360px; two re-runs green).

## Rulings
See ledger (5 lines): control-vs-wrapper split for ChipGroup/OtpInput/QuantityStepper, ChipGroup aria-invalid, SearchField/SlotPicker, Dialog panel + id, NotificationProps omit.
