# Design System — Shared Component Contracts (binding for plans 2–5)

**Purpose:** plans 2a–5 are written in parallel. This file fixes every name, path, prop and type
that crosses a plan boundary, so the plans cannot drift. A plan **implements exactly** the
contracts of the components it owns and **consumes exactly** the contracts of the rest. If a plan
author finds a contract wrong (it contradicts the component's design-system `.d.ts`/`.jsx`/
`.card.html`), they record the deviation in their plan's "Contract deviations" section with the
reason — never silently.

**Read with:** spec `docs/superpowers/specs/2026-09-27-design-system-rewrite-design.md` (§8 rules,
§9 inventory) and Plan 1 `docs/superpowers/plans/2026-09-27-ds-01-foundation.md` (tokens,
utilities, `componentVariants`, Icon, Logo, test helpers, conventions).

## 0. Conventions every contract assumes

- Every `…Props` interface **extends the native props of its root element** (`ComponentProps<"el">`,
  with `Omit` of conflicting keys) unless stated. `className` merges via `componentVariants`.
  `ref` is a normal prop (React 19). Spread `...props` onto the root last.
- Enum props are string unions; defaults are listed as `= value`.
- `asChild?: boolean` = Radix Slot: `import { Slot } from "radix-ui"` → render `<Slot.Root>` (verify
  the export shape in `packages/ui/node_modules/radix-ui` before use).
- "C" = client component (`"use client"` at the top of that file only). Everything else must stay
  server-safe (no hooks except `useId`, no handlers created inside, no browser APIs).
- Event naming: native-backed controls keep **native** events (`onChange`, `onBlur`, `checked`,
  `value`) so `react-hook-form`'s `register()` works; value-based controls use
  `value` / `defaultValue` / `onValueChange` (+ `name`, `onBlur`) for RHF `<Controller>`.
- Paths are under `packages/ui/src/`. Export everything listed here from `src/index.ts` by name
  (component + its `Props` type + any exported helper).

## 1. Shared library types (created once, used everywhere)

| File (owner plan)                           | Exports                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lib/component-variants.ts` (Plan 1)        | `componentVariants`, `type VariantProps`, `twMergeConfig`                                                                                                                                                                                                                                                                                            |
| `atoms/icon/icon.tsx` (Plan 1)              | `Icon`, `type IconComponent`, `type IconProps`                                                                                                                                                                                                                                                                                                       |
| `atoms/logo/logo.tsx` (Plan 1)              | `Logo`, `type LogoProps`                                                                                                                                                                                                                                                                                                                             |
| `lib/brand-artwork.ts` (Plan 1)             | `ARTWORK`, `type Mark`, `type Artwork`, `SYMBOL_DATA_URI_WHITE`                                                                                                                                                                                                                                                                                      |
| `lib/reveal-observer.tsx` (Plan 1)          | `RevealObserver`                                                                                                                                                                                                                                                                                                                                     |
| `lib/heading.ts` (**Plan 2a, task 1**)      | `type HeadingLevel = 1 \| 2 \| 3 \| 4 \| 5 \| 6`; `function headingTag(level: HeadingLevel): "h1" \| "h2" \| "h3" \| "h4" \| "h5" \| "h6"`                                                                                                                                                                                                           |
| `lib/link-as.ts` (**Plan 2a, task 1**)      | `interface LinkAsProps { href: string; className?: string; children?: ReactNode; "aria-current"?: "page" \| "step" \| "true"; onClick?: MouseEventHandler<HTMLAnchorElement> }`; `type LinkAs = ElementType<LinkAsProps>` — organisms/molecules that render **lists of links** take `linkAs?: LinkAs` (default `"a"`) so an app can pass `next/link` |
| `lib/field-status.ts` (**Plan 2b, task 1**) | `type FieldStatus = "default" \| "error" \| "success" \| "warning"`; `const FIELD_STATUS_ICON: Record<Exclude<FieldStatus,"default">, IconComponent>` (error/warning → `AlertTriangle` or `CircleAlert`, success → `CircleCheck` — match `Field.jsx`)                                                                                                |
| `lib/space.ts` (**Plan 2c, task 1**)        | `type SpaceStep = 0 \| 0.5 \| 1 \| 1.5 \| 2 \| 3 \| 4 \| 5 \| 6 \| 7 \| 8 \| 9 \| 10 \| 11 \| 12 \| 14 \| 16 \| 18 \| 20 \| 24 \| 32`; `const GAP_CLASS: Record<SpaceStep, string>` (full literal class strings `"gap-6"` etc., so Tailwind scans them)                                                                                              |
| `atoms/tag/tag.tsx` (Plan 2a)               | also exports `tagVariants` (the Tag's `componentVariants` instance) — reused by ChipGroup and FilterBar, which render Radix ToggleGroup items with Tag styling                                                                                                                                                                                       |
| `atoms/button/button.tsx` (Plan 2a)         | also exports `buttonVariants` — reused where a Radix trigger must look like a Button                                                                                                                                                                                                                                                                 |

## 2. Atoms — Plan 2a (`atoms/<name>/<name>.tsx`)

```ts
// text
type TextVariant =
  | "display-1"
  | "display-2"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "body-lg"
  | "body"
  | "body-sm"
  | "caption"
  | "overline"
  | "mono";
