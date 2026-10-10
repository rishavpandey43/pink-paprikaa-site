# Audit B — molecules vs handoff 6b1e28a

`D/`=`zip-files/Pink Paprikaa Design System/components/molecules/`, `DA/`=`…/atoms/`, `U/`=`packages/ui/src/molecules/`, `FC`=`packages/ui/src/lib/field-control.tsx`. state-hover=pink-50, state-press=pink-100.

## Cross-cutting (fix once, many molecules close)

- X1 [interaction] Fields: hover → `border-strong` 1px (INTERACTIONS.md:58-60; D/Combobox.jsx:85, D/DatePicker.jsx:156, D/SearchField.jsx:24) → `FC:25` has no hover class → add `not-focus-within:hover:border-border-strong` (skip when disabled/read-only/status≠default) to the root slot.
- X2 [visual] Field leading icon turns the status accent (pink-500 default) while focused/open (D/Combobox.jsx:89, D/DatePicker.jsx:162, D/SearchField.jsx:33) → `FC:28` icon is always ink-500 → add `group-focus-within/field:text-pink-500` (+ per-status accent).
- X3 [interaction] Popup open motion `pp-pop-in` 140ms (`--dur-fast`, ease-out), origin top/bottom (DA/Popover.jsx:102; design tokens/base.css:47) → absent from `packages/ui/src/styles.css:39-42` → (token) add `--animate-pop-in` + `@keyframes pp-pop-in`; apply on Menu/Popover/Combobox panels with `motion-safe:`.
- X4 [interaction] ≤640px every Select/DatePicker/ActionMenu/Popover panel renders as a bottom sheet (`pp-sheet-in`, radius-xl top, shadow-4, 40×4 handle, 18px title, 52px rows, max-h `min(70vh,520px)`) (INTERACTIONS.md:68; DA/Popover.jsx:71-84; DA/Menu.jsx:66) → our Menu (`U/menu/menu.tsx:142`) and Popover (`U/popover/popover.tsx:20`) are always floating → add a `sheet?: "auto" | boolean` path. Combobox stays a popover (D/Combobox.prompt.md).
- X5 [interaction] Pressable states come from `usePress` with per-component press scales .97/.92/.94/.90/.99 (INTERACTIONS.md:6-12) → we use `hover:`/`active:press-scale` (one scale .97, `motion.json:21`) → (token) add the scale ladder (`--press-scale-icon` .92, `-page` .94, `-card` .99; stepper .90 per D/QuantityStepper.jsx:12) and `pointer-fine:hover:` or `@media (hover:hover)` for hover.
- X6 [visual] Inset focus rings: rows −2, CouponTicket stub −6, Tabs +4 (INTERACTIONS.md:13) → global +2 (`styles.css:129-131`) → per-component offsets.
- X7 [api] Molecules now compose new/changed atoms: TextButton (Toast, Snackbar), IconButton `size="xs"` + `on="tint"|"brand"` (Alert, Snackbar, SearchField, Combobox), Link subtle sm (Breadcrumb), Card press (MenuItemCard, OutletCard), Tag states (FilterBar). We have no TextButton; IconButton lacks `xs` (`atoms/icon-button/icon-button.tsx:47-51`) → land audit A first. CONFLICT: design's `on` prop → our shared API forbids `on` → map `on` to the surrounding `data-surface`; IconButton/TextButton read it.
- X8 [story] Docs-only forced-state props (`PageButton state`, `Toast actionState`, `TextButton state`) → CONFLICT with "no docs-only props in the public API" → recommend `storybook-addon-pseudo-states` (one dev dep, `pnpm add -D`) and a "States" story per card row that asks for rest/hover/press/focus/disabled.
- X9 CONFLICT [visual] Field/control text is 15px (14 sm) in the handoff → ours 16px at every size (R21: iOS zooms <16px) `FC:36-39` → keep 16px (an accepted deviation).

## Summary

