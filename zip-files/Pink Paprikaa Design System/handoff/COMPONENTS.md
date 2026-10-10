# Component reference

80 React components, organised by Atomic Design tier. For each: purpose, usage, full props contract (verbatim from its `.d.ts`), internal dependencies, and its storybook card.

Per component: `Name.jsx` = reference implementation · `Name.d.ts` = props contract · `Name.prompt.md` = usage note · `Name.card.html` = visual spec of every variant and state (open in a browser).

**Build order:** atoms → molecules → organisms → layouts. "Built from" lists the in-system imports (components and shared hooks such as `usePress`).

**Interaction contract:** every pressable component imports `usePress` from `atoms/TextButton.jsx` and renders rest / hover / press / focus-visible / disabled from the `--state-*` tokens (spec card: `guidelines/states.card.html`). Components with a `state` prop let specimens force a state — the cards show each one. Checkbox, Radio and Switch tint their whole row on hover/press; fields darken their border to `--border-strong` on hover.

## Index

**atoms (31):** Avatar, Badge, Button, Card, Checkbox, DietMark, Divider, Icon, IconButton, ImageSlot, Input, Link, Logo, Menu, PatternField, Popover, PriceTag, ProgressBar, Radio, Rating, Select, Skeleton, SocialHeadline, SpiceLevel, Spinner, StatusDot, Switch, Tag, Text, TextButton, Tooltip

**molecules (30):** Accordion, ActionMenu, Alert, Breadcrumb, Combobox, CouponTicket, DatePicker, EmptyState, Field, FilterBar, ListRow, LogoLockup, LoyaltyCard, MenuItemCard, MenuItemRow, OfferSeal, OtpInput, OutletCard, Pagination, PriceSummary, QuantityStepper, ReviewCard, SearchField, SectionHeader, SlotPicker, Snackbar, Stat, StepTracker, Tabs, Toast

**organisms (12):** CartPanel, CtaBand, Dialog, FaqSection, HeroBanner, MenuList, OrderTracker, SiteFooter, SiteHeader, StatBand, TabBar, TestimonialWall

**layouts (7):** AppShell, AutoGrid, Cluster, Container, PostFrame, Section, Stack

---

## Atoms

### Avatar

Circular guest/staff avatar. Falls back to initials on --pink-100.

- **Files:** `components/atoms/Avatar.jsx` · `.d.ts` · `.prompt.md` · `Avatar.card.html`
- **Built from:** `Icon`, `Tooltip`

**Usage**

Circular avatar for guest accounts, reviews and staff credits.

```jsx
<Avatar name="Aditi Rao" size="lg" ring />
<Avatar icon="user" size="sm" />
```

No photo → initials in Poppins 700 on `--pink-100`. Never square, never a coloured random-hash background.

**Props contract**

```ts
import type { CSSProperties } from "react";

export interface AvatarProps {
  /** Used for initials and the title attribute. */
  name?: string;
  src?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
  /** Lucide glyph instead of initials. */
  icon?: string;
  /** Pink halo, for the signed-in guest. */
  ring?: boolean;
  /** Show the name in our Tooltip on hover/focus (never the browser's title bubble). */
  tooltip?: boolean;
  style?: CSSProperties;
}
export function Avatar(props: AvatarProps): JSX.Element;
```

### Badge

Small uppercase status marker. Reads as a label, never as a button.

- **Files:** `components/atoms/Badge.jsx` · `.d.ts` · `.prompt.md` · `Badge.card.html`
- **Built from:** `Icon`

**Usage**

Uppercase status marker for menu items, orders and cards — non-interactive.

```jsx
<Badge tone="brand">Bestseller</Badge>
<Badge tone="soft" icon="flame">New</Badge>
<Badge tone="success">Order Confirmed</Badge>
```

Always ALL CAPS and two words maximum. For a filterable, tappable pill use `Tag` instead.

**Props contract**

```ts
import type { CSSProperties, ReactNode } from "react";

export interface BadgeProps {
  children?: ReactNode;
  tone?: "brand" | "soft" | "ink" | "success" | "warning" | "danger" | "neutral";
  /** Optional 12px Lucide glyph. */
  icon?: string;
  style?: CSSProperties;
}
export function Badge(props: BadgeProps): JSX.Element;
```

### Button

Primary action. Pill, Poppins 700, Title Case label. Every variant has rest, hover, press, focus-visible, loading and disabled.

- **Files:** `components/atoms/Button.jsx` · `.d.ts` · `.prompt.md` · `Button.card.html`
- **Built from:** `Icon`, `usePress`, `mergeHandlers`

**Usage**

The brand's action button — pill, Poppins 700, Title Case; use `primary` once per view.

```jsx
<Button icon="shopping-bag" size="lg">Order Now</Button>
<Button variant="secondary">See Full Menu</Button>
<Button variant="ghost" iconAfter="arrow-right">Find a Paprikaa</Button>
```

Variants: `primary` (flooded pink + `--shadow-brand`), `secondary` (2px pink outline on white), `ghost`, `inverse` (ink). On a flooded pink panel pass `on="brand"` — primary flips to white-on-pink, secondary to a white outline. Press = 0.97 scale + darken; disabled is a real grey fill, not opacity.

**Props contract**

```ts
import type { CSSProperties, MouseEventHandler, ReactNode } from "react";

/**
 * Primary call to action. Pill-shaped, Poppins 700, Title Case label.
 */
export interface ButtonProps {
  children?: ReactNode;
  /** primary = flooded pink; secondary = pink outline; ghost = text only; inverse = ink. */
  variant?: "primary" | "secondary" | "ghost" | "inverse";
  size?: "sm" | "md" | "lg";
  /** Set "brand" when the button sits on a flooded pink panel. */
  on?: "light" | "brand";
  /** Lucide icon name rendered before the label. */
  icon?: string;
  /** Lucide icon name rendered after the label. */
  iconAfter?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** Force a visual state — docs/specimens only. */
  state?: "hover" | "press" | "focus";
  style?: CSSProperties;
}
export function Button(props: ButtonProps): JSX.Element;
```

### Card

Content container. Never gets a coloured left border.

- **Files:** `components/atoms/Card.jsx` · `.d.ts` · `.prompt.md` · `Card.card.html`
- **Built from:** `usePress`, `mergeHandlers`

**Usage**

The surface every block of content sits on.

```jsx
<Card interactive><h4>Sector 57</h4><p>8am – 11:30pm</p></Card>
<Card variant="feature" padding={28}>…</Card>
```

`default` white + 1px `--border-subtle` + `--shadow-1`; `feature` light-pink, 24px radius, no shadow; `brand` flooded pink; `ink` dark footer-style; `quiet` sunken grey. Use `padding={0}` when the card starts with an image.

**Props contract**

```ts
import type { CSSProperties, MouseEventHandler, ReactNode } from "react";

/**
 * Content container in the brand's five surface skins.
 */
export interface CardProps {
  children?: ReactNode;
  variant?: "default" | "feature" | "brand" | "ink" | "quiet";
  /** Inner padding in px. Pass 0 for full-bleed media cards. */
  padding?: number;
  /** Adds the −2px hover lift to --shadow-3. */
  interactive?: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
  style?: CSSProperties;
}
export function Card(props: CardProps): JSX.Element;
```

### Checkbox

Add-on / consent checkbox. 6px radius, pink when checked.

- **Files:** `components/atoms/Checkbox.jsx` · `.d.ts` · `.prompt.md` · `Checkbox.card.html`
- **Built from:** `usePress`, `Icon`

**Usage**

Multi-select choice — menu add-ons, dietary preferences, consent.

```jsx
<Checkbox label="Extra burnt chilli mayo" price={40} checked={on} onChange={t} />
```

Pass `price` for add-ons; it right-aligns as `+₹40` in Poppins 700. Use `Radio` when exactly one option must be chosen.

**Props contract**

```ts
import type { CSSProperties, ChangeEventHandler } from "react";

export interface CheckboxProps {
  label?: string;
  /** Secondary line under the label. */
  description?: string;
  /** Add-on price in whole rupees; renders as "+₹60". */
  price?: number;
  checked?: boolean;
  disabled?: boolean;
  /** true, or the message to show. Turns the box red. */
  error?: boolean | string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  style?: CSSProperties;
}
export function Checkbox(props: CheckboxProps): JSX.Element;
```

### DietMark

Statutory Indian vegetarian mark. Pink Paprikaa is a pure-veg kitchen, so only "veg" (green square + dot) and "egg" (turmeric) exist.

- **Files:** `components/atoms/DietMark.jsx` · `.d.ts` · `.prompt.md` · `DietMark.card.html`
- **Built from:** — (leaf)

**Usage**

Statutory Indian vegetarian mark. Every menu item on every surface carries one.

```jsx
<DietMark /> <DietMark type="egg" size={14} />
```

Pink Paprikaa is a **pure-veg kitchen** — there is no non-veg mark in this system and none should be added. Green square-and-dot for veg, turmeric dot for the few egg-containing bakes. Never substitute emoji or a coloured pill.

**Props contract**

```ts
import type { CSSProperties } from "react";

export interface DietMarkProps {
  /** veg = green square + dot. egg = turmeric dot, for the few egg-containing bakes. */
  type?: "veg" | "egg";
  size?: number;
  style?: CSSProperties;
}
export function DietMark(props: DietMarkProps): JSX.Element;
```

### Divider

Hairline rule. `diamond` inserts the brand mark as a section break.

- **Files:** `components/atoms/Divider.jsx` · `.d.ts` · `.prompt.md` · `Divider.card.html`
- **Built from:** — (leaf)

**Usage**

Hairline separator; the `diamond` variant is the brand's section break.

    <Divider />
    <Divider label="Also Try" />
    <Divider variant="diamond" />

Menu rows are separated by `Divider`, not by cards. The diamond variant loads the mark from `base` (default `/assets`) and flips to the white mark when `on="brand"`.

**Props contract**

```ts
import type { CSSProperties } from "react";

export interface DividerProps {
  variant?: "line" | "diamond";
  /** Centres an uppercase overline label in the rule. */
  label?: string;
  on?: "light" | "brand";
  /** Assets folder holding the symbol files (diamond variant only). */
  base?: string;
  style?: CSSProperties;
}
export function Divider(props: DividerProps): JSX.Element;
```

### Icon

- **Files:** `components/atoms/Icon.jsx` · `.d.ts` · `.prompt.md` · `Icon.card.html`
- **Built from:** — (leaf)

**Usage**

One-element Lucide glyph that inherits `currentColor` — use it for every icon in Pink Paprikaa UI.

```jsx
<Icon name="shopping-bag" size="lg" title="Cart" />
```

Sizes: `xs` 14 (inline), `sm` 16, `md` 20 (buttons, rows), `lg` 24 (nav, tab bar), `xl` 32 (empty states). Stroke icons only, never filled; never emoji. Brand glyphs (the diamond symbol, the logo chilli) are PNG assets, not icons.

**Props contract**

```ts
import type { CSSProperties } from "react";

export interface IconProps {
  /** Lucide icon name, kebab-case (e.g. "shopping-bag", "map-pin"). */
  name: string;
  /** 14 / 16 / 20 / 24 / 32, or an explicit pixel number. */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
  /** Accessible label. Omit for decorative icons. */
  title?: string;
  style?: CSSProperties;
}
export function Icon(props: IconProps): JSX.Element;
```

### IconButton

Square-footprint circular button carrying a single Lucide glyph. Rest, hover, press, focus-visible and disabled on every variant and surface. on="tint" inherits the parent's text colour (for dismiss buttons inside coloured blocks).

- **Files:** `components/atoms/IconButton.jsx` · `.d.ts` · `.prompt.md` · `IconButton.card.html`
- **Built from:** `Icon`, `usePress`, `mergeHandlers`

**Usage**

Circular icon-only button for toolbars, card overlays and app headers.

```jsx
<IconButton icon="heart" label="Save" />
<IconButton icon="arrow-left" label="Back" variant="glass" />
```

`glass` is for buttons floating over food photography (translucent white + blur). Always pass `label`. Minimum 44px hit area on touch surfaces — use `size="lg"` in the app.

**Props contract**

```ts
import type { CSSProperties, MouseEventHandler } from "react";

export interface IconButtonProps {
  /** Lucide icon name. */
  icon: string;
  /** Required accessible label. */
  label: string;
  variant?: "primary" | "secondary" | "ghost" | "glass";
  size?: "xs" | "sm" | "md" | "lg";
  /** "tint" inherits the parent text colour — dismiss buttons inside Alerts. */
  on?: "light" | "brand" | "tint";
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** Force a visual state — docs/specimens only. */
  state?: "hover" | "press" | "focus";
  style?: CSSProperties;
}
export function IconButton(props: IconButtonProps): JSX.Element;
```

### ImageSlot

Photography placeholder. No brand photography exists yet, so every image slot states the exact crop it needs instead of shipping a grey box.

- **Files:** `components/atoms/ImageSlot.jsx` · `.d.ts` · `.prompt.md` · `ImageSlot.card.html`
- **Built from:** — (leaf)

**Usage**

Every image in the system. Until real photography lands, it renders a labelled pink placeholder that names the crop needed.

