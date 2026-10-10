"use client";

import { Check, ChevronRight } from "lucide-react";
import { DropdownMenu as RadixMenu } from "radix-ui";
import type { ComponentProps, KeyboardEvent, ReactElement, ReactNode } from "react";
import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  use,
  useCallback,
  useState,
} from "react";

import { BrandDiamond } from "../../lib/brand-diamond";
import type { SxProp } from "../../lib/common-props";
import { isShown } from "../../lib/is-shown";
import { menuPanelVariants } from "../../lib/menu-panel";
import {
  placementSideAlign,
  reportOpenChange,
  type SheetMode,
  useAsSheet,
} from "../../lib/popover-shell";
import { withSx } from "../../lib/sx";
import { Icon, type IconComponent } from "../icon/icon";

const SIDE_OFFSET_PX = 4;

const DenseContext = createContext(false);
const SheetContext = createContext(false);
const CloseContext = createContext<(() => void) | null>(null);

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

export interface MenuRootProps {
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
  /** Design `onClose` — called when the menu goes from open to closed (R148). */
  onClose?: ((reason: string) => void) | undefined;
  modal?: boolean | undefined;
  children: ReactNode;
}

/**
 * MUI's `<Menu>` + `anchorEl` + `open` + `onClose`, on Radix DropdownMenu: the trigger is a part,
 * which gives correct `aria-haspopup`/`aria-expanded`/`aria-controls`, focus return, typeahead and
 * roving focus. Controlled `open` / `onOpenChange` still work.
 */
export function Menu({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  onClose,
  modal,
  children,
}: MenuRootProps) {
  const [isUncontrolledOpen, setIsUncontrolledOpen] = useState(defaultOpen);
  const isControlled = openProp !== undefined;
  const isOpen = isControlled ? openProp : isUncontrolledOpen;
  const setIsOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setIsUncontrolledOpen(next);
      reportOpenChange(next, onOpenChange, onClose);
    },
    [isControlled, onOpenChange, onClose]
  );
  return (
    <RadixMenu.Root
      open={isOpen}
      onOpenChange={setIsOpen}
      {...(modal === undefined ? {} : { modal })}
    >
      <CloseContext
        value={() => {
          setIsOpen(false);
        }}
      >
        {children}
      </CloseContext>
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
  /** Sheet title when rendered as a ≤640 bottom sheet. */
  title?: ReactNode | undefined;
  /** `"auto"` = bottom sheet at ≤640px. */
  sheet?: SheetMode | undefined;
  /** Focus the list on open. Set false when an input owns focus (Combobox). */
  autoFocus?: boolean | undefined;
  /** In-flow specimen (no portal / floating). */
  inline?: boolean | undefined;
  minWidth?: number | undefined;
  placement?: "bottom-start" | "bottom-end" | "top-start" | "top-end" | undefined;
}

/** Radix labels the panel by its trigger via `aria-labelledby`; blanking it lets `aria-label` name it. */
function ownLabel(label: string): { "aria-label": string; "aria-labelledby"?: string } {
  return { "aria-label": label, "aria-labelledby": undefined } as { "aria-label": string };
}

function onContentKeyDown(event: KeyboardEvent, close: (() => void) | null) {
  // Close first so Radix's Tab trap does not keep focus; do not preventDefault (Review Focus 4).
  if (event.key === "Tab") close?.();
}

