# Batch E report — Plan 5 T7 / T9 / T10

Base `c66c71d`. Status: done.

## T7 Layout — `db81a7e`

7 MDX pages + `Layout/Specimens`. Deleted Spacing/Shape; moved Radii / BorderWidths (R56 play) / DepthLadder / Stacking. Dropped Shape from storySort. `storybook:test -- layout.stories` 11/11.

## T9 Marketing — `a2c7d09`

Canvas formats/type + carried `ClearSpace` (LogoLockup = first P) and `StatusAlerts` (four tones; Deferred comment gone). Mapping: 33 of 33; 34 MDX. `marketing.stories` 4/4; brand 14 + colors 13.

## T10 Website kit — `cbb384b`

Fixtures, KitNotice, expectNoHorizontalOverflow, WebsiteKit. Homepage toast + two-step booking; Homepage360 no sideways scroll + Menu. 800px probe failed as required, then removed.

## Gates (once, before T10)

`run-many -t typecheck lint test build` green after import-sort + format. `format:check` / `sync:check` ok. `storybook:test` 103 files / 970 tests. `guard:founder` clean. No cold-cache flake.

## Concerns

Header `actions` at lg; 360 uses the drawer only (compact Search+Cart overflowed 67px). Toast play uses `toBeInTheDocument` (pop starts at opacity 0).

## Ruling

- Ruling: DepthLadder names from `tokensWithPrefix("shadow-","primitive")`, not a hand list (includes `shadow-inset`).
- Ruling: no `compactActions`; drawer covers below-lg (logo + Pure veg + cart + Menu overflowed 360).
- Ruling: toast assert is in-document, not visible, because `animate-toast-pop` starts opacity 0.
- Ruling: story Cluster cards `min-w-0` not `min-w-50`.
