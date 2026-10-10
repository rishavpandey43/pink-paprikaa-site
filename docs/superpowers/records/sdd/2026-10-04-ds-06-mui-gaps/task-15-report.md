# Task 15 report — Combobox, Fab, SpeedDial, DatePicker/Calendar (BASE 066c076)

Commits: 6de76d6 combobox · d6ffea2 fab · 4170962 speed dial · 1f80238 date picker + calendar.
15b (Select rewrite) and 15c (enquiry DatePicker) NOT started — owner HOLD 2026-10-04.

## Built
- Combobox (molecule): hand-built WAI-ARIA 1.2 combobox, `aria-activedescendant`, diacritic-insensitive filter + `<mark>` highlight, clear button, loading/empty status, hidden input, controlled/uncontrolled value and text. Field look from `lib/field-control`.
- Fab (atom) + `fab.json` (`fab-md` 48 / `fab-lg` 56, registered in SPACING): round or extended, primary/secondary, `position` fixed corners above the dock, `asChild`.
- SpeedDial (molecule): Fab trigger, link/button actions with label chips, four directions, axis arrow keys, Escape/outside-press close, controlled `open`.
- DatePicker + Calendar (molecule): react-day-picker 10.0.2 under token classes only (no library CSS), Monday start, en-IN, single/range, 1–2 months, `lib/format-date.ts` (`formatDate`, `toIsoDate`) with spec.
- Exports in `index.ts`: Combobox, Fab, SpeedDial, DatePicker, Calendar (+ `DateRange`, `Matcher` types).

## TDD
RED each time: module unresolved. GREEN: combobox 20, fab 13 (+ tokens rebuilt), speed-dial 16, date-picker 21, format-date 6.
Stories: Combobox 10, Fab 10, SpeedDial 4, DatePicker/Calendar 11 (Playground, Calendar*, TwoMonths, InFieldWithError, Mobile360, computed-style check for selected/range/hover).

## Gate (this task)
ui typecheck + lint (only the known menu.test max-lines warning) + test 121 files/1966; design-tokens 288; `web:build`, `format:check`, `guard:founder` green; `storybook:test -- combobox fab speed-dial date-picker` 4 files/35 green (first run after the dependency install: Vite re-optimised and reloaded — re-run green).

## Plan vs code
- Fixture weekdays: 4 Oct 2026 is a Sunday (brief said Sat); expectations shifted by one day.
- react-day-picker 10: no `fromDate/toDate` props (mapped to matchers + start/endMonth); disabled day = disabled button in `td[data-disabled]`.
- `autoFocus` prop renamed `shouldFocusDay` (jsx-a11y/no-autofocus + boolean-prefix rule).
- Brief's `mb-dock-clearance` invalid (token is `bottom`-only) → `bottom-dock-clearance md:bottom-6`.

## Rulings
In `.superpowers/sdd/2026-10-04-ds-06-mui-gaps/progress.md` (10 lines under "Task 15").

## Concerns
- Visual QA was by computed-style plays, not eyes: worth a look at Calendar range ends and SpeedDial chips in Storybook.
- Combobox/DatePicker use `role=presentation` wrappers for delegated handlers (lint-clean, no disables).

## Review fixes (I1–I3)

- I1: `stepIndex` now starts from `n` when stepping up from nothing-active (-1); ArrowUp lands on the last match. Regression test added (type "pan" → ArrowUp → Paneer Butter Masala active).
- I2: `Field` label gets `id="{controlId}-label"`; Combobox reads the input's `labels[0].id` on open and names the listbox with `aria-labelledby` (only when no `aria-label`). New test: in-Field open listbox named "Dish" + axe clean.
- I3: registered `calendar-selected-day` (color-ink-000 on color-pink-500, min 3, exception brand-fill) in contrast-pairs.json, same as icon-button-count/offer-seal-brand.
- Evidence: `pnpm nx test ui -- combobox field date-picker calendar` → 7 files, 112 tests pass; `pnpm nx test design-tokens` → 290 pass; `nx run-many -t lint typecheck -p ui` green; format:check green.
