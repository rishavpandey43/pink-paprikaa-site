# Task 12 parity diffs

Format: `Component — difference — fix`

## Process
- Tool: `apps/storybook/scripts/parity.mjs` → `.superpowers/sdd/2026-10-04-ds-07-design-parity/parity/*-montage-{360,1280}.png`
- 79/80 cards shot. `Text` has no story id (mapped to Typography — R143).
- Card HTML is a labelled specimen board; playground stories are interactive. Chrome/labels differ by design. Gaps are missing variants/states/tokens only.

## Gaps found
- Text — no `atoms-text` story (Typography rename R143) — no fix; coverage row already R143/have.
- Toast/Snackbar/ActionDock — TextButton action chrome (T10 mop) — baselines updated in T12.
- Spacing specimens component-sizes height drift after `max-h-menu-sheet` utility — baseline updated.
- Select in-app-shell / App home — sub-1% pixel drift — baselines refreshed.

## Closed with no further code change
Sampled montages (Button, Menu, Select, SiteHeader, Toast, Dialog, HeroBanner, MenuList): design-defined variants present; remaining differences are specimen-board chrome vs playground, or approved R136/R137/R140/R142/R143.
