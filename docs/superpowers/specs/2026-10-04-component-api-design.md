# Component API — design (MUI-grade props for `packages/ui`)

**Date:** 2026-10-04 · **Status:** approved by owner (rulings R128–R130) · **Plan:** `docs/superpowers/plans/2026-10-04-ds-06-component-api.md`

## 1. Why

The design system exists so the website (Phase 1 step 2) is assembled from parts in minutes, and every
page is on-brand and accessible without anyone checking by hand. Today the 90 components work, but their
APIs disagree with one another:

| Problem (measured 2026-10-04)                                                                                                                                          | Effect on whoever builds pages                                                       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| No way to adjust spacing, display or alignment on a component except a raw `className`                                                                                 | Wrapper `div`s and one-off classes everywhere; raw classes bypass the token rules    |
| 8 different `tone` vocabularies (`ink/brand/inverse`, `open/busy/closed/live`, `pink/white/badge`, …), half of them meaning "background ground", half meaning "colour" | Every component must be looked up before use                                         |
| 8 different `size` sets                                                                                                                                                | Same                                                                                 |
| `Link` has its own `variant`/`size`, unrelated to `Text`                                                                                                               | Links cannot match the paragraph they sit in                                         |
| 18 component files do not accept native element props                                                                                                                  | No `id`, `aria-*`, `data-*` or `ref` on Tabs, Toast, Dialog, ChipGroup, FilterBar, … |
| Missing primitives against MUI's catalogue: Grid, Drawer, Popover, Menu, Autocomplete, Fab/SpeedDial, DatePicker                                                       | Pages need hand-built versions                                                       |

MUI is the reference for **API shape** (prop names, inheritance, `sx`, compound components). It is never a
reference for implementation or styling: the stack stays React 19 + Tailwind 4 + tokens + Radix, server
components keep working, and nothing runs CSS-in-JS.

## 2. Decisions (owner, 2026-10-04)

- **R128 — `sx`, not loose system props.** Every component takes one typed `sx` prop. This is MUI v7's
  direction: MUI deprecated `mt={…}`/`bgcolor={…}` props on Box, Typography, Stack and Grid because they
  collide with HTML attributes (`color`, `width`, `height`) and bloat every component's prop list.
- **R129 — one vocabulary, brand language.** `surface` for grounds, `color` for the palette, `status`
  for domain states, one `size` scale, Typography props inherited by text-rooted components. Variant
  names stay ours (`primary/secondary/ghost`, not `contained/outlined/text`).
- **R130 — order.** Finish the partial X1 work, build the foundation, migrate every component, then build
  the missing components on the new API.

## 3. `sx` — the token-typed style prop

```tsx
<Button sx={{ mt: 4 }}>Order now</Button>
<Typography variant="h2" sx={{ mb: { base: 4, md: 8 }, textAlign: "center" }}>Thalis</Typography>
<Stack sx={{ display: { base: "none", lg: "flex" } }}>…</Stack>
```

- **Where it lands:** the component's outermost element. Merged after the component's own variant
  classes (tailwind-merge), so `sx` wins over defaults; `className` is merged last and still wins.
- **Only tokens.** Every value is a union type. A raw length, hex or arbitrary class is a TypeScript
  error. This is the guard-rail that lets pages be built fast without drifting off-brand.
- **Responsive:** responsive keys accept `{ base?, sm?, md?, lg?, xl? }` (mobile-first; `base` is no
  prefix). Breakpoints are the theme's (`sm md lg xl`; `2xl` is deliberately not offered to keep CSS small).
- **Keys:**

| Family     | Keys                            | Values                                                                              | Responsive |
| ---------- | ------------------------------- | ----------------------------------------------------------------------------------- | ---------- |
| Margin     | `m mt mb ms me mx my`           | `SpaceStep` (lib/space: 0, 0.5, 1, 1.5, 2–12, 14, 16, 18, 20, 24, 32) or `"auto"`   | yes        |
| Padding    | `p pt pb ps pe px py`           | `SpaceStep`                                                                         | yes        |
| Gap        | `gap gapX gapY`                 | `SpaceStep`                                                                         | yes        |
| Display    | `display`                       | `none block inline inline-block flex inline-flex grid contents`                     | yes        |
| Text       | `textAlign`                     | `start center end`                                                                  | yes        |
| Size       | `w`                             | `full auto fit`                                                                     | yes        |
| Size       | `h` · `minW` · `maxW`           | `full auto fit` · `0 full` · `full none`                                            | no         |
| Flex child | `grow` · `shrink` · `alignSelf` | `boolean` · `boolean` · `start center end stretch baseline`                         | no         |
| Box        | `position` · `overflow`         | `relative absolute sticky` · `hidden auto visible clip`                             | no         |
| Look       | `radius` · `shadow` · `border`  | `none xs sm md lg xl pill` · `0 1 2 3 4` · `boolean` (default hairline)             | no         |
| Colour     | `bg` · `color`                  | `page page-alt card sunken soft` · `heading body muted subtle brand danger success` | no         |

