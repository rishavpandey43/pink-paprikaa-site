# Dev-parity audit — Plan 2a (atoms, core)

Plan: `docs/superpowers/plans/2026-09-27-ds-02a-atoms-core.md`. Components audited: the 13 atoms in
Tasks 2–14. Icon and Logo are Plan 1 and were skipped. Task 1 (shared library) has no dev
counterpart, so it is marked `**Dev reference:** none`. Task 0 gained Step 6, "Dev parity tables
present on every ported-component task" (a grep that expects 13).

**Totals: ADD 51 · DROP 40 · ALREADY 50.** One ADD waits on a contract delta.

## Per component

| Task | Component      | ADD | DROP | ALREADY | Notable items |
| ---- | -------------- | --- | ---- | ------- | ------------- |
| 2    | Text           | 6   | 5    | 4       | ADD: `isBalanced={false}` opts a heading out of balance. It goes through the `className` merge, because tailwind-variants reads an unset boolean as `false` (checked in `tailwind-variants@3.3.1` `getVariantValue`). ADD: tests for the `as="h1" variant="h2"` outline and for "no align/measure class". ADD: stories for `on-brand`, all seven fluid steps, and prose + narrow measure. DROP: the caption/overline `muted` default (contracts §2), the free `as` element, and the D4 step names. |
| 3    | Link           | 7   | 5    | 3       | ADD (a11y): the external arrow is announced "Opens in a new tab" (`role="img"`). The plan's arrow was silent. It is written as a separate element, because Icon's `label?: string` predates R13. ADD: tests for no target/rel on an internal link, `onClick`, and a caller className replacing the colour. ADD: stories for `iconAfter`, inverse on ink, and `InFooterNav`. DROP: required `href` (asChild), the 14px glyph at sm (`Link.jsx`), and the 20px AA-large story (§5.1). |
| 4    | PatternField   | 3   | 3    | 4       | ADD: `isolate` on the root (texture stacking), a radius-override test, and the `FullBleedBand` story. DROP: SVG `<pattern>` + `useId` (R19), the free numeric tile (§8.2), and `"use client"`. |
| 5    | SocialHeadline | 3   | 7    | 3       | ADD: a size-override test, and the `Alignment` and `OnACanvas` stories. DROP: `on` (D5); 88% body on dark (§3.2.2); the default `p` element (plan deviation 4); the size-dependent default measure and `none` (contracts §2 plus `SocialHeadline.d.ts`, one 18ch default); `align="end"` moving the block (`.jsx`). |
| 6    | Button         | 1   | 3    | 3       | ADD: a test that a disabled button does not fire. DROP: the Spinner loader (D14, atoms import only Icon). The `not-disabled:` guards are ALREADY covered by `controlStates` variant order and `aria-disabled:pointer-events-none`. |
| 7    | IconButton     | 3   | 3    | 4       | ADD: a radius-override test, the `OverPhotography` story, and a disabled secondary. DROP: the glass shadow and hover (`IconButton.jsx`). |
| 8    | Tag            | 6   | 3    | 2       | ADD: the press scale for interactive tags. `controlStates`' own doc already names "interactive Tag", but the class was missing. ADD: the selected-hover darken (readme §3.8) through the new `color-tag-selected-hover` token (brand-hover; ink-800 on brand), restored in `light.json`, with two contrast pairs (5.18 and 16.1). ADD: tests for a decorative glyph and a radius override. ADD: a disabled+selected story and `CategoryFilterRail`. DROP: always-a-button (§9.1) and the border tint on hover. |
| 9    | Card           | 5   | 2    | 4       | ADD: tests for no-fade, a nested link owning the interaction, and a radius override. ADD: the `Paddings` and `InteractiveWithLink` stories. |
| 10   | Divider        | 3   | 2    | 5       | ADD: a rule-colour override test, the plain line on brand, and `BetweenMenuRows`. The labelled row is ALREADY covered by the `aria-label` naming (plan deviation 4). |
| 11   | ImageSlot      | 2   | 2    | 6       | ADD: the `Ratios` story shows all seven ratios. **ADD pending (delta 1):** native div props forwarded to the root. DROP: the "Dish photo" default (D9) and the arbitrary aspects. |
| 12   | Badge          | 3   | 1    | 3       | ADD: a decorative-glyph test, a radius-override test, and the `OnAMenuCard` story. |
| 13   | StatusDot      | 4   | 2    | 4       | ADD: a gap-override test, a labelled danger row, and the `Sizes` and `OutletStrip` stories. DROP: xs/lg sizes (contracts §2). |
| 14   | Avatar         | 5   | 2    | 5       | ADD (behaviour): the initials stay visible while a photo loads, and for good if it fails. The photo is layered `absolute inset-0` over them, so this stays server-safe; dev used a client Radix Avatar. ADD: `select-none`, tests for icon+name and a radius override, and the `Photo` (incl. a failed path) and `InAGuestRow` stories (no review copy, §10.1). DROP: Radix Avatar (D6/D7). |

