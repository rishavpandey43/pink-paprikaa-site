# Atom parity audit — design handoff 6b1e28a vs built (2026-10-04)

Read-only. `D/` = `zip-files/Pink Paprikaa Design System/components/atoms/`, `U/` = `packages/ui/src/`,
`IX` = `zip-files/Pink Paprikaa Design System/handoff/INTERACTIONS.md`. Mapping per API spec §4–§5
(`tone`→`color`/`status`/`surface`, `on=`→`data-surface`, booleans `is/has`, `showX`→`hasX`,
`size` px numbers→`sm/md/lg`, `style`→`sx`/`className`, `name: string` icon→`IconComponent`). A
renamed-but-equivalent prop is not counted as a gap.

## Summary

| Component | Status | #gaps |
| --- | --- | --- |
| Avatar | differs | 1 |
| Badge | identical | 0 |
| Button | differs | 5 |
| Card | differs | 2 |
| Checkbox | differs | 5 |
| DietMark | differs | 2 |
| Divider | identical | 0 |
| Icon | identical | 0 |
| IconButton | differs | 8 |
| ImageSlot | differs | 2 |
| Input | differs | 4 |
| Link | differs | 4 |
| Logo | identical | 0 |
| Menu (NEW) | differs (tier: ours molecule) | 11 |
| PatternField | identical | 0 |
| Popover (NEW) | differs (tier: ours molecule) | 6 |
| PriceTag | identical (+`size="canvas"` extra) | 0 |
| ProgressBar | identical | 0 |
| Radio | differs | 3 |
| Rating | identical | 0 |
| Select | differs | 4 |
| Skeleton | identical | 0 |
| SocialHeadline | identical | 0 |
| SpiceLevel | identical | 0 |
| Spinner | identical | 0 |
| StatusDot | identical | 0 |
| Switch | differs | 3 |
| Tag | differs | 4 |
| Text → Typography | identical | 0 |
| TextButton (NEW) | missing | 4 |
| Tooltip | identical | 0 |
| Countdown | extra | — |
| Fab | extra | — |
| Slider | extra | — |
| ToggleButton | extra | — |

Counts: identical 15 · differs 15 · missing 1 · extra 4 (+ `RadioGroup`, exported from `U/atoms/radio/radio.tsx:95`).

## Cross-cutting (fix once, many components)

- [visual] (token) IX:14 state layer: `--state-press` pink-100, `--state-press-danger` #f8d4d4, `--state-hover-neutral` ink-100, `--state-press-neutral` ink-200, `--state-hover-on-color` white 16%, `--state-hover-tint` / `--state-press-tint` ink 6%/12%, `--state-disabled-fill` ink-100 → we only have `button-hover-tint` (pink-50) and `white-alpha-28/40/90` (`packages/design-tokens/tokens/component/button.json`) → add a `state.*` semantic group (surface-aware: on-brand/ink resolve to the white alphas).
- [interaction] (token) IX:12 press scales .92 (icon buttons, choice marks), .94 (page buttons), .99 (cards) → only `--motion-press-scale` .97 (`packages/design-tokens/tokens/primitive/motion.json`) → add `press-scale-icon|page|card` + `@utility` twins next to `U/styles.css:255`.
- [interaction] (token) `pp-pop-in` 140ms (D/Popover.jsx:102, IX:68) → no keyframe in `U/styles.css:417-505` → add keyframe + `--animate-pop-in`; use on Menu/Popover/Select/Combobox/DatePicker content (`data-[state=open]:animate-pop-in`).
- [interaction] IX:58 field hover → `--border-strong` (1px) on Input/Select/DatePicker/Combobox triggers → `U/lib/field-control.tsx:25` has no hover → add `hover:border-border-strong` on the default status, guarded off disabled/read-only/focus-within.
- [visual] Disabled is per-variant in the design (only filled controls go ink-200) → `U/lib/control-states.ts:13-14` paints `bg-ink-200 border-transparent` on every variant → move the disabled paint into each recipe (see Button, IconButton, Tag).

## Per component

### Avatar
- [a11y|api] design `tooltip` shows the name in our Tooltip, "never the browser's title bubble" (D/Avatar.d.ts:12-13, D/Avatar.jsx:28) → we always set `title={name}` (U/atoms/avatar/avatar.tsx:71) → drop `title`; add `hasTooltip?: boolean` that wraps the face in `Tooltip` (needs `tabIndex=0` when standalone).

