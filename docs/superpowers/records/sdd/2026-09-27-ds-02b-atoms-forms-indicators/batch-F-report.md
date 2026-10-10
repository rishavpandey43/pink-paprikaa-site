# Batch F report: carried fixes 1–6, then Tasks 15–16

Base `4e42d43`. Commits: `3b5d6e2`, `e500c60`, `6fda7cd`, `ca90de6`, `7606082` (carried fixes);
`e550f8e` (T15), `ea5d76b` (T15 R48 follow-up), `137ae96` (T16). No plan re-sort was needed:
`format:check` passed after every task.

Fold-list items applied: 7 (`"tooltip"` appended to `Z`), 8 (barrel sorted by path: countdown
between checkbox and diet-mark, tooltip after text), 9 (trailer). Tooltip uses `delayDuration={0}`
(the plan's amendment).

## Carried fixes (W/carried-fixes-F.md)

| #   | Fix | Commit | Evidence |
| --- | --- | ------ | -------- |
| 1   | Spinner: the label is now an `sr-only` span inside `role="status"`, not `aria-label`. `status` takes its name from the author only, so a plain inner span dropped the name, and both `getByRole("status",{name})` tests failed (seen). The status therefore points `aria-labelledby` at the span (`useId`, which is still server-safe). New test: no `aria-label`, the label is in the text content, and the span is `sr-only`. | `3b5d6e2` | Red: 1 failure, then 2 with a bare span. Green: 12/12. |
| 2   | `field-control.tsx`: the read-only-select compound no longer sets `has-disabled:border-border-default` for every status. Four compounds now set `status default` → `border-border-default`, and `error/success/warning` → `has-disabled:border-status-{danger,success,warning}`. There is a unit `it.each` for the three statuses. The `readOnly / disabled` story gains a read-only `status="error"` select, and its play compares the computed border colour with `--color-status-danger`. | `e500c60` | Story red before the fix: `expected rgb(207, 34, 34)`, received `rgb(220, 211, 215)`, the subtle grey. Green after it. Select/Input stories 23/23. |
| 3   | ProgressBar `OnSurfacesStory` (`name: "OnSurfaces"`), using the default tone on every ground. | `6fda7cd` | ProgressBar stories 8/8. |
| 4   | `select.test.tsx`: the negated two-class `.not.toHaveClass(a, b)` is split into two assertions. Radio: new `InvalidChecked` story (`invalid + checked`) whose play checks a 6px ring with the computed `--color-status-danger` border on an option that is invalid by itself and checked, as GroupError does. The unit test's comment points to it. | `ca90de6` | Radio stories 10/10. ui select/radio 41/41. |
| 5   | **R65.** New `docs-kit/library-source.ts`: `LIBRARY_SOURCE` holds packages/ui's shipped source, read with a build-time `import.meta.glob(…, { query: "?raw", eager: true })` that excludes tests, specs and stories. Both the browser catalogue and the node spec now scan that one source. `catalogue.ts` gains the exported `libraryUsesOf(step, reader)`, the spec's scan moved here with its blind-spot note. Colour utilities are now `colorRoleUtilities` (the R62 default) ∪ the library's uses under a `COLOR_READER` (`bg text border[-side] outline ring fill stroke decoration accent caret divide`). The spec gains an "R65 colour chips" block with exact lists for `status-danger/success/warning`, `veg` and `focus`, an unused colour kept at its default, and variant-prefix / longer-name cases. The contract story's `DERIVED` gains paints for `text-status-success`, `accent-pink-500`, `fill-pink-500` and `bg-border-subtle`, each proven in Chromium. | `7606082` | Red: 77 failures (`libraryUsesOf` not exported). Green: docs-kit 105/105, docs-kit/colors/spacing stories 34/34. |
| 6   | `primitive/space.json` `hit` marker is now `["min-h"]`. The spec expects `["min-h-hit"]`, and the DERIVED `spacing-hit` case paints `min-h-hit` only. | `7606082` | Same run. design-tokens 234/234. |

R65's effect: a probe over every base colour token found 11 tokens that gained chips:
`status-{success,warning,danger}` → `text-`; `veg` → `text-`; `focus` → `outline-`;
`pink-500` → `accent-`, `fill-`; `border-subtle` → `bg-`; `link-underline`, `white-alpha-40`,
`white-alpha-90` and `border-default` → `decoration-`.

## Task 15: Tooltip (`e550f8e`, `ea5d76b`)

Built: `--z-tooltip: 90` (`primitive/z-index.json`), `@utility z-tooltip`, `"tooltip"` in `Z`
(fold 7), and `atoms/tooltip/{tooltip,tooltip.test,tooltip.stories}.tsx`. Radix was already
installed (`radix-ui ^1.6.7` → `@radix-ui/react-tooltip` 1.2.16). The component follows the brief
verbatim, apart from the deviations below.

Deviations:

1. **The tests and plays query the `role="tooltip"` element itself, not its `parentElement`.** The
   brief's helper assumed Radix renders the label twice, a visible copy plus a hidden
   `role="tooltip"` span. The installed 1.2.16 does that only when `Content` has an `aria-label`
   (`dist/index.mjs:346,365`). Without one, the styled content element is `role="tooltip"`, carries
   `data-side` and the classes, and is what `aria-describedby` points at. Run as written, the brief
   failed the pill-class test, because the parent is Radix's unstyled popper wrapper. So the label
   renders once, and `contentOf` is gone.
2. **R48:** a blank `label` renders the trigger alone, with no tooltip and no `aria-describedby`. The
   brief did not cover this. It has its own test (red, then green) in the follow-up commit `ea5d76b`.
3. `AUTHORING.md`: the stacking list names `z-tooltip`, and §8's client-file list names Tooltip and
   Countdown.

Dev parity (the brief's table, confirmed against `git show dev:…/tooltip.tsx`):

| Dev item | Ruling | Where / clause |
| --- | --- | --- |
| a separate `TooltipProvider` (shared delay, skip-delay sweep) | DROP | spec §9.1 / contract §3 "provider included"; with a 0ms open delay there is no delay to skip |
| closed until the trigger is reached | ALREADY | "stays closed until its trigger is focused" |
| opens on keyboard focus | ALREADY | same test |
| closes when focus leaves | ADD | "closes when focus leaves the trigger" |
| closes on Escape | ALREADY | "closes on Escape" + Playground play |
| describes its trigger (`aria-describedby`) | ALREADY | `toHaveAccessibleDescription` in the test and the play |
| uses the caller's control and adds no button | ADD | "keeps the trigger's own name and handlers" |
| four sides (`data-side`) | ALREADY | `side` story play (real placement in Chromium) |
| `isDefaultOpen` / `isOpen` / `onOpenChange` | ADD — contract delta P2 raised | not built, pending the controller's P2 ruling |
| ink pill, not a bordered box | ALREADY | the pill-class test |
| caller `className` on the pill | DROP | contract §3 `TooltipProps` takes no native props |
| a long hint wraps at a cap, not off a 360px screen | ADD | `max-w-56`; `long hint` play (width ≤ 224) |
| axe | ALREADY | the test runs while open (container and content) |
| stories default / sides / on a button | ALREADY | Playground, `side`, `on a button` |
| (missed by plan) blank label | ADD | R48 test (deviation 2) |

Gate: `pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache`
gave "Successfully ran targets typecheck, lint, test for 2 projects" (tokens 234, ui 591). The TDD red
was `Failed to resolve import "./tooltip"`. Tooltip stories 4/4 in Chromium (Playground, side, long
hint, on a button). `format:check` exit 0.

## Task 16: Countdown (`137ae96`)

Built: `atoms/countdown/{countdown,countdown.test,countdown.stories}.tsx`, from the brief verbatim,
and the barrel line. No tokens and no dev reference (handoff component).

Deviations:

1. **R48:** a blank `label` reads no `sr-only` prefix (`hasLabel`, the StatusDot pattern). There is a
   new test, and it failed against the brief's `label === undefined` check (seen).

Dev parity: none (handoff). Checked against the handoff: the format is `Nd HHh MMm SSs`, it ticks
once a second, and the pill is mono and bold with ink fill, white text, `1px 8px` padding and a pill
radius. After `endsAt` it renders `fallback` (spec §9.1/§16) instead of the handoff's frozen zeros.

Gate: ui typecheck, lint and test green (605). The TDD red was `Failed to resolve import "./countdown"`.
It covers the SSR placeholder, hydration with no recoverable error, the tick, the swap to fallback
at the deadline, nothing rendered after expiry, one interval that is cleared on unmount, and
`RangeError` for three offset-less inputs. Countdown stories 4/4 in Chromium: the Playground play
waits for a real tick. `format:check` exit 0.

## Final gate (whole batch, cold)

- `pnpm nx format:check` exit 0; `pnpm nx sync:check` "All files are up to date."
- `pnpm nx run-many -t typecheck lint test -p ui design-tokens storybook --skip-nx-cache` gave
  "Successfully ran targets typecheck, lint, test for 3 projects". Results: design-tokens 234/234,
  ui 605/605 (39 files), storybook 396/396 (37 files, stories and docs-kit). All passed on the first
  run, with no cold-cache failure.
- `pnpm nx run @pink-paprikaa-web/storybook:build --skip-nx-cache` succeeded.

## Concerns

- R65 puts packages/ui's raw shipped source, about 200 KB before minification, into the Storybook
  docs chunk (`token-table-*.js`, now 692 KB). It is Storybook only and never reaches the site.
  Vite's ">500 kB chunk" warning was already raised by `iframe` and `axe`. If it matters, a small
  Vite virtual module could emit only the used-class set.
- Countdown's pill is `bg-surface-inverse`, which no surface overrides, so on an `ink` field the
  pill is ink on ink. The handoff only places it on the brand launch bar. This is flagged for Task 17
  parity. No `OnSurfaces` story was added, because the component is not surface-aware.
- Tooltip fades without the 8–12px translate that AUTHORING §9 pairs with a fade. The brief and dev
  both call the hint one that "appears, it does not travel". I kept it as briefed.