| Component                                                                                                                               | Status                                | #gaps |
| --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ----- |
| ActionMenu (NEW)                                                                                                                        | missing (our `menu` is the primitive) | 9     |
| Combobox (NEW)                                                                                                                          | differs                               | 15    |
| DatePicker (NEW)                                                                                                                        | differs                               | 15    |
| Pagination                                                                                                                              | differs                               | 8     |
| Tabs                                                                                                                                    | differs                               | 4     |
| Toast                                                                                                                                   | differs                               | 5     |
| Snackbar                                                                                                                                | differs                               | 5     |
| SearchField                                                                                                                             | differs                               | 4     |
| SlotPicker                                                                                                                              | differs                               | 3     |
| QuantityStepper                                                                                                                         | differs                               | 5     |
| OtpInput                                                                                                                                | differs                               | 4     |
| ListRow                                                                                                                                 | differs                               | 3     |
| CouponTicket                                                                                                                            | differs                               | 3     |
| Accordion                                                                                                                               | differs                               | 3     |
| Alert                                                                                                                                   | differs                               | 1     |
| Breadcrumb                                                                                                                              | differs                               | 1     |
| MenuItemCard                                                                                                                            | differs (via Card/IconButton atoms)   | 1     |
| OutletCard                                                                                                                              | differs (via Card atom)               | 1     |
| FilterBar                                                                                                                               | differs (via Tag atom)                | 1     |
| EmptyState, Field, LogoLockup, LoyaltyCard, MenuItemRow, OfferSeal, PriceSummary, ReviewCard, SectionHeader, Stat, StepTracker          | identical*                            | 0     |
| Menu (ours; design = atom `Menu`)                                                                                                       | extra/tier + differs                  | 12    |
| Popover (ours; design = atom `Popover`)                                                                                                 | extra/tier + differs                  | 4     |
| ToggleButtonGroup, SpeedDial (API spec §6)                                                                                              | extra                                 | 0     |
| AnnouncementBar, CheckCard, ChipGroup, ChoiceCardGroup, FeatureItem, KeyValueList, LinkCard, PricingCard, Steps, StickyActionBar, Table | extra (dev-parity)                    | 0     |

\* Unchanged in 6b1e28a and built against these files (plans 3a/3b). Props map via §4. I didn't re-diff them line by line. CONFLICT: MenuItemRow/Card `diet:"egg"` clashes with pure-veg; keep no `diet` prop (`U/menu-item-row/menu-item-row.tsx:66`).

Totals: 31 design molecules → 19 differ, 11 identical, 1 missing (ActionMenu). 15 extras (Menu and Popover are a tier clash, the other 13 have no design). 107 gaps (91 on design molecules + 16 on Menu/Popover) + 9 cross-cutting (X1–X9).

---

## ActionMenu — missing (design molecule, NEW)

- [api] `ActionMenu {items, onSelect(value,item), label="More actions", icon="ellipsis-vertical", variant="ghost", size="sm", placement="bottom-end", sheet="auto", title, minWidth=200, defaultOpen}` (D/ActionMenu.jsx:7-23, .d.ts) → nothing; 3-dot is hand-assembled (`U/menu/menu.stories.tsx:69-75`, IconButton md, "More options", `align="start"`) → add `U/action-menu/` (molecule) composing our Menu + IconButton: defaults `icon={EllipsisVertical}`, `label="More actions"`, `variant="ghost"`, `size="sm"`, `side="bottom" align="end"`, `minWidth` 200.
- CONFLICT [api] design `items: MenuEntry[]` (data) vs our compound children → recommend: ActionMenu takes `items` (`{value,label,icon?: IconComponent,description?,meta?,disabled?,isDanger?}` | `{divider:true}` | `{group}`) + `onSelect(value,item)` since it's a convenience wrapper; Menu keeps the compound API. Map `danger`→`color="danger"` on MenuItem.
- CONFLICT [api] `on="brand"` → drop; trigger follows `data-surface` (X7).
- [interaction] trigger `aria-haspopup="menu"`, `aria-expanded`; select closes + refocuses trigger; Esc closes + refocuses (D/ActionMenu.jsx:14-20) → Radix gives this; verify the test asserts focus return after Esc.
- [interaction] sheet on ≤640 with `title || label` as the sheet heading (D/ActionMenu.jsx:19) → X4.
- [interaction] panel `pp-pop-in` → X3.
- [visual] panel/rows as design Menu (see Menu below) → inherits Menu fixes.
- [story] card rows "variants" (ghost, secondary, `icon="ellipsis"`), "on brand", "open" (inside a row card with Avatar, `defaultOpen`, destructive last after divider) (D/ActionMenu.card.html) → add `U/action-menu/action-menu.stories.tsx`: Variants, OnBrand, OpenInRow (play opens).
- [a11y] destructive action last, after a divider, `danger` (D/ActionMenu.prompt.md) → document in JSDoc + test that the danger row has `color=danger` styling and is last in the story.

## Combobox — differs (`U/combobox/combobox.tsx`)

