# Plan 2c, batch B report (2b final fix wave, Task 3 Stack, Task 4 Cluster)

Base `c581ffe`, head `01308e6`. 15 commits: 12 for the fix wave, then Stack, the plan-5 Spacing
restore, and Cluster. Status: **DONE_WITH_CONCERNS**. See concern 1: Cluster's far-end focus check
needed a controller-visible change.

## 2b fix wave (R69, `02b…/final-fix-wave.md` items 1–12)

| # | What | Commit | Evidence |
| --- | --- | --- | --- |
| 1 (Important) | The field box's disabled paint now names the control: `has-[>:is(input,textarea,select):disabled]:` and `group-has-[>:is(input,textarea,select):disabled]/field:`, in every place in `field-control.tsx` plus the Input/Select unit tests. The doc comment explains why, and says that a new control must be one of those three elements and a direct child of the box. New `Input` story `trailing disabled` (a disabled trailing "Apply" button): its play checks that the input's computed colour is `text-body` and the box is `surface-card`. The probe helper moved from `select.stories.tsx` into `lib/story-paint.ts` and both stories share it. | `9d8eada` | **Red first in Chromium:** expected `rgb(43, 31, 37)` (text-body), received `rgb(184, 171, 177)` (ink-400). Green after the fix. Select's placeholder/disabled plays are still green. |
| 2 (Important) | `text-success/warning/danger` were added to the `soft-surface`, `ink-surface`, `ink-card`, `brand-surface` and `brand-card` contrast groups. Overrides: brand and ink map them to `mint-soft` / `turmeric-soft` / `danger-soft`. soft maps danger to a **new primitive `danger-strong` `#B81E1E`**: plain danger measures 4.24:1 on pink-100, and the tree now gives 5.10:1. `light.json` restores the base values, because theme.spec requires every overridden token to be in light. Radio's OnSurfaces story gains an errored `RadioGroup` row. | `e25f07e` | **Red first: 13 pairs failed.** Danger on soft was 4.24. On ink, success/warning/danger were 5.82/9.80/3.42 before and ink-card failed too. On brand and brand-card: 1.28–2.15. After the fix, tokens are 249/249. The soft tints measure 3.46–3.60 on brand, 3.14–3.27 on the brand card (≥ 3, brand-fill) and 13.6–16.4 on ink. |
| 3 (Important, R67) | `OnSurfaces` takes `grounds?: readonly Ground[]` and a per-ground function child. Checkbox, Radio and Switch pass `["page","alt","ink","soft"]`, and their docs now say "There is no on-brand skin: keep it off the brand (pink) ground." ProgressBar's brand row renders `tone="inverse"`. | `79b1bf3` | The four atoms' stories: 33/33 in Chromium. |
| 4 | The read-only Select compound adds `has-[>:is(…):disabled]:bg-surface-sunken`, so the fill no longer depends on ink-100 equalling surface-sunken. | `0f51b7d` | Red first: the unit test's class assertion failed. |
| 5 | A disabled `<fieldset>` greys its fields. This is proved by the new Input story `inside a disabled fieldset` in Chromium: the input is disabled, its text is ink-400 and the box is ink-100. | `22e9398` | Pinning test. The behaviour already existed, so it was green on first run. |
| 6 | Rating's name and its visible score share one `toFixed(1)` string, so 4 is named "4.0 out of 5". | `337ab1d` | Red first: 2 tests ("0.0 out of 5", "2.0 out of 3"). |
| 7 | The `src/lib/` ESLint block now bans `**/molecules/**`, `**/organisms/**`, `**/layouts/**` and any atom except Icon (`../atoms/x` and `../../src/atoms/x`). | `243edd7` | Red first: the new node test got 0 errors where it expected 1. 7/7 after. `ui:lint` is green, so no existing lib file breaks the rule. |
| 8 | The `library-source.ts` glob excludes `!**/story-*.*`. This also covers the new `story-paint.ts`, which the dispatch's `story-*.tsx` would have missed. New `library-source.spec.ts`. | `759f456` | Red first. The docs-kit specs (113) and the foundations stories (47) stayed green without the story classes. |
| 9 | `SpinnerProps` omits `aria-label` **and** declares `"aria-label"?: never`. | `7c08641` | The `@ts-expect-error` test failed typecheck first (TS2578). **Omit alone stayed TS2578**, because JSX skips excess-property checks on hyphenated attributes, so the `never` declaration is required. |
| 10 | A blank RadioGroup message (`""`, whitespace, `false`) now renders no `<p>` and sets no `aria-describedby` (R48). A status message is typed `string \| ReactElement`, so a boolean does not compile. | `0cb9137` | Red first: 3 runtime cases plus the TS2578 on the boolean. |
| 11 | styles.spec: a new case asserts that `surfaceShadows` contains `focus-ring`, so the list cannot be vacuously empty. The `@utility` check is now a whitespace-tolerant regex. | `56c23a9` | 5/5. |
| 12 | Barrel lib block sorted by path (`reveal-observer` moved after `link-as`). | `2644e71` | index.spec 7/7. |