type TextTone =
  "heading" | "body" | "muted" | "subtle" | "brand" | "on-brand" | "inverse" | "danger";
interface TextProps extends ComponentProps<"p"> {
  variant?: TextVariant; // = "body"
  tone?: TextTone; // = "heading" for display-*/h*, "body" otherwise
  as?:
    | "p"
    | "span"
    | "div"
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "label"
    | "strong"
    | "em"
    | "small"
    | "li"
    | "dt"
    | "dd"
    | "figcaption"
    | "blockquote"
    | "time";
  weight?: "regular" | "medium" | "semibold" | "bold" | "black";
  align?: "start" | "center" | "end";
  isFluid?: boolean; // use the -fluid token of the step (display/h*/body)
  lineClamp?: 1 | 2 | 3 | 4 | 5 | 6;
  measure?: "prose" | "narrow";
  isBalanced?: boolean;
}
// link (Slot)
interface LinkProps extends ComponentProps<"a"> {
  variant?: "default" | "subtle" | "inverse" | "quiet";
  size?: "sm" | "md" | "lg";
  icon?: IconComponent;
  iconAfter?: IconComponent;
  isExternal?: boolean;
  asChild?: boolean;
}
// pattern-field (sets data-surface = tone)
interface PatternFieldProps extends ComponentProps<"div"> {
  tone?: "brand" | "ink" | "soft" | "light";
  tile?: 56 | 64 | 72 | 80 | 86 | 96 /* = 64 */;
  density?: "default" | "faint";
  radius?: "none" | "md" | "lg" | "xl";
  asChild?: boolean;
}
// social-headline
interface SocialHeadlineProps extends ComponentProps<"h2"> {
  size?: "hero" | "h1" | "h2" | "body" | "caption" | "overline";
  align?: "start" | "center" | "end";
  measure?: "tight" | "default" | "wide";
  as?: "h1" | "h2" | "h3" | "p" | "span";
}
// button (Slot) — also exports buttonVariants
interface ButtonProps extends ComponentProps<"button"> {
  variant?: "primary" | "secondary" | "ghost" | "inverse";
  size?: "sm" | "md" | "lg";
  icon?: IconComponent;
  iconAfter?: IconComponent;
  isFullWidth?: boolean;
  isLoading?: boolean;
  asChild?: boolean;
} // type = "button" by default
// icon-button (Slot)
interface IconButtonProps extends Omit<ComponentProps<"button">, "children" | "aria-label"> {
  icon: IconComponent;
  label: string;
  variant?: "primary" | "secondary" | "ghost" | "glass";
  size?: "sm" | "md" | "lg";
  count?: number;
  asChild?: boolean;
}
// tag — interactive <button type="button" aria-pressed> when onClick is given, else <span>; also exports tagVariants
interface TagProps extends ComponentProps<"button"> {
  isSelected?: boolean;
  icon?: IconComponent;
  tone?: "default" | "success" | "brand";
}
// card (Slot) — sets data-surface: default/quiet→light, feature→soft, brand→brand, ink→ink
interface CardProps extends ComponentProps<"div"> {
  variant?: "default" | "feature" | "brand" | "ink" | "quiet";
  padding?: "none" | "sm" | "md" | "lg" /* = "md" */;
  isInteractive?: boolean;
  asChild?: boolean;
}
// divider — role="separator"
interface DividerProps extends ComponentProps<"div"> {
  variant?: "line" | "diamond";
  label?: string;
  orientation?: "horizontal" | "vertical";
}
// image-slot — discriminated: a real image, or a labelled placeholder
interface ImageSlotBase {
  ratio?: "square" | "4:3" | "3:4" | "4:5" | "16:9" | "16:10" | "wide";
  radius?: "none" | "md" | "lg" | "xl";
  tone?: "soft" | "strong" | "ink";
  isFill?: boolean;
  className?: string;
  children?: ReactNode; /* a <picture> from the image pipeline */
}
type ImageSlotProps = ImageSlotBase &
  (
    | {
        src: string;
        alt: string;
        width: number;
        height: number;
        sizes?: string;
        srcSet?: string;
        loading?: "lazy" | "eager";
        fetchPriority?: "high" | "low" | "auto";
        label?: never;
      }
    | { src?: undefined; label: string }
  );