- [api] `size: sm|md|lg` (40/48/56) (D/Combobox.jsx:43) → no size prop (`:25-54`) → add `size`, pass to `FieldControl size`.
- [api] leading `icon` default search (D/Combobox.jsx:27,89) → none (`:306`) → `icon?: IconComponent` default `Search`, pass `FC icon`.
- [api] option shape `MenuItem {icon, meta, text, danger, group/divider entries}` + string shorthand (DA/Menu.d.ts:3-16) → `ComboboxOption {value,label,description,disabled}` (`:17-23`) → add `icon?`, `meta?` (trailing mono 12 text-subtle, DA/Menu.jsx:101); card rows show prices as `meta`.
- CONFLICT [api] `label/hint/error/success/warning/required/optional` built in → ours composes `Field` (`:47-51`) → keep Field composition (shared field pattern); map design props 1:1 onto `<Field>`; `onChange(value,item)`→`onValueChange(value)`.
- [api] defaults `placeholder="Start typing..."`, `emptyText="No matches. Try a shorter word."` (D/Combobox.jsx:26-27) → `placeholder` undefined, `emptyMessage="No matches"` (`:145-146`) → set both defaults (keep prop name `emptyMessage`).
- [visual] trailing slot: clear (when query typed) → else status glyph → else chevron-down md ink-500, pink-500 + rotate 180° when open, `--dur-fast` (D/Combobox.jsx:100-105) → no chevron; clear only when `isClearable` (`:309-324`) → add chevron affordance (`FC` affordance) and the precedence.
- [interaction] clear = IconButton xs ghost, `tabIndex=-1`, `-mr-1.5`, shown whenever the query is non-empty, clears the **query only** and refocuses (D/Combobox.jsx:101) → opt-in `isClearable`, size sm, clears the value (`:221-227,310-321`) → show whenever text≠"" and not disabled; clear text, not `current` (keep `isClearable` only if a value-clear is still wanted, else remove).
- [interaction] active option resets to the first enabled match on open and on every query change (D/Combobox.jsx:57) → typing calls `open(-1)` (`:354`) → set active to first enabled visible option so Enter picks the top match.
- [interaction] Tab closes without committing (D/Combobox.jsx:67) → Tab commits the active option (`:269-273`) → close only.
- [interaction] Esc: open → close; closed → reset query to the chosen label (value kept) (D/Combobox.jsx:66) → closed Esc clears the value too (`:262-266`) → keep value, restore label.
- [interaction] click on the box focuses the input; list opens on typing or ArrowDown/Up (both open, active = first) (D/Combobox.jsx:59,86) → click opens; ArrowUp opens at last (`:236-238,356-358`) → match design (no open on click; both arrows open at first match).
- [visual] match highlight `--pink-700` 700 (D/Combobox.jsx:20) → `mark` = text-heading semibold (`:66`) → `bg-transparent font-bold text-pink-700`.
- [visual] option row: radius-sm, gap 12, font 15, active bg state-hover, press state-press, selected text pink-700 600 + brand diamond (StatusDot live 14) at the end (DA/Menu.jsx:90-104) → `rounded-md`, active `bg-surface-sunken` (ink-100), selected `font-semibold` only (`:63-64`) → `rounded-sm`, `data-[active=true]:bg-surface-page-alt`, `active:bg-surface-brand-soft`, selected `text-pink-700 font-semibold` + trailing `BrandDiamond` 14px.
- [visual] panel radius-md, offset 6px (DA/Popover.jsx:21,105) → `rounded-lg`, `mt-1` (`:60`) → `rounded-md mt-1.5`; add `pp-pop-in` (X3).
- [visual] field hover + icon accent → X1, X2.
- [story] card "selected" row shows a chosen dish with `meta` prices at rest (D/Combobox.card.html) → add `Selected` story (defaultValue, options with meta); others covered (Playground=typing, Empty=no matches, InFieldWithError, Disabled).

## DatePicker + Calendar — differs (`U/date-picker/date-picker.tsx`, `calendar.tsx`)

