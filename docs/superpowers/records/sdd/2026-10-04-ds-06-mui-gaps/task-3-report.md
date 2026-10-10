# Task 3 report: Typography (rename Text) and Link inherits it

Commit: 1ebd380 `refactor(ui): rename text to typography and let link inherit it` (base fb7e784). Not pushed.

## Result
- `atoms/text` -> `atoms/typography` via `git mv` (typography.tsx / .test.tsx / .stories.tsx). `Text`/`TextProps` remain as
  deprecated aliases in `index.ts` (`export { Typography as Text }`, `TypographyProps as TextProps`, JSDoc). `TextTone` and
  `TextVariant` are gone; `TypographyColor` / `TypographyVariant` are exported.
- Typography: `tone` -> `color` (+ `success`, `link`), `noWrap`, `sx` (via `withSx`, className beats sx), `link-sm/md/lg`, `as="a"`.
- Link renders `<Typography as="a">` (or `Slot.Root` with the same `typography()` classes under `asChild`). `variant`
  (link-sm|md|lg|inherit, default link-md), `color` (any Typography colour + `quiet`, default `link`), `underline`
  (always|hover|none). Old classes reproduced exactly (see test matrix). Icons, isExternal sr-only text, asChild unchanged.
- Call sites updated: 17 files in packages/ui, 5 in apps/storybook (+3 mdx text mentions), review-card `size="sm"` -> `variant="link-sm"`.
- Stories: Typography `Colors` (all ten), `NoWrap` (360px play), `LinkVariants`; Link `Colors`, `Underline`, `Variants`,
  `InheritsParagraph` (play: computed fontSize equals the paragraph's).

## TDD evidence
RED, typography (old implementation with renamed symbols, new tests): `Tests 15 failed | 35 passed (50)`, failures: color
colours, noWrap, success/link, link-sm/md/lg, inherit, `takes color and sx`.
RED, link (old link.tsx, new tests): `Tests 15 failed | 13 passed (28)`.
GREEN, typography: `Tests 49 passed` (after dropping the alias test, since the alias moved to index.ts).
GREEN, link: `Tests 28 passed (28)`.

## Gates (final tree)
- `pnpm nx test ui`: 111 files, 1700 tests pass (baseline 1685).
- `pnpm nx run storybook:test`: 109 files, 996 tests pass (baseline 995 + 5 new stories - 4 removed).
  One run showed `app.stories.tsx > Home` failing on a not-visible toast element (untouched code, a toast animation timing
  flake); two reruns passed. Nx also reported storybook:test as flaky.
- `pnpm nx run-many -t typecheck lint -p ui storybook`, `nx test eslint-config`, `nx format:check`, `nx sync:check`: green.

## Deviations / rulings (also in progress.md)
1. **atomic-layering amended.** The brief requires Link (atom) -> Typography (atom); the LAW rule allowed atoms to import
   only Icon, so lint failed. Narrowly extended the rule to `icon|typography` (rule file, its test incl. a `typographyx`
   negative probe, AUTHORING.md, engineering docs 02/06). No eslint-disable. Reviewer should confirm this is acceptable.
   Alternative if not: move the recipe to `lib/` and have Link use it (Link would then not render the Typography component).
2. **`variant="inherit"` is a Typography variant too** (empty class set). Brief said Link "sets text-inherit", but that class is a
   colour and would not inherit size. Without a real "no size" variant Typography's default `body` would force a size.
3. **noWrap = `truncate text-nowrap`.** `truncate` alone did not truncate when `text-pretty`/`text-balance` were present
   (text-wrap shorthand resets white-space); the NoWrap play caught it. A unit test now asserts it.
4. `LinkProps` is built from `ComponentProps<"a">` + `TypographyStyleProps` (new exported interface), not
   `Omit<TypographyProps,...>`, because extending the `<p>`-typed props alongside the `<a>` props conflicts on `ref`/handlers.
   `typography` (the recipe) is exported from typography.tsx for Link's asChild path but not from the barrel.
5. Link's `sx` is applied after Link's recipe and before `className` (so `sx.display` replaces `inline-flex`), not passed on to Typography.