### Button
- [visual] secondary hover: border pink-600 + text pink-700; ghost hover text pink-700 (D/Button.jsx:18,20; IX:21-22) → only `hover:bg-button-hover-tint` (U/atoms/button/button.tsx:51,53) → add `hover:border-pink-600 hover:text-text-link-hover` (secondary), `hover:text-text-link-hover` (ghost).
- [interaction] (token) secondary/ghost press fill pink-100; on-brand secondary press white 28% (D/Button.jsx:14,18,20) → no `active:` fill → `active:bg-state-press`.
- [visual] inverse hover ink-800, press ink-700 (D/Button.jsx:22, IX:23) → none (button.tsx:54) → `hover:bg-ink-800 active:bg-ink-700`.
- [visual] (token) disabled: secondary = white + 2px ink-200 border, ghost = transparent, on-brand primary = white 30% / white 70% text (D/Button.jsx:13-22, IX:20-25) → one grey fill for all (control-states.ts:13) → per-variant disabled classes; on-brand needs surface-aware `button-disabled-bg/fg` tokens.
- [story] card `states` rows ×5 (rest/hover/press/focus/disabled per variant + on-brand) (D/Button.card.html:32-36) → no `States` story (U/atoms/button/button.stories.tsx) → add `States` using `U/lib/story-ring.ts` for forced focus and pseudo-state params for hover/press.

### Card
- [interaction] (token) press = scale .99 + shadow-1, transform at `--dur-instant` (D/Card.jsx:26-29, IX:51) → hover lift only (U/atoms/card/card.tsx:45) → add `active:press-scale-card active:shadow-1 active:translate-y-0`.
- [a11y] CONFLICT: design makes a `div` with onClick `role=button tabIndex=0` + Enter/Space (D/Card.jsx:22-23) → we use `asChild` around a real `<a>`/`<button>` (card.tsx:19-20) → keep ours (native semantics beat ARIA-on-div); document in the story.

### Checkbox
- [interaction] (token) whole row hover pink-50 / press pink-100, row padding 10/12 with −12px bleed, radius-md (D/Checkbox.jsx:12, IX:61) → no row state (U/lib/choice-control.tsx:17) → add to `choiceVariants.root`: `-mx-3 rounded-md px-3 py-2.5 hover:bg-state-hover active:bg-state-press transition-colors` (shared with Radio/Switch).
- [interaction] box: empty hover border pink-400; checked hover brand-hover, press brand-active; box press scale .92 (D/Checkbox.jsx:8-9,20) → none (U/atoms/checkbox/checkbox.tsx:15-21) → `group-hover/choice:` + `group-active/choice:` variants.
- [visual] disabled = whole row opacity .5 (D/Checkbox.jsx:12, IX:61-63) → grey box + ink-400 text (choice-control.tsx:17, checkbox.tsx:19) → CONFLICT with readme "never opacity" (that rule is for pill controls): recommend follow IX:61 for choice rows (`has-disabled:opacity-50`), keep grey for pills.
- [api] CONFLICT: `error: boolean | string` renders the message (D/Checkbox.d.ts:11-12, .jsx:35-37) → `isInvalid` + Field owns the message (checkbox.tsx:30) → keep ours (§4 status/Field split); no change.
- [story] card `interaction` row (D/Checkbox.card.html:19) → none → add `Interaction` (hover/press/focus forced).

### Radio
- [interaction] row hover/press tint (D/Radio.jsx:10) → none (U/lib/choice-control.tsx:17) → same shared fix as Checkbox.
- [interaction] ring hover pink-400 (checked: brand-hover / brand-active), circle press scale .92, unchecked hover/press fills (D/Radio.jsx:7,17-18) → none (U/atoms/radio/radio.tsx:14-24) → add group-hover/active variants.
- [visual] disabled row opacity .5 (D/Radio.jsx:10) → grey ring (radio.tsx:19) → as Checkbox.

### Switch
- [interaction] row hover/press tint (D/Switch.jsx:9) → none → shared choice-row fix.
- [interaction] track hover ink-400 (on: brand-hover), press ink-500 (on: brand-active); thumb widens 22→26px on press, left 21→17 (D/Switch.jsx:19,25; IX:63) → static track/knob (U/atoms/switch/switch.tsx:12-17) → add `group-hover/choice:` / `group-active/choice:` track colours and `group-active/choice:w-[26px]` via a `switch-knob-pressed` (token) width.
- [visual] disabled opacity .5 (D/Switch.jsx:9) → `bg-ink-200` track (switch.tsx:15) → as Checkbox.

