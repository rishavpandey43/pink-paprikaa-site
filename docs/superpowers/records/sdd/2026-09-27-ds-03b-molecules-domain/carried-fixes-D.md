# Carried fixes for batch D (from review B) — FIRST, fix commits
1. Minor, ruling R95 — field.json:140 `field-select-min` 160px overflows a grid-cols-2 row at the 360 floor (~158px/col). Lower to 128px (placeholder + chrome); keep the ContentSizedParent play green; add a play: two Selects in grid-cols-2 at floor360, no overflow.
2. Minor — surface/ink.json: `step-tracker-marker-off` → match bar-off on ink (white-alpha 25) so upcoming diamonds don't out-shine reached ones.
3. Minor (a11y) — menu-item-card.tsx: focus ring on the whole card when its stretched link has keyboard focus (`has-[a:focus-visible]:` ring on the root); play asserting the ring shows on Tab.
4. Minor — select.test.tsx:385 assert `min-w-0` is dropped for selects.
