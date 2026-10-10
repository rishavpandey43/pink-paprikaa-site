# Interaction spec — every interactive element

Exact values for **rest → hover → press → focus-visible → disabled** (plus selected/current where relevant). Source of truth is the component `.jsx`; this table is the readable version. Visual reference: `guidelines/states.card.html` and the `states` row on each component card.

## Shared mechanics (all components)
- **Hook:** `usePress(disabled)` in `components/atoms/TextButton.jsx` → `{ hover, press, focus, bind }`. Spread `bind` on the pressable element (or merge with `mergeHandlers(bind, rest)` to keep consumer handlers).
  - `hover`: pointerenter, **ignored for touch pointers**; cleared on leave.
  - `press`: pointerdown → pointerup/leave/cancel; also **Space/Enter keydown → keyup**.
  - `focus`: true only when the element itself matches `:focus-visible` (keyboard), not when a child is focused.
  - All three are forced false when disabled.
- **Timing:** colour/background/border `--dur-fast` 140ms; transform `--dur-instant` 80ms; easing `--ease-out`.
- **Press scale:** `--press-scale` 0.97 (text/pill controls) · 0.92 (icon buttons, stepper buttons, checkbox/radio marks, tab-bar pill, calendar days) · 0.94 (page buttons) · 0.99 (cards).
- **Focus ring:** `outline: 2px solid var(--pink-500); outline-offset: 2px` (white `--ink-000` on pink/ink/status surfaces). Inset rows/cells use offset −2. Fields use 2px border + `--focus-ring` (`0 0 0 3px var(--pink-200)`).
- **State tokens:** `--state-hover` pink-50 · `--state-press` pink-100 · `--state-hover-neutral` ink-100 · `--state-press-neutral` ink-200 · `--state-press-danger` #f8d4d4 · `--state-hover-on-color` rgba(255,255,255,.16) · `--state-press-on-color` rgba(255,255,255,.28) · `--state-hover-tint` rgba(26,18,22,.06) · `--state-press-tint` rgba(26,18,22,.12) · `--state-disabled-fill` ink-100 · `--brand-hover` pink-600 · `--brand-active` pink-700.
- **Cursor:** pointer when actionable · not-allowed when disabled · progress when loading · text in fields.

## Buttons
| Component / variant | Rest | Hover | Press | Disabled |
|---|---|---|---|---|
| Button primary | bg pink-500, white, `--shadow-brand` | bg `--brand-hover` | bg `--brand-active`, no shadow, scale .97 | bg ink-200, text ink-400, no shadow |
| Button secondary | white bg, 2px pink-500 border, pink-600 text | bg pink-50, border pink-600, text pink-700 | bg pink-100 | white bg, 2px ink-200 border, ink-400 |
| Button ghost | transparent, pink-600 | bg pink-50, text pink-700 | bg pink-100 | transparent, ink-400 |
| Button inverse | ink-900, white, shadow-2 | ink-800 | ink-700 | ink-200 / ink-400 |
| Button on="brand" primary | white bg, pink-600 | pink-50, pink-700 | pink-100 | white 30% / white 70% text |
| Button on="brand" secondary | transparent, 2px white 70% border | white 16% bg, solid white border | white 28% | white 30% border, white 50% text |
| Button loading | spinner replaces leading icon, `aria-busy`, cursor progress | — | — | — |
| IconButton ghost | transparent, ink-700 | pink-50 bg, pink-600 glyph | pink-100, scale .92 | transparent, ink-400 |
| IconButton secondary | white, 1px border-default, pink-600 | pink-50, border pink-300 | pink-100 | 1px ink-200, ink-400 |
| IconButton primary | pink-500, white | brand-hover | brand-active | ink-200 fill, ink-400 |
| IconButton glass | `--surface-glass` + blur | white | pink-50 | — |
| IconButton on="brand" | transparent, white | white 16% | white 28% | white 45% glyph |
| IconButton on="tint" (dismiss in Alert) | inherits parent colour | ink 6% overlay | ink 12% | — |
| TextButton (light) brand / neutral / danger | word only: pink-600 / ink-700 / danger | pill bg pink-50 / ink-100 / danger-soft, text one step darker, underline (not in caps) | pill pink-100 / ink-200 / #f8d4d4, scale .97 | ink-400, no bg |
| TextButton on="dark" (ink toast/snackbar) | pink-300 (brand) / white | white 16% pill, pink-200 | white 28% | white 40% |
| TextButton on="brand" (pink/status toast) | white | white 16% pill | white 28% | white 50% |

