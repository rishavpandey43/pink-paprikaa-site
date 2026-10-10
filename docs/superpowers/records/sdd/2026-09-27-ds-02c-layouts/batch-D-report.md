# Plan 2c, batch D report (Task 7 AppShell, Task 8 PostFrame + `POST_FORMATS`)

Base `657e3eb`, head `4c9aae9`. Four commits. Status: **DONE**.

| Commit | What |
| --- | --- |
| `7e76a72` | feat(ui): add the AppShell layout |
| `2f584a1` | docs: re-sort classes in the 2c plan's AppShell code block |
| `5f80d82` | feat(ui): add the PostFrame layout and the seven canvas formats |
| `4c9aae9` | docs: re-sort classes in the 2c plan's PostFrame code block |

## Task 7: AppShell

**Built:**
- `packages/design-tokens/tokens/component/app-shell.json`: 8 spacing tokens, radius `app-shell`, and text `app-shell-status`.
- `packages/ui/src/layouts/app-shell/{app-shell.tsx,app-shell.test.tsx,app-shell.stories.tsx}`. The test and stories are verbatim from the brief. The source is verbatim apart from R13, and Prettier re-sorted its classes.
- The eight `app-shell-*` names in `SPACING`, `"app-shell"` in `RADIUS` and `"app-shell-status"` in `TEXT`.
- The barrel line, first in the layouts block (sorted by path, before `auto-grid`).

**TDD:** the test failed first with `Failed to resolve import "./app-shell"`, along with index.spec's three layouts rows (3 failed, 743 passed). After the implementation it passed (10 tests; ui 756).

**Deviations (all from the fold list unless marked):**
1. R13 (item 1): `statusTone`, `time`, `tabBar`, `overlay` and `size` are declared `?: T | undefined`.
2. R61 (item 4): `["w"]` on `app-shell-w`, `app-shell-sm-w` and `app-shell-home-bar-w`. `["h"]` on `app-shell-h`, `app-shell-sm-h`, `app-shell-home` and `app-shell-home-bar-h`. No marker on `app-shell-status-x`, because it is padding. `catalogue.spec` is green.
3. R70 / item 6: there is no `size="fluid"`, and the union is `"phone" | "phone-sm"`.
4. **No TS2322 cast.** AppShell has no `as` prop: it always renders a `div` with `ComponentProps<"div">`. Typecheck is green without the cast.
5. Commit subject lower-cased (item 10).
6. Item 7: the Tailwind plugin re-sorted 3 class strings in the 2c plan's AppShell code block. I committed that alone as `2f584a1`.