**Fix-wave deviations**
- **Item 2, scope widened (Badge and Tag):** they pair `bg-status-*-soft` with `text-text-*`. Once
  `text-text-*` turns into a soft tint on brand/ink, a status Badge/Tag on those grounds would put
  soft on soft, and nothing would catch it: Storybook disables axe `color-contrast`, and the policy
  groups are surface-null. They now use the surface-invariant primitives `text-mint-strong`,
  `text-turmeric-strong` and `text-danger`, which have the same base values, and the `badge`/`tag`
  contrast pairs name those primitives. `status.mdx` got one paragraph on the overrides.
- **Item 2, soft surface:** this was not in the review. I found it when I added the groups
  (danger 4.24 on pink-100). Fixing it needed the new primitive `danger-strong`. If the owner wants
  a different hex, it is one value in `primitive/color.json`.
- **Item 10:** a literal `""` cannot be excluded at type level without making RadioGroup generic.
  `""` still compiles, but it renders as no message (documented on the prop).
- **Item 5:** this is a Chromium story `play`, not a jsdom test, because jsdom cannot evaluate
  `:has()` paint.

## Task 3: Stack

**Built:** `packages/ui/src/layouts/stack/{stack.tsx,stack.test.tsx,stack.stories.tsx}` and the barrel
line, in the layouts block after `container` in path order.

**TDD:** the first run failed with `Failed to resolve import "./stack"`. After that, the Stack tests
passed, but index.spec's three layouts rows stayed red until the export and stories existed.

**Deviations**
1. R13 (fold item 1): `space`, `align`, `justify`, `isDivided` and `as` are `?: T | undefined`.
2. **TS2322 fired** (fold item 11 said to cast only if it does). The `ul`/`ol` members reject the
   spread div `ref`. I used `const Element = as as "div";` with a comment. The first gate run showed
   the error; typecheck is green after the cast.
3. Commit subject lower-cased (fold item 10): `feat(ui): add the Stack layout`.