```jsx
<ImageSlot ratio="4:5" label="Hero 4:5 — warm, close-cropped" />
<ImageSlot src="/photo.jpg" alt="Chilli paneer" ratio="4:3" />
```

Always give a specific `label` — "Dish photo" is the default but "Kitchen portrait 3:4" is what a photographer can act on. `fill` for full-bleed panels.

**Props contract**

```ts
import type { CSSProperties } from "react";

export interface ImageSlotProps {
  /** Real image URL. Omit to render the labelled placeholder. */
  src?: string;
  alt?: string;
  /** What photography belongs here, e.g. "Hero 4:5 — warm, close-cropped". */
  label?: string;
  ratio?: "square" | "4:3" | "3:4" | "4:5" | "16:9" | "16:10" | "wide" | string;
  radius?: string;
  tone?: "soft" | "strong" | "ink";
  /** Fill the parent's height instead of using an aspect ratio. */
  fill?: boolean;
  style?: CSSProperties;
}
export function ImageSlot(props: ImageSlotProps): JSX.Element;
```

### Input

Text field. Carries the system's full status set. Never renders a browser picker.

- **Files:** `components/atoms/Input.jsx` · `.d.ts` · `.prompt.md` · `Input.card.html`
- **Built from:** `Icon`, `Spinner`

**Usage**

Single-line or multiline text field - 48px tall (40 sm / 56 lg), 10px radius, 2px status border.

    <Input label="Mobile number" icon="phone" placeholder="98765 43210" />
    <Input label="Card" error="That card didn't go through. Try another?" />
    <Input label="Promo code" success="PAPRIKAA50 applied." />
    <Input label="Outlet" value="Sector 57" readOnly />

**States:** rest, hover, focus (2px + ring), filled, `disabled`, `readOnly`, `loading`, `error`, `success`, `warning`. Each status prop takes `true` or the message string; the message replaces `hint` and the matching glyph appears on the right. Labels are sentence case; error copy says what to do next, never a code.

**Props contract**

```ts
import type { CSSProperties, ChangeEventHandler, ReactNode } from "react";

/**
 * The system's text field, with the full status set.
 */
export interface InputProps {
  label?: string;
  /** Helper text, shown when there is no status message. */
  hint?: string;
  /** true, or the message to show. Turns the field red. */
  error?: boolean | string;
  /** true, or the message to show. Turns the field mint. */
  success?: boolean | string;
  /** true, or the message to show. Turns the field turmeric. */
  warning?: boolean | string;
  /** Set the status without a message. */
  status?: "default" | "error" | "success" | "warning";
  /** Leading Lucide icon name. */
  icon?: string;
  /** Trailing static text, e.g. a unit or count. */
  suffix?: string;
  /** Trailing element, e.g. a small Button. */
  trailing?: ReactNode;
  multiline?: boolean;
  rows?: number;
  size?: "sm" | "md" | "lg";
  /** Text-like types only. "number" becomes a text field with a decimal keypad; date/time/color/file/range are refused — use DatePicker / SlotPicker. */
  type?: "text" | "email" | "tel" | "password" | "url" | "search" | "number";
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  /** Locked but readable - sunken fill and a lock glyph. */
  readOnly?: boolean;
  /** Trailing spinner while validating. */
  loading?: boolean;
  required?: boolean;
  /** Marks the field optional instead of starring the required ones. */
  optional?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  style?: CSSProperties;
}
export function Input(props: InputProps): JSX.Element;
```

### Link

Inline or standalone link. Underline is the brand's link signal.

- **Files:** `components/atoms/Link.jsx` · `.d.ts` · `.prompt.md` · `Link.card.html`
- **Built from:** `Icon`, `usePress`, `mergeHandlers`

**Usage**

Text links. Never leave an `<a>` unstyled — browser blue is not in the palette.

```jsx
<Link href="/menu">See the full menu</Link>
<Link variant="quiet">Outlets</Link>
<Link variant="inverse" external>FSSAI licence</Link>
```

`quiet` is the header/footer nav treatment (no underline until hover). `external` adds the arrow and the safe `rel`.

**Props contract**

```ts
import type { CSSProperties, MouseEventHandler, ReactNode } from "react";

export interface LinkProps {
  children?: ReactNode;
  href?: string;
  /** default = pink underline · subtle = muted · inverse = on pink/ink · quiet = nav links */
  variant?: "default" | "subtle" | "inverse" | "quiet";
  size?: "sm" | "md" | "lg";
  icon?: string;
  iconAfter?: string;
  /** Opens in a new tab and appends the arrow glyph. */
  external?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  disabled?: boolean;
  /** Force a visual state — docs/specimens only. */
  state?: "hover" | "press" | "focus";
  style?: CSSProperties;
}
export function Link(props: LinkProps): JSX.Element;
```

### Logo

Wraps the supplied logo files so nobody recolours or rebuilds the mark. lockup   — the official logo, tagline included. The default; use it wherever there is room for at least 200px of width. wordmark — the same artwork without the tagline, for headers and UI chrome where the lockup's tagline would fall below ~9px and stop reading. symbol   — the interlocked diamond mark alone, for avatars, favicons, loaders and tight badges. Square, so it drops straight into a 1:1 slot.

- **Files:** `components/atoms/Logo.jsx` · `.d.ts` · `.prompt.md` · `Logo.card.html`
- **Built from:** — (leaf)

**Usage**

The only correct way to place the brand mark. Never rebuild, retype or recolour it.

```jsx
<Logo width={260} />                      {/* official lockup, tagline included */}
<Logo height={60} />                      {/* site header — lockup fits too */}
<Logo variant="symbol" tone="white" width={32} />
<Logo tone="badge" width={200} />         {/* white on a pink square */}
```

**Three variants.** `lockup` is the real logo — the tagline "India's First Desi Urban Café" is part of the artwork, so never set it in live type. **It is the default almost everywhere:** the tagline tucks into the white space beside the "P" descender, so the lockup and the wordmark share the same ~1.9:1 box and swapping one for the other costs no layout at all. Reach for `wordmark` — the same artwork with the tagline removed — only below about 120px of width, where the tagline drops under ~6px and turns to mud. `symbol` is the interlocked diamond mark alone — square, so it drops straight into a 1:1 slot for avatars, favicons, loaders and tight badges.

**Three tones.** `pink` on light surfaces, `white` on pink or ink, `badge` for white-on-pink-square (app icons, profile pictures, stickers).

Set `height` in horizontal chrome so the width follows the artwork; set `width` on marketing canvases. Never apply a CSS filter, drop shadow or opacity to the mark.

**Props contract**

```ts
import type { CSSProperties } from "react";

export interface LogoProps {
  /**
   * lockup   - the official logo with the tagline. The default almost everywhere;
   *            same ~1.9:1 box as the wordmark, so it is a free swap.
   * wordmark - no tagline. Only under ~120px wide, where the tagline turns to mud.
   * symbol   - the interlocked diamond mark alone. Square (1:1).
   */
  variant?: "lockup" | "wordmark" | "symbol";
  /** pink on light - white on pink/ink - badge is white on a pink square. */
  tone?: "pink" | "white" | "badge";
  /** Set height and the width follows the artwork. Preferred in headers. */
  height?: number | string;
  /** Explicit width. Defaults: lockup 240, wordmark 180, symbol 40. */
  width?: number | string;
  /** Assets folder. Default "/assets". */
  base?: string;
  style?: CSSProperties;
}
export function Logo(props: LogoProps): JSX.Element;
```

### Menu

The option list behind Select, Combobox and ActionMenu. Brand diamond marks the chosen row; arrows, Home/End, Enter and type-to-jump all work.

- **Files:** `components/atoms/Menu.jsx` · `.d.ts` · `.prompt.md` · `Menu.card.html`
- **Built from:** `Icon`, `StatusDot`, `Popover`

**Usage**

The one option panel. Select, Combobox and ActionMenu all render it, so every list in the product looks the same.

    <Menu inline role="listbox" value="paneer" items={[{ group: "Mains" }, { value: "paneer", label: "Chilli Paneer", meta: "₹280" }, { divider: true }, { value: "x", label: "Remove", icon: "trash-2", danger: true }]} />

Rows are 44px (52px in a sheet), --pink-50 on hover/keyboard focus, chosen row in --pink-700 with the brand diamond. Supports groups, dividers, icons, descriptions, trailing meta, disabled and danger rows. Keys: arrows, Home/End, Enter/Space, Tab closes, typing jumps.

**Props contract**

```ts
import type { CSSProperties, ReactNode } from "react";

export interface MenuItem {
  value: string;
  label: ReactNode;
  /** Plain text used for type-to-jump when label is not a string. */
  text?: string;
  description?: string;
  /** Leading Lucide icon. */
  icon?: string;
  /** Trailing mono text, e.g. a price. */
  meta?: string;
  disabled?: boolean;
  danger?: boolean;
}
export type MenuEntry = string | MenuItem | { divider: true } | { group: string };

export interface MenuProps {
  items?: MenuEntry[];
  /** Selected value (or values) — marked with the brand diamond in listbox mode. */
  value?: string | string[];
  onSelect?: (item: MenuItem) => void;
  open?: boolean;
  onClose?: (reason: string) => void;
  /** Focus the list and handle keys itself. Set false when an input owns focus (Combobox). */
  autoFocus?: boolean;
  activeIndex?: number;
  onActiveChange?: (index: number) => void;
  role?: "menu" | "listbox";
  id?: string;
  /** Path to /assets for the brand mark. */
  base?: string;
  emptyText?: string;
  title?: string;
  sheet?: "auto" | boolean;
  placement?: "bottom-start" | "bottom-end" | "top-start" | "top-end";
  inline?: boolean;
  width?: number | string;
  minWidth?: number;
  maxHeight?: number;
  style?: CSSProperties;
}
export function Menu(props: MenuProps): JSX.Element | null;
```

### PatternField

The brand's only texture: the diamond symbol tiled at low opacity.

- **Files:** `components/atoms/PatternField.jsx` · `.d.ts` · `.prompt.md` · `PatternField.card.html`
- **Built from:** — (leaf)

**Usage**

Flooded brand panel with the diamond symbol tiled behind it — the brand's single texture.

```jsx
<PatternField tone="brand" tile={96} radius="var(--radius-xl)" style={{padding:40}}>…</PatternField>
```

Set `base` if the assets are not at `/assets`. Keep opacity ≤ 0.12 — the pattern is a whisper, never a graphic element. No noise, grain or gradients alongside it.

**Props contract**

```ts
import type { CSSProperties, ReactNode } from "react";

export interface PatternFieldProps {
  tone?: "brand" | "ink" | "soft" | "light";
  /** Tile size in px — 96 on a 1080 canvas, 56–72 on screen. */
  tile?: number;
  /** Defaults to .08 on dark tones, .09 on light. Never above .12. */
  opacity?: number;
  /** Path to the assets folder, default "/assets". */
  base?: string;
  radius?: string;
  children?: ReactNode;
  style?: CSSProperties;
}
export function PatternField(props: PatternFieldProps): JSX.Element;
```

### Popover

Floating surface every custom picker opens into. Anchors to its parent element, flips above when there is no room below, closes on outside press and Esc, and becomes a bottom sheet on phones. Never the browser's own popup.

- **Files:** `components/atoms/Popover.jsx` · `.d.ts` · `.prompt.md` · `Popover.card.html`
- **Built from:** — (leaf)

**Usage**

Low-level floating surface. Reach for Select, Combobox, DatePicker or ActionMenu first; use Popover directly only for a custom panel (a filter sheet, a share card).

    <div style={{ position: "relative" }}>
      <Button onClick={() => setOpen(true)}>Share</Button>
      <Popover open={open} onClose={() => setOpen(false)} title="Share">...</Popover>
    </div>

Anchors to its parent element, flips above when there is no room, closes on outside press and Esc. sheet="auto" turns it into a bottom sheet at 640px and below. Floats with position: fixed, so it escapes overflow: hidden (Dialog) but not a transformed ancestor.

**Props contract**

```ts
import type { CSSProperties, ReactNode, HTMLAttributes, Ref } from "react";

export interface PopoverProps {
  open?: boolean;
  /** Called with "outside" or "escape". */
  onClose?: (reason: "outside" | "escape") => void;
  children?: ReactNode;
  /** Heading shown when rendered as a bottom sheet. */
  title?: string;
  placement?: "bottom-start" | "bottom-end" | "top-start" | "top-end";
  /** "auto" = bottom sheet at 640px and below. */
  sheet?: "auto" | boolean;
  /** Render in flow (specimens, docs) instead of floating. */
  inline?: boolean;
  width?: number | string;
  /** Defaults to the anchor's width. */
  minWidth?: number;
  maxHeight?: number;
  offset?: number;
  padding?: number | string;
  bodyRef?: Ref<HTMLDivElement>;
  bodyProps?: HTMLAttributes<HTMLDivElement>;
  style?: CSSProperties;
}
export function Popover(props: PopoverProps): JSX.Element | null;
```

### PriceTag

Enforces ₹, no decimals on whole rupees, en-dash ranges, struck original.