// badge
interface BadgeProps extends ComponentProps<"span"> {
  tone?: "brand" | "soft" | "ink" | "success" | "warning" | "danger" | "neutral" /* = "soft" */;
  icon?: IconComponent;
}
// status-dot
interface StatusDotProps extends ComponentProps<"span"> {
  tone?: "open" | "busy" | "closed" | "live" | "danger";
  label?: string;
  isPulsing?: boolean;
  size?: "sm" | "md";
}
// avatar
interface AvatarProps extends ComponentProps<"span"> {
  name?: string;
  src?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  icon?: IconComponent;
  hasRing?: boolean;
}
```

## 3. Atoms — Plan 2b

```ts
// input — single line, or a textarea when isMultiline
type InputProps = {
  size?: "sm" | "md" | "lg";
  status?: FieldStatus;
  icon?: IconComponent;
  suffix?: string;
  trailing?: ReactNode;
  isLoading?: boolean;
} & (
  | ({ isMultiline?: false } & Omit<ComponentProps<"input">, "size">)
  | ({ isMultiline: true; rows?: number } & ComponentProps<"textarea">)
); // readOnly → sunken fill + lock glyph; aria-invalid when status="error"
// select — native
interface SelectOption {
  value: string;
  label: string;
  isDisabled?: boolean;
}
interface SelectProps extends Omit<ComponentProps<"select">, "size" | "children"> {
  options: SelectOption[];
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  status?: FieldStatus;
  icon?: IconComponent;
}
// checkbox / radio / switch — native input inside a <label>
interface CheckboxProps extends Omit<ComponentProps<"input">, "type" | "size"> {
  label: ReactNode;
  description?: ReactNode;
  price?: number /* renders +₹60 */;
  isInvalid?: boolean;
}
interface RadioProps extends Omit<ComponentProps<"input">, "type" | "size"> {
  label: ReactNode;
  description?: ReactNode;
  price?: number /* renders ₹60 */;
  isInvalid?: boolean;
}
interface RadioGroupProps extends ComponentProps<"fieldset"> {
  legend: ReactNode;
  isLegendHidden?: boolean;
  orientation?: "vertical" | "horizontal";
  status?: FieldStatus;
} // same file as Radio
interface SwitchProps extends Omit<ComponentProps<"input">, "type" | "size"> {
  label: ReactNode;
  description?: ReactNode;
}
// slider — native range (handoff)
interface SliderProps extends Omit<ComponentProps<"input">, "type"> {
  label: string; /* aria-label */
}
// rating — role="img"
interface RatingProps extends ComponentProps<"span"> {
  value: number;
  max?: number /* = 5 */;
  count?: number;
  size?: "sm" | "md" | "lg";
  variant?: "diamond" | "symbol";
  hasValue?: boolean; /* = true */
}
// progress-bar — role="progressbar"
interface ProgressBarProps extends ComponentProps<"div"> {
  value: number;
  max?: number;
  segments?: number;
  label: string;
  tone?: "brand" | "mint" | "inverse";
  size?: "sm" | "md";
}
// spinner — role="status"
interface SpinnerProps extends ComponentProps<"span"> {
  size?: "sm" | "md" | "lg";
  tone?: "brand" | "ink" | "inverse";
  label?: string; /* = "Loading" */
}
// skeleton
interface SkeletonProps extends ComponentProps<"div"> {
  variant?: "text" | "block" | "circle";
  lines?: 1 | 2 | 3 | 4 | 5 | 6;
}
// tooltip — C (Radix Tooltip, provider included)
interface TooltipProps {
  label: string;
  side?: "top" | "bottom" | "left" | "right";
  children: ReactElement;
}
// diet-mark — veg only (the kitchen is egg-free)
interface DietMarkProps extends ComponentProps<"span"> {
  size?: "sm" | "md" | "lg";
  label?: string; /* = "Vegetarian" */
}
// spice-level — role="img"
interface SpiceLevelProps extends ComponentProps<"span"> {
  level: 1 | 2 | 3 | 4;
  max?: 4;
  hasLabel?: boolean;
  size?: "sm" | "md" | "lg";
}
// price-tag — uses formatRupees / formatRupeeRange from @pink-paprikaa-web/utils
interface PriceTagProps extends ComponentProps<"span"> {
  amount: number;
  was?: number;
  to?: number;
  size?: "sm" | "md" | "lg";
  tone?: "ink" | "brand" | "inverse";
}
// countdown — C (handoff). Renders <time dateTime={endsAt}> "Nd HHh MMm SSs"; stable SSR placeholder; renders `fallback` after expiry
interface CountdownProps extends Omit<ComponentProps<"time">, "children" | "dateTime"> {
  endsAt: string /* ISO with offset */;
  fallback?: ReactNode /* = null */;
  label?: string; /* accessible prefix */
}
```

## 4. Layouts — Plan 2c (`layouts/<name>/<name>.tsx`)

```ts
type ContainerSize = "content" | "wide" | "narrow" | "article" | "prose" | "full";
interface ContainerProps extends ComponentProps<"div"> {
  size?: ContainerSize /* = "content" */;
  isBleed?: boolean;
  as?: "div" | "main" | "section" | "article" | "header" | "footer" | "nav";
}
interface SectionProps extends ComponentProps<"section"> {
  tone?: "page" | "alt" | "sunken" | "soft" | "brand" | "ink" /* sets data-surface */;
  pattern?: "none" | "default" | "faint";
  size?: ContainerSize;
  space?: "none" | "tight" | "default" | "loose";
  isBare?: boolean;
  as?: "section" | "div" | "header" | "footer" | "aside";
}
interface StackProps extends ComponentProps<"div"> {
  space?: SpaceStep /* = 4 */;
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between";
  isDivided?: boolean;
  as?: "div" | "ul" | "ol" | "section" | "article";
}
interface ClusterProps extends ComponentProps<"div"> {
  space?: SpaceStep /* = 3 */;
  align?: "start" | "center" | "end" | "baseline";
  justify?: "start" | "center" | "end" | "between";
  isNowrap?: boolean;
  isScrollable?: boolean;
  as?: "div" | "ul" | "ol" | "nav";
}
type AutoGridMin = "xs" | "sm" | "md" | "lg" | "xl" | "2xl"; // 140 / 200 / 260 / 320 / 380 / 420 px component tokens
interface AutoGridProps extends ComponentProps<"div"> {
  min?: AutoGridMin /* = "md" */;
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  as?: "div" | "ul" | "ol" | "section";
}
interface AppShellProps extends ComponentProps<"div"> {
  statusTone?: "ink" | "light";
  time?: string /* = "9:41" */;
  tabBar?: ReactNode;
  overlay?: ReactNode;
  size?: "phone" | "phone-sm";
}
type PostFormat = "post" | "portrait" | "story" | "landscape" | "wide" | "mpu" | "leaderboard";
const POST_FORMATS: Readonly<Record<PostFormat, { width: number; height: number; label: string }>>;
interface PostFrameProps extends ComponentProps<"div"> {
  format: PostFormat;
  scale?: number;
  isFit?: boolean /* C leaf: ResizeObserver */;
  tone?: "brand" | "ink" | "soft" | "light";
  padding?: "none" | "default" | "tight";
  hasSafeArea?: boolean;
}
```

## 5. Molecules — Plan 3a (`molecules/<name>/<name>.tsx`)

```ts
// field — render prop wiring, RSC-safe
interface FieldControlProps {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
  required?: true;
}
interface FieldProps extends Omit<ComponentProps<"div">, "children"> {
  label: ReactNode;
  hint?: ReactNode;
  status?: FieldStatus;
  message?: ReactNode;
  isRequired?: boolean;
  isOptional?: boolean;
  orientation?: "stack" | "side";
  id?: string;
  children: (control: FieldControlProps) => ReactNode;
}
// search-field — C
interface SearchFieldProps extends Omit<
  ComponentProps<"input">,
  "size" | "type" | "value" | "defaultValue" | "onChange"