## Navigation & selection
| Component | Rest | Hover | Press | Selected / current | Disabled |
|---|---|---|---|---|---|
| Link default | pink link colour, pink-200 underline | `--text-link-hover`, underline currentColor | `--brand-active` | — | ink-400, no underline, `aria-disabled`, not focusable |
| Link subtle / quiet | muted / ink-700, no underline | heading / pink-600 + underline | pink-700 | — | as above |
| Link inverse | white, white 40% underline | 90% underline | solid underline + white 16% bg | — | — |
| Tag (filter chip) | white, 1px border-default, ink-700 | pink-50, border pink-300, pink-700 | pink-100, scale .97 | pink-500 fill, white; hover brand-hover; press brand-active | ink-100 fill, ink-200 border, ink-400 |
| PageButton | white, 1px border-default, ink-700 | pink-50, border pink-300, pink-700 | pink-100, scale .94 | pink-500 fill, white, not clickable | ink-100, ink-400 (prev at page 1, next at last) |
| Tabs | text-subtle, no underline | text-heading + 3px ink-200 underline | pink-700 text, pink-300 underline | heading + 3px pink-500 underline | ink-300 |
| TabBar item | ink-500 | ink-800 + pink-50 pill behind icon | pink-600, pill pink-100, icon scale .92 | pink-500 icon/label, pink-50 pill, label 700 | — |
| Accordion head | heading colour | pink-50 row bg, pink-600 text | pink-100 | open: pink-600 text, chevron rotated 180° | — |
| ListRow (interactive) | transparent | pink-50 | pink-100 | — | — (Enter/Space activate) |
| SlotPicker slot | white, 1px border-default | pink-50, border pink-300, pink-700 | pink-100, scale .97 | pink-50 fill, 2px pink-500 border, pink-700 | ink-100, ink-400, struck through (sold out) |
| QuantityStepper +/− | transparent, pink-600 | pink-100 circle, pink-700 | pink-200, scale .92 | — | ink-300 at min/max |
| Card interactive | shadow-1 | lift −2px, shadow-3 | scale .99, shadow-1 | — | — (Enter/Space activate when it has onClick) |
| CouponTicket stub | white 8% (brand) / pink-50 | white 16% / pink-100 | white 28% / pink-200 | "Copied" + check for 1.8s | — |
| SiteHeader logo | — | opacity .82 | scale .97 | — | — |

## Form controls
| Component | Hover | Focus (keyboard) | Press | Checked / filled | Disabled |
|---|---|---|---|---|---|
| Input / Select / DatePicker / Combobox trigger | border → `--border-strong` (1px) | 2px status/pink border + ring | — | — | ink-100 fill, border-subtle, ink-400 |
| SearchField (pill) | border-strong | 2px pink + `--focus-ring` | — | — | ink-100 |
| OtpInput cell | border-strong | 2px pink-500, pink-50 fill, focus ring | — | 2px pink-500 | ink-100, ink-400 |
| Checkbox | whole row pink-50; empty box border pink-400; checked box brand-hover | 2px pink outline on box + ring | row pink-100, box scale .92; checked box brand-active | pink-500 fill + white check | row 50% opacity |
| Radio | row pink-50; ring pink-400 (checked: brand-hover) | 2px outline on circle | row pink-100, circle scale .92 | 6px pink-500 ring | 50% opacity |
| Switch | row pink-50; track ink-400 (on: brand-hover) | 2px outline on track | track ink-500 / brand-active; thumb widens 22→26px | pink-500 track, thumb right | 50% opacity |
| Menu row | pink-50 (danger: danger-soft) | keyboard-active row = same as hover | pink-100 (danger: #f8d4d4) | pink-700, 600 weight, brand diamond | ink-400, not-allowed |
| Calendar day | pink-50 | roving focus outline | pink-100, scale .92 | pink-500 diamond, white bold number | ink-300, struck through |

## Overlays & feedback
- **Select / Combobox / DatePicker / ActionMenu panels:** `pp-pop-in` 140ms on open; chevron rotates 180°; Esc closes and returns focus; outside press closes; ≤640px renders a bottom sheet with `pp-sheet-in`.
- **Toast:** `pp-toast-pop` with `--ease-pop` when `pop` (add-to-cart only). Action = TextButton caps sm, `on` = "brand" for brand/success/danger, "dark" for ink.
- **Snackbar:** slides in (`pp-sheet-in`), auto-dismiss 3200ms, action TextButton, dismiss IconButton xs on="brand".
- **Alert:** dismiss = IconButton xs on="tint".
- **Dialog:** scrim click closes; close = IconButton sm ghost.
- **Tooltip:** shows on pointer hover and on focus, 140ms fade; never the browser `title`.
