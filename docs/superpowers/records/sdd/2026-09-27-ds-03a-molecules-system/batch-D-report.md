# Plan 3a, batch D report (carried fix + Task 7 Alert + Task 8 Toast + Task 9 Snackbar)

Base `374d96c`. Tree clean at the end. Commits, in order:

| SHA | Subject |
| --- | --- |
| `2077071` | fix(ui): blank stepper labels fall back to their defaults |
| `e0c93c6` | feat(ui): add the Alert molecule with a client dismiss leaf |
| `23f0e4d` | docs: re-sort the alert title classes in plan 3a |
| `24d5fdf` | feat(ui): add the Toast and ToastProvider molecules on Radix Toast |
| `a543f3e` | docs: re-sort the toast classes in plan 3a |
| `5bb389a` | feat(ui): add the Snackbar molecule on Radix Toast |
| `a335bb1` | docs: re-sort the snackbar classes in plan 3a |

## Carried fix (`carried-fixes-D.md` item 1, ruling R79)

**Blank stepper labels** (`2077071`).
- `quantity-stepper.tsx` has a module helper, `orDefault(label, fallback)`. It treats `undefined`, `""` and whitespace-only labels as absent (R48).
- Both `aria-label`s use the helper, replacing `??`.
- New test: `it.each(["", "   "])` "falls back to the default button names when a label is blank". It expects `Remove one` / `Add one`.
- TDD: the test failed first (no button named "Remove one"), then all 27 passed.

## Task 7: Alert (+ client dismiss leaf)

**Built:**
- `tokens/component/alert.json` (`text-alert-title`).
- `"alert-title"` in `TEXT`.
- An `alert` contrast group (pink-800 on surface-brand-soft).
- `molecules/alert/{alert.tsx,alert-dismiss.tsx,alert.test.tsx,alert.stories.tsx}`, verbatim from the brief.
- A barrel line at the head of the molecule block (sorted before Field).
- `alert.tsx` is server-safe. `alert-dismiss.tsx` starts with `"use client"`.

**Fold items applied:**
- **Item 8:** `export const OnSurfacesStory: Story = { name: "OnSurfaces", … }`.
- **Item 1:** the subject is lower-case (`add the Alert molecule …`).
- **Items 2 and 17:** sorted barrel line; no layout imports.

**Deviations:**
- The brief expects 14 tests; there are 15, because the six-row tone `it.each` counts each row.
- Plan-doc re-sort (`23f0e4d`). Once `text-alert-title` existed, Prettier re-sorted the title slot classes in the plan (the known trap).

**TDD:** "Failed to resolve import ./alert" first, then 15 passed.

**Dev parity:**

| Dev item | Ruling | Where / why |
| --- | --- | --- |
| each tone fills its soft ground | ADD | fill column in the tone `it.each` |
| full 1px border, never a coloured left edge | ADD | test "carries a full border…" |
| dismiss hit area ≥ 36px (dev: IconButton `sm`) | ADD | `AlertDismiss` `relative before:absolute before:-inset-2` (24px glyph, 40px hit) + assertion |
| caller `className` merges | ADD | test "merges a caller className…" |
| `Narrow` story (360px, title + dismiss wrap) | ADD | `Narrow` story |
| `role="status"` for every tone | ALREADY | `status` for all but `danger`, which is `alert` (deviation 11, better) |
| title above message; flush one-liner without title; one action; dismiss | ALREADY | tests "is a polite status…", "renders its action slot…", "offers a dismiss button only…" |
| glyph not overridable ("the tone is the mark") | DROP | contracts §5 `AlertProps.icon` (the handoff PG hint uses its own glyph) |
| warning glyph in tandoor, body text heading-coloured | DROP | spec D4 / §5.3: the tone's `text-text-*` token paints glyph and text |
| `Tones`, `WithAction`, `MessageOnly`, `Dismissible` stories | ALREADY | `InfoAndSuccess`, `WarningAndDanger`, `BrandWithAction`, `Nudge` / `Neutral`, `Dismissible` |
| light island on dark fields (not in dev) | ADD | `data-surface="light"` test + `OnSurfaces` story |

I checked this against dev's `alert.test.tsx`: all 9 tests map to a row above. So do the 6 dev stories.