> {
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onClear?: () => void;
  size?: "sm" | "md";
  status?: FieldStatus;
  isLoading?: boolean;
  hint?: ReactNode;
}
// quantity-stepper — C
interface QuantityStepperProps {
  label: string;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  onBlur?: () => void;
  min?: number /* = 0 */;
  max?: number;
  step?: number /* = 1 */;
  size?: "sm" | "md";
  name?: string;
  disabled?: boolean;
  className?: string;
}
// otp-input — C
interface OtpInputProps {
  label: string;
  length?: 4 | 6;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  status?: FieldStatus;
  message?: ReactNode;
  disabled?: boolean;
  name?: string;
  className?: string;
}
// slot-picker — native radios
interface SlotOption {
  value: string;
  label: string;
  note?: string;
  isDisabled?: boolean;
}
interface SlotPickerProps extends Omit<ComponentProps<"fieldset">, "onChange"> {
  name: string;
  legend: ReactNode;
  slots: SlotOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  columns?: 2 | 3 | 4 | 5 | 6;
  status?: FieldStatus;
  disabled?: boolean;
}
// alert — dismiss button is a client leaf when onDismiss is given
interface AlertProps extends ComponentProps<"div"> {
  tone?: "info" | "success" | "warning" | "danger" | "brand" | "neutral";
  title?: ReactNode;
  action?: ReactNode;
  onDismiss?: () => void;
  icon?: IconComponent;
}
// toast / snackbar — C, Radix Toast
interface ToastProviderProps {
  children: ReactNode;
  duration?: number;
  label?: string;
} // renders Provider + Viewport
interface ToastProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  tone?: "brand" | "ink" | "success" | "danger";
  icon?: IconComponent;
  action?: { label: string; altText: string; onClick: () => void };
  isPop?: boolean;
  duration?: number;
  children: ReactNode;
}
interface SnackbarProps extends Omit<ToastProps, "isPop"> {
  position?: "bottom-center" | "bottom-left" | "bottom-right" | "top-center" | "top-right";
}
// empty-state
interface EmptyStateProps extends ComponentProps<"div"> {
  title: ReactNode;
  body?: ReactNode;
  icon?: IconComponent;
  variant?: "icon" | "symbol";
  action?: ReactNode;
  size?: "md" | "lg";
  headingLevel?: HeadingLevel;
}
// tabs — C, Radix Tabs
interface TabItem {
  value: string;
  label: ReactNode;
  content: ReactNode;
}
interface TabsProps {
  label: string;
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  variant?: "underline" | "segmented";
  className?: string;
}
// breadcrumb
interface BreadcrumbItem {
  label: string;
  href?: string;
}
interface BreadcrumbProps extends ComponentProps<"nav"> {
  items: BreadcrumbItem[];
  tone?: "light" | "inverse";
  linkAs?: LinkAs;
}
// pagination — links, not callbacks
interface PaginationProps extends ComponentProps<"nav"> {
  page: number;
  pages: number;
  getPageHref: (page: number) => string;
  linkAs?: LinkAs;
  label?: string; /* = "Pagination" */
}
// section-header
interface SectionHeaderProps extends Omit<ComponentProps<"div">, "title"> {
  overline?: ReactNode;
  title: ReactNode;
  headingLevel?: HeadingLevel /* = 2 */;
  lede?: ReactNode;
  action?: ReactNode;
  align?: "start" | "center";
}
// stat
interface StatProps extends ComponentProps<"div"> {
  value: ReactNode;
  label: ReactNode;
  sub?: ReactNode;
  icon?: IconComponent;
  tone?: "ink" | "brand" | "inverse";
  align?: "start" | "center";
}
// accordion — native <details name>, server-safe
interface AccordionItem {
  value: string;
  question: ReactNode;
  answer: ReactNode;
}
interface AccordionProps extends ComponentProps<"div"> {
  items: AccordionItem[];
  isMultiple?: boolean;
  defaultOpen?: string[] /* = [items[0].value] */;
  name?: string;
}
// list-row (Slot)
interface ListRowProps extends Omit<ComponentProps<"div">, "title"> {
  title: ReactNode;
  description?: ReactNode;
  leading?: ReactNode;
  icon?: IconComponent;
  value?: ReactNode;
  trailing?: ReactNode;
  hasChevron?: boolean;
  hasDivider?: boolean;
  isDanger?: boolean;
  asChild?: boolean;
}
// price-summary — <dl>, money lines
interface PriceLine {
  label: ReactNode;
  amount: number;
  isDiscount?: boolean;
  isStrong?: boolean;
}
interface PriceSummaryProps extends ComponentProps<"div"> {
  lines: PriceLine[];
  total: number;
  totalLabel?: string /* = "Total" */;
  note?: ReactNode;
  tone?: "light" | "inverse";
}
// step-tracker — <ol>, aria-current="step"
interface TrackerStep {
  label: string;
  note?: string;
}
interface StepTrackerProps extends ComponentProps<"ol"> {
  steps: TrackerStep[];
  current: number;
  orientation?: "vertical" | "horizontal";
  tone?: "light" | "inverse";
}
```

## 6. Molecules — Plan 3b

```ts
// menu-item-row / menu-item-card — every dish is veg: the DietMark always shows, no diet prop
interface MenuItemImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}
interface MenuItemRowProps extends ComponentProps<"article"> {
  name: string;
  nameDevanagari?: string;
  description?: string;
  price: number;
  was?: number;
  spice?: 1 | 2 | 3 | 4;
  badge?: string;
  image?: MenuItemImage;
  imageLabel?: string;
  action?: ReactNode;
  hasDivider?: boolean;
  headingLevel?: HeadingLevel; /* = 3 */
}
interface MenuItemCardProps extends ComponentProps<"article"> {
  name: string;
  description?: string;
  price: number;
  was?: number;
  spice?: 1 | 2 | 3 | 4;
  badge?: string;
  image?: MenuItemImage;
  imageLabel?: string;
  action?: ReactNode;
  href?: string;
  linkAs?: LinkAs;
  headingLevel?: HeadingLevel;
}
interface OutletCardProps extends ComponentProps<"article"> {
  name: string;
  city?: string;
  address?: string;
  hours?: string;
  status?: "open" | "busy" | "closed";
  statusLabel?: string;
  image?: MenuItemImage;
  imageLabel?: string;
  hasImage?: boolean /* = true */;
  action?: ReactNode;
  headingLevel?: HeadingLevel;
}
interface ReviewCardProps extends ComponentProps<"figure"> {
  name: string;
  meta?: string;
  quote: string;
  rating?: number;
  avatar?: string;
  variant?: "default" | "brand";
  mark?: "diamond" | "symbol";
  isVerified?: boolean;
  source?: { label: string; href: string };
}
interface LoyaltyCardProps extends ComponentProps<"div"> {
  visits: number;
  goal: number;
  reward: string;
  variant?: "feature" | "brand";
}
// filter-bar — C, Radix ToggleGroup (single) styled with tagVariants
interface FilterOption {
  value: string;
  label: string;
  icon?: IconComponent;
}
interface FilterBarProps {
  label: string;
  options: FilterOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  isWrapping?: boolean;
  note?: ReactNode;
  trailing?: ReactNode;
  className?: string;
}
interface LogoLockupProps extends ComponentProps<"div"> {
  tone?: "pink" | "white" | "badge";
  size?: "sm" | "md" | "lg" | "xl";
  hasTagline?: boolean /* = true */;
  align?: "start" | "center";
}
interface OfferSealProps extends ComponentProps<"div"> {
  value: string;
  label?: string;
  note?: string;
  size?: "sm" | "md" | "lg" | "xl" /* xl = 156px handoff hero */;
  tone?: "light" | "brand" | "turmeric";
  corner?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  bleed?: "none" | "sm" | "md"; /* clamped ≤ 0.18 × size */
}
interface CouponTicketProps extends ComponentProps<"div"> {
  code: string;
  headline: string;
  terms: string;
  tone?: "brand" | "light";
  size?: "md" | "lg";
  notch?: "page" | "tint" | "sunken";
  isCopyable?: boolean;
  onCopy?: (code: string) => void;
}
// handoff-derived
interface ChoiceOption {
  value: string;
  title: ReactNode;
  price?: ReactNode;
  was?: ReactNode;
  description?: ReactNode;
  badge?: ReactNode;
  meta?: ReactNode;
  isDisabled?: boolean;
}
interface ChoiceCardGroupProps extends Omit<
  ComponentProps<"fieldset">,
  "onChange" | "defaultValue"