- CONFLICT [api] value is an ISO string `"2026-10-10"` in and out; `onChange(iso)` (D/DatePicker.d.ts:10-12) → `Date | null`, `onValueChange(Date|null)` (`date-picker.tsx:13-16`) → recommend ISO `string` (`value/defaultValue/onValueChange(iso)`): matches the handoff and the hidden input, and avoids TZ drift on a static site. Convert at the react-day-picker boundary.
- [api] `min`/`max` ISO limits on the field (also disable month nav past them) (D/DatePicker.jsx:30-31,40-41) → only `disabledDays` on DatePicker; `fromDate/toDate` live on Calendar only (`calendar.tsx:24-26`) → add `min`/`max` to DatePicker → Calendar `fromDate/toDate`.
- [api] `isDateDisabled(iso)` → `disabledDays` matcher (function matcher supported) → document the mapping, no change.
- [api] `weekStart: 0|1` default 1 (D/DatePicker.jsx:23) → hard-coded Monday (`calendar.tsx:102`) → add `weekStart`.
- [api] `format(iso)` default "Sat, 10 Oct 2026" (D/DatePicker.jsx:21) → fixed `formatDate` (`date-picker.tsx:104`) → add optional `format`.
- [api] `size sm|md|lg` (D/DatePicker.jsx:118) → none → add, pass to `FC size`.
- [api] `readOnly`: sunken fill, trailing lock, no hover, `cursor:not-allowed` (D/DatePicker.jsx:155,163) → none → add `readOnly` → `FC isReadOnly`.
- [api] `inline`: just the calendar card, 312 wide, surface-card, 1px border-subtle, radius-md, shadow-2 (D/DatePicker.jsx:128-133) → Calendar renders bare (`calendar.tsx:43`) → add `inline` (or a `Calendar variant="card"`) with that chrome.
- CONFLICT [api] built-in `label/hint/error…` → keep Field composition (same as Combobox).
- [interaction] ArrowDown on the closed trigger opens (D/DatePicker.jsx:150) → not handled → add `onKeyDown` ArrowDown→open.
- [interaction] popover width 312, padding 4, maxHeight 420; ≤640 bottom sheet titled `label||placeholder` with roomy 44px cells (D/DatePicker.jsx:167-170, 25 `roomy`) → Radix popover, default padding, no sheet (`date-picker.tsx:83-90`) → set width/padding; sheet via X4.
- [visual] selected day: rotated pink-500 diamond 0.7×cell, radius 6, `shadow-brand`, white bold number (D/DatePicker.jsx:93) → pink-500 square, `rounded-md` (`calendar.tsx:58`) → render a diamond span under the number; drop the square fill.
- [visual] today: pink-700 bold + 5px pink-500 diamond 5px from the bottom (D/DatePicker.jsx:87,95) → bold `text-text-brand` (pink-600), no marker (`calendar.tsx:60`) → `text-pink-700` + `after:` diamond.
- [visual] weekday header: Space Mono 10.5, `.06em`, uppercase, text-subtle, 28px tall, "Mo".."Su" (D/DatePicker.jsx:69) → `text-caption font-medium text-text-muted size-10` (`calendar.tsx:54`) → `h-7 font-mono text-[token] tracking-[.06em] uppercase text-text-subtle` (token) `calendar-weekday` 10.5px.
- [visual] caption: display 700 16px `-.01em` heading; nav = IconButton sm ghost (D/DatePicker.jsx:62-66) → `text-h4` = 20px; custom nav button `hover:bg-button-hover-tint` (`calendar.tsx:48-51`) → 16px caption (token); style nav like IconButton sm ghost (hover pink-50 + pink-600 glyph, press pink-100 .92, disabled ink-400).
- [visual]/[interaction] day: font 14.5 tabular-nums, radius-sm; hover pink-50; press state-press + scale .92; disabled ink-300 + line-through `ink-200` decoration (D/DatePicker.jsx:80-99) → `text-body-sm` (14), `rounded-md`, hover `bg-surface-sunken` (ink-100), no press, disabled ink-400 (`calendar.tsx:56-61`) → match all. CONFLICT: disabled ink-300 fails 3:1. WCAG 1.4.3 exempts disabled text, so take the design value; log it in `contrast-pairs.json` if gated.
- [story] card "calendar" row = inline card, min=today, Tuesdays blocked (D/DatePicker.card.html) → `CalendarDisabledDays` exists but bare → after `inline`, show it in the card chrome; "placeholder" row has a hint ("We need 3 days' notice…") → add the hint via Field in `Empty`.

## Pagination — differs (`U/pagination/pagination.tsx`)

