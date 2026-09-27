# Dev-parity audit — Plan 2b (atoms: forms, indicators, menu primitives)

Plan: `docs/superpowers/plans/2026-09-27-ds-02b-atoms-forms-indicators.md`. The only file edited.
Dev read with `git show dev:packages/ui/src/atoms/<name>/<name>.{tsx,test.tsx,stories.tsx}`,
cross-checked against the design-system `.jsx` / `.d.ts` / `.card.html` where dev and the plan
disagreed on shape.

**Totals: ADD 61 · DROP 28 · ALREADY 104** across 13 ported components. Slider and Countdown are
marked `**Dev reference:** none (handoff component)`. Task 0 Step 3 now checks that the 13 tables
and the 2 handoff markers exist. Task 0 Step 4's probe now also covers `max-w-56` and
`tabular-nums`, the two classes the ADDs introduce.

## Per component

| Task | Component | ADD | DROP | ALREADY | Notable |
| --- | --- | --- | --- | --- | --- |
| 2 | Input | 4 | 1 | 14 | ADD: `type="text"` default; disabled swallows typing; axe at rest / read-only / multiline; `argTypes` turning off the `icon` / `trailing` controls. DROP: glyphs shrinking at sm (Input.jsx keeps one size, D2). ALREADY: "disabled wins over a status". `has-disabled:` out-specifies the status colour, and the width stays 2px as Input.jsx draws it. |
| 3 | Select | 8 | 4 | 8 | DROP: Radix popover (§3.3, D7), `onValueChange` (D17), "Choose one" default (D9), string options (§8.2). ADD: warning ≠ invalid; disabled real fill; `id` / describedby / required reach the select; className on the box; axe over disabled + read-only; md in the size story; a disabled option in a story; `argTypes`. |
| 4 | Checkbox | 4 | 2 | 10 | DROP: Radix + `onCheckedChange` (D7 / D17); **indeterminate**. See P1. ADD: a disabled row ignores clicks; className replaces `gap-3`; axe with a disabled row; `AddOnList` story (plain fieldset). |
| 5 | Radio / RadioGroup | 8 | 1 | 7 | DROP: Radix RadioGroup (D7 / D17). ADD: a click moves the choice and unchecks the last; a disabled option ignores clicks, with a real fill; option-level `isInvalid`; className on the option row and on the fieldset; axe over a horizontal group with a disabled option; `States` and `PortionPicker` stories. |
| 6 | Switch | 5 | 1 | 7 | DROP: Radix Switch (D7 / D17). ADD: Tab + Space with a focus ring on the track; disabled ignores clicks; className replaces `gap-3.5`; axe off / on / disabled; `PreferencesPanel` story. |
| 8 | Spinner | 2 | 4 | 6 | DROP: unlabelled means hidden (contract default `label = "Loading"`), sizes xs–xl (card 24/36/52), tones muted / subtle / onBrand / current (contract, D5), the inherit-colour story. ADD: className merges and wins; inverse on ink as well as brand. |
| 9 | Skeleton | 2 | 1 | 8 | Dev's `label` → role=status is ALREADY (differently): the contract has no `label`, so the region is named once. The `card shape` story and the axe test now show `role="status" aria-label aria-busy` on the wrapper. DROP: the `h-20` block floor (Skeleton.jsx is 16px). ADD: className on the line stack. |
| 10 | ProgressBar | 7 | 3 | 9 | DROP: Radix Progress (D7), size lg, optional `value`. ADD: real share of any `max`; the segment count overrides `max`; **a fractional `segments` now throws `RangeError`** (dev rounded it, and the plan's rule is that impossible input throws; the code, test and Interfaces line are updated); className; a broader axe test; an inverse continuous bar; a 360px stamps story. |
| 11 | Rating | 6 | 1 | 9 | DROP: size xs. ALREADY (differently): a score above max throws instead of clamping. ADD: className; `tabular-nums` on the score and count; a broader axe test; a 0 value, a count without the score, and an `OnAnOutletCard` story. |
| 12 | SpiceLevel | 3 | 5 | 6 | DROP: the default level (D9 / contract), the "Spice level: Mild" name (spec §9.1 says "3 of 4"), `max` 1–3 and its story (contract `max?: 4`), size xs. ADD: className; axe at level 1; an in-menu-row story. |
| 13 | DietMark | 1 | 2 | 5 | DROP: egg (C10), size xs. ADD: className replaces the size token. |
| 14 | PriceTag | 7 | 1 | 7 | DROP: paise (spec §7.4 "rounded, no decimals"). ADD: lakh grouping `₹1,25,000`; no `<s>` without a discount; **root `flex-wrap`**; a broader axe test; `₹1,25,000` in a story; the tone story now shows ink and brand with `was`, plus inverse with `was` on brand. |
| 15 | Tooltip | 4 | 2 | 8 | DROP: a separate `TooltipProvider` (spec "provider included"), className on the pill (the contract takes no native props). ADD: closes when focus leaves; adds no button of its own; **`max-w-56` replaces `whitespace-nowrap`**, so a long hint wraps at 360px, with a `LongHint` story whose play measures it. ADD pending: controlled / uncontrolled open. See P2. |

## Proposed contract deltas (2)

**P1 — `CheckboxProps.isIndeterminate` (recommend reject).** Ruled DROP in the plan until the
controller decides.

```ts
// contracts §3, interface CheckboxProps — add
isIndeterminate?: boolean; /* select-all row whose children are partly chosen */
```

Cost if accepted: a native mixed state exists only as the `indeterminate` DOM property, so
`checkbox.tsx` needs `"use client"` and a ref callback (`(el) => { if (el) el.indeterminate = … }`)
merged with the consumer's ref. The Minus glyph would come from
`group-has-indeterminate/choice:`. Every Checkbox would ship JS, against D6 and the plan's rule
that only `tooltip.tsx` and `countdown.tsx` are client files. No design-system file
(`Checkbox.d.ts` / `.jsx` / `.card.html`) and no handoff page uses a mixed state (grep of
`zip-files` finds none).

**P2 — `TooltipProps` open state (recommend accept).** Ruled ADD in the plan, not implemented
until ruled.

```ts
// contracts §3, interface TooltipProps — add (spec §8.1 naming: open / defaultOpen / onOpenChange)
open?: boolean;
defaultOpen?: boolean;
onOpenChange?: (open: boolean) => void;
```

If accepted, Plan 2b Task 15 changes as follows:

- Props are declared `?: T | undefined` (R13).
- Radix's `TooltipPrimitive.TooltipProps` declares these without `| undefined`, and
  `exactOptionalPropertyTypes` is on, so build the Root props by omission. Dev's
  `const rootProps: TooltipPrimitive.TooltipProps = {}; if (open !== undefined) rootProps.open = open; …`
  works.
- Add three tests: `defaultOpen` renders the tooltip on mount; `open` holds it open; focus calls
  `onOpenChange(true)`.
- The Sides story can then show all four open at once, as dev's did.

## Cross-plan notes

- **Plan 2a Button:** dev's Spinner had `tone="current"` and xs / sm sizes for Button's loading
  state, so the spinner matched the label on white and on flooded pink. The rewrite's Spinner drops
  both. Button's `isLoading` glyph must draw in `currentColor` itself.
- **Plan 3a Field / SearchField:** dev Input and Select stories used a leading icon + a trailing
  ghost "Apply" `Button` (Ticket), and a Clock-icon slot picker. Those compositions belong to the
  Field / SearchField stories, because an atom story may not compose Button. SearchField can render
  inside `lib/field-control.tsx`.
- **Plan 3a ListRow:** dev Switch `PreferencesPanel` is the settings list. In the kit it becomes a
  ListRow with a bare `Switch isLabelHidden` (deviation 4).
- **Plan 3b CheckCard / ChoiceCardGroup / item sheet:** dev Checkbox `AddOnList` and Radio
  `PortionPicker` (priced, described, one option disabled) are the real item-sheet shapes. The
  atom stories now carry plain versions; the molecules should reproduce them.
- **Plan 3b OutletCard / ReviewCard:** dev Rating `OnAnOutletCard` (sm + count). ReviewCard uses
  `variant="symbol"`.
- **Plan 3b MenuItemRow / MenuItemCard:** dev SpiceLevel and DietMark `InContext` (sm, beside the
  dish name). The size choices are already in this plan's "Decisions" table.
- **Plan 3b LoyaltyCard:** six stamps at the 360px floor (dev `Narrow`), size sm.
- **Plan 3b / 4 PriceSummary, CartPanel:** dev PriceTag's inverse-on-brand story (the struck price
  on pink).
