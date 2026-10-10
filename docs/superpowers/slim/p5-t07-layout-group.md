# P5 T7 — The Layout foundation group

**Files:** create `apps/storybook/src/foundations/layout/layout.stories.tsx` + `{breakpoints,autogrid,radii,borders,elevation,card-anatomy,utility-classes}.mdx`. Delete `foundations/spacing/shape.mdx`; move its stories from `spacing.stories.tsx`; drop "Shape" from storySort.

**What it is:** 7 MDX pages, from 6 guideline cards and the spec §6.5 utility map. Visuals: hidden CSF `Layout/Specimens`.

**Specimens**

- `Breakpoints`: bars from `tokensWithPrefix("breakpoint-")`; 1/2/3/4/4 columns.
- `AutoGridCards`: AutoGrid at md (the default) and at `min="xs"`.
- `AutoGridTokens`: spacing-card-min, card-min-wide, grid-gap.
- `Radii`: `RadiusScale`.
- `Borders`: subtle, default, brand + `shadow-focus-ring`, strong.
- `BorderTokens`: widths, colours, focus.
- `DepthLadder`: `ShadowLadder`, plus a z-* stacking table.
- `CardAnatomy`: Card default / feature / quiet / isInteractive / brand / ink.
- `UtilityClasses`: container-page, section-y, autogrid(-wide), cluster, line-clamp-2, text-h1-fluid, scrim-bottom.

**Pages:** `Layout/<Page>`, each with a `{/* source: guidelines/<card>.card.html */}` comment. Utility classes: `.pp-*` → utility table.

**Prose rules:**

- 360 floor; no bare `1fr`; nothing clips text; `min-w-0` on text rows.
- Radius by job: pill · lg card · xl sheet · md input.
- `shadow-brand`: primary CTA + floating add only. Blur: header + scrims only.
- No coloured left border on cards.
- Focus: 2px outline, 2px offset; fields 3px ring.

**Tests:** specimens run in `storybook:test` (axe). Keep the moved `BorderWidths` chip-copy play (R56).

**Reuse:** docs-kit scales, `TokenTable`, `SpecimenRow`, `token`, `utilitiesOf`, `spyOnClipboard`; ui `AutoGrid`, `Card`, `ImageSlot`.

**Gotchas**

- Spacing/Shape already has Radii, BorderWidths, Elevation and Stacking. Merge them here; else T9 counts 35 MDX, not 34.
- Take shadow names from `tokensWithPrefix("shadow-","primitive")`, never a hand list.

**Commit:** `feat(storybook): the Layout foundation pages`