**Gate:**
```
pnpm nx build design-tokens → green
run-many -t typecheck lint test -p ui design-tokens --skip-nx-cache → tokens 255 · ui 57 files / 931 → Successfully ran
pnpm nx run storybook:test   → 51 files / 539 passed
storybook:build              → Successfully ran
pnpm nx format:check         → failed on the plan doc only → re-sorted (23f0e4d) → exit 0
```

## Task 8: Toast + ToastProvider (client, Radix Toast)

**Built:**
- `tokens/component/toast.json` (`toast-success-bg`, `text-toast`, `text-toast-action`).
- `"toast"` and `"toast-action"` in `TEXT`.
- A `toast` contrast group on ink.
- `lib/notification.ts` (not exported).
- `molecules/toast/{toast.tsx,toast.test.tsx,toast.stories.tsx}`, verbatim from the brief.
- A barrel line after SlotPicker.
- Imports go through `radix-ui` (`Toast as RadixToast`), as the brief does and as the other components do.

**Deviations:**
- **jsdom shim in `packages/ui/vitest.setup.ts`.** Clicking the toast's action ("runs its action, then closes…") raised an unhandled `TypeError: target.hasPointerCapture is not a function`. It comes from Radix Toast's swipe `onPointerUp`, because jsdom lacks the pointer-capture methods. All tests passed, but Vitest reported 1 unhandled error.
  - The fix adds `hasPointerCapture`, `setPointerCapture` and `releasePointerCapture` stubs to `Element.prototype`, in the existing "browser APIs jsdom lacks" block. They are installed only where missing, like the other shims there.
  - It is test-only, and Snackbar needs the same shim.
- The brief expects 15 tests; there are 19, because of the `it.each` rows.
- Plan-doc re-sort (`a543f3e`) for the message and action classes.

**Review Focus 5 (SSR hydration):** the brief's `renderToString` → `hydrateRoot` test passes. It records no `onRecoverableError` and no `console.error`, and then the toast shows.

**TDD:** "Failed to resolve import ./toast" first, then 19 passed with no unhandled errors once the shim was in.

**Dev parity:**

| Dev item | Ruling | Where / why |
| --- | --- | --- |
| confirmation announced politely, failure assertively | ADD | Radix `type={tone === "danger" ? "foreground" : "background"}` + announcer `it.each` |
| action has a 44px hit target and press feedback | ADD | `action` slot `-my-3 inline-flex min-h-hit … active:press-scale` + assertion |
| caller `className` merges | ADD | test "merges a caller className…" |
| danger toast with an action (`Retry`); `CustomGlyph` story | ADD | `Status` story action, `CustomGlyph` story |
| every toast rises in (`animate-pp-rise`), pop only swaps the curve | DROP | spec D2: only `pop` animates (`animate-toast-pop`); §8.1 reserves the entrance for `isPop` |
| `action` string + `onAction` | ALREADY | contracts §5 `action: { label, altText, onClick }` |
| four tone fills; brand white on pink; one glyph, overridable; pill | ALREADY | tone `it.each`, "takes a glyph of its own" |
| no action without a handler | ALREADY | the action object carries its handler by type |
| `InContext` story (bottom-centre above the tab bar, 360px) | ALREADY | `Contained` story (`isContained`, deviation 4a) + the page-edge viewport test |
| `Default`, `Tones`, `WithAction`, `Pop` stories | ALREADY | `Playground`, `Tones`, `Status`, `Pop`, `AddToOrder` |
| SSR hydration without mismatch (not in dev) | ADD | Review Focus 5 test |

I checked this against dev's `toast.test.tsx`: all 11 tests map to a row above. The "rises rather than blinking" test is the DROP row.

**Gate:**
```
run-many -t typecheck lint test -p ui design-tokens --skip-nx-cache → tokens 258 · ui 58 files / 950 → Successfully ran
pnpm nx run storybook:test   → 52 files / 546 passed (AddToOrder play green in Chromium)
storybook:build              → Successfully ran
pnpm nx format:check         → failed on the plan doc only → re-sorted (a543f3e) → exit 0
```

## Task 9: Snackbar (client, Radix Toast)