- **Plan 5:** dev's `packages/ui/src/docs/` Foundations MDX is not in this plan's scope.

## Concerns

1. **R19 vs the plan's own tests (not a parity item, but it will go red).** These tests find the
   mark as an inline SVG:
   - Input and Spinner: `markIn` (`svg[viewBox=ARTWORK.symbol.viewBox]`).
   - Rating: `.bg-pink-500 > svg` and `svg.opacity-22`.
   - SpiceLevel: `.bg-heat-1 > svg`.

   The controller amendment R19, and the built `brand-artwork.ts` (which exports only `Mark`,
   `Artwork` and `ARTWORK`), make `SymbolMark` a `mask-symbol` span. Task 0 Step 1 also still
   expects `SYMBOL_DATA_URI_WHITE`. Task 0 has to patch these selectors to
   `.mask-symbol` / `> span`. I did not, because it is outside the parity scope. None of my added
   tests depend on the SVG.
2. The appended controller amendments are not folded into the task code:
   - the read-only Select's hidden `<input>`;
   - R21 (field text at `text-body` for every size), which contradicts Task 2's
     `text-body-sm` / `text-control` size assertions;
   - `rounded-diamond`.

   An implementer has to merge them. My amendments do not conflict with them.
3. **P2 must be ruled before Task 15 runs.** Otherwise the Tooltip ships without the open-state
   props that spec §8.1's convention implies.
4. The Tooltip wrap depends on Radix's popper wrapper sizing to `max-content`, so short hints
   still sit on one line as Tooltip.jsx's `nowrap` does. The `LongHint` play checks it in
   Chromium, but jsdom cannot.
