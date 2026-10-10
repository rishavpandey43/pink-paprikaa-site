# P4 fix wave

SHA: `c66c71d` `fix(ui): settle the Plan 4 review findings in one wave`

1. ReviewCarousel Paging: Previous `aria-disabled` inside `waitFor`.
2. MenuList `variant` via `Pick<VariantProps<typeof menuList>, "variant">`.
3. CartPanel optional slots `?: T | undefined`.
4. CartPanel Playground `play: proveRingsWhole`.
5. Qty 0: CartPanel (LiveCart parent) focuses next stepper or empty heading.
6. Molecule `w-full max-w-*` frames → `w-* max-w-full`.
7. AppShell: deleted `TABS` / `AppTabBar`; inlined TabBar; distinct labels kept.
8. Empty-state new-tab copy: ` (Opens in a new tab)`.
9. `emptyTitle=""` → R79 fallback `"Nothing here yet."` (no empty heading).

**Covering:** ui cart-panel 15 + totals 5; menu-list 20; sb review-carousel 9, cart-panel 7, app-shell 6; molecule stories 187.

**Gates:** run-many typecheck/lint/test/build 12 projects; ui 108/1619; sb 100/955; format:check; sync:check; guard:founder clean.

**Ruling:** Focus lives in CartPanel (QuantityStepper parent), not only LiveCart. `ref` after `{...props}` so the panel keeps the root. Article frames `w-190` (760px). Prose frames `w-160` — adding `w` to `text-measure-prose` fails R61/docs-kit (`utilitiesOf` is max-w only).

**Concerns:** `w-160` is not 64ch.