**Dev parity** (the brief's table, checked against `git show dev:…/templates/stack/*`):

| Dev item | Ruling | Where / clause |
| --- | --- | --- |
| `grid min-w-0` base, 16px default gap | ALREADY | + `grid-cols-1` (deviation 10) |
| `space` steps incl. half steps | ALREADY | `GAP_CLASS`; `gap-0-5` names DROP (D4) |
| `align` → `justify-items-*`, `justify` → `content-*` | ALREADY | `it.each` rows |
| `hasDivider` (`divide-y divide-border-subtle`) | ALREADY | `isDivided`, hidden rule elements that keep lists valid |
| `as` any element (doc names `dl`) | DROP | Contracts §4 union |
| Tests: every child kept, no margins, className replaces gap, axe | ALREADY/ADD | as the brief |
| Stories Default / Spacing / Align / WithDividers / Narrow | ALREADY/ADD | `Playground`, `Steps`, `Align`, `DividedList`, `LongWordAt360` |
| Dev `defaultVariants` (align stretch, justify start) | DROP (implicit) | Plan tier rule: defaults live in destructured props. Not in the brief's table |

**Gate** (`gate-t3`):
```
design-tokens: Test Files 4 passed (4) · Tests 249 passed (249)
ui:            Test Files 42 passed (42) · Tests 679 passed (679)
NX Successfully ran targets typecheck, lint, test for 2 projects
storybook:build OK
storybook:test: ✓ layouts/stack/stack.stories.tsx (9 tests) · Test Files 40 passed (40) · Tests 421 passed (421)
format:check → GATE-GREEN
```

**Commit:** `b8088af feat(ui): add the Stack layout`

### Plan-5 restore (F7, plan-5 fold item 6)

`4054ce4 feat(storybook): restore the Spacing specimen's compile-time step check`. It adds `type
SpaceStep = NonNullable<StackProps["space"]>` and `SPACE_STEPS … as const satisfies readonly
SpaceStep[]`.

**Deviation:** the brief's `_isEveryStepShown` fails `noUnusedLocals` (TS6133) and the naming lint
(`is/has…` prefix). It is now `isEveryStepShown`, read in the `Scale` play
(`expect(isEveryStepShown).toBe(true)`).

**Probe:** I dropped `32` from the list and typecheck failed with TS2322. The value is restored.
storybook typecheck and lint are green, and Spacing specimens pass 8/8.

## Task 4: Cluster

**Built:** `packages/ui/src/layouts/cluster/{cluster.tsx,cluster.test.tsx,cluster.stories.tsx}` and the
barrel line, before `container`.

**TDD:** the first run failed with `Failed to resolve import "./cluster"`. It passed after the
implementation (ui 702).

**Deviations**
1. R13 on `space`, `align`, `justify`, `isNowrap`, `isScrollable` and `as`.
2. **TS2322 fired here too.** I confirmed it by reverting to `ElementType` (error at line 63), then
   used the same `as as "div"` cast.
3. **`ScrollableRailAt360` far-end check.** It failed at `end = -31.27`, not at ≈ 0, so the cause is
   **not** scroll-padding. I instrumented each tab step, then re-ran it against `storybook-static`
   with **real Playwright key presses**, in the scratchpad (nothing committed). Chromium does not
   focus-scroll an item that is already partly visible. "Chai & Coffee" stayed 66px outside the
   rail. The first fully hidden item ("Sweets") was *centred*, which left "Breakfast" 31px outside.
   This matches Chromium's minimum-intersect-for-reveal rule (32px). No CSS changes it, and the
   brief's `after:` spacer would not help. **Change:** after Tab reaches the last item, the play
   sets `rail.scrollLeft = rail.scrollWidth` (the user scrolling the focused rail) and then measures
   the far-end ring room. The story's JSDoc records why. Keyboard reach and the top, bottom and
   start ring room at rest are unchanged.
   **Probe that it still discriminates:** with `pe-0` added to the rail, the far-end check fails at
   `-0.27`, which is line 189.

**Dev parity** (checked against `git show dev:…/templates/cluster/*`):

| Dev item | Ruling | Where / clause |
| --- | --- | --- |
| Wrapping `flex min-w-0`, 12px default, centred | ALREADY | default test |
| `space`, `align`, `justify`, `isNowrap` | ALREADY | `it.each` rows |
| `isScrollable`: `overflow-x-auto flex-nowrap` rail | ALREADY | + `*:shrink-0`, 4px ring room (deviation 11) |
| Dev rail `pb-1` (scrollbar breathing room) | ALREADY (implicit) | Superseded by `p-1` on all sides. Not in the brief's table |
| Scrolling rail is a tab stop; wrapping cluster is not | ALREADY | keyboard + default tests |
| Automatic `role="region"` when labelled | ALREADY | The consumer names the rail. The `ul` test asserts no region |
| Dev test "leaves an unlabelled rail as a plain list" / "keeps every child" | ALREADY | "keeps a scrolling ul a named list, with every item" |
| Tests: an `as="ul"` rail, no margins, className, axe on the `ul` row | ADD | as the brief |
| Stories Default / Wrap / Scroll / Justify / Spacing / InContext | ALREADY/ADD | `Playground`, `Wrap`/`WrapAt360`, `Scroll`, `Justify`, `Spacing`, `BaselineMetaRow` |

**Gate** (`gate-t4`, final run):
```
design-tokens: Test Files 4 passed (4) · Tests 249 passed (249)
ui:            Test Files 43 passed (43) · Tests 702 passed (702)
NX Successfully ran targets typecheck, lint, test for 2 projects
storybook:build OK
storybook:test: ✓ layouts/cluster/cluster.stories.tsx (9 tests) · Test Files 41 passed (41) · Tests 430 passed (430)
format:check → GATE-GREEN
```
The first gate run was red only on the far-end check (deviation 3). After the fix wave I also ran a
gate that added storybook typecheck and lint and `@pink-paprikaa-web/eslint-config` test (ui 659,
storybook 412). It was green.

**Commit:** `01308e6 feat(ui): add the Cluster layout`

No plan-doc re-sorts were needed (format:check was green each time).

## Concerns

1. **Review Focus 3 wording vs Chromium.** "Ring room at the far end after focus-scrolling" cannot
   hold with Tab alone. Chromium leaves a focused item that is ≥ 32px visible partly clipped. That
   applies to any scroll container, so it is not specific to this CSS. The only complete fix is a
   client leaf (`focusin` → `scrollIntoView({ inline: "nearest" })`), which breaks the plan's
   server-first rule for layouts. The controller should rule on whether to accept the scrolled-end
   check (current) or add that leaf.
2. **New primitive `danger-strong` (#B81E1E).** Added for danger text on the soft ground, and the
   handoff has no value for it. The owner may want to choose the hex.
3. `lib/story-paint.ts` is a second lib story helper. It is excluded from the library scan (item 8)
   and never exported from the barrel.
