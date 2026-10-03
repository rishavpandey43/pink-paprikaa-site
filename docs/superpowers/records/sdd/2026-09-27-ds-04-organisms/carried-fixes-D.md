# Carried fixes for batch D (from review B + batch C) — FIRST, before Task 6
D1. Minor — stat-band.test.tsx:57: the "white on brand/ink" row pins only soft and ink; add tone="brand" → numbers `text-text-on-inverse` (fails if STAT_TONE.brand were pink-on-pink).
D2. Minor — stat-band.test.tsx:33: drop the extra empty-sub test (isShown lives in Stat and is owned by Stat's tests; "" cannot tell isShown from truthiness). Keep the plan doc in sync.
D3. Minor — hero-banner.test.tsx:90: pin pattern defaults fully — it.each ink and soft defaults, pattern="none" on a flooded tone renders no layer, and `faint` density reaches PatternField.
D4. Minor — hero-banner: the dev-parity row "split stacks under the copy at 360" needs an assertion — `lg:grid-cols-2` on the inner element for split, absent for center (or reword the row as story-only; prefer the assertion).
D5. Minor — hero-banner.tsx:136: meta facts — filter entries with isShown so a "" entry renders no bare li + diamond; test it.
D6. Minor — stat-band.json:7: give `stat-band-gap` a `$description` like its sibling.
D7. Minor — plan Task 4 code: sync the built `role="list"` (and any other built-vs-plan drift in Tasks 4–5) into the plan doc, as C3 did for Tasks 1–3.
All plan-doc syncs are `docs:` commits; code/test changes are `test(ui):`/`fix(ui):` commits; keep the plan's Task 2/3 code equal to the build after D1–D5.
