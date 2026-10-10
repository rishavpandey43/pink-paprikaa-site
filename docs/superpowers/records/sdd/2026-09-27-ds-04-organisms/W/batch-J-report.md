# Batch J — T14 MenuList, T15 CartPanel, T16 stand-ins + parity

## T14 MenuList — `46d4487` feat(ui): add the MenuList organism
Finished WIP (filter server panels + client leaf). Lint: destructure the two lists instead of `!`. 20 unit + 12 stories green.

## T15 CartPanel — `5df884d` feat(ui): add the CartPanel organism
`cart-panel-thumb` 56px `["size"]` + SPACING. `cartTotals` (empty; 960→48/1008; 1180→1239; 1010→51; rate 0). 12 panel tests + 5 totals + 7 stories.

## T16 — `c170dd6` test(ui): organism tier parity review and real layout-story components
AppShell: TabBar / FilterBar / LoyaltyCard / MenuItemRow / Dialog sheet. PostFrame: LogoLockup + OfferSeal. `grep Stand-in|stand-in layouts` empty. No organism code changes.

## Gate
`run-many typecheck lint test build`: storybook:test 954/955 first (ReviewCarousel Paging `aria-disabled` flake). Rerun: 100 files / 955 tests. format:check, sync:check, guard:founder clean.

## Ruling
- CartPanel `title` / `emptyTitle` / `emptyBody` are overridable chrome defaults.
- CartPanel `OnSurfaces` titles are unique per ground (`landmark-unique`).
- StatusTones keeps `DemoHomeScreen` on the light frame; both TabBars have distinct `label`s.
- MenuScreen chilli copy uses chutney, not mayo.
- Overlay-sheet a11y disables `color-contrast` as well as `aria-hidden-focus` (story `rules` replace the preview list — Dialog precedent).
- Pair screenshots not archived; remaining diffs are the brief’s expected set (AA colours, untrue copy, drawer <1024, autogrid, rings, skip/dock, fonts). CartPanel has no egg diet.