## Proposed contract deltas

1. **`ImageSlotBase` forwards native `div` props** (contracts §2). Dev's ImageSlot spreads
   `ComponentPropsWithoutRef<"div">` onto its root (`id`, `data-*`, `aria-*`, `ref`, `style`).
   Contracts §2 gives the rewrite only `className` and `children`, which breaks §0's "every Props
   extends its root's native props" convention. Exact change:
   ```ts
   interface ImageSlotBase extends Omit<ComponentProps<"div">, "children" | "role" | "aria-label"> {
     ratio?: …; radius?: …; tone?: …; isFill?: boolean;
     children?: ReactNode; /* a <picture> from the image pipeline */
   } // drop the explicit `className?: string` (inherited)
   ```
   The component omits `role` and `aria-label` because it sets them on the placeholder. No `div`
   attribute collides with the photo branch (`src`, `alt`, `width`, `height`, `sizes`, `srcSet`,
   `loading`, `fetchPriority`), so the discriminated union survives. Plan 2a Task 11 needs
   `...rest` spread on the root once this is accepted. This was not amended in the plan.

## Cross-plan notes

- **Link's external arrow now joins the accessible name** ("Zomato listing" plus "Opens in a new
  tab"). Plans 3a/3b/4 tests that query an `isExternal` Link by an exact name must use a regex
  or `{ name: /^…/ }`: SiteFooter social links, OutletCard directions, CtaBand WhatsApp links.
- **`tagVariants({ isSelected, isInteractive: true })`** now carries `active:press-scale` and the
  selected-hover classes. ChipGroup and FilterBar (Plan 3b) inherit both. Their class assertions
  may need the new names.
- **Avatar with `src` keeps the initials in the DOM** (under the photo). Plan 3b ReviewCard or any
  molecule test that asserts initials are absent when a photo is given would now fail.
- **Dev `lib/component-props.spec.ts`** (a prop-vocabulary gate: allowed variant keys, `is/has`
  booleans, every variant has a default) and **`lib/token-classes.spec.ts`** belong to the
  library, which is Plan 1. If Plan 1 ports them, Plan 2a's internal Divider `layout` variant key
  and Text's default-less `tone`/`weight`/`align` variants would violate them as written.
- Dev Button's loader was Plan 2b's Spinner. That is dropped here (D14), so no dependency remains.

## Concerns

1. **R19 and the diamond-radius rulings are not applied in the plan body.** Task 1's `SymbolMark`
   test still does `container.querySelector("svg")`. Divider's test reads `rule.querySelector("svg")`
   for the mark, and StatusDot's reads `diamond?.querySelector("svg")`. Task 13 still creates
   `radius.status-dot` (`rounded-status-dot`), where the controller amendment says to create
   `radius.diamond` (`rounded-diamond`). These predate this audit and were left untouched (out of
   scope), but the implementer will hit them.
2. **R13 is not applied to the plan's interfaces.** They still read `?: T`, and only the tail
   amendment mandates `| undefined`. The new code here adds no props, and the story-local
   `SelectableRow` follows R13.
3. **"Opens in a new tab" is a built-in English string**, like StatusDot's tone names. If D9 is
   read to cover a11y chrome, it needs an `externalLabel` prop (a contract delta). I judged it UI
   chrome, not content.
4. The Tag selected-hover ADD adds a component token plus a surface override. It is readme §3.8
   behaviour, but `Tag.jsx` itself has no selected hover. If the controller prefers `Tag.jsx`
   literally, drop that one row (Step 1 token and pairs, one compound, one test assertion).