/** The panel (Portal + Content). Radix renders the `role="menu"` element. */
export function MenuContent(props: MenuContentProps) {
  const {
    sideOffset,
    isDense = false,
    maxHeight,
    sx,
    "aria-label": ariaLabel,
    title,
    sheet = "auto",
    portalContainer,
    children,
    side,
    align,
    autoFocus: shouldAutoFocus = true,
    inline: isInline = false,
    minWidth,
    placement,
  } = props;
  const placed = placementSideAlign(placement);
  const resolvedSide = placed.side ?? side;
  const resolvedAlign = placed.align ?? align;
  const isSheet = useAsSheet(isInline ? false : sheet);
  const close = use(CloseContext);
  const slots = menuPanelVariants({ maxHeight });
  const floatingClass = slots.content({ className: withSx(sx, undefined) });
  const minWidthStyle = minWidth === undefined ? undefined : { minWidth };

  const body = (
    <DenseContext value={isDense}>
      <SheetContext value={isSheet}>{children}</SheetContext>
    </DenseContext>
  );

  if (isInline) {
    return (
      <RadixMenu.Content
        data-surface="light"
        className={floatingClass}
        style={{ position: "relative", transform: "none", ...minWidthStyle }}
        tabIndex={shouldAutoFocus ? 0 : -1}
      >
        {body}
      </RadixMenu.Content>
    );
  }

  return (
    <RadixMenu.Portal container={portalContainer ?? null}>
      {isSheet ? (
        <div className="fixed inset-0 z-overlay flex items-end bg-surface-overlay">
          {/*
            Sheet chrome (handle/title) stays outside `role="menu"` so axe's
            aria-required-children stays happy; Radix Content is only the scroll body.
          */}
          <div
            data-surface="light"
            className="sheet-pin flex max-h-menu-sheet w-full flex-col overflow-hidden rounded-t-xl bg-surface-card shadow-4 motion-safe:animate-sheet-in"
          >
            <div aria-hidden className="flex shrink-0 justify-center pt-2.5">
              <span className="h-1 w-10 rounded-pill bg-ink-300" />
            </div>
            {title === undefined || title === null || title === false || title === "" ? null : (
              <div className="shrink-0 px-6 pt-3.5 pb-1.5 font-display text-body-lg font-bold text-text-heading">
                {title}
              </div>
            )}
            <RadixMenu.Content
              {...(ariaLabel === undefined ? {} : ownLabel(ariaLabel))}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain border-0 bg-transparent px-3 pt-1 pb-4 shadow-none outline-none"
              style={{ position: "relative", transform: "none" }}
              tabIndex={shouldAutoFocus ? 0 : -1}
              onKeyDown={(event) => {
                onContentKeyDown(event, close);
              }}
            >
              {body}
            </RadixMenu.Content>
          </div>
        </div>
      ) : (
        <RadixMenu.Content
          sideOffset={sideOffset ?? SIDE_OFFSET_PX}
          collisionPadding={16}
          loop
          data-surface="light"
          {...(ariaLabel === undefined ? {} : ownLabel(ariaLabel))}
          {...(resolvedSide === undefined ? {} : { side: resolvedSide })}
          {...(resolvedAlign === undefined ? {} : { align: resolvedAlign })}
          className={floatingClass}
          {...(minWidthStyle === undefined ? {} : { style: minWidthStyle })}
          tabIndex={shouldAutoFocus ? 0 : -1}
          onKeyDown={(event) => {
            onContentKeyDown(event, close);
          }}
        >
          <div className={slots.popIn()}>{body}</div>
        </RadixMenu.Content>
      )}
    </RadixMenu.Portal>
  );
}

export interface MenuItemProps
  extends Omit<ComponentProps<"div">, "children" | "color" | "onSelect">, SxProp {
  /** MUI ListItemIcon. */
  icon?: IconComponent | undefined;
  /** Trailing mono meta (design) / MUI shortcut, e.g. "⌘P" or "₹280". */
  shortcut?: ReactNode;
  /** Alias of `shortcut` — design `meta`. */
  meta?: ReactNode;
  /** MUI ListItemText secondary. */
  description?: ReactNode;
  /** Chosen row: pink-700 + brand diamond (listbox). */
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
  meta?: ReactNode;
  description?: ReactNode;
  isSelected?: boolean | undefined;
  slots: ReturnType<typeof menuPanelVariants>;
}