### DietMark
- [api] CONFLICT: `type="egg"` turmeric mark (D/DietMark.d.ts:5, .jsx:6) → veg only, "not even egg (spec C10)" (U/atoms/diet-mark/diet-mark.tsx:23-26) → keep ours (product spec wins on content); ask design to drop the egg row (D/DietMark.card.html:14).
- [story] card `size` 16/20/26 (D/DietMark.card.html:13) → sm 14 · md 16 · lg 20 (diet-mark.tsx:11), no Sizes story → add `Sizes`; 26 not needed unless a surface uses it.

### IconButton
- [api] (token) size `xs` 28px — Alert/Snackbar dismiss (D/IconButton.jsx:5, .d.ts:9, IX:70-71) → sm/md/lg only (U/atoms/icon-button/icon-button.tsx:19; tokens `icon-button-sm|md|lg`) → add `xs` (`icon-button-xs` 28px, keep a 44px hit via `before:-inset-2`).
- [api] (token) CONFLICT: `on="tint"` inherits parent colour, ink 6%/12% hover/press (D/IconButton.jsx:13, IX:32) → missing; `on` props are banned (§4) → add `variant="tint"`: `text-current hover:bg-state-hover-tint active:bg-state-press-tint`.
- [visual] ghost hover glyph pink-600 (D/IconButton.jsx:18) → colour unchanged (icon-button.tsx:44) → `hover:text-pink-600` (surface-aware token).
- [visual] secondary hover border pink-300, press pink-100 (D/IconButton.jsx:16, IX:28) → `hover:bg-pink-50` only (icon-button.tsx:43) → add `hover:border-pink-300 active:bg-state-press`.
- [visual] glass hover white, press pink-50 (D/IconButton.jsx:17, IX:30) → none (icon-button.tsx:45) → `hover:bg-ink-000 active:bg-pink-50`.
- [interaction] (token) press scale .92 (D/IconButton.jsx:42) → `.97` (icon-button.tsx:32) → `active:press-scale-icon`.
- [visual] disabled: only primary gets ink-200; others transparent, secondary 1px ink-200 border, on-brand white 45% glyph (D/IconButton.jsx:43-45) → ink-200 fill everywhere (control-states.ts:13) → per-variant disabled.
- [story] card `states` row (D/IconButton.card.html:17) → none → add `States`.

### ImageSlot
- [api] CONFLICT: design `tone` (soft/strong/ink) and boolean `fill` (D/ImageSlot.d.ts:11-13) → ours `fill` = the colourway and `isFill` = the boolean (U/atoms/image-slot/image-slot.tsx:12-15): same word, two meanings across the boundary → rename ours `fill` → `variant: "soft" | "strong" | "neutral"` (§4: visual style), keep `isFill`.
- [visual] placeholder label colours pink-400 / pink-700 / ink-500 (D/ImageSlot.jsx:9) → pink-700 / pink-800 / ink-600 (image-slot.tsx:60-62) → keep ours (design soft pink-400 on pink-100 fails AA); no change, note only.

### Input
- [interaction] hover border-strong (D/Input.jsx:54) → none (U/lib/field-control.tsx:25) → cross-cutting field fix.
- [api] `type="number"` → `type=text inputMode=decimal`; date/datetime-local/month/week/time/color/file/range refused with a dev warning naming DatePicker/SlotPicker (D/Input.jsx:14-15,33-38, .d.ts:27) → type passes through (U/atoms/input/input.tsx:76) → narrow `type` to `text|email|tel|password|url|search|number` and map `number`.
- [visual] value 15px (14 sm) (D/Input.jsx:73) → 16px every size (field-control.tsx:36-39, R21 iOS zoom) → keep ours; note.
- [api] CONFLICT: label/hint/error|success|warning strings/required/optional live on Input (D/Input.d.ts:7-38) → in Field (input.tsx:12) → keep Field composition; no change.

### Link
- [api] `disabled`: no href, `aria-disabled`, `tabIndex=-1`, ink-400, no underline (D/Link.jsx:20-21,28, IX:40) → no prop (U/atoms/link/link.tsx:16-33) → add `isDisabled`.
- [interaction] press: link → brand-active, muted/quiet → pink-700, inverse → white 16% bg + solid underline (D/Link.jsx:12-15, IX:40-42) → no `active:` styles (link.tsx:47-52) → add per tone.
- [visual] quiet hover shows a pink-200 underline (D/Link.jsx:15, IX:41) → `{tone:"quiet", underline:"hover"}` is `decoration-transparent` with no hover class, so it never underlines (link.tsx:84) → `decoration-transparent hover:decoration-link-underline`.
- [story] card `states` row (D/Link.card.html:18) → none → add `States` (incl. disabled).

