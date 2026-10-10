# Carried into T14 (Important from review E)

`apps/storybook/src/kits/website/website-kit.tsx:79` — Book a Table in drawerActions is a Button. SiteHeaderDrawer only closes on `a[href]`. Below lg there are no compactActions, so Homepage360 opens the booking Dialog on top of the open menu dialog.

Fix: close the drawer first (Book as a hash link that also opens booking, or compactActions). Then re-run `pnpm nx run storybook:test -- website`.

Commit first: `fix(storybook): close the website-kit drawer before booking`

Minors from review E wait for T15 fix wave — do not fix them now.