- **Files:** `components/atoms/PriceTag.jsx` · `.d.ts` · `.prompt.md` · `PriceTag.card.html`
- **Built from:** — (leaf)

**Usage**

The only correct way to render a price: `₹` with no space, no decimals on whole rupees, Indian digit grouping.

```jsx
<PriceTag amount={280} />
<PriceTag amount={240} was={320} />
<PriceTag amount={180} to={320} size="sm" />
```

`tone="inverse"` on pink or ink panels. Never hand-write a price string.

**Props contract**

```ts
import type { CSSProperties } from "react";

export interface PriceTagProps {
  /** Whole rupees. */
  amount: number;
  /** Original price, rendered struck through. */
  was?: number;
  /** Upper bound — renders "₹180–₹320". */
  to?: number;
  size?: "sm" | "md" | "lg";
  tone?: "ink" | "brand" | "inverse";
  style?: CSSProperties;
}
export function PriceTag(props: PriceTagProps): JSX.Element;
```

### ProgressBar

Loyalty / order progress. Segmented by default — the brand's loyalty look.

- **Files:** `components/atoms/ProgressBar.jsx` · `.d.ts` · `.prompt.md` · `ProgressBar.card.html`
- **Built from:** — (leaf)

**Usage**

Loyalty stamps and order progress.

```jsx
<ProgressBar segments={6} value={3} label="3 more visits and chai's on us" />
<ProgressBar value={70} tone="inverse" />
```

Segmented is the loyalty pattern; continuous is for checkout steps and uploads. `--pink-200` track, `--pink-500` fill.

**Props contract**

```ts
import type { CSSProperties } from "react";

export interface ProgressBarProps {
  value?: number;
  max?: number;
  /** Render as N discrete segments (loyalty stamps) instead of a continuous bar. */
  segments?: number;
  label?: string;
  tone?: "brand" | "mint" | "inverse";
  height?: number;
  style?: CSSProperties;
}
export function ProgressBar(props: ProgressBarProps): JSX.Element;
```

### Radio

Single-choice control. Used for size, spice and payment method.

- **Files:** `components/atoms/Radio.jsx` · `.d.ts` · `.prompt.md` · `Radio.card.html`
- **Built from:** `usePress`

**Usage**

Exactly-one choice — portion size, spice level, payment method.

```jsx
<Radio name="size" label="Regular" price={280} checked onChange={pick} />
<Radio name="size" label="Sharing" price={440} onChange={pick} />
```

Group with a 12px gap and always pass a shared `name`. The dot is drawn as a 6px pink ring — do not swap in a filled circle.

**Props contract**

```ts
import type { CSSProperties, ChangeEventHandler } from "react";

export interface RadioProps {
  label?: string;
  description?: string;
  /** Absolute price for this option in whole rupees. */
  price?: number;
  name?: string;
  value?: string;
  checked?: boolean;
  disabled?: boolean;
  /** Marks the whole group invalid. */
  error?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  style?: CSSProperties;
}
export function Radio(props: RadioProps): JSX.Element;
```

### Rating

Review score. Brand diamonds carrying the mark; symbol={true} drops the diamond and uses the bare mark. Partial scores clip in SCREEN space across the diamond's true bounding box, so 4.3 fills exactly 30% of the fifth diamond's width.

- **Files:** `components/atoms/Rating.jsx` · `.d.ts` · `.prompt.md` · `Rating.card.html`
- **Built from:** — (leaf)

**Usage**

Review score for outlet cards and social proof.

    <Rating value={4.6} count={2184} />
    <Rating value={5} symbol size={18} />

Diamonds, not stars - the brand shape. symbol swaps the plain diamond for the interlocked brand mark, which is the treatment used in ReviewCard and on marketing artwork. Partial scores fill by real percentage: the fill clips in screen space across the diamond bounding box, so 4.3 fills exactly 30% of the fifth diamond width. Default size is 16px - below that the embedded mark stops reading, so the component raises its opacity automatically.

**Props contract**

```ts
import type { CSSProperties } from "react";

export interface RatingProps {
  /** Supports halves, e.g. 4.5. */
  value?: number;
  max?: number;
  /** Review count, shown in brackets with Indian digit grouping. */
  count?: number;
  /** Rendered diamond size in px. Default 16; below 16 the mark opacity steps up. */
  size?: number;
  /** Use the brand symbol mark instead of plain diamonds. */
  symbol?: boolean;
  /** Assets folder, only used when symbol is set. */
  base?: string;
  /** Hide the numeric value. */
  showValue?: boolean;
  style?: CSSProperties;
}
export function Rating(props: RatingProps): JSX.Element;
```

### Select

Brand dropdown. Our own trigger and list panel — never the browser's popup. Matches Input metrics and states exactly; becomes a bottom sheet on phones.

- **Files:** `components/atoms/Select.jsx` · `.d.ts` · `.prompt.md` · `Select.card.html`
- **Built from:** `Icon`, `Menu`, `normalizeItems`

**Usage**

Dropdown for short, known lists - outlet, table size, pickup slot. Our own trigger and list panel; the browser's popup never appears.

    <Select label="Pick your outlet" options={["Sector 57, Gurgaon"]} />
    <Select label="Guests" placeholder="Choose a size" error="Pick a table size." options={[...]} onValueChange={setGuests} />

Matches Input exactly - same heights, radius, status colours and messages (error / success / warning / disabled / readOnly). The status glyph replaces the chevron. onChange stays event-shaped (e.target.value) so old call sites keep working; onValueChange gives the bare value. Bottom sheet on phones. Over ~12 options, use Combobox.

**Props contract**

```ts
import type { CSSProperties } from "react";

export interface SelectOption { value: string; label: string; disabled?: boolean }

export interface SelectProps {
  label?: string;
  hint?: string;
  /** true, or the message to show. */
  error?: boolean | string;
  success?: boolean | string;
  warning?: boolean | string;
  status?: "default" | "error" | "success" | "warning";
  /** Strings, or {value,label} pairs. */
  options?: (string | SelectOption)[];
  value?: string;
  /** Uncontrolled start value. Without a placeholder, defaults to the first option. */
  defaultValue?: string;
  /** Name for a hidden form input. */
  name?: string;
  /** Shown in the trigger when nothing is chosen. */
  placeholder?: string;
  /** Leading Lucide icon name. */
  icon?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  optional?: boolean;
  /** Event-shaped for drop-in compatibility: e.target.value. */
  onChange?: (e: { target: { value: string; name?: string }; value: string }) => void;
  onValueChange?: (value: string) => void;
  /** Path to /assets for the selected-row mark. */
  base?: string;
  /** "auto" = bottom sheet at 640px and below. */
  sheet?: "auto" | boolean;
  /** Docs/specimens only. */
  defaultOpen?: boolean;
  style?: CSSProperties;
}
export function Select(props: SelectProps): JSX.Element;
```

### Skeleton

Loading placeholder in --pink-100. Pair with the pulsing diamond for pages.

- **Files:** `components/atoms/Skeleton.jsx` · `.d.ts` · `.prompt.md` · `Skeleton.card.html`
- **Built from:** — (leaf)

**Usage**

Loading placeholder — light-pink blocks, never grey, never a gradient spinner.

```jsx
<Skeleton height={180} radius="var(--radius-lg)" />
<Skeleton lines={3} />
```

Needs `@keyframes pp-skeleton` (opacity 1 → .55 → 1) in the page. For whole-page loads use the pulsing pink diamond symbol instead.

**Props contract**

```ts
import type { CSSProperties } from "react";

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: string;
  /** Pill/round placeholder for avatars and chips. */
  circle?: boolean;
  /** Render N stacked text lines with varied widths. */
  lines?: number;
  style?: CSSProperties;
}
export function Skeleton(props: SkeletonProps): JSX.Element;
```

### SocialHeadline

Canvas-scale type for marketing artboards. Balanced wrapping, never clipped.

- **Files:** `components/atoms/SocialHeadline.jsx` · `.d.ts` · `.prompt.md` · `SocialHeadline.card.html`
- **Built from:** — (leaf)

**Usage**

Type for marketing canvases — sized in canvas pixels, wrapped with `text-wrap: balance`.

```jsx
<SocialHeadline size="overline" on="brand">Tonight Only</SocialHeadline>
<SocialHeadline size="hero" on="brand" max="14ch">Chai first, decisions later.</SocialHeadline>
```

Never use screen `--fs-*` sizes on a 1080 canvas — they render as fine print. Keep headlines ≤ 6 words so `balance` can do its job.

**Props contract**

```ts
import type { CSSProperties, ReactNode } from "react";

export interface SocialHeadlineProps {
  children?: ReactNode;
  /** hero 132 · h1 96 · h2 72 · body 34 · caption 26 · overline 24 (canvas px) */
  size?: "hero" | "h1" | "h2" | "body" | "caption" | "overline";
  on?: "brand" | "ink" | "soft" | "light";
  align?: "start" | "center" | "end";
  /** Measure cap, default 18ch — keeps headlines to 2–3 balanced lines. */
  max?: string;
  style?: CSSProperties;
}
export function SocialHeadline(props: SocialHeadlineProps): JSX.Element;
```

### SpiceLevel

Heat shown as brand diamonds on the --heat-* ramp. Never emoji. Each diamond carries the brand mark inside: white at 35% when filled, pink when the diamond is empty grey so the mark never blends away.

- **Files:** `components/atoms/SpiceLevel.jsx` · `.d.ts` · `.prompt.md` · `SpiceLevel.card.html`
- **Built from:** — (leaf)

**Usage**

Heat indicator built from the brand's diamond motif — the sanctioned alternative to 🌶.

```jsx
<SpiceLevel level={3} showLabel />
```

Filled diamonds take the `--heat-*` colour of the level (mint → turmeric → tandoor → pink); the rest sit in `--ink-200`. Labels are the brand's Hinglish names: Mild, Medium, Hot, Extra Hot.

**Props contract**

```ts
import type { CSSProperties } from "react";

export interface SpiceLevelProps {
  /** 1 Mild · 2 Medium · 3 Hot · 4 Extra Hot. */
  level?: 1 | 2 | 3 | 4;
  max?: number;
  /** Show the uppercase Hinglish heat name beside the diamonds. */
  showLabel?: boolean;
  size?: number;
  style?: CSSProperties;
}
export function SpiceLevel(props: SpiceLevelProps): JSX.Element;
```

### Spinner

Loading indicator: the brand mark, pulsing. Never a gradient ring.

- **Files:** `components/atoms/Spinner.jsx` · `.d.ts` · `.prompt.md` · `Spinner.card.html`
- **Built from:** — (leaf)

**Usage**

Whole-view loading state - the brand mark, pulsing.

    <Spinner size={40} />

Default 36px; go to 44-56px for a full-page load. tone="inverse" uses the white mark on pink or ink. For content that has a known shape use Skeleton instead - it is the better default. Set base if the assets are not at /assets.

**Props contract**

```ts
import type { CSSProperties } from "react";

export interface SpinnerProps {
  size?: number;
  tone?: "brand" | "ink" | "inverse";
  /** Assets folder holding the symbol files. */
  base?: string;
  /** Accessible status label. */
  label?: string;
  style?: CSSProperties;
}
export function Spinner(props: SpinnerProps): JSX.Element;
```

### StatusDot

Small state marker for outlet open/closed and live order states. A brand diamond with the mark inside it, held back so the dot still reads as a solid state colour first and a brand mark second.

- **Files:** `components/atoms/StatusDot.jsx` · `.d.ts` · `.prompt.md` · `StatusDot.card.html`
- **Built from:** — (leaf)

**Usage**

Outlet open/closed state and live order state.

```jsx
<StatusDot tone="open" label="Open till 11:30pm" />
<StatusDot tone="live" pulse label="On the tandoor" />
```

A rotated diamond, not a circle — the brand shape carries all the way down. `pulse` needs `@keyframes pp-dot-pulse` (scale 1→2.4, opacity .6→0).

**Props contract**

```ts
import type { CSSProperties } from "react";

export interface StatusDotProps {
  tone?: "open" | "busy" | "closed" | "live" | "danger";
  label?: string;
  /** Adds the expanding pulse — live orders only. */
  pulse?: boolean;
  size?: number;
  /** Assets folder holding symbol-white.svg. */
  base?: string;
  style?: CSSProperties;
}
export function StatusDot(props: StatusDotProps): JSX.Element;
```

### Switch

Instant-effect toggle. Never used to submit a form.

- **Files:** `components/atoms/Switch.jsx` · `.d.ts` · `.prompt.md` · `Switch.card.html`
- **Built from:** `usePress`

**Usage**

Toggle for settings that take effect immediately — never inside a save-on-submit form.

```jsx
<Switch label="Jain preferences" description="Hides onion and garlic." checked={veg} onChange={t} />
```

Label sits left, control right, so a column of switches aligns. 46×28 track, 22px knob, 220ms slide.

**Props contract**

```ts
import type { CSSProperties, ChangeEventHandler } from "react";

export interface SwitchProps {
  label?: string;
  description?: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  style?: CSSProperties;
}
export function Switch(props: SwitchProps): JSX.Element;
```

### Tag

Selectable filter pill used across menu category rails.