/** The inside of a row: icon · label (+ description) · meta · optional diamond. */
function rowContent({ icon, meta, description, isSelected, slots }: RowParts, label: ReactNode) {
  return (
    <>
      {icon === undefined ? null : <Icon icon={icon} size="md" className={slots.icon()} />}
      <span className={slots.text()}>
        <span>{label}</span>
        {isShown(description) ? <span className={slots.description()}>{description}</span> : null}
      </span>
      {isShown(meta) ? <span className={slots.meta()}>{meta}</span> : null}
      {isSelected === true ? (
        <span className={slots.diamond()}>
          <BrandDiamond size="14px" fill="brand" />
        </span>
      ) : null}
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
  meta,
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
  const isSheet = use(SheetContext);
  assertOneChild(asChild, children);
  const slots = menuPanelVariants({ isDense, isSheet, color, isSelected, hasDivider });
  const trailing = meta ?? shortcut;
  return (
    <RadixMenu.Item
      {...props}
      {...selectProps(disabled, onSelect)}
      {...(asChild === undefined ? {} : { asChild })}
      {...(isSelected === true ? { "data-selected": "", "aria-current": true } : {})}
      className={slots.item({ className: withSx(sx, className) })}
    >
      {renderRow(asChild, { icon, meta: trailing, description, isSelected, slots }, children)}
    </RadixMenu.Item>
  );
}

/** MUI `<Divider />` inside a Menu. */
export function MenuDivider() {
  return <RadixMenu.Separator className={menuPanelVariants().divider()} />;
}

/** MUI `ListSubheader` / design group label (mono uppercase). */
export function MenuLabel({ children }: { children: ReactNode }) {
  return <RadixMenu.Label className={menuPanelVariants().label()}>{children}</RadixMenu.Label>;
}

/** Empty-list row when composing without `MenuPanel`. */
export function MenuEmpty({ children }: { children: ReactNode }) {
  return <div className={menuPanelVariants().empty()}>{children}</div>;
}

export type MenuCheckboxItemProps = Omit<
  MenuItemProps,
  "isSelected" | "onSelect" | "asChild" | "meta"
> & {
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
  const isSheet = use(SheetContext);
  const slots = menuPanelVariants({ isDense, isSheet, color, hasDivider });
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
      {rowContent({ icon, meta: shortcut, description, slots }, children)}
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

export type MenuRadioItemProps = Omit<MenuItemProps, "isSelected" | "asChild" | "meta"> & {
  value: string;
};

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
  const isSheet = use(SheetContext);
  const slots = menuPanelVariants({ isDense, isSheet, color, hasDivider });
  return (
    <RadixMenu.RadioItem
      {...props}
      {...selectProps(disabled, onSelect)}
      className={slots.item({ className: withSx(sx, className) })}
    >
      <span className={slots.indicator()}>
        <RadixMenu.ItemIndicator>
          <BrandDiamond size="14px" fill="brand" />
        </RadixMenu.ItemIndicator>
      </span>
      {rowContent({ icon, meta: shortcut, description, slots }, children)}
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
}: Omit<MenuItemProps, "onSelect" | "meta">) {
  const isDense = use(DenseContext);
  const isSheet = use(SheetContext);
  const slots = menuPanelVariants({ isDense, isSheet, color, isSelected, hasDivider });
  return (
    <RadixMenu.SubTrigger
      {...props}
      {...disabledProps(disabled)}
      {...(isSelected === true ? { "data-selected": "", "aria-current": true } : {})}
      className={slots.item({ className: withSx(sx, className) })}
    >
      {rowContent({ icon, meta: shortcut, description, isSelected, slots }, children)}
      <Icon icon={ChevronRight} size="sm" className={slots.chevron()} />
    </RadixMenu.SubTrigger>
  );
}

/** The submenu's panel. Radix places it beside its trigger, so `side` and `align` do not apply. */
export function SubMenuContent(props: MenuContentProps) {
  const {
    isDense = false,
    maxHeight,
    sx,
    "aria-label": ariaLabel,
    portalContainer,
    children,
  } = props;
  const slots = menuPanelVariants({ maxHeight });
  return (
    <RadixMenu.Portal container={portalContainer ?? null}>
      <RadixMenu.SubContent
        sideOffset={SIDE_OFFSET_PX}
        collisionPadding={16}
        loop
        data-surface="light"
        {...(ariaLabel === undefined ? {} : ownLabel(ariaLabel))}
        className={slots.content({ className: withSx(sx, undefined) })}
      >
        <div className={slots.popIn()}>
          <DenseContext value={isDense}>
            <SheetContext value={false}>{children}</SheetContext>
          </DenseContext>
        </div>
      </RadixMenu.SubContent>
    </RadixMenu.Portal>
  );
}

export {
  MenuPanel,
  type MenuEntry,
  type MenuItemData,
  type MenuPanelProps,
  /** Design `MenuProps` — data-driven panel (compound `Menu` stays for ActionMenu-style trees). */
  type MenuPanelProps as MenuProps,
} from "../../lib/menu-panel";
