# Dev-parity audit — Plan 3b (molecules: domain, marketing, handoff patterns)

Plan: `docs/superpowers/plans/2026-09-27-ds-03b-molecules-domain.md`. Only that file was edited.

Nine tasks port a dev component (Tasks 1–9). Eleven tasks are handoff components with no dev counterpart
(Tasks 10–20: ChoiceCardGroup, CheckCard, ChipGroup, KeyValueList, Steps, FeatureItem, PricingCard,
LinkCard, StickyActionBar, AnnouncementBar, Table). Those carry `**Dev reference:** none (handoff component)`
and are otherwise unchanged. Task 0 gained check **l**: "Dev parity tables present on every
ported-component task."

**Totals: ADD 55 · DROP 17 · ALREADY 70.**

## Per component

| Task | Component    | ADD | DROP | ALREADY | Notable items                                                                                                                                                                                                                                                                                                                                                   |
| ---- | ------------ | --- | ---- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | MenuItemRow  | 6   | 2    | 10      | ADD: thumbnail `size-20 sm:size-26` (80px at 360); the Add action is named with the dish (story `addButton(name)` + `action` JSDoc); tests for no heat, no control and className merge; stories `AsAMenuSection`, `SpiceLevels`, `InCart`, `Narrow` (360 play). DROP: `diet`/egg (C10), `onAdd` (§9.2).                                                        |
| 2    | MenuItemCard | 9   | 3    | 8       | ADD: body `flex-1` + footer `mt-auto` so a grid lines up; description `line-clamp-2`; tests for lift-only-when-link, the stretched `after:inset-0` link, no action, photo, className; stories `InAGrid`, `Narrow`. The meta width decorator moved into a `cardWidth` story decorator: Storybook concatenates decorators, so the old `decorators: []` removed nothing. DROP: old class names (D4), `diet` (C10), `onAdd` (§9.2). |
| 3    | OutletCard   | 7   | 1    | 7       | ADD: `href` + `linkAs` (stretched link, lifts only then, action `relative z-raised` above it). Recorded as **plan deviation 17**. Also root `h-full`; tests for heading level, photo, link/lift, action outside the link, className; stories `StatusStates`, `CustomStatusLine`, `Narrow`. DROP: `StatusDot size="sm"` (D2, design system uses the default).     |
| 4    | ReviewCard   | 5   | 3    | 8       | ADD: tests for the default `data-surface="light"`, no score/meta, className; axe on brand+symbol too; story `WithoutScore`. DROP: `PartialScore` on an invented review (§10.1, real reviews only), `hasValueLabel={false}` (D2), old classes (D4).                                                                                                              |
| 5    | LoyaltyCard  | 7   | 1    | 7       | ADD: tests for the article-first reward, the `sr-only` track name, feature `data-surface="soft"`, the hidden symbol, className; axe on three states; stories `Empty`, `LongReward`. DROP: content defaults `goal=6`/`reward="chai"` (D9). A negative count throws instead of clamping (deviation 11), which counts as ALREADY.                                   |
| 6    | FilterBar    | 4   | 1    | 8       | ADD: `trailing` wrapped `shrink-0`; the note is asserted not to be a radio; className test; story `WithTrailing`. DROP: bare-string options (§8.2).                                                                                                                                                                                                              |
| 7    | LogoLockup   | 4   | 2    | 8       | ADD: `isDecorative` (dev `label=""`), recorded as **plan deviation 18**. Also a className/clear-space test (`className="p-0"` covers dev `hasClearSpace={false}`), axe on three, story `ClearSpace`. DROP: `tagline` override and `AlternateTagline` (§7.1: the tagline is artwork), default tone `brand` (D2, deviation 12).                                     |
| 8    | OfferSeal    | 4   | 1    | 7       | ADD: value-only test, no-gradient assertion, className test, axe on three tones and sizes. DROP: old classes (D4). The dev's arbitrary `translate-[18%]` is covered by the enum bleed (ALREADY).                                                                                                                                                                 |
| 9    | CouponTicket | 9   | 3    | 7       | ADD: the `md` ticket stacks below `sm` (horizontal perforation, notches on the side edges) and `lg` artwork always splits; `transition-control active:press-scale` on the copy stub; tests for the live-region announcement, keyboard copy, no hint on print, lg headline, stacking, className; axe on light print; stories `OnTintedPage`, `LongCode`, `Narrow`. DROP: optional `terms` (contract §6 requires it), the "Copied" flash on a refused copy (deviation 8), the PatternField stub (D2). |