- CONFLICT [api] `onChange(page)` + buttons (D/Pagination.jsx:33-49) → `getPageHref` + links (`:44-53`): paging is navigation on a static-export site → keep links; paint the design's PageButton states on them.
- [api] `PageButton` exported for custom pagers (D/Pagination.jsx:5-31,51; .d.ts:11-21) → not exported → export `PageButton` (polymorphic: `asChild`/`linkAs`, `isCurrent`, `disabled`), no docs-only `state` (X8).
- [visual] hover: pink-50 bg + pink-300 border + pink-700 text (D/Pagination.jsx:15-17) → `hover:bg-surface-page-alt` only (`:19`) → add `hover:border-pink-300 hover:text-pink-700`.
- [interaction] press: state-press bg + scale .94, `--dur-instant` transform (D/Pagination.jsx:16,20) → none → `active:bg-surface-brand-soft active:scale-[--press-scale-page]` (X5).
- [visual] current: 1px pink-500 border + pink-500 fill, `cursor:default`, not clickable (D/Pagination.jsx:6,15) → no border (`:21`) → add `border border-border-brand`. Check that current is still a link: the design disables it (`usePress(disabled||current)`). Ours links to itself, so keep it `aria-current="page"`.
- [visual] prev/next at the ends: `--state-disabled-fill` (ink-100) + ink-200 border + ink-400, `not-allowed` (D/Pagination.jsx:15-17,42,46) → `inert` = white `bg-surface-card` + border-subtle (`:23`) → `bg-ink-100 cursor-not-allowed`.
- [visual] ellipsis: bare `…`, min-width 24, display 700, ink-400, no border/pill (D/Pagination.jsx:44) → bordered pill (`:22,97`) → plain `span min-w-6 text-center font-display font-bold text-ink-400`.
- [visual] numbers `tabular-nums` (D/Pagination.jsx:18) → missing (`:14`) → add.
- [story] card rows "last page (next disabled)" ✓ LastPage; "button states" rest/hover/press/focus/current/disabled (D/Pagination.card.html) → missing → `States` story (pseudo-states, X8).

## Tabs — differs (`U/tabs/tabs.tsx`)

- [visual] hover: heading text **+ 3px ink-200 underline** (D/Tabs.jsx:17; INTERACTIONS.md:45) → text only (`:27`) → `not-disabled:hover:after:bg-ink-200` (not on selected).
- [interaction] press: pink-700 text + pink-300 bar; selected press bar `--brand-active` (D/Tabs.jsx:12,17) → none → `active:text-pink-700 active:after:bg-pink-300`, `aria-selected:active:after:bg-brand-active`.
- [visual] disabled ink-300 (D/Tabs.jsx:12) → `disabled:text-ink-400` (`:19`) → ink-300.
- [visual] focus outline offset 4, radius 4 (D/Tabs.jsx:13) → global +2 → `focus-visible:outline-offset-4 rounded-xs`.
- [api] `items` accepts strings, tablist-only (no panels) (D/Tabs.d.ts:3-6) → ours requires `content`, renders panels (`:50-56`) → keep (role=tab without tabpanel is invalid) but allow string `label` shorthand only if cheap; note `segmented`/`isFullWidth`/icons are extras the design lacks.

## Toast — differs (`U/toast/toast.tsx`)

- [interaction] action = TextButton caps sm, `on="brand"` for brand/success/danger and `"dark"` for ink: rest word only, hover a white 16% pill (dark: pink-200 text), press 28% + scale .97, disabled white 40/50%, `-mr-2` (D/Toast.jsx:31; INTERACTIONS.md:34-35,69) → bare text button, `active:press-scale` only (`:41-42`) → render via TextButton (atoms A) with the surface mapping.
- [api] `actionDisabled` (D/Toast.d.ts:13) → none → add `action.disabled?` to `NotificationAction` (`packages/ui/src/lib/notification.ts`).
- [visual] neutral action colour on ink = pink-300 (TextButton on=dark brand; INTERACTIONS.md:34) → `text-current` (white) → pink-300 for `color="neutral"`.
- [interaction] pop entrance `pp-toast-pop` **`--dur-base` 220ms** `--ease-pop` (D/Toast.jsx:24) → `animate-toast-pop` uses `--duration-slow` 340ms (`packages/ui/src/styles.css:42`) → duration-base.
- [story] rows "actions — every tone" (ink Undo, success Track, danger Retry) and "action states" (rest/hover/press/focus/disabled) (D/Toast.card.html:15-16) → missing → add `Actions` and `ActionStates` (X8).
- CONFLICT [visual] success fill: design `--status-success`; ours `bg-toast-success-bg` (white on mint fails AA, `design-tokens/tokens/component/snackbar.json:6`) → keep ours (quality bar).