### Menu (NEW in design; ours `U/molecules/menu`)
- [api] tier: design atom, one panel behind Select/Combobox/ActionMenu (D/Menu.prompt.md:1) → molecule, Radix DropdownMenu (spec §6) → keep molecule; Select/Combobox must reuse its item recipe so every list looks the same.
- [visual] (token) row hover/keyboard-active pink-50 (danger: danger-soft), press pink-100 (danger #f8d4d4) (D/Menu.jsx:92, IX:64) → `data-highlighted:bg-surface-sunken`, no press (U/molecules/menu/menu.tsx:24) → `data-highlighted:bg-state-hover active:bg-state-press` + danger twins.
- [visual] selected/chosen = pink-700 text, 600 weight, brand diamond (StatusDot live 14px) at row end (D/Menu.jsx:81,93,103) → brand-soft row fill + semibold (menu.tsx:49) → drop the fill, `text-pink-700 font-semibold`, trailing diamond.
- [visual] row 15px body text, radius-sm, 44px (52 in sheet) (D/Menu.jsx:90-93) → `text-body-sm` 14px, `rounded-md` (menu.tsx:24) → `text-body rounded-sm`.
- [visual] group label mono 10.5px uppercase .08em subtle (D/Menu.jsx:79); meta mono 12px subtle (L101) → `MenuLabel` caption semibold muted (menu.tsx:30); shortcut caption muted (L28) → mono styles.
- [visual] panel radius-md (D/Popover.jsx:105) → `rounded-lg` (menu.tsx:23) → `rounded-md`.
- [interaction] (token) open = `pp-pop-in` (D/Popover.jsx:102) → none → cross-cutting.
- [interaction] Tab closes the menu (D/Menu.jsx:55) → Radix swallows Tab (`node_modules/.pnpm/@radix-ui+react-menu@2.1.24…/dist/index.mjs:313`) → `onKeyDown` Tab → close via controlled `open`.
- [interaction] ≤640px bottom sheet: full width, radius-xl top, drag handle 40×4, title 18px, `pp-sheet-in`, overlay scrim, 52px rows (D/Popover.jsx:25-26,76-93; IX:68) → floating panel at every width → add a sheet mode (`--animate-sheet-in` exists, `U/styles.css:39`).
- [api] `emptyText` "Nothing here yet." (D/Menu.jsx:14,76) → none → add `MenuEmpty` row.
- [story] card rows listbox · groups+meta · menu · empty · sheet (D/Menu.card.html:17-21) → no listbox/groups-meta/empty/sheet story (menu.stories.tsx) → add 4.

### Popover (NEW in design; ours `U/molecules/popover`)
- [api] tier atom → molecule (spec §6) → keep.
- [api] CONFLICT: anchors to its parent, `open`+`onClose(reason)`, `placement` bottom/top-start/end, `inline`, `width/minWidth` (= anchor width)/`maxHeight` 320 (D/Popover.d.ts:3-24) → Radix `trigger`, `side`+`align`, `open/onOpenChange` (U/molecules/popover/popover.tsx:32-53) → keep ours (§4 `open/onOpenChange`); map `placement` = `side`+`align`; add `matchTriggerWidth` (`--radix-popover-trigger-width`) for pickers.
- [interaction] ≤640px bottom sheet (`sheet="auto"`) (D/Popover.jsx:25-26) → none → shared sheet mode with Menu.
- [visual] radius-md, padding 6, no title row except in sheet (D/Popover.jsx:71,105) → `rounded-lg p-popover-pad` + h4 title (popover.tsx:21-23) → `rounded-md`; padding stays (ours is the "custom panel" use).
- [interaction] (token) `pp-pop-in` → none → cross-cutting.
- [story] `inline sheet` row (D/Popover.card.html:16) → none (Mobile360 is floating) → add `Sheet`.

### Select
- [interaction] our own trigger (`button role=combobox aria-haspopup=listbox`) + Menu listbox: brand-diamond chosen row, arrows/Home/End/typeahead, Esc returns focus, chevron rotates 180°, focus ring held while open, bottom sheet ≤640px (D/Select.jsx:58-92, .prompt.md:1,6; IX:68) → native `<select>` (U/atoms/select/select.tsx:35-39,75) → rebuild on Radix Select in FieldControl as spec §6.1 already mandates; keep hidden native select for posts.
- [api] `onValueChange`, `defaultOpen`, option `description`; option flag named `disabled` (D/Select.d.ts:3,31,37; card L14) → none; ours `isDisabled` (select.tsx:15) → add `onValueChange`/`open`/`defaultOpen`/`onOpenChange`, option `description`; keep `isDisabled` (§4 booleans).
- [interaction] trigger hover border-strong (D/Select.jsx:70) → none → cross-cutting.
- [story] `open` row (D/Select.card.html:22) → impossible with native → add `Open` after rebuild.

### Tag
- [visual] unselected hover: border pink-300 + text pink-700; press pink-100 (D/Tag.jsx:23-25, IX:43) → `hover:bg-pink-50` only (U/atoms/tag/tag.tsx:46) → add `hover:border-pink-300 hover:text-pink-700 active:bg-state-press`.
- [visual] selected press brand-active (D/Tag.jsx:23-24) → hover only (tag.tsx:51) → `active:bg-button-primary-bg-active active:border-…` (surface-aware).
- [visual] (token) disabled ink-100 fill (`--state-disabled-fill`) + ink-200 border (D/Tag.jsx:23-24, IX:43) → ink-200 fill, transparent border (control-states.ts:13) → per-recipe disabled.
- [story] card `states` row (D/Tag.card.html:16) → none → add `States`. (Ours `color` prop is extra vs design — keep, handoff delivery-zone chips.)

### TextButton (NEW in design — missing)
- [api] text-only action: `tone` brand|neutral|danger, `on` light|dark|brand, `size` sm 30 / md 36, `caps`, `icon`/`iconAfter` (16px), `loading` (spinner, `aria-busy`), `disabled`, `type` (D/TextButton.d.ts:3-21) → nothing → new atom `U/atoms/text-button/`: `color: "brand"|"neutral"|"danger"`, surface via `data-surface` (CONFLICT: `on` → surface-aware tokens, §4), `isCaps`, `isLoading`, `asChild`.
- [visual] (token) INK table: light pink-600/ink-700/danger, hover pill pink-50/ink-100/danger-soft + one-step-darker text + underline (not caps), press pink-100/ink-200/#f8d4d4 scale .97; dark (ink) pink-300/white, white 16%/28%; brand all white; disabled ink-400 / white 40% / white 50%; Poppins 700 15/13.5, caps 12.5/12 .06em (D/TextButton.jsx:35-54,75-89; IX:33-35) → needs `state.*` tokens (cross-cutting) + `text-button-*` text tokens.
- [interaction] Toast/Snackbar actions use TextButton caps sm (`on=brand` for brand/success/danger, `dark` for ink) (IX:69-70) → Toast hand-rolls its action (U/molecules/toast/toast.tsx:41-42) → swap to TextButton once built.
- [story] card rows brand · neutral · danger · on dark caps · on brand caps · loading/icons, each rest/hover/press/focus/disabled (D/TextButton.card.html:15-20) → add 6 stories. (`usePress`/`mergeHandlers` exports are JS-runtime plumbing; CSS `:hover/:active/:focus-visible` covers them — skip.)

## Identical (verified, no gaps)
Badge (`tone`→`color`×`variant`, D/Badge.jsx:4-12 ≡ U/atoms/badge/badge.tsx:26-44) · Divider (`on`→surface) · Icon (`title`→`label`) ·
Logo (`tone` pink/white/badge → `color` brand/inverse/badge; `width/height` → classes) · PatternField (`tone`→`surface`, `opacity`→`density`) ·
PriceTag (`tone` ink→`color` neutral) · ProgressBar (`tone` mint→`color` success, `height`→`size`; `label` now required) ·
Rating (`showValue`→`hasValue`, `symbol`→`variant`) · Skeleton (`circle`/`lines`→`variant`) · SocialHeadline (`size`→`variant`, `on`→surface, `max`→`measure`) ·
SpiceLevel (`showLabel`→`hasLabel`) · Spinner (`tone` ink→`color` neutral) · StatusDot (`tone`→`status`, `pulse`→`isPulsing`) ·
Typography (`tone`→`color`, `clamp`→`lineClamp`, `fluid`→`isFluid`; `Text` alias `U/index.ts:52`) · Tooltip (Radix; 0ms delay, 8px offset, 12.5px ink pill).

## Extra (ours, design lacks) — keep
Countdown (handoff launch bar) · Fab, ToggleButton (spec §6) · Slider (native range, spec §6.1) · RadioGroup (fieldset wrapper). Ask design to card them.
