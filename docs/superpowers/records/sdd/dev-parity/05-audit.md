# Dev-parity audit — Plan 5 (Storybook foundations, kits, docs, gauntlet)

Plan file: `docs/superpowers/plans/2026-09-27-ds-05-storybook-kits-docs.md` (only file edited).

Plan 5 owns no components, so the audit compared dev's Foundations MDX
(`packages/ui/src/docs/{introduction,colour,typography,space-shape-motion,voice-and-accessibility}.mdx`)
and dev's `apps/storybook/**` (`main.ts`, `preview.tsx`, `styles.css`, `README.md`, `package.json`,
`vite.config.mts`, `vitest.config.mts`, `eslint.config.mjs`, `tsconfig*.json`) against the plan's
docs-kit, foundation, records and gauntlet tasks. Most of dev's Storybook config (remark-gfm, a11y
`test: "error"`, addon-vitest browser mode, Chromatic, docgen `include`/`tsconfigPath`, viewports,
token backgrounds) is already on the branch from Plan 1 Task 8, so those rows are ALREADY.

**Totals: 29 ADD · 13 DROP · 63 ALREADY** (105 rows across 10 tasks).

## Per task

| Task | Dev source | ADD | DROP | ALREADY | Notable items |
| ---- | ---------- | --- | ---- | ------- | ------------- |
| 1 Contrast evaluator | dev README "target is red", preview contrast comment | 0 | 1 | 2 | DROP the measured failing-pair snapshot (spec §5.2–§5.4, C13) |
| 2 Plumbing + docs-kit | `.storybook/*`, `package.json`, vite/vitest, the MDX helpers | 1 | 3 | 13 | ADD Swatch click-to-copy name and value (buttons + `role="status"`, new `SwatchCopiesNameAndValue` play, count 10 → 11). MotionDemo label now names the duration (`Play --ease-out over --duration-base`), test updated. DROP Google Fonts (D11), the old storySort (D13/§10.1), old class names (D4, §11.2) |
| 3 Intro + Brand | `introduction.mdx`, `voice-and-accessibility.mdx` | 11 | 1 | 3 | Intro gains the personality line, a layers table plus the layering rule, what `styles.css` brings, "stock Tailwind scales do not exist", "before you add a component", and a full Accessibility section (guarantees + what each use owns, restated for D5/D7/§5.5). Voice page gains the two-`a` rule. DROP the hand-classed hero panel (D4, R23) and keep its line as prose |
| 4 Colors | `colour.mdx` | 2 | 1 | 10 | ADD copy (via Swatch) and the `text-text-*` / `border-border-*` naming note on Semantic. DROP August names (D4) |
| 5 Type | `typography.mdx` | 4 | 1 | 9 | ADD "all text through `Text`", `isFluid` usage with a code example, why the small end has no twin, and `measure` narrow for pull quotes. The fluid.mdx fence became 4 backticks for the nested code block. DROP `subtitle1`/`body1` names (D4) |
| 6 Spacing | `space-shape-motion.mdx` §Spacing/Layout | 1 | 2 | 6 | ADD `ChromeTokens` (header, header-compact, tabbar, dock-clearance, hit) on Layout rhythm, and the same names in the Task 0 Step 4 check. DROP 72px header (C1), `--layout-*` names (D4) |
| 7 Layout | `space-shape-motion.mdx` §Breakpoints/Radius/Elevation/Cards | 0 | 1 | 9 | Everything is covered. DROP `rounded-1..6`, `shadow-elevationN` (D4). Wording fix below |
| 8 Motion | `space-shape-motion.mdx` §Motion | 4 | 2 | 6 | ADD `Durations` (one curve, four durations), `Animations` (the seven keyframes live, with a play asserting each `animationName`), the "entrances play once" note and how to check reduced motion. DROP the August keyframes (D1/§6.5) and arbitrary classes (§11.2) |
| 14 Records | dev `apps/storybook/README.md` | 4 | 1 | 4 | README replacement gains the `MainFileMissingError` note and a "Story tests" section (render → play → axe, Chromium not jsdom, the separate jsdom suite, watch-mode deep link). It also keeps Plan 1's "founder guard covers this build" section, which the replacement would have deleted. DROP "target is red" (§5, C13) |
| 15 Gauntlet | dev `main.ts` comments (two regressions on record) | 2 | 0 | 1 | The Step 7 sweep now fails on a raw Markdown table on any docs page (remark-gfm) and on an empty props table on a `packages/ui` component docs page (docgen). `.docblock-argstable-body` was verified in the installed addon-docs 10.5.7 |

Tasks 9–13 are marked `**Dev reference:** none`: dev has no Marketing foundations, no kits and no
form-library story. Task 0 gained A20 ("Dev parity tables present on every ported-component task")
and A21 (the landmark findings below). Its report line now reads A1–A21.

Requested wording fixes: "fields use the inset ring" is now "the 3px focus ring" in Layout → Borders
(which also names `shadow-focus-ring`, an outer spread) and in Motion → States.

## Proposed contract deltas

None. The docs-kit helpers are Plan 5's own. Contracts §8 names them but fixes no signatures.

## Cross-plan notes

- **Plan 2c (layouts):** on dev's first `storybook:test` run, `AppShell` failed `landmark-unique`
  and `Cluster` (scroll rail) failed `scrollable-region-focusable`. The Cluster case is already
  Plan 5 A10.
- **Plan 4 (organisms):** on the same run, `SiteHeader` failed `landmark-unique` and
  `landmark-no-duplicate-banner`, and `TabBar` failed `landmark-unique`. Plan 5 A21 checks these
  before the kits compose them. The fix belongs to the component tasks, not the kits.
- **Plan 1:** Plan 1's Storybook globs still include `packages/ui/src/**/*.mdx`. The rewrite puts
  all docs MDX in `apps/storybook/src`, so that glob is inert. It is harmless.

## Concerns

1. Task 14's README replacement still drops two parts of Plan 1's current README. They are not dev
   items, so they are left as-is for the controller: the "How it consumes the design system"
   paragraph (Fontsource, `@source` scope) and the `build`/`serve-static` alias paragraph.
2. `animate-spin-pulse` has no consumer in Plans 2–4 (grep finds none). The Animations specimen
   shows it as "the diamond pulse". If it really is unused, Plan 1 may want to drop the keyframe.
3. The empty-props-table sweep check can flag a component whose props are all native. The Expected
   text tells the implementer to list such a page with its reason. Any other hit is a docgen
   finding.
4. Swatch copy uses `navigator.clipboard`, which only exists in a secure context. Localhost is
   fine, and D16 (local and static build only) keeps it there. A static build served over plain
   http from another host would log an error on click.