## Snackbar — differs (`U/snackbar/snackbar.tsx`)

- [interaction] action = TextButton caps sm (`on` dark/brand) (D/Snackbar.jsx:53) → bespoke `action` slot (`:31-32`) → TextButton.
- [interaction] dismiss = IconButton xs `on="brand"` (hover white 16% bg, press 28%), `-mr-1` (D/Snackbar.jsx:56; INTERACTIONS.md:31,70) → `opacity-70 hover:opacity-100` (`:33-34,158`) → IconButton xs.
- [api] dismiss + auto-hide only when `onClose` given (D/Snackbar.jsx:6-9,55) → dismiss always rendered (`:158`) → show the close only when `onOpenChange` is passed (or add `isDismissible`, default true when controlled).
- [api] `inset` (default 24) and `width` (default 420) (D/Snackbar.d.ts:20-22) → fixed `inset-x-6`/`bottom-6`, `max-w-snackbar` (`:26-27,44-48`) → add `inset`/`width` via `sx`-safe CSS vars or document `sx` as the mapping (recommend `sx`; no new props).
- [visual] icon opacity .95 (D/Snackbar.jsx:47) → full → `opacity-95`.
- CONFLICT [visual] success fill (same as Toast) → keep ours.

## SearchField — differs (`U/search-field/search-field.tsx`)

- [a11y]/[api] `<input type="text" inputMode="search" enterKeyHint="search" role="searchbox" autoComplete="off">` (D/SearchField.jsx:36) → `type="search"` + `search-reset` (`:126`, slot `:25`) → switch to the design attributes (drops the native cancel button and keeps the searchbox role).
- [interaction] clear = IconButton xs ghost (hover pink-50 + pink-600, press pink-100 .92), `-mr-2` (D/SearchField.jsx:43) → custom `size-6` subtle→heading (`:27-28,105-112`) → IconButton xs.
- [interaction] hover border-strong → X1.
- [visual] search icon pink-500 while focused (D/SearchField.jsx:33) → X2.
- [story] ✓ all six rows covered (Playground, WithValue, Loading, NoResults, Disabled, Small), and placeholders name real dishes. Our required `label` is a11y-positive (the design has none), so keep it.

## SlotPicker — differs (`U/slot-picker/slot-picker.tsx`)

- [interaction] hover (not sold-out): pink-50 bg, pink-300 border, pink-700 text; selected+hover border `--brand-hover` (D/SlotPicker.jsx:6-12) → none (`:20`) → `hover:bg-surface-page-alt hover:border-pink-300 hover:text-pink-700`, `has-checked:hover:border-brand-hover`.
- [interaction] press: state-press bg + scale .97, `--dur-instant` (D/SlotPicker.jsx:12,16) → none → `active:bg-surface-brand-soft active:press-scale`.
- [visual] disabled border ink-200 (D/SlotPicker.jsx:11) → border stays `border-default` (ink-300) → `has-disabled:border-border-subtle`.
- CONFLICT [a11y] design `aria-pressed` buttons → ours radios in a fieldset (right for one-of-many; focus ring already on the slot, `:20`) → keep ours, 0 change.

## QuantityStepper — differs (`U/quantity-stepper/quantity-stepper.tsx`)

- [visual] hover glyph pink-700 (bg pink-100 ✓ via `surface-brand-soft`) (D/QuantityStepper.jsx:11) → stays `text-text-brand` (`:19`) → `hover:text-pink-700`.
- [interaction] press: pink-200 bg + scale **.90** (D/QuantityStepper.jsx:10,12) → `active:press-scale` (.97), no bg (`:19`) → `active:bg-pink-200 active:scale-90` (X5).
- [visual] disabled glyph ink-300 (D/QuantityStepper.jsx:11; INTERACTIONS.md:50) → `disabled:/aria-disabled:text-ink-400` (`:19`) → ink-300.
- [visual] focus outline offset −2 (D/QuantityStepper.jsx:13) → global +2 → `focus-visible:-outline-offset-2`.
- [api] `max` default 20 (D/QuantityStepper.jsx:24) → `undefined` (`:101`) → default 20 (our editable count + `step` are extras; keep).

## OtpInput — differs (`U/otp-input/otp-input.tsx`)