**Dev parity** (the brief's table, checked against `git show dev:packages/ui/src/templates/app-shell/*`, and extended):

| Dev item | Ruling | Where / clause |
| --- | --- | --- |
| `relative overflow-hidden` frame that overlays anchor to | ALREADY | first test (+ `contain-layout`, `ref`) |
| `tabBar` and `overlay` slots; overlay after the tab bar | ALREADY | ordering test |
| `time` clock (default `9:41`) on the status bar | ALREADY | clock test |
| Status bar and home indicator hidden from assistive tech | ALREADY | ordering + clock tests |
| `tone` ink/light flips the chrome text | ALREADY | `statusTone` (contracts §4); light floods the row brand (resolution 7) |
| Sizes `sm` 375×812, `lg` 430×932 | DROP | Contracts §4 `size: "phone" \| "phone-sm"`; the 360×780 floor replaces the small artboard |
| Size `fluid` (fills its parent, capped at 430px) | DROP | R70 (contracts win, no plan 3–5 consumer) |
| Arbitrary `rounded-[44px]`, `h-[844px]`, `shadow-elevation4` | ALREADY | Component tokens; D4 (old shadow name) |
| Test: caller className replaces the radius and shadow | ADD | className test |
| Test: axe on the light status tone with a tab bar | ADD | "light status tone with a sheet open" axe test |
| Story `Default`, `WithTabBar`, `WithOverlay`, `OnBrand` | ALREADY | `Playground`, `WithTabBar`, `WithOverlaySheet`, `StatusTones` |
| Story `Sizes` (frames side by side) | ADD | `Sizes` |
| Stand-in TabBar takes a `label`, so several frames never repeat a `navigation` name | ADD | `DemoTabBar` `label`, used by `StatusTones` and `Sizes` |
| Only large text on a brand header (the 4.04:1 note) | DROP | Spec §5.1: white on brand is the declared 3:1 exception |
| Dev frame fill `bg-surface-card` | DROP (implicit) | Brief: `bg-surface-page` + `data-surface="light"` (the frame owns its surface). Not in the brief's table |
| Dev home indicator flips with `tone` (`bg-current opacity-25`) | DROP (implicit) | Brief: fixed `bg-ink-300` bar. The home strip sits on the light frame for both status tones, so it never needs to flip. Not in the brief's table |
| Dev battery drawn from two nested spans (arbitrary px) | DROP (implicit) | Lucide `BatteryFull` at `size="sm"` (brief Step 4 note) |
| Dev status inset `px-5` (20px) | ALREADY (implicit) | `px-app-shell-status-x` 22px (zip value) |
| Dev `ComponentPropsWithoutRef<"div">` | DROP (implicit) | `ComponentProps<"div">` so `ref` reaches the frame (the portal-container hand-off). The ref test pins it |
| Dev `defaultVariants` | DROP (implicit) | Plan tier rule: defaults live in the destructured props |

**Gate** (`gate-t7`):
```
design-tokens: Test Files 4 passed (4) · Tests 249 passed (249)
ui:            ✓ app-shell.test.tsx (10 tests) · Test Files 46 passed (46) · Tests 756 passed (756)
NX Successfully ran targets typecheck, lint, test for 2 projects
storybook:build OK
storybook:test: ✓ layouts/app-shell/app-shell.stories.tsx (6 tests) · Test Files 44 passed (44) · Tests 472 passed (472)
format:check: FAILED on docs/superpowers/plans/2026-09-27-ds-02c-layouts.md only → re-sorted in 2f584a1 → green
```

## Task 8: PostFrame and `POST_FORMATS`

**Built:**
- `packages/design-tokens/tokens/component/post-frame.json`.
- `packages/ui/src/layouts/post-frame/{post-formats.ts,post-formats.spec.ts,post-frame.tsx,post-frame-scaler.tsx,post-frame.test.tsx,post-frame.stories.tsx}`. These are verbatim from the brief apart from R13 and R15, and Prettier re-sorted the guide classes.
- `canvas-pad`, `canvas-pad-tight`, `story-safe-top` and `story-safe-bottom` in `SPACING`.
- The barrel lines `post-frame/post-formats` and then `post-frame/post-frame`, between `container` and `section`. `scaledSize` and `PostFrameScaler` stay internal.

**TDD:** with the source files moved aside, both specs failed with `Failed to resolve import "./post-formats"` / `"./post-frame"`, along with index.spec's three layouts rows. With the source restored, `post-formats.spec.ts` passed 13 tests and `post-frame.test.tsx` passed 27 (ui 796).

**Deviations:**
1. R13 (item 1): `tone`, `padding` and `hasSafeArea` are `?: T | undefined`. The union is `({ scale?: number | undefined; isFit?: false | undefined } | { isFit: true; scale?: never })`, and `PostFrameScalerProps.className?: string | undefined`. `format` stays required.
2. R15 (item 2): `post-formats.spec.ts` reads `join(import.meta.dirname, "../../../../design-tokens/dist/tokens.json")` and imports `join` from `node:path`.
3. R61 (item 4): `["h"]` on `story-safe-top` and `story-safe-bottom`. There is no marker on `canvas-pad` or `canvas-pad-tight`, because they are padding. `catalogue.spec` is green.
4. The contract deviations 2, 3 and 5 (the scale/isFit union, `tone="alt"` and padding by format) are built as the plan decided.
5. No TS2322 cast was needed: there is no `as` prop.
6. Commit subject lower-cased (item 10): `feat(ui): add the PostFrame layout and the seven canvas formats`.
7. Item 7: the Tailwind plugin re-sorted 2 class strings (`safeTop`/`safeBottom`) in the 2c plan's PostFrame code block. I committed that alone as `4c9aae9`.

**Dev parity** (the brief's table, checked against `git show dev:packages/ui/src/templates/post-frame/*`, and extended):

| Dev item | Ruling | Where / clause |
| --- | --- | --- |
| Seven canvases pinned to the `--canvas-*` tokens | ALREADY | `POST_FORMATS` + `post-formats.spec.ts` (token equality) |
| `variant` (default `post`) | ALREADY | `format`, required (contracts §4) |
| `scale` (default 1) through a `--pp-canvas-scale` custom property and arbitrary `calc()` classes | ALREADY | Computed inline geometry (tier rule: the only inline styles); scaled-box test |
| Reserved box = canvas × scale; `shrink-0 overflow-hidden` | ALREADY | first and third tests |
| `padding` default/tight/none; 20px (`p-5`) on mpu and leaderboard | ALREADY | padding tests (+ 48px default on landscape, resolution 5) |
| Story guides only on `story`, only with `hasSafeArea` | ALREADY | guide tests (now `aria-hidden`) |
| Background through `className` | ALREADY | `tone` (spec §9.4), sets `data-surface` |
| Test: children render inside the true-pixel canvas | ADD | "renders its children" test |
| Test: caller className merges onto the frame; caller `style` is kept | ADD | className/style test |
| Test: axe on a scaled story with guides | ALREADY | last test |
| Story `Default` | ALREADY | `Playground` |
| Story `Canvases` (seven boards with copy) | ALREADY | Per-format stories + `AllFormats` |
| `Canvases`' `wide` board with copy (no per-format story had it) | ADD | `Wide` |
| Story `StorySafeArea` (guides off vs on) | ADD | `SafeAreaGuides` |
| Story `Padding` (default · tight · none) | ADD | `Padding` |
| Arbitrary `text-[22px]`, `max-w-[13ch]` in board copy | DROP | Token-only class rule (AUTHORING §6); boards use SocialHeadline / Text steps |
| Dev guide stroke `border-2 border-dashed border-glass-white` | DROP (implicit) | Brief: `outline-2 -outline-offset-2 outline-dashed outline-border-default`. An outline takes no layout space inside the guide band. Not in the brief's table |
| Dev guide heights `h-(--canvas-story-safe-*)` (arbitrary var) | ALREADY (implicit) | `h-story-safe-{top,bottom}` component tokens (R61 `["h"]`) |
| Dev `defaultVariants: { variant: "post", padding: "default" }` | DROP (implicit) | Plan tier rule: defaults live in the destructured props, and `format` is required |
| Dev `ComponentPropsWithoutRef<"div">` | DROP (implicit) | `ComponentProps<"div">` (React 19 `ref` prop) |
| `isFit` (fit to the parent's width) | ADD (implicit) | Spec §9.4 / contracts §4. Dev had none. isFit tests + `FitToParent` / `FitsItsParentAt360` |

**Gate** (`gate-t8`):
```
design-tokens: Test Files 4 passed (4) · Tests 249 passed (249)
ui:            ✓ post-formats.spec.ts (13 tests) ✓ post-frame.test.tsx (27 tests) ·
               Test Files 48 passed (48) · Tests 796 passed (796)
NX Successfully ran targets typecheck, lint, test for 2 projects
storybook:build OK
storybook:test: ✓ layouts/post-frame/post-frame.stories.tsx (14 tests) — FitsItsParentAt360 play green ·
                Test Files 45 passed (45) · Tests 490 passed (490)
format:check: FAILED on docs/superpowers/plans/2026-09-27-ds-02c-layouts.md only → re-sorted in 4c9aae9 →
              "FORMAT-GREEN" (pnpm nx format:check exit 0)
```

## Notes for the controller

- Plan 5 Task 7 (the Layout group) no longer waits on AppShell.
- No other plan's docs needed a re-sort in this batch. Only the 2c plan failed `format:check`.
- The SDD records are not archived to `docs/superpowers/records/sdd/`. That rsync is the controller's job.