- **`bg` is light grounds only.** A dark or brand ground changes the text colours of everything inside,
  which the surface system handles with `data-surface`. So `brand` and `ink` grounds are set with the
  `surface` prop (Box, Section, …), never with `sx.bg`.
- **How the classes exist:** responsive keys build class names at runtime (`md:mt-4`). Tailwind can only
  emit classes it can see, so `packages/ui/src/styles.css` declares the complete set once with Tailwind
  4's `@source inline("…")` brace expansion. Non-responsive keys use literal class maps (the scanner sees
  them). **CSS budget:** the built Storybook CSS may grow by at most **20 KB gzip**; the foundation task
  measures it.
- MUI's `sx` also takes arbitrary CSS, theme callbacks and nested selectors. Ours deliberately does not:
  anything beyond the keys above belongs in a component variant.

## 4. Shared prop vocabulary (`lib/common-props.ts`)

| Prop      | Type                                                                                            | Meaning                                                                                  | Replaces                                                                                                                                                                                                                                                     |
| --------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `sx`      | `Sx`                                                                                            | §3                                                                                       | —                                                                                                                                                                                                                                                            |
| `surface` | `"page" \| "alt" \| "sunken" \| "soft" \| "brand" \| "ink"`                                     | The ground the component sits on/paints, and the `data-surface` it sets for its children | every `tone`/`variant` value that switches the background (Section, CtaBand, HeroBanner, SiteFooter, QuotePanel, StatBand, PostFrame, PatternField, Card `brand/ink`, ChoiceCardGroup, CouponTicket, LinkCard, ReviewCard `brand`, LoyaltyCard `brand`, Box) |
| `color`   | `"brand" \| "neutral" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "inverse"` | Palette colour of the component itself. `accent` = turmeric, `info` = kesar              | every `tone` that means "colour" (Badge, Alert, Spinner, ProgressBar, PriceTag, Stat, Tag, OfferSeal, Logo, LogoLockup, Toast, Snackbar)                                                                                                                     |
| `status`  | component-specific domain union                                                                 | A state, not a colour                                                                    | StatusDot `tone` (`open busy closed live danger`); OutletCard and form `status` already use this name                                                                                                                                                        |
| `size`    | `"sm" \| "md" \| "lg"` (+ `xs`/`xl` only where they exist today)                                | Scale                                                                                    | unchanged names; AppShell `size: phone \| phone-sm` → `frame` (it is a device frame, not a size)                                                                                                                                                             |
| `variant` | component-specific                                                                              | Visual style                                                                             | unchanged, except where a value was really a surface (moved to `surface`)                                                                                                                                                                                    |

Every component's props extend `BaseProps<"el">` = the root element's native props (with `color` omitted
where the component defines `color`) + `sx`. Native props spread onto the root; `ref` passes through
(React 19 ref-as-prop). This includes the compound/Radix components that do not today.

Unchanged conventions: booleans `is/has/should/can`; `onValueChange`; `open/defaultOpen/onOpenChange`;
`asChild` on components, `as` on primitives; `data-surface` never an `on` prop.

## 5. Typography and inheritance

- **`Text` is renamed `Typography`** (`atoms/typography/`). `Text`/`TextProps` stay exported as aliases
  for one release.
- **`TypographyProps`:** `variant` (`display-1 display-2 h1 h2 h3 h4 body-lg body body-sm caption overline
mono` + new `link-sm link-md link-lg`, the link text styles, like MUI's `button` variant), `color` (text
  tones `heading body muted subtle brand on-brand inverse danger success link`), `weight`, `align`,
  `lineClamp`, `noWrap` (new: one line, ellipsis), `measure`, `isBalanced`, `isFluid`, `as`, `sx`.