- [visual] focused cell fills pink-50 (D/OtpInput.jsx:37) → `active` = border-2 + ring, white (`:30`) → add `bg-surface-page-alt` to `active`.
- [visual] error focus ring = `0 0 0 3px --status-danger-soft` (D/OtpInput.jsx:36) → `shadow-focus-ring` regardless of status (`:30`) → compound `{state:"active",status:"error"}` → `shadow-field-ring-danger` (and success/warning).
- [interaction] hover cell border-strong (D/OtpInput.jsx:35) → none; the overlay input covers all cells → apply hover to the next-to-fill cell via `group-hover` (not every cell).
- [interaction] focus selects the cell's digit (D/OtpInput.jsx:29 `e.target.select()`) → single overlay input, caret behaviour is the platform's → on focus move the caret to the end so typing continues from the next empty cell. (Disabled ink-400/border-subtle ✓; paste ✓ natively.)

## ListRow — differs (`U/list-row/list-row.tsx`)

- [interaction] press = state-press bg, **no scale** (D/ListRow.jsx:21; INTERACTIONS.md:48) → `active:press-scale` (`:31`) → `active:bg-surface-brand-soft`, drop the scale.
- [visual] focus outline offset −2 (D/ListRow.jsx:22) → global +2 (clips under `-mx-3`) → `focus-visible:-outline-offset-2`.
- [visual] chevron ink-400 (D/ListRow.jsx:33) → `text-text-subtle` = ink-600 (`:22` slot `chevron`) → `text-ink-400`.
- CONFLICT [api] design `onClick` turns the div into `role=button` with Enter/Space → ours `asChild` (a real link/button) → keep ours.

## CouponTicket — differs (`U/coupon-ticket/coupon-ticket.tsx`)

- [visual] brand stub = translucent white 8% on pink, white code (D/CouponTicket.jsx:61-63,79) → `stub: bg-surface-card` (white), pink code (`:31`, `code` slot `text-text-brand`) → `bg-white-alpha-8` (token) with `text-text-on-brand` code.
- [interaction] stub hover/press: brand `--state-hover-on-color` 16% / `-press-on-color` 28%; light pink-100 / pink-200 (D/CouponTicket.jsx:61-63; INTERACTIONS.md:52) → `active:press-scale` only (`:78`) → add bg states, drop the scale (the design has no scale on the stub).
- [visual] focus ring white on brand, pink-500 on light, offset −6 (D/CouponTicket.jsx:64) → `focus-visible:-outline-offset-4` (`:78`) → −6 (token-less `-outline-offset-6`).

## Accordion — differs (`U/accordion/accordion.tsx`)

- [interaction] head hover: pink-50 row bg + pink-600 text; press pink-100; row padding 18/12 with `-mx-3`, radius-sm (D/Accordion.jsx:10-17) → text colour only, `py-4.5` (`:17-18`) → `-mx-3 px-3 rounded-sm hover:bg-surface-page-alt active:bg-surface-brand-soft`.
- [visual] focus outline offset −2 (D/Accordion.jsx:17) → global +2 on `<summary>` → `focus-visible:-outline-offset-2`.
- [api] default nothing open (`defaultOpen = []`, D/Accordion.jsx:31) → first item opens when `defaultOpen` is omitted (`:68`) → default to none open (the stories pass `defaultOpen` explicitly).

## Alert — differs (`U/alert/alert-dismiss.tsx`)