## Proposed contract deltas

Both are additive and optional. The plan already implements them, and its "Contract deviations"
table records them as rows 17 and 18.

1. **§6 `OutletCardProps`**: add `href?: string; linkAs?: LinkAs;`. Reason: the spec §9.2 OutletCard row
   lists `href`, §8.2 maps navigation `onClick` to `href`, and dev's OutletCard is a linkable card. It has
   the same anatomy as MenuItemCard: the name is a stretched link, the card lifts only when linked, and the
   action sits above the link.
2. **§6 `LogoLockupProps`**: add `isDecorative?: boolean /* = false */`, forwarded to `Logo`. Reason: dev
   parity. Dev's `label=""` hid the mark when the artwork already names the brand. `title` is not usable,
   because `LogoLockupProps` extends `div` props, where `title` is the HTML attribute.

## Cross-plan notes

- **Plan 4 MenuList (`renderItemAction`)**: dev MenuItemRow and MenuItemCard built the Add control
  themselves, named "Add {dish}", so a menu is not a list of identical "Add" buttons. The rewrite moves the
  control into the `action` slot, so MenuList (and the web app) must pass `aria-label={`Add ${name}`}` (or
  the IconButton `label`). Plan 3b's stories model this.
- **Plan 4 TestimonialWall**: it owns dev ReviewCard's `Wall` story (three brand cards across).
- **Plan 2b**: `PriceTag` covers the dev `was`-is-`<s>` tests. `Rating` covers dev ReviewCard's
  symbol-mark and half-score tests. `DietMark` covers the dropped egg mark (C10).
- **Plans 4 / 5 (locator, kits)**: OutletCard can now take `href`. A kit or organism that lists outlets
  may pass it.
- **Plan 5 marketing kit**: an artboard whose headline already names the brand can pass
  `<LogoLockup isDecorative />`. CouponTicket `size="lg"` stays side by side at every viewport, so a
  scaled PostFrame at 360px is not reflowed. Only `md` stacks.

## Concerns

1. **`decorators: []` is a no-op in Storybook 10.5.** `prepareStory` concatenates story, component and
   project decorators (verified in the installed `storybook` dist). The plan uses it six more times, in
   the handoff tasks I was told to leave unchanged: Task 16 PricingCard (4×, meta decorator
   `max-w-text-measure-prose`) and Task 17 LinkCard (2×). Their grid stories will render squeezed inside
   the meta width. I fixed Task 2's instance because the added `InAGrid` depends on it. The controller
   should apply the same `const x: Decorator` pattern to Tasks 16 and 17.
2. **FilterBar has no `name`/`onBlur`.** Spec D17 lists FilterBar among the value controls that expose
   `name` and `onBlur` for `<Controller>`. The plan's FilterBar (and contract §6) has neither. This is a
   spec gap, not a dev-parity item, so it is not amended.
3. **Viewport globals.** The new `Narrow` stories set `globals: { viewport: { value: "floor360" } }`, as
   dev did. Their plays use explicit `w-80` / `w-90` decorators, so they pass whether or not the vitest
   runner applies viewport globals. CouponTicket's stacked layout is driven by the `sm:` media query, so
   in the runner it is exercised only by the class test.
4. **The CouponTicket stacked layout has no design source.** The design-system card only draws the 560px
   split. The Task 21 parity review should look at it at 360px.