**Built:**
- `tokens/component/snackbar.json` (`snackbar-success-bg`, spacing `snackbar`, `text-snackbar`, `text-snackbar-action`).
- `"snackbar"` in `SPACING`, and `"snackbar"` and `"snackbar-action"` in `TEXT`.
- A `snackbar` contrast group on ink.
- `molecules/snackbar/{snackbar.tsx,snackbar.test.tsx,snackbar.stories.tsx}`, verbatim from the brief. It imports `NotificationProps`, `NOTIFICATION_ICON` and `NOTIFICATION_SURFACE` from Task 8's lib.
- A barrel line sorted after SearchField and before SlotPicker.

**Fold items applied:**
- **Item 14 (R61):** the spacing token `snackbar` carries `"$extensions": { "pink-paprikaa": { "utility": ["max-w"] } }`. Its only use is `max-w-snackbar`.
- **Items 1, 2 and 17:** lower-case subject, sorted barrel line, no layout imports.

**Deviations:**
- The brief expects 21 tests; there are 22 (`it.each` rows).
- Plan-doc re-sort (`a335bb1`) for the root, message and action classes.

**TDD:** "Failed to resolve import ./snackbar" first, then 22 passed.

**Dev parity:**

| Dev item | Ruling | Where / why |
| --- | --- | --- |
| confirmation announced politely, failure assertively | ADD | Radix `type` by tone + announcer `it.each` (as Toast) |
| action 44px hit target + press feedback; dismiss hit ≥ 36px | ADD | `action` `-my-3 min-h-hit … active:press-scale`; `dismiss` `before:-inset-2` (40px) + test |
| caller `className` merges | ADD | test "merges a caller className over the bar" (on the bar, not the anchor) |
| stories: brand tone, `top-center` / `bottom-right` anchors, `Narrow` | ADD | `Brand`, `TopCenter`, `BottomRight`, `Narrow` stories |
| dismiss only when `onClose` is given | DROP | deviation 6: the design system defines Snackbar as a bar "with a text action and a dismiss" |
| `duration={0}` keeps the bar up | ALREADY | `duration={Infinity}` (Radix), test "stays until dismissed…" |
| `isOpen` / `onClose` / `onAction` | ALREADY | `open` / `onOpenChange` (spec §8.2), `action: { label, altText, onClick }` (contracts §5) |
| renders nothing closed; four tone fills; brand white; five positions | ALREADY | tests "leaves nothing behind…", tone and position `it.each` |
| auto-hide after 3.2s; dismiss/action close and report | ALREADY | tests "hides itself after 3.2 seconds…", "closes from its dismiss…", "runs its action…" |
| `Default`, `Tones` (danger + Retry), `UndoAndDismiss` stories | ALREADY | `Playground`, `Success`, `DangerWithRetry`, `UndoAndDismiss`, `LiveCopy`, `TopRight` |
| no F8 hotkey; region `Messages` (not in dev) | ADD | `hotkey={[]}` + every test queries the region by the name `Messages` |

I checked this against dev's `snackbar.test.tsx`: all 13 tests map to a row above. The dev `Positions` story is split into one story per anchor, so that only one `Messages` landmark is open at a time.

**Gate:**
```
run-many -t typecheck lint test -p ui design-tokens --skip-nx-cache → tokens 261 · ui 59 files / 972 → Successfully ran
pnpm nx run storybook:test   → 53 files / 557 passed (R61 catalogue spec green with the marker)
storybook:build              → Successfully ran
pnpm nx format:check         → failed on the plan doc only → re-sorted (a335bb1) → exit 0
```

## Final batch gate (cold)

```
pnpm nx run-many -t typecheck lint test -p ui design-tokens storybook --skip-nx-cache
  design-tokens 261 · ui 59 files / 972 · storybook 53 files / 557 → Successfully ran for 3 projects
pnpm nx format:check → exit 0 · pnpm nx sync:check → up to date · pnpm run guard:founder → clean
```

## Concerns

- **The `vitest.setup.ts` pointer-capture shim is outside the brief's file list.** Without it, the Toast and Snackbar action-click tests pass but Vitest reports an unhandled error. I kept it test-only and guarded, in the existing jsdom-shim block.
- **The lint-staged backup stash from batch C is still there.** `stash@{0}` has not been touched.
- **The R61 marker was not mutation-checked.** I did not remove it to watch `catalogue.spec` fail. It was applied exactly as fold item 14 names it.