- [interaction] dismiss = IconButton xs `on="tint"` (hover ink 6% overlay, press 12%), margin `-4px -6px -4px 0` (D/Alert.jsx:33; INTERACTIONS.md:32,71) → `hover:opacity-70` 24px button (`alert-dismiss.tsx:19`) → IconButton xs on the tint surface. (Ours sets `role="alert"` on danger where the design always uses `status`. That's a11y-positive, so keep it.)

## Breadcrumb — differs (`U/breadcrumb/breadcrumb.tsx`)

- [interaction] links render through `Link variant="subtle" size="sm"` (muted → heading + underline on hover, pink-700 on press, Link focus) (D/Breadcrumb.jsx:16) → hand-rolled classes, no press (`:15`) → `<Link color="muted" underline="hover" variant="link-sm">` per API spec §5 mapping.

## MenuItemCard / OutletCard / FilterBar — differ via atoms

- MenuItemCard [interaction] Card press: shadow-1 + scale .99 (`--dur-instant`), focus ring on the card, Enter/Space (DA/Card.jsx diff 6b1e28a) → `atoms/card/card.tsx:45` hover only → atoms A; then check that `U/menu-item-card/menu-item-card.tsx:88` and the add IconButton (primary lg, changed) pick it up.
- OutletCard [interaction] same Card press (`U/outlet-card/outlet-card.tsx:91`).
- FilterBar [interaction] Tag hover pink-50/pink-300/pink-700, press pink-100 .97, selected hover brand-hover (INTERACTIONS.md:43) → inherits atom Tag fix.

## Menu (ours) — extra/tier + differs (`U/menu/menu.tsx`; design `DA/Menu.jsx`)

- CONFLICT [tier] design `Menu` and `Popover` are **atoms**; ours are molecules (API spec §6). The owner wants tiers identical, so move both to `atoms/` (they import only Icon/BrandDiamond/IconButton, which are atoms, so layering holds) and keep ActionMenu as the molecule.
- [visual] panel radius-md (10) (DA/Popover.jsx:105) → `rounded-lg` (`:23`) → `rounded-md`.
- [visual] row: font 15, radius-sm, gap 12, padding 8/12, min-h 44 (52 in sheet) (DA/Menu.jsx:90-93) → `text-body-sm` (14), `rounded-md` (`:24`) → `text-[15px]` (token `menu-item`), `rounded-sm`.
- [interaction] active/hover row = pink-50; danger active = `--status-danger-soft`; press state-press / `--state-press-danger` #f8d4d4 (DA/Menu.jsx:92; INTERACTIONS.md:64) → `data-highlighted:bg-surface-sunken` (ink-100), no press (`:24`) → `data-highlighted:bg-surface-page-alt`, danger → `bg-status-danger-soft`, `active:` press colours (token `state-press-danger`).
- [visual] selected = pink-700 text, 600 weight, no fill (+ brand diamond in listbox mode) (DA/Menu.jsx:81-82) → `bg-surface-brand-soft font-semibold` (`:49`) → drop the bg, `text-pink-700`.
- [visual] icon ink-500, pink-500 when active or selected, danger red, disabled ink-300 (DA/Menu.jsx:96) → `text-text-muted` (ink-600) (`:46`) → match.
- [visual] disabled `cursor:not-allowed`, ink-400; description ink-400 (DA/Menu.jsx:91,99) → `pointer-events-none` (`:24`) → keep Radix's skip but show `not-allowed` (drop `pointer-events-none`, rely on `data-disabled`).
- [api] `meta` trailing Space Mono 12 text-subtle (DA/Menu.jsx:101) → `shortcut` caption muted (`:28`) → style `shortcut` as mono 12 text-subtle (map `meta`→`shortcut`).
- [visual] group label: Space Mono 10.5, `.08em`, uppercase, text-subtle, padding 10/12/4 (DA/Menu.jsx:79) → `text-caption font-semibold text-text-muted px-3 py-1.5` (`:30`) → match (token `menu-group` 10.5px).
- [visual] divider margin 6px 4px, inset (DA/Menu.jsx:78) → full-bleed `-mx-1.5 my-1.5` (`:31`) → `mx-1 my-1.5`.
- [interaction] `emptyText` row (padding 14/12, 14px subtle) when no items (DA/Menu.jsx:76) → none → add for data-driven use (ActionMenu/Combobox).
- [interaction] open `pp-pop-in`; ≤640 sheet → X3, X4.

## Popover (ours) — extra/tier + differs (`U/popover/popover.tsx`; design `DA/Popover.jsx`)

- CONFLICT [tier] atom in design → move (see Menu).
- [visual] radius-md, default padding 6, offset 6, shadow-3, maxHeight 320 scroll, minWidth = anchor (DA/Popover.jsx:21,104-106) → `rounded-lg p-popover-pad` (`:21`) → `rounded-md`; `popover-pad` is 16px (`design-tokens/tokens/component/popover.json`) vs design 6 → 6px for Menu-style lists; keep 16 only for prose popovers (title/close variant).
- [interaction] sheet ≤640 with handle + title (DA/Popover.jsx:76-84) → none → X4 (our `title` prop maps to the sheet title).
- [interaction] `pp-pop-in` → X3. Our `hasArrow`/`hasCloseButton`/`side` extras stay.

## Extras: keep (no design card to compare)

ToggleButtonGroup and SpeedDial (API spec §6). AnnouncementBar, CheckCard, ChipGroup, ChoiceCardGroup, FeatureItem, KeyValueList, LinkCard, PricingCard, Steps, StickyActionBar and Table come from dev parity. The standalone Calendar export stays; the design keeps it private.
