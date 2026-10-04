"use client";

import type { ComponentProps, ReactElement, ReactNode } from "react";

import { Check, ChevronRight } from "lucide-react";
import { DropdownMenu as RadixMenu } from "radix-ui";
import { Children, cloneElement, createContext, isValidElement, use } from "react";

import type { SxProp } from "../../lib/common-props";

import { Icon, type IconComponent } from "../../atoms/icon/icon";
import { BrandDiamond } from "../../lib/brand-diamond";
import { componentVariants } from "../../lib/component-variants";
import { isShown } from "../../lib/is-shown";
import { withSx } from "../../lib/sx";

const SIDE_OFFSET_PX = 4;

const menu = componentVariants({
  slots: {
    // `p-1.5` keeps the rounded rows clear of the panel's own rounded corners.
    content:
      "z-overlay min-w-48 rounded-lg border-default border-border-subtle bg-surface-card p-1.5 text-body-sm text-text-body shadow-3 outline-none",
    item: "relative flex w-full cursor-default items-center gap-3 rounded-md px-3 py-2.5 text-body-sm outline-none select-none data-disabled:pointer-events-none data-disabled:text-ink-400 data-highlighted:bg-surface-sunken",
    icon: "",
    text: "flex min-w-0 flex-1 flex-col",
    description: "text-caption text-text-muted",
    shortcut: "ms-auto ps-3 text-caption text-text-muted",
    indicator: "grid size-icon-md shrink-0 place-items-center text-text-brand",
    label: "px-3 py-1.5 text-caption font-semibold text-text-muted",
    divider: "-mx-1.5 my-1.5 h-px bg-border-subtle",
    chevron: "ms-auto shrink-0 text-text-muted rtl:rotate-180",
  },
  variants: {
    maxHeight: {
      sm: { content: "max-h-menu-max-sm overflow-y-auto" },
      md: { content: "max-h-menu-max-md overflow-y-auto" },
      lg: { content: "max-h-menu-max-lg overflow-y-auto" },
    },
    // 44px tap targets, or MUI's `dense` 36px rows.
    isDense: {
      true: { item: "min-h-9 py-1.5" },
      false: { item: "min-h-hit" },
    },
    color: {
      default: { item: "text-text-body", icon: "text-text-muted" },
      danger: { item: "text-text-danger", icon: "text-current" },
    },
    isSelected: { true: { item: "bg-surface-brand-soft font-semibold" } },
    hasDivider: { true: { item: "border-b border-border-subtle" } },
  },
  defaultVariants: { isDense: false, color: "default" },
});

const DenseContext = createContext(false);

/** Radix types its optionals without `| undefined`; ours allow it (exactOptionalPropertyTypes). */
function disabledProps(disabled: boolean | undefined) {
  return disabled === undefined ? {} : { disabled };
}

function selectProps(
  disabled: boolean | undefined,
  onSelect: ((event: Event) => void) | undefined
) {
  return { ...disabledProps(disabled), ...(onSelect === undefined ? {} : { onSelect }) };
}

/**
 * MUI's `<Menu>` + `anchorEl` + `open` + `onClose`, on Radix DropdownMenu: the trigger is a part,
 * which gives correct `aria-haspopup`/`aria-expanded`/`aria-controls`, focus return, typeahead and
 * roving focus. Controlled `open` / `onOpenChange` still work.
 */
export function Menu({
  open,
  defaultOpen,
  onOpenChange,
  modal,
  children,
}: {
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
  modal?: boolean | undefined;
  children: ReactNode;
}) {
  return (
    <RadixMenu.Root
      {...(open === undefined ? {} : { open })}
      {...(defaultOpen === undefined ? {} : { defaultOpen })}
      {...(onOpenChange === undefined ? {} : { onOpenChange })}
      {...(modal === undefined ? {} : { modal })}
    >
      {children}
    </RadixMenu.Root>
  );
}

/** Wraps one focusable element that forwards props and ref: an IconButton (3-dot) or a Button. */
export function MenuTrigger({ children }: { children: ReactElement; asChild?: true | undefined }) {
  return <RadixMenu.Trigger asChild>{children}</RadixMenu.Trigger>;
}

export interface MenuContentProps extends SxProp {
  /** MUI anchorOrigin / transformOrigin. Default "bottom"; flips when there is no room. */
  side?: "top" | "right" | "bottom" | "left" | undefined;
  align?: "start" | "center" | "end" | undefined;
  sideOffset?: number | undefined;
  /** MUI `dense`: 36px rows instead of 44px. */
  isDense?: boolean | undefined;
  /** MUI "long menu": scrolls inside at 216 / 320 / 400px. */
  maxHeight?: "sm" | "md" | "lg" | undefined;
  portalContainer?: HTMLElement | null | undefined;
  children: ReactNode;
  "aria-label"?: string | undefined;
}