> {
  name: string;
  legend: ReactNode;
  isLegendHidden?: boolean;
  options: ChoiceOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  min?: AutoGridMin;
  tone?: "light" | "on-brand";
} // native radios; RHF-compatible via name + onChange passthrough
interface CheckCardProps extends Omit<ComponentProps<"input">, "type" | "size" | "title"> {
  title: ReactNode;
  description?: ReactNode;
}
type ChipGroupProps = {
  label: string;
  options: { value: string; label: ReactNode; icon?: IconComponent; isDisabled?: boolean }[];
  variant?: "chips" | "segmented";
  className?: string;
  name?: string;
  disabled?: boolean;
} & (
  | {
      type: "single";
      value?: string;
      defaultValue?: string;
      onValueChange?: (value: string) => void;
    }
  | {
      type: "multiple";
      value?: string[];
      defaultValue?: string[];
      onValueChange?: (value: string[]) => void;
      maxSelected?: number;
    }
); // C, Radix ToggleGroup
interface KeyValueItem {
  key: ReactNode;
  value: ReactNode;
  isEmphasised?: boolean;
}
interface KeyValueListProps extends ComponentProps<"dl"> {
  items: KeyValueItem[];
  density?: "compact" | "default";
  keyWidth?: "sm" | "md";
  hasDividers?: boolean; /* = true */
}
interface StepsItem {
  title: ReactNode;
  description?: ReactNode;
}
interface StepsProps extends ComponentProps<"ol"> {
  items: StepsItem[];
  variant?: "circle" | "rule";
  headingLevel?: HeadingLevel; /* = 3 */
}
interface FeatureItemProps extends Omit<ComponentProps<"div">, "title"> {
  icon: IconComponent;
  title: ReactNode;
  description?: ReactNode;
  size?: "sm" | "md";
  headingLevel?: HeadingLevel; /* = 3 */
}
interface PricingCardProps extends Omit<ComponentProps<"article">, "title"> {
  name: ReactNode;
  tag?: ReactNode;
  price: number;
  unit: string;
  was?: number;
  blurb?: ReactNode;
  points?: ReactNode[];
  footnote?: ReactNode;
  action?: ReactNode;
  media?: ReactNode;
  variant?: "default" | "featured" | "flooded";
  headingLevel?: HeadingLevel; /* = 3 */
}
interface LinkCardProps extends Omit<ComponentProps<"a">, "title"> {
  title: ReactNode;
  description?: ReactNode;
  cta?: string;
  media?: ReactNode;
  layout?: "row" | "stack";
  tone?: "default" | "brand" | "ink" | "soft";
  asChild?: boolean;
  headingLevel?: HeadingLevel;
}
interface StickyActionBarProps extends ComponentProps<"div"> {
  amount: ReactNode;
  caption?: ReactNode;
  action: ReactNode;
  hideFrom?: "lg" | "never"; /* = "lg" */
}
interface AnnouncementBarProps extends Omit<ComponentProps<"div">, "children"> {
  children: ReactNode;
  href?: string;
  endsAt?: string;
  countdownLabel?: string;
  linkAs?: LinkAs;
} // C (expiry): renders nothing once endsAt has passed
// table — compound, semantic
interface TableProps extends ComponentProps<"table"> {
  caption: ReactNode;
  isCaptionVisible?: boolean;
  minWidth?: "none" | "sm" | "md" | "lg" /* 460 / 620 / 720 px tokens */;
  highlightColumn?: number;
}
// + TableHead (thead), TableBody (tbody), TableRow (tr), TableHeaderCell (th, scope = "col"), TableCell (td) — each extends its native element props
```

## 7. Organisms — Plan 4 (`organisms/<name>/<name>.tsx`)

```ts
interface NavLink {
  label: string;
  href: string;
  isActive?: boolean;
}
interface SiteHeaderProps extends ComponentProps<"header"> {
  homeHref: string;
  links: NavLink[];
  logo?: ReactNode /* = <Logo/> */;
  actions?: ReactNode;
  drawerActions?: ReactNode;
  announcement?: ReactNode;
  badge?: ReactNode;
  size?: "default" | "compact";
  skipLinkHref?: string /* = "#main" */;
  linkAs?: LinkAs;
  menuLabel?: string; /* = "Menu" */
} // drawer + glass-on-scroll are C leaves
interface FooterItem {
  label: ReactNode;
  href?: string;
  icon?: IconComponent;
}
interface FooterColumn {
  heading: string;
  items: FooterItem[];
}
interface SiteFooterProps extends ComponentProps<"footer"> {
  tone?: "brand" | "ink";
  brand?: ReactNode;
  columns: FooterColumn[];
  social?: { network: "instagram" | "youtube" | "linkedin"; href: string; label: string }[];
  legal?: ReactNode;
  policies?: { label: string; href: string }[];
  linkAs?: LinkAs;
}
interface HeroBannerProps extends Omit<ComponentProps<"section">, "title"> {
  overline?: ReactNode;
  badges?: ReactNode;
  title: ReactNode;
  headingLevel?: HeadingLevel /* = 1 */;
  body?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode[];
  media?: ReactNode;
  tone?: "brand" | "ink" | "soft" | "alt";
  layout?: "split" | "center";
}
interface MenuListItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  spice?: 1 | 2 | 3 | 4;
  badge?: string;
  was?: number;
  image?: MenuItemImage;
}
interface MenuListProps extends ComponentProps<"section"> {
  items: MenuListItem[];
  categories?: string[];
  overline?: ReactNode;
  title?: ReactNode | null;
  action?: ReactNode;
  variant?: "grid" | "list";
  gridCount?: number;
  note?: ReactNode;
  renderItemAction?: (item: MenuListItem) => ReactNode;
  getItemHref?: (item: MenuListItem) => string;
  linkAs?: LinkAs;
  headingLevel?: HeadingLevel;
} // C (filter)
interface CtaBandProps extends Omit<ComponentProps<"section">, "title"> {
  overline?: ReactNode;
  title: ReactNode;
  body?: ReactNode;
  action?: ReactNode;
  tone?: "ink" | "brand" | "soft";
  align?: "split" | "center";
  hasPattern?: boolean;
  headingLevel?: HeadingLevel;
}
interface StatBandProps extends ComponentProps<"section"> {
  stats: { value: ReactNode; label: ReactNode; sub?: ReactNode; icon?: IconComponent }[];
  tone?: "soft" | "brand" | "ink";
}
interface TestimonialWallProps extends Omit<ComponentProps<"section">, "title"> {
  overline?: ReactNode;
  title: ReactNode;
  reviews: ReviewCardProps[];
  variant?: "default" | "brand";
  headingLevel?: HeadingLevel;
}
interface FaqSectionProps extends Omit<ComponentProps<"section">, "title"> {
  overline?: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  items: AccordionItem[];
  isMultiple?: boolean;
  aside?: ReactNode;
  headingLevel?: HeadingLevel;
}
interface TabBarItem {
  value: string;
  label: string;
  icon: IconComponent;
  count?: number;
  href?: string;
}
interface TabBarProps extends ComponentProps<"nav"> {
  items: TabBarItem[];
  value: string;
  onValueChange?: (value: string) => void;
  linkAs?: LinkAs;
  label?: string; /* = "Primary" */
}
interface DialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactElement;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  variant?: "modal" | "sheet";
  size?: "sm" | "md" | "lg";
} // C, Radix Dialog
interface CartLine {
  id: string;
  name: string;
  price: number;
  quantity: number;
  note?: string;
}
interface CartPanelProps extends ComponentProps<"section"> {
  lines: CartLine[];
  title?: ReactNode;
  meta?: ReactNode;
  gstRate?: number /* = 0.05 */;
  onQuantityChange?: (id: string, quantity: number) => void;
  placeAction?: ReactNode;
  browseAction?: ReactNode;
} // C
interface OrderTrackerProps extends ComponentProps<"section"> {
  steps: TrackerStep[];
  current: number;
  code: string;
  outlet?: string;
  total?: number;
  payment?: string;
  action?: ReactNode;
  variant?: "flush" | "card";
}
interface ReviewCarouselProps extends Omit<ComponentProps<"section">, "title"> {
  eyebrow?: ReactNode;
  heading: ReactNode;
  reviews: ReviewCardProps[];
  footerLink?: { label: string; href: string };
  emptyState?: ReactNode;
  headingLevel?: HeadingLevel;
  previousLabel?: string;
  nextLabel?: string;
} // controls are a C leaf
interface DockAction {
  label: string;
  href: string;
  icon: IconComponent;
}
interface ActionDockProps extends ComponentProps<"div"> {
  primary: DockAction;
  secondary?: DockAction;
}
interface QuotePanelProps extends Omit<ComponentProps<"section">, "title"> {
  tone?: "brand" | "ink" | "light";
  title: ReactNode;
  badge?: ReactNode;
  amount: ReactNode;
  unit?: ReactNode;
  was?: ReactNode;
  lines?: KeyValueItem[];
  total?: { label: ReactNode; value: ReactNode };
  note?: ReactNode;
  alerts?: ReactNode;
  action?: ReactNode;
  footnote?: ReactNode;
  headingLevel?: HeadingLevel;
}
```

## 8. Storybook ownership (Plan 5)

- `apps/storybook/src/docs-kit/` — docs-only helpers (never exported from `packages/ui`): `Swatch`, `TokenTable`, `TypeSpecimen`, `ContrastMatrix`, `SpacingScale`, `RadiusScale`, `ShadowLadder`, `MotionDemo`. They read `@pink-paprikaa-web/design-tokens/tokens.json` and `@pink-paprikaa-web/design-tokens/contrast`.
- `apps/storybook/src/foundations/<group>/*.mdx` — the 33 guideline pages (spec §10.1 mapping).
- `apps/storybook/src/kits/{website,app,marketing}/*.stories.tsx` — kit pages composed only from `@pink-paprikaa-web/ui` exports; real brand facts from `@pink-paprikaa-web/content`; real reviews (the four in `zip-files/pink-paprikaa-handoff/design/rates.js` → `google.reviews`) as fixtures in `apps/storybook/src/kits/fixtures.ts`.
- `apps/storybook/src/patterns/forms.stories.tsx` — title `Molecules/Field/React Hook Form + Zod` (D17).

## 9. Story titles (sidebar)

`Atoms/<Name>`, `Molecules/<Name>`, `Organisms/<Name>`, `Layouts/<Name>`; foundations `Brand/…`, `Colors/…`, `Type/…`, `Spacing/…`, `Layout/…`, `Motion/…`, `Marketing/…`; kits `Website/…`, `App/…`, `Marketing/Kit/…`. `<Name>` is the PascalCase component name.