- **`Link` inherits Typography:** `LinkProps = Omit<TypographyProps, "as"> & ComponentProps<"a">` +
  `underline: "always" | "hover" | "none"` + `isExternal` + `icon`/`iconAfter` + `asChild`. It renders
  through Typography. Default `variant="link-md"` keeps today's look; `variant="inherit"` takes the size
  of the surrounding text. Old props map exactly (same classes as today):

| Old Link                    | New Link                                                          |
| --------------------------- | ----------------------------------------------------------------- |
| `size="sm" \| "md" \| "lg"` | `variant="link-sm" \| "link-md" \| "link-lg"`                     |
| `variant="default"`         | `color="link" underline="always"` (defaults)                      |
| `variant="subtle"`          | `color="muted" underline="hover"`                                 |
| `variant="inverse"`         | `color="inverse" underline="always"`                              |
| `variant="quiet"`           | `color="quiet" underline="hover"` (`quiet` is a Link-only colour) |

- Other text-rooted components (Badge label, Tag, SocialHeadline, Stat value) take Typography's
  `variant`/`weight` names where they expose text styling. `SocialHeadline size` → `variant`.

## 6. New components (on the new API)

| Component                         | Tier            | MUI equivalent      | Summary                                                                                                                                                                     |
| --------------------------------- | --------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Box                               | layout          | Box                 | Polymorphic `as`, `surface`, `sx`. Its padding/radius/shadow/border props from X1 are removed in favour of `sx`                                                             |
| Grid + GridItem                   | layout          | Grid v2             | 12/6/4 columns, `gap`, responsive `span`/`start` per item                                                                                                                   |
| Drawer                            | organism        | Drawer              | `Dialog variant="drawer"` + `side`, and a `Drawer` alias                                                                                                                    |
| Popover                           | molecule        | Popover             | Radix Popover with title, side/align, close button                                                                                                                          |
| Menu (+ MenuItem, MenuDivider, …) | molecule        | Menu                | MUI names and behaviour, including the 3-dot "more options" menu, icon/dense/selected/long/positioned menus, checkbox/radio items and submenus; built on Radix DropdownMenu |
| ToggleButton + ToggleButtonGroup  | atom + molecule | ToggleButton(Group) | `value`; `exclusive` (null on re-click unless `isValueRequired`); multiple → array; orientation, size, color, fullWidth; Radix Toggle/ToggleGroup                           |
| Combobox                          | molecule        | Autocomplete        | WAI-ARIA 1.2 combobox, hand-built (no dependency)                                                                                                                           |
| Fab                               | atom            | Fab                 | Round floating button, extended label, fixed positions                                                                                                                      |
| SpeedDial                         | molecule        | SpeedDial           | Fab that fans out actions                                                                                                                                                   |
| DatePicker + Calendar             | molecule        | X DatePicker        | `react-day-picker` (one new dependency), styled with tokens only                                                                                                            |

### 6.1 No native popups (owner, 2026-10-04)

Every popup is ours, never the browser's or the OS's. This **supersedes spec 2026-09-27 D7** for Select and
dates, whose own deferral row said to revisit "when a searchable/multi select is designed" (Combobox).

| Control | Before                                                       | After                                                                                                                                                          |
| ------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Select  | Native `<select>`: styled box, but the open list is the OS's | Radix Select in the same field box. Our panel, items, check mark, typeahead and scroll. A hidden native select keeps form posts working. RHF via `Controller`. |
| Dates   | Native `<input type="date">` (enquiry form)                  | `DatePicker` (react-day-picker grid, token-styled)                                                                                                             |

Native inputs that never open a popup stay native and restyled: Checkbox, Radio, Switch, Slider. Forms keep
`noValidate`, so the browser's validation bubbles never show. Trade-off accepted: on phones a custom list
replaces the OS wheel.

## 7. Quality bar (unchanged, binding)

Tests first, by role and label, every variant, keyboard paths, empty slots, and
`expectNoA11yViolations`. Stories with card parity, Playground, OnSurfaces, a 360px story and plays.
Full gate per batch. Pure-veg fixtures, "Pink Paprikaa" with two a's, no founder identity, no raw hex,
no eslint-disable on LAW rules, never `--no-verify`.

## 8. Out of scope

Theme switching, dark mode, MUI's `styled()`, arbitrary CSS in `sx`, Menubar, TransferList, TreeView,
Masonry, ImageList, importable page templates (a likely next step: the reference kits live in the
Storybook app, so the website cannot import them yet).