/** Radix labels the panel by its trigger via `aria-labelledby`; blanking it lets `aria-label` name it. */
function ownLabel(label: string): { "aria-label": string; "aria-labelledby"?: string } {
  return { "aria-label": label, "aria-labelledby": undefined } as { "aria-label": string };
}

function panelProps({
  sideOffset,
  isDense,
  maxHeight,
  sx,
  "aria-label": ariaLabel,
}: MenuContentProps) {
  return {
    sideOffset: sideOffset ?? SIDE_OFFSET_PX,
    collisionPadding: 16,
    loop: true,
    "data-surface": "light",
    ...(ariaLabel === undefined ? {} : ownLabel(ariaLabel)),
    className: menu({ maxHeight }).content({ className: withSx(sx, undefined) }),
    isDense: isDense ?? false,
  };
}

/** The panel (Portal + Content). Radix renders the `role="menu"` element. */
export function MenuContent(props: MenuContentProps) {
  const { isDense, ...content } = panelProps(props);
  return (
    <RadixMenu.Portal container={props.portalContainer ?? null}>
      <RadixMenu.Content
        {...content}
        {...(props.side === undefined ? {} : { side: props.side })}
        {...(props.align === undefined ? {} : { align: props.align })}
      >
        <DenseContext value={isDense}>{props.children}</DenseContext>
      </RadixMenu.Content>
    </RadixMenu.Portal>
  );
}

export interface MenuItemProps
  extends Omit<ComponentProps<"div">, "children" | "color" | "onSelect">, SxProp {
  /** MUI ListItemIcon. */
  icon?: IconComponent | undefined;
  /** MUI trailing Typography, e.g. "⌘P". */
  shortcut?: ReactNode;
  /** MUI ListItemText secondary. */
  description?: ReactNode;
  /** MUI `selected`: brand-soft row, semibold, `aria-current`. */
  isSelected?: boolean | undefined;
  /** MUI `divider`: a hairline under the item. */
  hasDivider?: boolean | undefined;
  color?: "default" | "danger" | undefined;
  disabled?: boolean | undefined;
  /** MUI onClick. The menu closes after a select (MUI default); `event.preventDefault()` keeps it open. */
  onSelect?: ((event: Event) => void) | undefined;
  /** Render the single child element (a Link / `<a>`) as the item: MUI `component={Link}`. */
  asChild?: boolean | undefined;
  children: ReactNode;
}

interface RowParts {
  icon?: IconComponent | undefined;
  shortcut?: ReactNode;
  description?: ReactNode;
  slots: ReturnType<typeof menu>;
}

/** The inside of a row: icon · label (+ description) · shortcut. */
function rowContent({ icon, shortcut, description, slots }: RowParts, label: ReactNode) {
  return (
    <>
      {icon === undefined ? null : <Icon icon={icon} size="md" className={slots.icon()} />}
      <span className={slots.text()}>
        <span>{label}</span>
        {isShown(description) ? <span className={slots.description()}>{description}</span> : null}
      </span>
      {isShown(shortcut) ? <span className={slots.shortcut()}>{shortcut}</span> : null}
    </>
  );
}

/** Plain row, or — with `asChild` — the child element with the row's content put inside it. */
function renderRow(asChild: boolean | undefined, parts: RowParts, children: ReactNode) {
  if (asChild === true && isValidElement<{ children?: ReactNode }>(children)) {
    return cloneElement(children, undefined, rowContent(parts, children.props.children));
  }
  return rowContent(parts, children);
}

const ITEM_ONLY_ONE_CHILD = "MenuItem asChild takes exactly one child element";

function assertOneChild(asChild: boolean | undefined, children: ReactNode) {
  if (asChild === true && Children.count(children) !== 1) throw new Error(ITEM_ONLY_ONE_CHILD);
}

/** One action. Disabled items are skipped by the arrow keys and announce `aria-disabled`. */
export function MenuItem({
  icon,
  shortcut,
  description,
  isSelected,
  hasDivider,
  color = "default",
  asChild,
  disabled,
  onSelect,
  sx,
  className,
  children,
  ...props
}: MenuItemProps) {
  const isDense = use(DenseContext);
  assertOneChild(asChild, children);
  const slots = menu({ isDense, color, isSelected, hasDivider });
  return (
    <RadixMenu.Item
      {...props}
      {...selectProps(disabled, onSelect)}
      {...(asChild === undefined ? {} : { asChild })}
      {...(isSelected === true ? { "data-selected": "", "aria-current": true } : {})}
      className={slots.item({ className: withSx(sx, className) })}
    >
      {renderRow(asChild, { icon, shortcut, description, slots }, children)}
    </RadixMenu.Item>
  );
}