- **Files:** `components/atoms/Tag.jsx` · `.d.ts` · `.prompt.md` · `Tag.card.html`
- **Built from:** `Icon`, `usePress`, `mergeHandlers`

**Usage**

Tappable filter pill — menu categories, dietary filters, outlet cities.

```jsx
<Tag selected onClick={pick}>All</Tag>
<Tag icon="leaf" onClick={pick}>Veg Only</Tag>
```

Sentence/Title Case (not caps — that's `Badge`). Selected = flooded pink; unselected = white with a 1px `--border-default`.

**Props contract**

```ts
import type { CSSProperties, MouseEventHandler, ReactNode } from "react";

export interface TagProps {
  children?: ReactNode;
  /** Selected pills flood pink. */
  selected?: boolean;
  icon?: string;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** Force a visual state — docs/specimens only. */
  state?: "hover" | "press" | "focus";
  style?: CSSProperties;
}
export function Tag(props: TagProps): JSX.Element;
```

### Text

Every piece of text in the system. Locks the type ramp so nothing is ad-hoc.

- **Files:** `components/atoms/Text.jsx` · `.d.ts` · `.prompt.md` · `Text.card.html`
- **Built from:** — (leaf)

**Usage**

Every string of text goes through `Text` — it is the only place the type ramp is expressed.

```jsx
<Text variant="overline" tone="brand">The Menu</Text>
<Text variant="h2" fluid>Most ordered this week</Text>
<Text variant="body" tone="muted" measure="prose">We roast our own masala every morning.</Text>
```

12 variants: display-1/2, h1–h4, body-lg/body/body-sm, caption, overline, mono. Pass `fluid` in any responsive layout so headings clamp instead of overflowing. Display variants get `text-wrap: balance`, body gets `pretty`.

**Props contract**

```ts
import type { CSSProperties, ReactNode } from "react";

/**
 * The system's single typography primitive.
 */
export interface TextProps {
  children?: ReactNode;
  /** The type ramp step. */
  variant?: "display-1" | "display-2" | "h1" | "h2" | "h3" | "h4" | "body-lg" | "body" | "body-sm" | "caption" | "overline" | "mono";
  /** Semantic colour, or any CSS colour string. */
  tone?: "heading" | "body" | "muted" | "subtle" | "brand" | "inverse" | "on-brand" | "danger" | string;
  /** Override the rendered element. */
  as?: string;
  /** Override the ramp's weight (400-800). */
  weight?: number;
  align?: "left" | "center" | "right";
  /** Use the clamp() fluid size for this step — always do this in responsive layouts. */
  fluid?: boolean;
  /** Truncate to N lines. */
  clamp?: number;
  /** "prose" (64ch), "narrow" (44ch) or any CSS length. */
  measure?: "prose" | "narrow" | string;
  style?: CSSProperties;
}
export function Text(props: TextProps): JSX.Element;
```

### TextButton

Shared interaction state for every pressable thing in the system: hover (pointer only), press (pointer or Space/Enter), and keyboard focus-visible.

- **Files:** `components/atoms/TextButton.jsx` · `.d.ts` · `.prompt.md` · `TextButton.card.html`
- **Built from:** `Icon`

**Usage**

Text-only action — toast/snackbar CTAs ("View Cart", "Undo"), inline card actions ("Edit", "Remove"), "View all" links that act rather than navigate.

    <Toast tone="brand" action="View Cart" onAction={openCart}>Added Chilli Paneer</Toast>
    <TextButton tone="neutral" icon="pencil">Edit</TextButton>

States: rest = just the word; hover = tinted pill + underline (not in caps); press = darker tint + scale 0.97; keyboard focus = 2px ring (white on dark/brand surfaces); disabled = dimmed, not-allowed; loading = spinner. Always set `on` to the surface: "light", "dark" (ink), or "brand" (pink or a status colour). Navigation goes to Link; a primary decision goes to Button.

The file also exports `usePress(disabled)` — the shared hover/press/focus-visible hook every pressable component in the system uses.

**Props contract**

```ts
import type { CSSProperties, MouseEventHandler, ReactNode } from "react";

export interface TextButtonProps {
  children?: ReactNode;
  /** Ink colour family. */
  tone?: "brand" | "neutral" | "danger";
  /** Surface it sits on: light page, dark ink (toasts/snackbars), or a flooded brand/status colour. */
  on?: "light" | "dark" | "brand";
  size?: "sm" | "md";
  /** Uppercase, tracked label — toast and snackbar actions. */
  caps?: boolean;
  icon?: string;
  iconAfter?: string;
  disabled?: boolean;
  loading?: boolean;
  /** Force a visual state — docs/specimens only. */
  state?: "hover" | "press" | "focus";
  type?: "button" | "submit" | "reset";
  onClick?: MouseEventHandler<HTMLButtonElement>;
  style?: CSSProperties;
}
export function TextButton(props: TextButtonProps): JSX.Element;
```

### Tooltip

Hover/focus hint. Ink pill, 6px radius, no arrow.

- **Files:** `components/atoms/Tooltip.jsx` · `.d.ts` · `.prompt.md` · `Tooltip.card.html`
- **Built from:** — (leaf)

**Usage**

Names an icon-only control or explains a mark; never holds essential copy.

```jsx
<Tooltip label="Contains dairy"><Icon name="milk" /></Tooltip>
```

Ink pill, 12.5px, no arrow, 140ms fade. Max ~5 words, no full stop.

**Props contract**

```ts
import type { CSSProperties, ReactNode } from "react";

export interface TooltipProps {
  /** Short hint, no full stop. */
  label: string;
  children?: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  style?: CSSProperties;
}
export function Tooltip(props: TooltipProps): JSX.Element;
```

---

## Molecules

### Accordion

FAQ / allergen disclosure list. One open at a time by default.

- **Files:** `components/molecules/Accordion.jsx` · `.d.ts` · `.prompt.md` · `Accordion.card.html`
- **Built from:** `Icon`, `usePress`, `mergeHandlers`

**Usage**

FAQ, allergen and franchise-detail disclosure.

```jsx
<Accordion items={[{q:"Is everything vegetarian?",a:"Yes — the whole kitchen is."}]} />
```

Hairline-separated rows, no card, chevron rotates 180°, height animates via `grid-template-rows`. Active question turns `--pink-600`.

**Props contract**

```ts
import type { CSSProperties, ReactNode } from "react";

export interface AccordionItem { q: string; a: ReactNode }

export interface AccordionProps {
  items?: AccordionItem[];
  /** Allow several panels open at once. */
  multiple?: boolean;
  /** Question strings to start open. */
  defaultOpen?: string[];
  style?: CSSProperties;
}
export function Accordion(props: AccordionProps): JSX.Element;
```

### ActionMenu

The "more" menu: an icon button that opens our Menu panel of actions. Use for row and card overflow (edit, share, remove).

- **Files:** `components/molecules/ActionMenu.jsx` · `.d.ts` · `.prompt.md` · `ActionMenu.card.html`
- **Built from:** `IconButton`, `Menu`

**Usage**

Overflow "more" menu for rows and cards.

    <ActionMenu items={[{ value: "edit", label: "Edit order", icon: "pencil" }, { value: "share", label: "Share", icon: "share-2" }, { divider: true }, { value: "cancel", label: "Cancel order", icon: "x", danger: true }]} onSelect={handle} />

Vertical ellipsis IconButton; opens bottom-end; sheet on phones. Put destructive actions last, after a divider, with danger.

**Props contract**

```ts
import type { CSSProperties } from "react";
import type { MenuEntry, MenuItem } from "../atoms/Menu";

export interface ActionMenuProps {
  items?: MenuEntry[];
  onSelect?: (value: string, item: MenuItem) => void;
  /** Accessible label for the trigger. */
  label?: string;
  icon?: string;
  variant?: "primary" | "secondary" | "ghost" | "glass";
  size?: "sm" | "md" | "lg";
  on?: "light" | "brand";
  placement?: "bottom-start" | "bottom-end" | "top-start" | "top-end";
  sheet?: "auto" | boolean;
  title?: string;
  minWidth?: number;
  defaultOpen?: boolean;
  style?: CSSProperties;
}
export function ActionMenu(props: ActionMenuProps): JSX.Element;
```

### Alert

Inline message block. Full 1px border — never a coloured left border only.

- **Files:** `components/molecules/Alert.jsx` · `.d.ts` · `.prompt.md` · `Alert.card.html`
- **Built from:** `Icon`, `IconButton`

**Usage**

Persistent inline message — kitchen delays, closed outlets, payment problems.

```jsx
<Alert tone="warning" title="Kitchen is busy">Pickup is running 25 minutes today.</Alert>
```

Soft tint fill with a matching **full** 1px border. Use `Toast` for transient confirmations instead.

**Props contract**

```ts
import type { CSSProperties, ReactNode } from "react";

export interface AlertProps {
  tone?: "info" | "success" | "warning" | "danger" | "brand";
  title?: string;
  children?: ReactNode;
  /** Usually a small ghost Button. */
  action?: ReactNode;
  onDismiss?: () => void;
  style?: CSSProperties;
}
export function Alert(props: AlertProps): JSX.Element;
```

### Breadcrumb

Website-only path trail.

- **Files:** `components/molecules/Breadcrumb.jsx` · `.d.ts` · `.prompt.md` · `Breadcrumb.card.html`
- **Built from:** `Icon`, `Link`

**Usage**

Path trail for website sub-pages (menu category, outlet, careers). Not used in the app.

```jsx
<Breadcrumb items={[{label:"Home",href:"/"},{label:"Menu",href:"/menu"},{label:"Small Plates"}]} />
```

Chevron separators, muted links, current page in ink 500-weight.

**Props contract**

```ts
import type { CSSProperties } from "react";

export interface BreadcrumbItem { label: string; href?: string }

export interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  style?: CSSProperties;
}
export function Breadcrumb(props: BreadcrumbProps): JSX.Element;
```

### Combobox

Type-to-filter dropdown for long lists — dishes, localities, corporate accounts. Same field shell as Input and Select; the list is our Menu panel.

- **Files:** `components/molecules/Combobox.jsx` · `.d.ts` · `.prompt.md` · `Combobox.card.html`
- **Built from:** `Icon`, `Menu`, `normalizeItems`, `IconButton`

**Usage**

Type-to-filter dropdown for long lists - dishes, localities, corporate accounts.

    <Combobox label="Add a dish" options={DISHES} value={dish} onChange={setDish} />

Same field shell as Input/Select. Matches are bolded in --pink-700; empty results show emptyText in our voice. onChange receives the value, not an event. Always a popover (never a sheet) so the keyboard stays up on phones.

**Props contract**

```ts
import type { CSSProperties } from "react";
import type { MenuItem } from "../atoms/Menu";

export interface ComboboxProps {
  label?: string;
  hint?: string;
  error?: boolean | string;
  success?: boolean | string;
  warning?: boolean | string;
  status?: "default" | "error" | "success" | "warning";
  options?: (string | MenuItem)[];
  value?: string;
  onChange?: (value: string, item: MenuItem) => void;
  placeholder?: string;
  /** Leading Lucide icon. Default "search". */
  icon?: string;
  emptyText?: string;
  /** Custom match. Default: case-insensitive "contains" on the label. */
  filter?: (item: MenuItem, query: string) => boolean;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  required?: boolean;
  optional?: boolean;
  name?: string;
  base?: string;
  /** Docs/specimens only. */
  defaultQuery?: string;
  defaultOpen?: boolean;
  style?: CSSProperties;
}
export function Combobox(props: ComboboxProps): JSX.Element;
```

### CouponTicket

Perforated voucher for stories, DMs and print handouts. The code stub is a copy button unless copyable={false}.

- **Files:** `components/molecules/CouponTicket.jsx` · `.d.ts` · `.prompt.md` · `CouponTicket.card.html`
- **Built from:** `Logo`, `Icon`, `usePress`, `mergeHandlers`

**Usage**

Voucher artwork for stories, DMs, table cards and print handouts. The code stub copies to the clipboard on tap.

    const [copied, setCopied] = React.useState(false);

    <CouponTicket code="PAPRIKAA50" headline="50% off your first order"
      width={900} onCopy={() => setCopied(true)} />
    <Snackbar open={copied} tone="success" onClose={() => setCopied(false)}>
      Code copied. Paste it at checkout.
    </Snackbar>

Always pair onCopy with a Snackbar - the stub's own "Copied" flash is reinforcement, not the confirmation. Pass copyable={false} on print artwork and inside PostFrame artboards, where nothing is tappable. All type scales from width, so it works from a 300px MPU to a 1080px canvas.

**Props contract**

```ts
import type { CSSProperties } from "react";

export interface CouponTicketProps {
  /** Uppercase promo code, Space Mono. */
  code?: string;
  /** 8 words maximum. */
  headline?: string;
  /** Terms in full sentences - always state the expiry. */
  terms?: string;
  tone?: "brand" | "light";
  base?: string;
  /** Design width in px; all inner type scales from it. */
  width?: number;
  /** Colour of the two punched notches - match the surface behind the ticket. */
  notchColor?: string;
  /** Makes the code stub a copy button. Set false for print and artboards. */
  copyable?: boolean;
  /** Fires with the copied code - pair it with a Snackbar. */
  onCopy?: (code: string) => void;
  style?: CSSProperties;
}
export function CouponTicket(props: CouponTicketProps): JSX.Element;
```

### DatePicker

Brand date field. Our calendar in a popover (bottom sheet on phones) — never the browser's date input. Values are ISO strings: "2026-10-10".

- **Files:** `components/molecules/DatePicker.jsx` · `.d.ts` · `.prompt.md` · `DatePicker.card.html`
- **Built from:** `Icon`, `IconButton`, `Popover`

**Usage**

Date field with our own calendar. Never use Input type="date".

    <DatePicker label="Date" min={todayISO} value={date} onChange={setDate} />

ISO strings in and out. Selected day sits in a pink brand diamond; today carries a small diamond under the number; past/blocked days are struck through. Weeks start Monday. Keys: arrows, PageUp/PageDown for months, Home/End for the week, Esc closes. Bottom sheet on phones. For times, use SlotPicker.

**Props contract**

```ts
import type { CSSProperties } from "react";

export interface DatePickerProps {
  label?: string;
  hint?: string;
  error?: boolean | string;
  success?: boolean | string;
  warning?: boolean | string;
  status?: "default" | "error" | "success" | "warning";
  /** ISO date, "2026-10-10". */
  value?: string;
  defaultValue?: string;
  onChange?: (iso: string) => void;
  /** Earliest pickable ISO date. */
  min?: string;
  max?: string;
  /** Block specific days, e.g. a weekly off. */
  isDateDisabled?: (iso: string) => boolean;
  placeholder?: string;
  /** 0 = Sunday, 1 = Monday (default). */
  weekStart?: 0 | 1;
  /** Formats the trigger text. Default "Sat, 10 Oct 2026". */
  format?: (iso: string) => string;
  icon?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  optional?: boolean;
  name?: string;
  sheet?: "auto" | boolean;
  /** Render just the calendar card in flow. */
  inline?: boolean;
  defaultOpen?: boolean;
  style?: CSSProperties;
}
export function DatePicker(props: DatePickerProps): JSX.Element;
```

### EmptyState

Nothing-here state. Always says what to do next.

- **Files:** `components/molecules/EmptyState.jsx` · `.d.ts` · `.prompt.md` · `EmptyState.card.html`
- **Built from:** `Text`, `Icon`

**Usage**

Empty cart, no search results, no orders yet.

    <EmptyState symbol title="Nothing here yet." body="Let's fix that."
      action={<Button onClick={browse}>Browse the Menu</Button>} />

Copy is two short sentences and never apologetic. Exactly one action, never two.

**Props contract**

```ts
import type { CSSProperties, ReactNode } from "react";

export interface EmptyStateProps {
  /** Short and plain: "Nothing here yet." */
  title?: string;
  /** One line that says what to do next. */
  body?: string;
  /** Lucide glyph. Ignored when symbol is set. */
  icon?: string;
  /** Use the brand diamond instead of an icon - the warmer option. */
  symbol?: boolean;
  /** Usually a single Button. */
  action?: ReactNode;
  size?: "md" | "lg";
  base?: string;
  style?: CSSProperties;
}
export function EmptyState(props: EmptyStateProps): JSX.Element;
```

### Field

Label + control + hint/error wrapper. Use around any bare control.

- **Files:** `components/molecules/Field.jsx` · `.d.ts` · `.prompt.md` · `Field.card.html`
- **Built from:** `Text`, `Icon`

**Usage**

Wraps any control that does not carry its own label - SlotPicker, a control group, a custom widget.

    <Field label="How spicy?" hint="You can change this later.">
      <div style={{display:"grid",gap:10}}>...radios...</div>
    </Field>

Input and Select already include a label; do not double-wrap them. Mark the *optional* fields rather than starring the required ones.

**Props contract**

```ts
import type { CSSProperties, ReactNode } from "react";

export interface FieldProps {
  label?: string;
  /** Helper text. Hidden while an error is showing. */
  hint?: string;
  /** Error message - replaces the hint and adds the alert glyph. */
  error?: string;
  /** Success message - mint, with a check glyph. */
  success?: string;
  /** Warning message - turmeric, with an alert glyph. */
  warning?: string;
  required?: boolean;
  /** Marks the field optional instead - prefer this to starring everything. */
  optional?: boolean;
  htmlFor?: string;
  /** "stack" (label above) or "side" (160px label column). */
  layout?: "stack" | "side";
  children?: ReactNode;
  style?: CSSProperties;
}
export function Field(props: FieldProps): JSX.Element;
```

### FilterBar

Horizontal category filter rail. Scrolls on mobile, wraps on desktop.

- **Files:** `components/molecules/FilterBar.jsx` · `.d.ts` · `.prompt.md` · `FilterBar.card.html`
- **Built from:** `Tag`, `Badge`

**Usage**

Menu category rail on both the website and the app.

    <FilterBar options={["All","Small Plates","All Day","Sweets"]} value={cat} onChange={setCat} note="100% Vegetarian" />

Scrolls horizontally by default (the app pattern); pass wrap for the website. Exactly one option is selected at a time.

**Props contract**

```ts
import type { CSSProperties, ReactNode } from "react";

export interface FilterOption { value: string; label: string; icon?: string }

export interface FilterBarProps {
  options?: (string | FilterOption)[];
  value?: string;
  onChange?: (value: string) => void;
  /** Wrap to multiple rows instead of scrolling horizontally. */
  wrap?: boolean;
  /** A static statement badge pinned after the filters, e.g. "100% Vegetarian". */
  note?: string;
  trailing?: ReactNode;
  style?: CSSProperties;
}
export function FilterBar(props: FilterBarProps): JSX.Element;
```

### ListRow

Generic settings / account / details row. Hairline separated, not carded.

- **Files:** `components/molecules/ListRow.jsx` · `.d.ts` · `.prompt.md` · `ListRow.card.html`
- **Built from:** `Text`, `Icon`, `usePress`, `mergeHandlers`

**Usage**

Settings, account and detail rows in the app.

    <ListRow icon="map-pin" title="Default outlet" value="Sector 57" chevron onClick={pick} />
    <ListRow icon="bell" title="Order updates" trailing={<Switch checked={on} onChange={t} />} />

Rows are hairline separated - never a stack of cards. Minimum 44px tall. Use danger for destructive rows.

**Props contract**

```ts
import type { CSSProperties, ReactNode } from "react";

export interface ListRowProps {
  title?: string;
  description?: string;
  /** Leading element - overrides icon. */
  leading?: ReactNode;
  /** Lucide glyph on the left. */
  icon?: string;
  /** Right-aligned muted value, e.g. "Sector 57". */
  value?: string;
  /** Right-aligned control, e.g. a Switch. */
  trailing?: ReactNode;
  chevron?: boolean;
  divider?: boolean;
  /** Destructive row - "Delete my account". */
  danger?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
}
export function ListRow(props: ListRowProps): JSX.Element;
```

### LogoLockup

Canvas-scale signature for marketing artwork. The tagline is part of the supplied artwork, never live type.

- **Files:** `components/molecules/LogoLockup.jsx` · `.d.ts` · `.prompt.md` · `LogoLockup.card.html`
- **Built from:** `Logo`

**Usage**

The signature that closes a piece of marketing artwork — a post, a story, an ad.

```jsx
<LogoLockup tone="white" size={280} />
<LogoLockup tone="pink" size={200} align="center" />
```

The tagline is part of the supplied logo artwork, so it scales with the mark and can never drift out of sync. Keep `size` at 200 or above; below that pass `tagline={false}` to drop to the wordmark. On a coloured field use `tone="white"`; on light artwork use `tone="pink"`.

**Props contract**

```ts
import type { CSSProperties } from "react";

export interface LogoLockupProps {
  tone?: "pink" | "white" | "badge";
  /** Rendered width in canvas px. Keep >= 200 so the tagline reads. */
  size?: number;
  /** false drops to the wordmark-only artwork. */
  /** Drop the tagline. Only for units under ~120px wide, where it cannot read. */
  tagline?: boolean;
  align?: "start" | "center";
  base?: string;
  style?: CSSProperties;
}
export function LogoLockup(props: LogoLockupProps): JSX.Element;
```

### LoyaltyCard

Loyalty stamp card. The one place segmented progress is used.

- **Files:** `components/molecules/LoyaltyCard.jsx` · `.d.ts` · `.prompt.md` · `LoyaltyCard.card.html`
- **Built from:** `Card`, `Text`, `ProgressBar`

**Usage**

The loyalty stamp card on the app home and account screen.

    <LoyaltyCard visits={3} goal={6} reward="chai" />

Copy is generated so it always reads naturally at 1, many and zero remaining. Segmented ProgressBar only - never a percentage bar here.

**Props contract**

```ts
import type { CSSProperties } from "react";

export interface LoyaltyCardProps {
  visits?: number;
  goal?: number;
  /** What the guest earns, lowercase: "chai", "a kulfi". */
  reward?: string;
  variant?: "feature" | "brand";
  base?: string;
  style?: CSSProperties;
}
export function LoyaltyCard(props: LoyaltyCardProps): JSX.Element;
```

### MenuItemCard

Grid/rail card for a dish. Image-first, 4:3 crop.

- **Files:** `components/molecules/MenuItemCard.jsx` · `.d.ts` · `.prompt.md` · `MenuItemCard.card.html`
- **Built from:** `Card`, `DietMark`, `SpiceLevel`, `PriceTag`, `Badge`, `IconButton`

**Usage**

Dish card for grids and horizontal rails — the website's "Most Ordered" and the app home.

```jsx
<MenuItemCard name="Masala Cold Brew" price={220} spice={1} badge="New"
  description="Cold brew, jaggery, cardamom." onAdd={add} />
```

4:3 image on top with an overlapping floating `+` (pink, `--shadow-brand`), then diet mark + name + price. Lifts −2px on hover via `Card interactive`.

**Props contract**

```ts
import type { CSSProperties } from "react";

/**
 * Image-first dish card for grids, rails and highlight sections.
 */
export interface MenuItemCardProps {
  name: string;
  description?: string;
  price: number;
  was?: number;
  diet?: "veg" | "egg";
  spice?: 1 | 2 | 3 | 4;
  badge?: string;
  image?: string;
  imageLabel?: string;
  width?: number | string;
  /** Assets folder holding the brand symbol files. Default "/assets". */
  base?: string;
  /** Shows the floating pink + button on the image. */
  onAdd?: () => void;
  onClick?: () => void;
  style?: CSSProperties;
}
export function MenuItemCard(props: MenuItemCardProps): JSX.Element;
```

### MenuItemRow

The menu list atom: hairline-separated row, thumbnail on the right.

- **Files:** `components/molecules/MenuItemRow.jsx` · `.d.ts` · `.prompt.md` · `MenuItemRow.card.html`
- **Built from:** `DietMark`, `SpiceLevel`, `PriceTag`, `Badge`, `Button`

**Usage**

The menu list row — no card, just a `--border-subtle` hairline between items.

```jsx
<MenuItemRow name="Paprikaa Chilli Paneer" nameDevanagari="पनीर" price={280} spice={3}
  description="Amritsari paneer, burnt chilli mayo, potato brioche." badge="Bestseller" onAdd={add} />
```

Always pass `diet`. Omit `image` and a labelled light-pink placeholder appears — no supplied photography exists yet. Use `MenuItemCard` for grids and rails instead.

**Props contract**

```ts
import type { CSSProperties, ReactNode } from "react";

/**
 * A single dish in a menu list — the atom both the website menu and the app browse use.
 */
export interface MenuItemRowProps {
  name: string;
  /** Optional Devanagari dish name shown beside the Latin one. */
  nameDevanagari?: string;
  /** Ingredient-led, max 14 words. */
  description?: string;
  price: number;
  was?: number;
  diet?: "veg" | "egg";
  spice?: 1 | 2 | 3 | 4;
  /** Short ALL-CAPS marker, e.g. "BESTSELLER". */
  badge?: string;
  /** Image URL; omit to show the labelled pink placeholder. */
  image?: string;
  imageLabel?: string;
  /** Assets folder holding the brand symbol files. Default "/assets". */
  base?: string;
  onAdd?: () => void;
  /** Replace the default Add button. */
  action?: ReactNode;
  divider?: boolean;
  style?: CSSProperties;
}
export function MenuItemRow(props: MenuItemRowProps): JSX.Element;
```

### OfferSeal

Rotated diamond seal for offers. The brand's badge shape, at canvas scale.

- **Files:** `components/molecules/OfferSeal.jsx` · `.d.ts` · `.prompt.md` · `OfferSeal.card.html`
- **Built from:** — (leaf)

**Usage**

Offer badge for posts, stories and banners — a rotated brand diamond, never a circular starburst.

```jsx
<OfferSeal value="50%" label="Off" note="till 11:30pm" size={280} bleed={50} />
```

One per artboard. Use `bleed` (with `corner`) to hang it off the canvas edge — the component clamps the offset to 0.18 x `size`, because the number reaches ~0.32 x `size` from the centre and the value must never be clipped. Text counter-rotates so it stays upright.

**Props contract**

```ts
import type { CSSProperties } from "react";

export interface OfferSealProps {
  /** The number — "50%", "₹99", "1+1". */
  value?: string;
  /** Short uppercase word under it, e.g. "Off". */
  label?: string;
  note?: string;
  /** Diagonal size in canvas px. */
  size?: number;
  tone?: "light" | "brand" | "turmeric";
  /** Corner bleed in px. Clamped to 0.18 x size so the value is never clipped. */
  bleed?: number;
  corner?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  style?: CSSProperties;
}
export function OfferSeal(props: OfferSealProps): JSX.Element;
```

### OtpInput

4/6-digit login code. Mono digits, pink active cell.

- **Files:** `components/molecules/OtpInput.jsx` · `.d.ts` · `.prompt.md` · `OtpInput.card.html`
- **Built from:** — (leaf)

**Usage**

Mobile-OTP login code — the app's only sign-in method.

```jsx
<OtpInput value={code} onChange={setCode} />
```

48×56 cells, Space Mono digits, filled cells take a 2px pink border. Wraps to a second row rather than overflowing on a 360px screen.

**Props contract**

```ts
import type { CSSProperties } from "react";

export interface OtpInputProps {
  length?: number;
  value?: string;
  error?: string;
  /** Confirmation message, e.g. "Verified." */
  success?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  style?: CSSProperties;
}
export function OtpInput(props: OtpInputProps): JSX.Element;
```

### OutletCard

An outlet in the locator.

- **Files:** `components/molecules/OutletCard.jsx` · `.d.ts` · `.prompt.md` · `OutletCard.card.html`
- **Built from:** `Card`, `Text`, `Icon`, `StatusDot`, `ImageSlot`

**Usage**

One cafe location - used in the website locator and the app outlet picker.

    <OutletCard city="Gurgaon" name="Sector 57" address="Booth No. 67P, HSVP Market, Sector 57"
      hours="8am - 11:30pm" action={<Button size="sm" variant="ghost">Directions</Button>} />

Pass image={false} for the compact list variant. Status is a StatusDot, never a coloured pill.

**Props contract**

```ts
import type { CSSProperties, ReactNode } from "react";

export interface OutletCardProps {
  name: string;
  city?: string;
  address?: string;
  hours?: string;
  status?: "open" | "busy" | "closed";
  /** Overrides the status text derived from status. */
  statusLabel?: string;
  /** Image URL, or false to drop the image entirely. */
  image?: string | false;
  imageLabel?: string;
  /** Assets folder holding the brand symbol files. Default "/assets". */
  base?: string;
  action?: ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
}
export function OutletCard(props: OutletCardProps): JSX.Element;
```

### Pagination

Page control for blog / press listings. Every page button has hover, press, focus-visible and current states; prev/next disable at the ends.

- **Files:** `components/molecules/Pagination.jsx` · `.d.ts` · `.prompt.md` · `Pagination.card.html`
- **Built from:** `Icon`, `usePress`, `mergeHandlers`

**Usage**

Paging for press, blog and careers listings. Wraps rather than overflowing on mobile.

```jsx
<Pagination page={2} pages={9} onChange={setPage} />
```

Current page is a flooded pink pill; the rest are white with a 1px `--border-default`. Ellipses appear past ±1 of the current page.

**Props contract**

```ts
import type { CSSProperties } from "react";

export interface PaginationProps {
  page?: number;
  pages?: number;
  onChange?: (page: number) => void;
  style?: CSSProperties;
}
export function Pagination(props: PaginationProps): JSX.Element;
```

### PriceSummary

Cart / invoice totals block. Enforces the money formatting rules.

- **Files:** `components/molecules/PriceSummary.jsx` · `.d.ts` · `.prompt.md` · `PriceSummary.card.html`
- **Built from:** `Text`, `Divider`, `PriceTag`

**Usage**

Cart totals, checkout summary and order receipts.

    <PriceSummary total={1240} note="Inclusive of all taxes."
      lines={[{label:"Subtotal",amount:1180},{label:"GST (5%)",amount:59},{label:"First order",amount:100,discount:true}]} />

Never hand-format a rupee amount - this component and PriceTag are the only correct sources.

**Props contract**

```ts
import type { CSSProperties } from "react";

export interface PriceLine {
  label: string;
  /** Whole rupees. */
  amount: number;
  /** Renders in mint with a leading minus. */
  discount?: boolean;
  /** Emphasise this line. */
  strong?: boolean;
}

export interface PriceSummaryProps {
  lines?: PriceLine[];
  total: number;
  totalLabel?: string;
  /** Fine print under the total, e.g. "Inclusive of all taxes." */
  note?: string;
  tone?: "light" | "inverse";
  style?: CSSProperties;
}
export function PriceSummary(props: PriceSummaryProps): JSX.Element;
```

### QuantityStepper

−/+ quantity control used in cart rows and item detail.

- **Files:** `components/molecules/QuantityStepper.jsx` · `.d.ts` · `.prompt.md` · `QuantityStepper.card.html`
- **Built from:** `Icon`, `usePress`, `mergeHandlers`

**Usage**

Quantity control for cart rows, item detail and add-ons.

```jsx
<QuantityStepper value={qty} onChange={setQty} min={1} />
```

Pill on `--pink-50` with a `--pink-200` hairline; count is Poppins 700. Use `min={0}` where reaching zero removes the line item, `min={1}` where it shouldn't.

**Props contract**

```ts
import type { CSSProperties } from "react";

export interface QuantityStepperProps {
  value?: number;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  onChange?: (value: number) => void;
  style?: CSSProperties;
}
export function QuantityStepper(props: QuantityStepperProps): JSX.Element;
```

### ReviewCard

Guest review / testimonial.

- **Files:** `components/molecules/ReviewCard.jsx` · `.d.ts` · `.prompt.md` · `ReviewCard.card.html`
- **Built from:** `Card`, `Text`, `Avatar`, `Rating`

**Usage**

Guest quotes on the website and in social proof bands.

    <ReviewCard rating={5} quote="The chilli paneer is the whole reason I drive to Sector 57."
      name="Aditi Rao" meta="Sector 57 - March" />

The score renders as brand diamonds carrying the mark inside; pass symbol to drop the diamond and use the bare mark instead. Never invent reviews - these must be real guest copy. Use variant="brand" for the light-pink treatment in a testimonial wall.

**Props contract**

```ts
import type { CSSProperties } from "react";

export interface ReviewCardProps {
  name: string;
  /** Outlet and date, e.g. "Sector 57 - March". */
  meta?: string;
  /** The review text, without quote marks - the component adds them. */
  quote?: string;
  rating?: number;
  avatar?: string;
  variant?: "default" | "brand";
  /** Drop the diamond and use the bare mark for the score. Default false. */
  symbol?: boolean;
  base?: string;
  style?: CSSProperties;
}
export function ReviewCard(props: ReviewCardProps): JSX.Element;
```

### SearchField

Pill search input. The app and site both use this exact shape.

- **Files:** `components/molecules/SearchField.jsx` · `.d.ts` · `.prompt.md` · `SearchField.card.html`
- **Built from:** `Icon`, `Spinner`, `IconButton`

**Usage**

Menu search — pill-shaped, unlike the 10px-radius `Input`.

```jsx
<SearchField value={q} onChange={e=>setQ(e.target.value)} onClear={()=>setQ("")} />
```

Always full-width in its container with `min-width:0` so it never pushes a flex row wider. Placeholder names real dishes, not "Search…".

**Props contract**

```ts
import type { CSSProperties, ChangeEventHandler } from "react";

export interface SearchFieldProps {
  value?: string;
  placeholder?: string;
  size?: "sm" | "md";
  /** Border + hint colour. */
  status?: "default" | "error" | "success" | "warning";
  disabled?: boolean;
  /** Trailing spinner while results load. */
  loading?: boolean;
  /** Small line under the field, e.g. "No matches for that." */
  hint?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onClear?: () => void;
  style?: CSSProperties;
}
export function SearchField(props: SearchFieldProps): JSX.Element;
```

### SectionHeader

Overline + heading + optional lede and trailing action.

- **Files:** `components/molecules/SectionHeader.jsx` · `.d.ts` · `.prompt.md` · `SectionHeader.card.html`
- **Built from:** — (leaf)

**Usage**

Standard section opener — every page section starts with one.

```jsx
<SectionHeader overline="The Menu" title="Most ordered this week"
  action={<Button variant="ghost" iconAfter="arrow-right">See Full Menu</Button>} />
```

Heading uses the fluid `--fs-h2-fluid` clamp, so it never overflows on mobile. `on="brand"` for flooded-pink sections.

**Props contract**

```ts
import type { CSSProperties, ReactNode } from "react";

export interface SectionHeaderProps {
  /** Uppercase eyebrow. */
  overline?: string;
  title?: ReactNode;
  /** One-sentence lede, max ~20 words. */
  lede?: string;
  /** Trailing element, usually a ghost Button. Ignored when centred. */
  action?: ReactNode;
  align?: "start" | "center";
  on?: "light" | "brand";
  style?: CSSProperties;
}
export function SectionHeader(props: SectionHeaderProps): JSX.Element;
```

### SlotPicker

Pickup / table time slots. Wraps freely; 44px minimum hit height.

- **Files:** `components/molecules/SlotPicker.jsx` · `.d.ts` · `.prompt.md` · `SlotPicker.card.html`
- **Built from:** `usePress`, `mergeHandlers`

**Usage**

Pickup and table-booking time slots.

```jsx
<SlotPicker label="Pickup time" value={slot} onChange={setSlot}
  slots={[{value:"asap",label:"ASAP",note:"12 min"},"7:30pm",{value:"8pm",label:"8:00pm",disabled:true}]} />
```

Auto-fit grid at 96px minimum so it reflows on any width; sold-out slots are struck through, not hidden.

**Props contract**

```ts
import type { CSSProperties } from "react";

export interface Slot { value: string; label: string; note?: string; disabled?: boolean }

export interface SlotPickerProps {
  slots?: (string | Slot)[];
  value?: string;
  label?: string;
  /** Fixed column count; omit for auto-fit at 96px minimum. */
  columns?: number;
  /** true, or the message to show. */
  error?: boolean | string;
  /** Disables the whole group. */
  disabled?: boolean;
  onChange?: (value: string) => void;
  style?: CSSProperties;
}
export function SlotPicker(props: SlotPickerProps): JSX.Element;
```

### Snackbar

Anchored confirmation bar with an optional text action (copy, undo).

- **Files:** `components/molecules/Snackbar.jsx` · `.d.ts` · `.prompt.md` · `Snackbar.card.html`
- **Built from:** `Icon`, `TextButton`, `IconButton`

**Usage**

Anchored confirmation bar for a completed action that may need an escape hatch - copying a code, undoing a removal, retrying a failure.

    <Snackbar open={copied} tone="success" onClose={() => setCopied(false)}>
      Code copied. Paste it at checkout.
    </Snackbar>

    <Snackbar open={removed} action="Undo" onAction={restore} onClose={hide}>
      Chilli Paneer removed.
    </Snackbar>

**Snackbar vs Toast:** Snackbar is a squared bar with a text action and a dismiss, for things the guest may want to reverse or act on. Toast is a pill with no dismiss, for pure confirmations like add-to-cart. Never show both at once.

Positioned `absolute`, so the nearest positioned ancestor anchors it - inside AppShell that is the phone frame, on a web page give the wrapper `position: relative` (or override to `position: fixed`). Auto-hides after 3.2s when onClose is given.

**Props contract**

```ts
import type { CSSProperties, ReactNode } from "react";

export interface SnackbarProps {
  open?: boolean;
  /** One short sentence. */
  children?: ReactNode;
  tone?: "ink" | "brand" | "success" | "danger";
  /** Override the tone's default Lucide glyph. */
  icon?: string;
  /** Uppercase text action, e.g. "UNDO". */
  action?: string;
  onAction?: () => void;
  /** Provide to show the dismiss button and enable auto-hide. */
  onClose?: () => void;
  /** Auto-hide delay in ms; 0 disables. Needs onClose. */
  duration?: number;
  position?: "bottom-center" | "bottom-left" | "bottom-right" | "top-center" | "top-right";
  /** Distance from the anchored edges. */
  inset?: number;
  width?: number;
  style?: CSSProperties;
}
export function Snackbar(props: SnackbarProps): JSX.Element | null;
```

### Stat

Big-number fact. Display weight number, one short line under it.

- **Files:** `components/molecules/Stat.jsx` · `.d.ts` · `.prompt.md` · `Stat.card.html`
- **Built from:** `Icon`

**Usage**

Single big fact — outlet counts, spices ground, years open.

```jsx
<Stat value="18" label="spices ground in-house, daily" />
<Stat value="6" label="outlets" tone="inverse" align="center" />
```

Number is fluid-clamped Poppins 800 so it never overflows a narrow column. Use at most 3–4 in a row and never invent numbers.

**Props contract**

```ts
import type { CSSProperties, ReactNode } from "react";

export interface StatProps {
  value?: ReactNode;
  /** One short line, sentence case, no full stop. */
  label?: string;
  sub?: string;
  icon?: string;
  tone?: "ink" | "brand" | "inverse";
  align?: "start" | "center";
  style?: CSSProperties;
}
export function Stat(props: StatProps): JSX.Element;
```

### StepTracker

Vertical or horizontal progress through named steps. Brand diamond markers.

- **Files:** `components/molecules/StepTracker.jsx` · `.d.ts` · `.prompt.md` · `StepTracker.card.html`
- **Built from:** `Text`, `Icon`

**Usage**

Order tracking and multi-step checkout.

    <StepTracker current={1} steps={[
      {label:"Order in",note:"Kitchen is on it."},
      {label:"On the tandoor",note:"Chilli paneer is charring."},
      {label:"Ready for pickup",note:"Counter 2."}]} />

Vertical markers are brand diamonds with a check when complete; horizontal renders as a segmented bar. Step copy is the brand voice, not system status text.

**Props contract**

```ts
import type { CSSProperties } from "react";

export interface TrackerStep { label: string; note?: string }

export interface StepTrackerProps {
  steps?: (string | TrackerStep)[];
  /** Index of the current step; earlier steps render as complete. */
  current?: number;
  /** vertical = order tracking · horizontal = checkout progress */
  orientation?: "vertical" | "horizontal";
  tone?: "light" | "inverse";
  /** Assets folder holding the symbol files. */
  base?: string;
  style?: CSSProperties;
}
export function StepTracker(props: StepTrackerProps): JSX.Element;
```

### Tabs

Underline tab set for in-page section switching.

- **Files:** `components/molecules/Tabs.jsx` · `.d.ts` · `.prompt.md` · `Tabs.card.html`
- **Built from:** `usePress`, `mergeHandlers`

**Usage**

Underline tabs for switching sections inside one page.

```jsx
<Tabs items={["All Day","Breakfast","Bar"]} value={tab} onChange={setTab} />
```

Poppins 700, 3px pink underline on the active tab. For filtering a list use `Tag` pills instead; for app-level navigation use `TabBar`.

**Props contract**

```ts
import type { CSSProperties } from "react";

export interface TabItem { value: string; label: string }

export interface TabsProps {
  items?: (string | TabItem)[];
  value?: string;
  onChange?: (value: string) => void;
  style?: CSSProperties;
}
export function Tabs(props: TabsProps): JSX.Element;
```

### Toast

Transient confirmation. Uses --ease-pop for add-to-cart moments.

- **Files:** `components/molecules/Toast.jsx` · `.d.ts` · `.prompt.md` · `Toast.card.html`
- **Built from:** `Icon`, `TextButton`

**Usage**

Transient pill confirmation, bottom-centre above the tab bar.

```jsx
<Toast tone="brand" pop action="View Cart" onAction={open}>Added to your order.</Toast>
```

`pop` is the only sanctioned overshoot in the system — reserve it for add-to-cart and reward confirmations. Copy is one short sentence, no exclamation mark. Needs `@keyframes pp-toast-pop` (translateY 12px → 0) in the page.

**Props contract**

```ts
import type { CSSProperties, ReactNode } from "react";

export interface ToastProps {
  children?: ReactNode;
  tone?: "brand" | "ink" | "success" | "danger";
  /** Override the tone's default Lucide glyph. */
  icon?: string;
  /** Uppercase inline action label, e.g. "VIEW CART". */
  action?: string;
  onAction?: () => void;
  /** Play the single-overshoot --ease-pop entrance (add-to-cart only). */
  pop?: boolean;
  actionDisabled?: boolean;
  /** Force the action's visual state — docs only. */
  actionState?: "hover" | "press" | "focus";
  style?: CSSProperties;
}
export function Toast(props: ToastProps): JSX.Element;
```

---

## Organisms

### CartPanel

The order panel: line items, note, totals, sticky pay bar.

- **Files:** `components/organisms/CartPanel.jsx` · `.d.ts` · `.prompt.md` · `CartPanel.card.html`
- **Built from:** `Text`, `Icon`, `Button`, `Card`, `Input`, `DietMark`, `PriceTag`, `QuantityStepper`, `PriceSummary`, `EmptyState`

**Usage**

The cart, whole. Renders its own empty state.

    <CartPanel lines={lines} onQty={setQty} onPlace={pay} onBrowse={goMenu} />

Quantity down to 0 removes the line. Totals go through PriceSummary so money formatting stays correct.

**Props contract**

```ts
import type { CSSProperties } from "react";

export interface CartLine {
  name: string; price: number; qty: number;
  diet?: "veg" | "egg";
  /** Chosen options, e.g. "Sharing - Extra Hot". */
  note?: string;
}

/**
 * The order panel with totals and pay bar.
 */
export interface CartPanelProps {
  lines?: CartLine[];
  title?: string;
  /** Fulfilment line under the title. */
  meta?: string;
  /** Defaults to 0.05 (5% GST). */
  gstRate?: number;
  base?: string;
  onQty?: (name: string, qty: number) => void;
  onPlace?: () => void;
  onBrowse?: () => void;
  style?: CSSProperties;
}
export function CartPanel(props: CartPanelProps): JSX.Element;
```

### CtaBand

Full-width call-to-action band. The page's closing argument.

- **Files:** `components/organisms/CtaBand.jsx` · `.d.ts` · `.prompt.md` · `CtaBand.card.html`
- **Built from:** `PatternField`, `Text`, `Button`

**Usage**

The band that closes a page - franchise, newsletter, app download.

    <CtaBand overline="Franchise" title="Bring Pink Paprikaa to your city"
      body="One kitchen, one playbook." action={<Button size="lg">Apply to Franchise</Button>} />

One per page, never two. Carries the tiled diamond pattern automatically.

**Props contract**

```ts
import type { CSSProperties, ReactNode } from "react";

/**
 * Full-bleed closing CTA band.
 */
export interface CtaBandProps {
  overline?: string;
  title?: string;
  body?: string;
  /** Usually one Button. */
  action?: ReactNode;
  tone?: "ink" | "brand" | "soft";
  /** "split" = copy left, action right · "center" = stacked and centred */
  align?: "split" | "center";
  base?: string;
  style?: CSSProperties;
}
export function CtaBand(props: CtaBandProps): JSX.Element;
```

### Dialog

Centred modal on desktop, bottom sheet on mobile. 24px radius.

- **Files:** `components/organisms/Dialog.jsx` · `.d.ts` · `.prompt.md` · `Dialog.card.html`
- **Built from:** `IconButton`

**Usage**

Modal for a decision that must be made now; `sheet` for the mobile app.

```jsx
<Dialog title="Remove this item?" onClose={close} footer={<><Button variant="ghost">Keep It</Button><Button>Remove</Button></>}>
  Chilli Paneer will come off your order.
</Dialog>
```

24px radius, `--shadow-4`, 56% ink scrim. Positioned `absolute` inside the nearest positioned ancestor so it works inside phone frames — give that ancestor `position:relative`.

**Props contract**

```ts
import type { CSSProperties, ReactNode } from "react";

export interface DialogProps {
  open?: boolean;
  title?: string;
  children?: ReactNode;
  /** Buttons, right-aligned. */
  footer?: ReactNode;
  /** Bottom-sheet presentation with a grab handle — the app default. */
  sheet?: boolean;
  width?: number;
  onClose?: () => void;
  style?: CSSProperties;
}
export function Dialog(props: DialogProps): JSX.Element | null;
```

### FaqSection

FAQ block for the website and franchise pages.

- **Files:** `components/organisms/FaqSection.jsx` · `.d.ts` · `.prompt.md` · `FaqSection.card.html`
- **Built from:** `SectionHeader`, `Accordion`

**Usage**

Two-column FAQ - heading left, accordion right, stacking on mobile.

    <FaqSection items={[{q:"Is everything vegetarian?",a:"Yes - the whole kitchen is."}]} />

The first answer opens by default. Answers are one or two short sentences.

**Props contract**

```ts
import type { CSSProperties } from "react";

export interface FaqItem { q: string; a: string }

export interface FaqSectionProps {
  overline?: string;
  title?: string;
  lede?: string;
  items?: FaqItem[];
  /** Allow several answers open at once. */
  multiple?: boolean;
  style?: CSSProperties;
}
export function FaqSection(props: FaqSectionProps): JSX.Element;
```

### HeroBanner

Page-opening hero. Flooded brand field with an image on the side.

- **Files:** `components/organisms/HeroBanner.jsx` · `.d.ts` · `.prompt.md` · `HeroBanner.card.html`
- **Built from:** `PatternField`, `Text`, `ImageSlot`

**Usage**

The top of any marketing page.

    <HeroBanner overline="India's First Desi Urban Cafe" title="Desi at heart. Urban by nature."
      body="We roast our own masala every morning." meta={["Est. 2025","Sector 57, Gurgaon"]}
      actions={<><Button on="brand" size="lg">Order Now</Button><Button on="brand" variant="secondary" size="lg">See Full Menu</Button></>} />

Headline is fluid display-1 so it never overflows. Buttons inside must carry on="brand" on the pink and ink tones.

**Props contract**

```ts
import type { CSSProperties, ReactNode } from "react";

/**
 * Page-opening hero band.
 */
export interface HeroBannerProps {
  overline?: string;
  title?: ReactNode;
  body?: string;
  /** One or two Buttons. */
  actions?: ReactNode;
  /** Short facts separated by the diamond glyph, e.g. ["Est. 2025","Sector 57, Gurgaon"]. */
  meta?: string[];
  image?: string;
  imageLabel?: string;
  tone?: "brand" | "ink" | "soft";
  /** "split" = copy + image · "center" = stacked, no image */
  layout?: "split" | "center";
  base?: string;
  style?: CSSProperties;
}
export function HeroBanner(props: HeroBannerProps): JSX.Element;
```

### MenuList

Filterable menu. Grid or list presentation.

- **Files:** `components/organisms/MenuList.jsx` · `.d.ts` · `.prompt.md` · `MenuList.card.html`
- **Built from:** `MenuItemRow`, `MenuItemCard`, `FilterBar`, `SectionHeader`, `EmptyState`, `Divider`

**Usage**

The whole menu section, filters included - use this rather than assembling cards by hand.

    <MenuList items={MENU} onAdd={add} action={<Button variant="ghost">See Full Menu</Button>} />

variant="grid" is the website; variant="list" is the app. Category filters derive from each item's cat.

**Props contract**

```ts
import type { CSSProperties, ReactNode } from "react";

export interface MenuListItem {
  name: string; price: number; cat?: string; description?: string;
  diet?: "veg" | "egg"; spice?: 1 | 2 | 3 | 4; badge?: string; was?: number; image?: string;
}

/**
 * The filterable menu section.
 */
export interface MenuListProps {
  items?: MenuListItem[];
  /** Defaults to "All" plus every distinct cat found in items. */
  categories?: string[];
  overline?: string;
  /** Pass null to render the filters with no section header. */
  title?: string | null;
  action?: ReactNode;
  /** "grid" = cards then an overflow list · "list" = rows only (the app pattern) */
  variant?: "grid" | "list";
  /** How many items show as cards before the list takes over. */
  gridCount?: number;
  /** Statement badge in the filter bar. */
  note?: string;
  /** Assets folder holding the brand symbol files. Default "/assets". */
  base?: string;
  onAdd?: (item: MenuListItem) => void;
  onOpen?: (item: MenuListItem) => void;
  style?: CSSProperties;
}
export function MenuList(props: MenuListProps): JSX.Element;
```

### OrderTracker

Live order status screen.

- **Files:** `components/organisms/OrderTracker.jsx` · `.d.ts` · `.prompt.md` · `OrderTracker.card.html`
- **Built from:** `PatternField`, `Text`, `Badge`, `Card`, `Button`, `Divider`, `StepTracker`

**Usage**

The screen a guest watches while the kitchen cooks.

    <OrderTracker current={1} total={1240} code="PPK-4821" onDone={home} />

Step copy is brand voice ("Kitchen's on it."), never system status. The header is a flooded pink PatternField.

**Props contract**

```ts
import type { CSSProperties } from "react";

export interface OrderStep { label: string; note?: string }

/**
 * Live order status after checkout.
 */
export interface OrderTrackerProps {
  steps?: OrderStep[];
  /** Index of the current step. */
  current?: number;
  /** Order code, uppercase, without the hash. */
  code?: string;
  outlet?: string;
  total?: number;
  payment?: string;
  base?: string;
  onDone?: () => void;
  style?: CSSProperties;
}
export function OrderTracker(props: OrderTrackerProps): JSX.Element;
```

### SiteFooter

Flooded-pink site footer with the white lockup.

- **Files:** `components/organisms/SiteFooter.jsx` · `.d.ts` · `.prompt.md` · `SiteFooter.card.html`
- **Built from:** `Logo`, `Link`, `Text`, `Divider`, `IconButton`

**Usage**

The site footer - a flooded pink field, white lockup, three link columns.

    <SiteFooter />

Columns auto-fit and collapse to one on mobile. The FSSAI licence line is legally required on Indian food sites - keep it in the policies list.

All defaults — legal line, FSSAI, contact lines, social icons — come from `brand.js` (`window.PP_BRAND`) when it is loaded. Load it before the bundle and never retype company facts in a page.

**Props contract**

```ts
import type { CSSProperties } from "react";

export interface FooterColumn { heading: string; links: string[] }

/**
 * Flooded-pink site footer.
 */
export interface SiteFooterProps {
  columns?: FooterColumn[];
  blurb?: string;
  /** Lucide brand glyph names. */
  social?: string[];
  legal?: string;
  policies?: string[];
  /** Website, phone, email lines under the blurb. Defaults from brand.js; null hides. */
  contact?: string[] | null;
  base?: string;
  style?: CSSProperties;
}
export function SiteFooter(props: SiteFooterProps): JSX.Element;
```

### SiteHeader

Website masthead. Sticky, goes translucent once scrolled.

- **Files:** `components/organisms/SiteHeader.jsx` · `.d.ts` · `.prompt.md` · `SiteHeader.card.html`
- **Built from:** `Logo`, `Link`, `Button`, `IconButton`

**Usage**

The website masthead - 72px, sticky, translucent after scroll.

    <SiteHeader cart={2} scrolled={y > 24} onOrder={goMenu} onBook={openBooking} />

Links drop off rather than wrapping or clipping as the viewport narrows; "Book a Table" hides under 720px. Never add a third CTA.

**Props contract**

```ts
import type { CSSProperties } from "react";

/**
 * The website masthead.
 */
export interface SiteHeaderProps {
  /** Nav labels. The list shortens automatically below 1280 / 1080 / 860px. */
  links?: string[];
  /** Cart count badge; 0 hides it. */
  cart?: number;
  /** Switches to the translucent blurred treatment. */
  scrolled?: boolean;
  base?: string;
  onOrder?: () => void;
  onBook?: () => void;
  onSearch?: () => void;
  onCart?: () => void;
  style?: CSSProperties;
}
export function SiteHeader(props: SiteHeaderProps): JSX.Element;
```

### StatBand

A row of big numbers. Three or four, never more.

- **Files:** `components/organisms/StatBand.jsx` · `.d.ts` · `.prompt.md` · `StatBand.card.html`
- **Built from:** `Stat`, `PatternField`

**Usage**

A proof band of big numbers between two content sections.

    <StatBand stats={[{value:"18",label:"spices ground daily"},{value:"6",label:"outlets"},{value:"4.6",label:"guest rating"}]} />

Only real, verifiable numbers. Auto-fits to one column on mobile.

**Props contract**

```ts
import type { CSSProperties } from "react";

export interface StatBandItem { value: string; label: string; sub?: string; icon?: string }

export interface StatBandProps {
  /** Three or four items. More than four reads as noise. */
  stats?: StatBandItem[];
  tone?: "soft" | "brand" | "ink";
  base?: string;
  style?: CSSProperties;
}
export function StatBand(props: StatBandProps): JSX.Element;
```

### TabBar

Fixed 64px bottom navigation for the ordering app.

- **Files:** `components/organisms/TabBar.jsx` · `.d.ts` · `.prompt.md` · `TabBar.card.html`
- **Built from:** `Icon`, `usePress`, `mergeHandlers`

**Usage**

The app's fixed bottom navigation — 64px, 4 or 5 destinations, never more.

```jsx
<TabBar value={tab} onChange={setTab} items={[
  { value: "home", label: "Home", icon: "house" },
  { value: "menu", label: "Menu", icon: "utensils" },
  { value: "cart", label: "Cart", icon: "shopping-bag", count: 2 },
  { value: "you", label: "You", icon: "user" },
]} />
```

Active destination is pink with a Poppins 700 label. Counts render as a pink pill on the icon.

**Props contract**

```ts
import type { CSSProperties } from "react";

export interface TabBarItem {
  value: string;
  label: string;
  /** Lucide icon name. */
  icon: string;
  /** Badge count, e.g. cart items. */
  count?: number;
}

export interface TabBarProps {
  items?: TabBarItem[];
  value?: string;
  onChange?: (value: string) => void;
  style?: CSSProperties;
}
export function TabBar(props: TabBarProps): JSX.Element;
```

### TestimonialWall

Grid of guest reviews.

- **Files:** `components/organisms/TestimonialWall.jsx` · `.d.ts` · `.prompt.md` · `TestimonialWall.card.html`
- **Built from:** `ReviewCard`, `SectionHeader`

**Usage**

Social proof section on the marketing site.

    <TestimonialWall reviews={[{name:"Aditi Rao",rating:5,quote:"...",meta:"Sector 57"}]} />

Three or six reviews reads best. Only real guest copy.

**Props contract**

```ts
import type { CSSProperties } from "react";

export interface WallReview { name: string; quote: string; meta?: string; rating?: number; avatar?: string }

export interface TestimonialWallProps {
  overline?: string;
  title?: string;
  reviews?: WallReview[];
  /** Assets folder holding the brand symbol files. Default "/assets". */
  base?: string;
  variant?: "default" | "brand";
  style?: CSSProperties;
}
export function TestimonialWall(props: TestimonialWallProps): JSX.Element;
```

---

## Layouts

### AppShell

Phone frame for app screens: 390x844, status bar, home indicator.

- **Files:** `components/layouts/AppShell.jsx` · `.d.ts` · `.prompt.md` · `AppShell.card.html`
- **Built from:** — (leaf)

**Usage**

Wraps every app screen so sheets and toasts position correctly.

    <AppShell statusTone="light" tabBar={<TabBar ... />} overlay={sheet}>
      <HomeScreen />
    </AppShell>

The frame is position:relative, which is what Dialog and Toast anchor to. Set statusTone="light" whenever the screen opens on a pink header.

**Props contract**

```ts
import type { CSSProperties, ReactNode } from "react";

/**
 * Phone frame for app screens.
 */
export interface AppShellProps {
  /** The scrolling screen body. */
  children?: ReactNode;
  /** A TabBar, pinned above the home indicator. */
  tabBar?: ReactNode;
  /** Sheets and toasts - absolutely positioned inside the frame. */
  overlay?: ReactNode;
  /** Status bar colour: ink on light screens, light on flooded pink. */
  statusTone?: "ink" | "light";
  time?: string;
  width?: number;
  height?: number;
  style?: CSSProperties;
}
export function AppShell(props: AppShellProps): JSX.Element;
```

### AutoGrid

Responsive card grid that collapses columns instead of squashing them.

- **Files:** `components/layouts/AutoGrid.jsx` · `.d.ts` · `.prompt.md` · `AutoGrid.card.html`
- **Built from:** — (leaf)

**Usage**

Every card grid in the system.

    <AutoGrid min={240}>{items.map(i => <MenuItemCard key={i.name} {...i} />)}</AutoGrid>

Tracks are always minmax(0,1fr) so a long label wraps instead of widening the column - the single most common layout bug this prevents.

**Props contract**

```ts
import type { CSSProperties, ReactNode } from "react";

export interface AutoGridProps {
  children?: ReactNode;
  /** Minimum track width in px before a column drops. 240 cards, 320 panels. */
  min?: number;
  /** Fixed column count instead of auto-fit. Always minmax(0,1fr). */
  columns?: number;
  /** Gap override; defaults to --gap-grid. */
  space?: string;
  as?: string;
  style?: CSSProperties;
}
export function AutoGrid(props: AutoGridProps): JSX.Element;
```

### Cluster

Horizontal group that wraps. Buttons, tags, chips, meta rows.

- **Files:** `components/layouts/Cluster.jsx` · `.d.ts` · `.prompt.md` · `Cluster.card.html`
- **Built from:** — (leaf)

**Usage**

Any horizontal run of small things: buttons, tags, badges, meta.

    <Cluster space={3}><Button>Order Now</Button><Button variant="secondary">See Menu</Button></Cluster>

space is the step number, N x 4px. Wraps by default so a row can never clip. Pass scroll for the app category rail.

**Props contract**

```ts
import type { CSSProperties, ReactNode } from "react";

export interface ClusterProps {
  children?: ReactNode;
  /** Spacing step - N means N x 4px (3 = 12px). Any CSS length also works. */
  space?: number | string;
  align?: "start" | "center" | "end" | "baseline";
  justify?: "start" | "center" | "end" | "space-between";
  /** Never wrap (use with care - can overflow). */
  nowrap?: boolean;
  /** Scroll horizontally instead of wrapping - the mobile filter-rail pattern. */
  scroll?: boolean;
  as?: string;
  style?: CSSProperties;
}
export function Cluster(props: ClusterProps): JSX.Element;
```

### Container

Horizontal page frame: max width + fluid gutters.

- **Files:** `components/layouts/Container.jsx` · `.d.ts` · `.prompt.md` · `Container.card.html`
- **Built from:** — (leaf)

**Usage**

The only correct way to constrain page width.

    <Container><Text variant="h2">Our story</Text></Container>

1200px max with clamp(20px,4vw,40px) gutters. Use size="prose" for long-form copy so the measure stays readable.

**Props contract**

```ts
import type { CSSProperties, ReactNode } from "react";

export interface ContainerProps {
  children?: ReactNode;
  /** default 1200 - wide 1440 - prose 64ch - full 100% - or any CSS length. */
  size?: "default" | "wide" | "prose" | "full" | string;
  as?: string;
  /** Drop the gutters (for a child that must run edge to edge). */
  bleed?: boolean;
  style?: CSSProperties;
}
export function Container(props: ContainerProps): JSX.Element;
```

### PostFrame

- **Files:** `components/layouts/PostFrame.jsx` · `.d.ts` · `.prompt.md` · `PostFrame.card.html`
- **Built from:** — (leaf)

**Usage**

Every Instagram post, story, banner or OG image starts here — it fixes the exact pixel canvas so nothing is designed at an invented size.

```jsx
<PostFrame format="post" fit background="var(--pink-500)">
  <SocialHeadline size="hero" on="brand">Chai first, decisions later.</SocialHeadline>
</PostFrame>
```

Children are authored at **true canvas pixels** (use the `--fs-canvas-*` scale, not screen type sizes); the frame scales the whole thing down for preview. `safeArea` draws the story chrome guides. Never design a marketing asset outside the seven listed formats.

**Props contract**

```ts
import type { CSSProperties, ReactNode } from "react";

/** Fixed-pixel marketing artboard (Instagram, story, banner) that scales to fit. */
export interface PostFrameProps {
  /** post 1080² · portrait 1080×1350 · story 1080×1920 · landscape 1200×628 · wide 1920×1080 · mpu 300×250 · leaderboard 728×90 */
  format?: "post" | "portrait" | "story" | "landscape" | "wide" | "mpu" | "leaderboard";
  /** Explicit display scale, e.g. 0.32. Omit and pass fit to auto-scale to the parent width. */
  scale?: number;
  /** Auto-scale to the parent's width (never above 1). */
  fit?: boolean;
  background?: string;
  /** Canvas padding; defaults to --canvas-pad on 1080-wide formats. */
  padding?: number | string;
  /** Show the story chrome safe-area guides (story format only). */
  safeArea?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
}
export function PostFrame(props: PostFrameProps): JSX.Element;
export const POST_FORMATS: Record<string, { w: number; h: number; label: string }>;
```

### Section

Vertical page rhythm. Wraps content in a Container by default.

- **Files:** `components/layouts/Section.jsx` · `.d.ts` · `.prompt.md` · `Section.card.html`
- **Built from:** `Container`

**Usage**

One page band. Owns the background colour and the vertical rhythm.

    <Section tone="alt"><SectionHeader overline="Our Story" title="..." /></Section>

Maximum two background colours per page - white/alt plus one flooded brand or ink band.

**Props contract**

```ts
import type { CSSProperties, ReactNode } from "react";

export interface SectionProps {
  children?: ReactNode;
  /** page - alt (pink-50) - sunken - brand (flooded pink) - ink - or any CSS colour. */
  tone?: "page" | "alt" | "sunken" | "brand" | "ink" | string;
  /** Container size passed through. */
  size?: "default" | "wide" | "prose" | "full";
  /** Vertical rhythm: none - tight - default - loose. */
  space?: "none" | "tight" | "default" | "loose";
  /** Skip the Container (the child handles its own width). */
  bare?: boolean;
  as?: string;
  style?: CSSProperties;
}
export function Section(props: SectionProps): JSX.Element;
```

### Stack

Vertical rhythm primitive. Gap-based, never margins.

- **Files:** `components/layouts/Stack.jsx` · `.d.ts` · `.prompt.md` · `Stack.card.html`
- **Built from:** — (leaf)

**Usage**

Vertical spacing. Use this instead of margins so direct-manipulation edits survive.

    <Stack space={6}><Text variant="h3">Small Plates</Text><MenuItemRow ... /></Stack>

space is the step number and the step IS the multiple of 4px - space={6} is 24px. divide adds the hairline rules used between menu rows and list items.

**Props contract**

```ts
import type { CSSProperties, ReactNode } from "react";

export interface StackProps {
  children?: ReactNode;
  /** Spacing step - N means N x 4px (6 = 24px). Half steps 0.5 and 1.5 exist. Any CSS length also works. */
  space?: number | string;
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "space-between";
  /** Insert hairline rules between children. */
  divide?: boolean;
  as?: string;
  style?: CSSProperties;
}
export function Stack(props: StackProps): JSX.Element;
```
