# Task 9 report — Atoms C get `sx`

Commit: 1fac245 `refactor(ui): give the form atoms sx` (one commit, base 75acfca).

Built: `sx` (via `withSx`) on the outermost element of checkbox, radio (+RadioGroup fieldset), switch, slider, input (input and textarea box), select, rating, spice-level, diet-mark, countdown, icon; tooltip takes it on its content. Checkbox/radio/switch share `lib/choice-control`, so the change is there plus the Props types. Native props unchanged. TDD: tests appended first (RED: 29 failing assertions/tests), then GREEN.

Rulings: see progress.md (shared ChoiceControl; RadioGroup also gets sx; Tooltip sx on content).

Gate 2 (typecheck lint test build, format:check, sync:check, storybook:test, guard:founder): all green. ui 112 files / 1757 tests; storybook 110 files / 1014 tests.