/** MUI `<Divider />` inside a Menu. */
export function MenuDivider() {
  return <RadixMenu.Separator className={menu().divider()} />;
}

/** MUI `ListSubheader`. */
export function MenuLabel({ children }: { children: ReactNode }) {
  return <RadixMenu.Label className={menu().label()}>{children}</RadixMenu.Label>;
}

export type MenuCheckboxItemProps = Omit<MenuItemProps, "isSelected" | "onSelect" | "asChild"> & {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  /** Radix closes the menu after a select; `event.preventDefault()` keeps it open for more choices. */
  onSelect?: ((event: Event) => void) | undefined;
};

/** A toggle row (`role="menuitemcheckbox"`) with a check where an icon would be. */
export function MenuCheckboxItem({
  icon,
  shortcut,
  description,
  hasDivider,
  color = "default",
  disabled,
  onSelect,
  sx,
  className,
  children,
  ...props
}: MenuCheckboxItemProps) {
  const isDense = use(DenseContext);
  const slots = menu({ isDense, color, hasDivider });
  return (
    <RadixMenu.CheckboxItem
      {...props}
      {...selectProps(disabled, onSelect)}
      className={slots.item({ className: withSx(sx, className) })}
    >
      <span className={slots.indicator()}>
        <RadixMenu.ItemIndicator>
          <Icon icon={Check} size="sm" />
        </RadixMenu.ItemIndicator>
      </span>
      {rowContent({ icon, shortcut, description, slots }, children)}
    </RadixMenu.CheckboxItem>
  );
}

export function MenuRadioGroup({
  value,
  onValueChange,
  children,
}: {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <RadixMenu.RadioGroup value={value} onValueChange={onValueChange}>
      {children}
    </RadixMenu.RadioGroup>
  );
}

export type MenuRadioItemProps = Omit<MenuItemProps, "isSelected" | "asChild"> & { value: string };

/** One choice in a MenuRadioGroup (`role="menuitemradio"`), marked with the brand diamond. */
export function MenuRadioItem({
  icon,
  shortcut,
  description,
  hasDivider,
  color = "default",
  disabled,
  onSelect,
  sx,
  className,
  children,
  ...props
}: MenuRadioItemProps) {
  const isDense = use(DenseContext);
  const slots = menu({ isDense, color, hasDivider });
  return (
    <RadixMenu.RadioItem
      {...props}
      {...selectProps(disabled, onSelect)}
      className={slots.item({ className: withSx(sx, className) })}
    >
      <span className={slots.indicator()}>
        <RadixMenu.ItemIndicator>
          <BrandDiamond size="12px" fill="brand" />
        </RadixMenu.ItemIndicator>
      </span>
      {rowContent({ icon, shortcut, description, slots }, children)}
    </RadixMenu.RadioItem>
  );
}

export function SubMenu({ children }: { children: ReactNode }) {
  return <RadixMenu.Sub>{children}</RadixMenu.Sub>;
}

/** A row that opens a submenu with ArrowRight (ArrowLeft in RTL); a chevron sits at the end. */
export function SubMenuTrigger({
  icon,
  shortcut,
  description,
  isSelected,
  hasDivider,
  color = "default",
  asChild: _asChild,
  disabled,
  sx,
  className,
  children,
  ...props
}: Omit<MenuItemProps, "onSelect">) {
  const isDense = use(DenseContext);
  const slots = menu({ isDense, color, isSelected, hasDivider });
  return (
    <RadixMenu.SubTrigger
      {...props}
      {...disabledProps(disabled)}
      {...(isSelected === true ? { "data-selected": "", "aria-current": true } : {})}
      className={slots.item({ className: withSx(sx, className) })}
    >
      {rowContent({ icon, shortcut, description, slots }, children)}
      <Icon icon={ChevronRight} size="sm" className={slots.chevron()} />
    </RadixMenu.SubTrigger>
  );
}

/** The submenu's panel. Radix places it beside its trigger, so `side` and `align` do not apply. */
export function SubMenuContent(props: MenuContentProps) {
  const { isDense, ...content } = panelProps(props);
  return (
    <RadixMenu.Portal container={props.portalContainer ?? null}>
      <RadixMenu.SubContent {...content}>
        <DenseContext value={isDense}>{props.children}</DenseContext>
      </RadixMenu.SubContent>
    </RadixMenu.Portal>
  );
}
