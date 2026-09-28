# Plan 2c, Task 0: fold list (BINDING OVERLAY, ruling R43)

The plan file is not patched. Each item below overrides the task body it names. An implementer
applies it on top of the brief and does not reinterpret it. Base: `9970d1c` (Plans 1, 2a, 2b built;
Plan 5 foundations live). Every check below was run against the tree, not the plan text.

## Checks run (Task 0 Steps 1 to 5b)

| Step | Result |
| ---- | ------ |
| 1. Tokens | All 41 names present, plus `spacing-text-measure-prose` (= `64ch`, the controller amendment's token). `spacing-gutter` `clamp(16px, 4vw, 40px)`, `spacing-section` `clamp(48px, 8vw, 96px)`, `spacing-grid-gap` `clamp(16px, 2vw, 24px)`, `spacing-card-min` `260px`, `spacing-card-min-wide` `320px`, `spacing-tabbar` `64px`; containers 1200/1440/960/760/64ch; canvases post 1080×1080, portrait 1080×1350, story 1080×1920, landscape 1200×628, wide 1920×1080, mpu 300×250, leaderboard 728×90; `canvas-pad` 72px, `canvas-pad-tight` 48px, story safe 250px/320px. No name or value mismatch. None of this plan's new token names exists yet (`spacing-section-tight/loose`, `spacing-grid-min-*`, `spacing-canvas-pad(-tight)`, `spacing-story-safe-*`, `spacing-app-shell-*`, `radius-app-shell`, `text-app-shell-status` all absent). |
| 2. Library core | `styles.css` has `@source "./"`, `@utility autogrid-wide`, `@utility cluster`, and the `@utility shadow-button-primary` / `shadow-focus-ring` pair. `component-variants.ts` has `TEXT`, `RADIUS`, `SPACING` (plus `Z`, `SHADOW`, `CONTAINER` …) inside `twMergeConfig.extend.theme`; `classGroups.autogrid` is `["autogrid", "autogrid-wide"]`. `expectNoA11yViolations` is exported (disables only `color-contrast`; `region` does not fire on isolated components — the Icon test is green). **`ResizeObserver` is stubbed with a `typeof … === "undefined"` guard, not `??=`** (the lint-clean form); `vi.stubGlobal` still replaces it, so Task 8's `isFit` tests are unaffected. `Icon({ icon, size = "md", label })`, `Logo({ variant, tone, title, isDecorative, className })` (tones `pink`/`white`/`badge`). Preview viewports: `floor360`, `sm`, `md`, `lg`, `xl`, `xxl`. `packages/ui/tailwind.css` imports `./src/styles.css`. |
| 3. 2a atoms | `PatternField` `tone` brand/ink/soft/light, `tile` 56–96 (numbers), `density` default/faint, `radius`, `asChild`, className; sets `data-surface={tone}`. `Text` `variant`/`tone` (incl. `subtle`, `muted`)/`as`/`weight` (incl. `black`). `Card` `padding` none/sm/md/lg. `Button` `variant`/`size`/`isFullWidth`. `Tag` `isSelected`, renders `span` without `onClick`. `SocialHeadline` `size` hero/h1/h2/body/caption/overline, `as`. All optional props already follow R13. **PatternField probe: PASS** (1 test; `data-surface="ink"`, `absolute bg-transparent`, no `bg-surface-*`, no `relative`). Probe deleted. |
| 4. Nothing exists yet | `packages/ui/src/lib/space.ts` and `packages/ui/src/layouts/` absent; no `section|auto-grid|app-shell|post-frame.json`. |
| 4b. Class probe | Every stock and token class the plan's source and stories use (`contain-layout`, `*:shrink-0`, `scroll-px-1`, `-m-1`, `justify-items-*`, `content-*`, `grid-cols-1…6`, `origin-top-left`, `invisible`, `outline-dashed -outline-offset-2 outline-border-default`, `max-w-{content,wide,narrow,article,none,text-measure-prose}`, `px-gutter`, `py-section`, `gap-grid-gap`, `gap-{0.5,1.5,14,18,20,24,32}`, `h-tabbar`, all six `bg-surface-*`, `bg-surface-card`, `bg-ink-300`, `rounded-pill`, `shadow-4`, the story widths `w-19…w-65`, `max-w-{75,90,120}`): **no `no-custom-classname` error**. The only findings were `no-contradicting-classname`, which the probe causes itself. Probe removed; tree clean. |
| 5. Baseline gate | Green at `9970d1c`: design-tokens 234 tests, ui 610 tests (39 files), typecheck + lint pass, Storybook build OK, `storybook:test` 403 tests (37 files). |
| 5b. Dev parity tables | `grep -c '^\*\*Dev parity:\*\*'` on the plan = **8** (Task 1 + Tasks 2–8). Spot-checked Task 2 against `git show dev:packages/ui/src/templates/container/container.tsx`: sizes default/wide/prose/full, `isFullBleed`, `defaultVariants`, `as?: ElementType` — the table's rows match. |

## Facts later 2c tasks rely on (code as built after 2a and 2b)

- **F1 — Surfaces.** `sd.config.mjs` emits every surface block as the light (base) block plus that
  surface's own overrides, and each block also sets `color: var(--color-text-body)`. So a
  `data-surface="light"` element nested in an ink band restores every surface-affected token and
  the text colour (Task 6 `NestedSurfaces`, Task 7 frame, Task 8 `alt` board).
- **F2 — Surface-overridden shadows need `@utility shadow-*`.** `styles.spec.ts` ("surface-overridden
  shadows") asserts one `@utility shadow-<name> { --tw-shadow: var(--shadow-<name>); }` per shadow a
  surface overrides. Today that is `focus-ring` (brand, ink, light) and `button-primary` (brand,
  light), both present. This plan uses only `shadow-4` (Task 7), which no surface overrides — **no
  new `@utility` is needed**. A later task that adds a surface shadow override must add one.
- **F3 — Surface aliases.** A component token may alias a semantic token only if no surface
  overrides it. This plan's aliases (`{spacing.card-min}`, `{spacing.card-min-wide}`,
  `{canvas.pad}`, `{canvas.pad-tight}`, `{canvas.story-safe-*}`, `{font-weight.semibold}`) are all
  primitives — OK.
- **F4 — Contrast.** Every text/surface pair the layouts create (text-heading/body on page, alt,
  sunken, soft, brand, ink) is already covered by `contrast-pairs.json` surface groups.
  `contrast-pairs.json` stays untouched.
- **F5 — R61/R63 sizing markers.** `apps/storybook/src/docs-kit/catalogue.spec.ts` ("R61 sizing
  markers") reads `packages/ui/src/**/*.{ts,tsx,css}` **live** (tests, specs and stories excluded)
  on every `storybook:test`. A **`spacing-*` token the library uses only as a size**
  (`size|w|h|min-w|min-h|max-w|max-h`) must carry `"$extensions": { "pink-paprikaa": { "utility":
  [...] } }` equal to exactly those uses, or `storybook:test` goes red. A token used for padding or a
  gap must carry none. `container-*` tokens are not checked (they map to `max-w-*`). Story-only
  uses do not count. See item 4 for each task's markers.
- **F6 — `max-w-prose` is banned.** `catalogue.spec.ts` asserts no token offers `max-w-prose`
  (Tailwind's static 65ch). `spacing-text-measure-prose` already carries `"utility": ["max-w"]` and
  Text already uses it, so Container's `max-w-text-measure-prose` adds no marker work.
- **F7 — Plan 5 deferrals this plan unblocks** (hand-off only; no 2c task edits `apps/storybook`):
  - `Spacing/Specimens` compile-time step check (`satisfies readonly SpaceStep[]` +
    `_isEveryStepShown`, Plan 5 fold item 6): unblocked by **2c Task 1** (`SpaceStep` exported from
    `@pink-paprikaa-web/ui`); the brief's exact spelling `NonNullable<StackProps["space"]>` needs
    **2c Task 3** (Stack). Both resolve to the same type.
  - `Spacing/Specimens` → `Rhythm` (Section + AutoGrid of Cards, Plan 5 fold item 3): unblocked by
    **2c Task 6** (Section; AutoGrid lands in Task 5), i.e. after 2c batch C.
  - Plan 5 Task 7 Layout group (`AutoGridCards`): unblocked by **2c Task 5**.

## Overlay items

1. **R13 on every props interface. Affects Tasks 2–8.** Every optional custom prop in the briefs is
   written `name?: T`. Declare each `name?: T | undefined`:
   - Task 2 `ContainerProps`: `size`, `isBleed`, `as`.
   - Task 3 `StackProps`: `space`, `align`, `justify`, `isDivided`, `as`.
   - Task 4 `ClusterProps`: `space`, `align`, `justify`, `isNowrap`, `isScrollable`, `as`.
   - Task 5 `AutoGridProps`: `min`, `columns`, `space`, `as`.
   - Task 6 `SectionProps`: `tone`, `pattern`, `size`, `space`, `isBare`, `as`.
   - Task 7 `AppShellProps`: `statusTone`, `time`, `tabBar`, `overlay`, `size`.
   - Task 8 `PostFrameBaseProps`: `tone`, `padding`, `hasSafeArea`; the union becomes
     `({ scale?: number | undefined; isFit?: false | undefined } | { isFit: true; scale?: never })`;
     `PostFrameScalerProps.className?: string | undefined`.
   `format: PostFormat` (Task 8) stays required.

2. **R15 file paths in tests. Affects Tasks 2, 5, 8.** Replace every
   `new URL("…", import.meta.url)` with `join(import.meta.dirname, "…")` and add
   `import { join } from "node:path";` (after `node:fs`, same import group):
   - Task 2 `container.test.tsx`: `readFileSync(join(import.meta.dirname, "../../../../design-tokens/dist/tokens.json"), "utf8")`.
   - Task 5 `auto-grid.test.tsx`: the same tokens path, and `readFileSync(join(import.meta.dirname, "../../styles.css"), "utf8")`.
   - Task 8 `post-formats.spec.ts`: the same tokens path.

3. **Barrel placement. Affects Tasks 1–8.** The barrel is ordered atoms → layouts → lib.
   - Layout exports form one block **between the last atom (`./atoms/tooltip/tooltip`) and
     `./lib/reveal-observer`, sorted by path**: `app-shell`, `auto-grid`, `cluster`, `container`,
     `post-frame/post-formats`, `post-frame/post-frame`, `section`, `stack`. Insert each task's line
     at its sorted place, never at the end of the file.
   - Task 1's `export { GAP_CLASS, type SpaceStep } from "./lib/space";` goes last in the lib block
     (after `./lib/link-as`).
   - `index.spec.ts` already covers the `layouts` tier (skipped until the folder exists): each
     layout folder needs its barrel line, a PascalCase export and the `tsx`/`test.tsx`/`stories.tsx`
     trio. `layouts/post-frame/` satisfies it through `post-frame.tsx`, `post-frame.test.tsx`,
     `post-frame.stories.tsx`; `post-formats.ts` and `post-frame-scaler.tsx` are extra files, allowed.

4. **R61/R63 sizing markers (F5). Affects Tasks 5, 7, 8; Tasks 2 and 6 confirmed none.** Add
   `"$extensions": { "pink-paprikaa": { "utility": [ … ] } }` to exactly these tokens, in the
   component JSON each task creates:
   - **Task 2:** none. `px-gutter` is padding; `max-w-content|wide|narrow|article` read `container-*`;
     `max-w-text-measure-prose` is already marked (F6).
   - **Task 5** `auto-grid.json`: every `grid-min-*` gets `"utility": []`, like `card-min`
     (R63: a grid template reads it through `autogrid-min-*`, so it has no spacing class of its own).
     `catalogue.spec` does not force this (no literal `*-grid-min-*` class), but without it the
     `Spacing/Specimens` → `ComponentSizes` table offers `p-grid-min-xs` chips. Add
     "A grid template reads it, so it has no class of its own." to each `$description`.
   - **Task 6:** none. `py-section-tight|loose` are padding — a marker would fail the spec.
   - **Task 7** `app-shell.json`: `app-shell-w` `["w"]`, `app-shell-h` `["h"]`, `app-shell-sm-w`
     `["w"]`, `app-shell-sm-h` `["h"]`, `app-shell-home` `["h"]`, `app-shell-home-bar-w` `["w"]`,
     `app-shell-home-bar-h` `["h"]`. **No marker** on `app-shell-status-x` (`px-`, padding).
     Without these, `storybook:test` fails "used only as a size … but carries no marker".
   - **Task 8** `post-frame.json`: `story-safe-top` `["h"]`, `story-safe-bottom` `["h"]`. **No
     marker** on `canvas-pad` / `canvas-pad-tight` (`p-`).
   - If a task later uses one of these tokens a second way, its marker must list every use.

5. **`autogrid-min-*` is a tailwind-merge class group. Affects Task 5** (02c-audit concern 1; the
   implementer-contract trap "every new custom class must be registered").
   - In `component-variants.ts`, the `autogrid` class group becomes
     `autogrid: ["autogrid", "autogrid-wide", { "autogrid-min": ["xs", "sm", "md", "lg", "xl", "2xl"] }]`,
     and `twMergeConfig.extend` gains
     `conflictingClassGroups: { autogrid: ["grid-cols"], "grid-cols": ["autogrid"] }` (verify the
     `grid-cols` group id and the `conflictingClassGroups` key against the installed
     `tailwind-merge` before relying on them).
   - In `component-variants.spec.ts`, add two rows to the "lets a consumer className replace %s
     with %s" table: `["autogrid-min-md", "autogrid-min-lg"]` and `["autogrid-min-md", "grid-cols-2"]`.
   - `Modify:` already names `component-variants.ts`; add `component-variants.spec.ts` to the task's
     prettier and `git add` lists.

6. **Contract deltas 1 and 2 have no ruling. Affects Tasks 2 and 7.** `progress.md` records no
   ruling on `02c-audit.md` delta 1 (Container `as="ul" | "ol"`) or delta 2 (AppShell
   `size="fluid"`). Build the contract unions as written in the briefs (no `ul`/`ol`, no `fluid`);
   report both rows as PENDING. **Controller: R70 DROPS both deltas.** If the controller accepts delta 1 later, it is an additive
   follow-up (two union members + the audit's `as="ul"` test).

7. **Plan-doc re-sorts. Affects Tasks 5–8.** Once a task's tokens exist, the Prettier Tailwind
   plugin re-sorts the classes in its code blocks (e.g. Task 7's
   `"rounded-app-shell relative flex …"`, Task 8's `"h-story-safe-top pointer-events-none …"`).
   Run `pnpm nx format:check`; if only the plan doc fails, `pnpm exec prettier --write
   docs/superpowers/plans/2026-09-27-ds-02c-layouts.md` and commit it alone as
   `docs: re-sort classes in the 2c plan's <Component> code block`. Report each as a deviation.

8. **Commit trailer. Affects every task.** The briefs already carry
   `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`; substitute whatever model actually
   runs the task.

9. **Task 0 body text is stale, with no downstream action.** Step 2 expects `ResizeObserver ??=`
   (the tree uses a `typeof` guard, same effect — see Step 2 row). Step 3's "raise with the 2a
   owner" branch is void: the PatternField probe passed, so Task 6 is not held.

10. **Commit subjects must not start upper-case (found in Task 2). Affects Tasks 3–8.** commitlint's
    `subject-case` rejects `feat(ui): Container layout`. Use `feat(ui): add the <Name> layout`
    (Task 8: `feat(ui): add the PostFrame layout and the seven canvas formats`); bodies unchanged.
    Task 2 committed as `feat(ui): add the Container layout`.

11. **`const Element: ElementType = as` typechecks (found in Task 2). Affects Tasks 3–6.** With
    `ComponentProps<"div">` (which carries `ref`) spread onto it, `ui:typecheck` is green for
    Container, so the known TS2322 trap does not fire for this shape. Keep the briefs' form; apply
    the `(as) as "div"` cast only if `tsc -b` actually reports TS2322 (and check for stale
    `packages/ui/dist` declarations first).

## Pre-flight table

### Pairs of tasks sharing a file or an interface

| Tasks | Producer → consumer | Finding | Verdict |
| ----- | ------------------- | ------- | ------- |
| 1 → 3, 4, 5 | `GAP_CLASS`, `SpaceStep` | Stack/Cluster/AutoGrid pass `GAP_CLASS` straight in as the `space` variant; the stories build `argTypes` from `Object.keys(GAP_CLASS).map(Number)`. tailwind-variants looks a numeric prop up by its string key (`"0.5"`), which is how the object is keyed. | OK |
| 2 → 6 | `Container`, `ContainerSize` | Section wraps content in `<Container size={size}>`; its tests read `max-w-content`/`max-w-narrow` + `px-gutter` on the child's parent — Container's classes. | OK |
| 3, 4 → 6, 7, 8 (stories) | `Stack`, `Cluster` | Section, AppShell and PostFrame stories import them. Batch order (B = T3–T4 before C/D) holds the dependency. | OK |
| 5, 6, 7, 8 | `component-variants.ts` `SPACING` / `RADIUS` / `TEXT` | Each appends its own names (`grid-min-*`; `section-tight/loose`; `app-shell-*` + radius `app-shell` + text `app-shell-status`; `canvas-pad(-tight)`, `story-safe-*`). No name collides with an existing token or with another task's. `component-variants.spec.ts` asserts each list equals the token build, so a task that forgets its names fails `ui:test`. | OK |
| 5 | `styles.css` `autogrid-min-*` + class group | Utility as written; the merge group and conflicts are item 5. | OK (after item 5) |
| 5, 7, 8 ↔ storybook `catalogue.spec` | component spacing tokens | Markers per item 4, or `storybook:test` fails (Tasks 7, 8) / docs mislabel (Task 5). | OK (after item 4) |
| 2–8 | `index.ts` | Layout block, sorted by path (item 3). `index.spec.ts` activates the `layouts` tier with Task 2. | OK (after item 3) |
| 6 → PatternField (2a) | transparent layer via `className` | Probe passed (Step 3). PatternField's root `relative` is replaced by `absolute` through twMerge. | OK |
| 7 → Plans 3a/4 | frame `ref` as portal container | `ComponentProps<"div">` carries `ref` (React 19), spread onto the root; Task 7 test pins it. | OK |
| 8 | `vitest.setup.ts` `ResizeObserver` | `typeof` guard, replaceable with `vi.stubGlobal` (Step 2 row). | OK |
| Plan 2b final fix wave (R69) | rides 2c batch B | No 2c layout consumes a 2b atom's interface (stories use only 2a atoms). | OK |
