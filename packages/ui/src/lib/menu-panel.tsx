"use client";

import type { KeyboardEvent, ReactNode } from "react";

import { useId } from "react";

import { Icon, type IconComponent } from "../atoms/icon/icon";
import { BrandDiamond } from "./brand-diamond";
import { componentVariants } from "./component-variants";
import { isShown } from "./is-shown";

/**
 * Shared panel + row recipe for Menu (compound), Select, Combobox and ActionMenu (R132).
 * Row text is `text-control` (15px) — same size as the handoff; R136's 16px rule is form fields only.
 */
export const menuPanelVariants = componentVariants({
  slots: {
    content:
      "z-overlay min-w-48 rounded-md border-default border-border-subtle bg-surface-card p-1.5 text-control text-text-body shadow-3 outline-none",
    // Inner shell: pop-in's transform must not fight Radix Floating UI's position transform.
    popIn: "motion-safe:animate-pop-in",
    item: "relative flex w-full cursor-default items-center gap-3 rounded-sm px-3 py-2 text-control transition-colors duration-instant ease-out outline-none select-none active:bg-state-press data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:text-ink-400 data-highlighted:bg-state-hover",
    icon: "",
    text: "flex min-w-0 flex-1 flex-col gap-px",
    description: "text-control-description font-regular text-text-muted",
    meta: "ms-auto shrink-0 ps-3 font-mono text-caption text-text-muted",
    indicator: "grid size-icon-md shrink-0 place-items-center text-text-brand",
    diamond: "ms-auto grid w-3.5 shrink-0 place-items-center",
    label: "px-3 pt-2.5 pb-1 font-mono text-overline font-regular text-text-muted uppercase",
    divider: "-mx-1.5 my-1.5 h-px bg-border-subtle",
    empty: "px-3 py-3.5 text-body-sm text-text-muted",
    chevron: "ms-auto shrink-0 text-text-muted rtl:rotate-180",
  },
  variants: {
    maxHeight: {
      sm: { content: "max-h-menu-max-sm overflow-y-auto" },
      md: { content: "max-h-menu-max-md overflow-y-auto" },
      lg: { content: "max-h-menu-max-lg overflow-y-auto" },
    },
    isDense: {
      true: { item: "min-h-9 py-1.5" },
      false: { item: "min-h-hit" },
    },
    isSheet: {
      true: { item: "min-h-13" },
      false: {},
    },
    color: {
      default: {
        item: "text-text-body",
        icon: "text-text-muted data-highlighted:text-pink-500",
      },
      danger: {
        item: "text-text-danger active:bg-state-press-danger data-highlighted:bg-status-danger-soft",
        icon: "text-current",
      },
    },
    isSelected: {
      true: { item: "font-semibold text-pink-700" },
    },
    hasDivider: { true: { item: "border-b border-border-subtle" } },
  },
  defaultVariants: { isDense: false, isSheet: false, color: "default" },
});

export interface MenuItemData {
  value: string;
  label: ReactNode;
  text?: string | undefined;
  description?: string | undefined;
  icon?: IconComponent | undefined;
  meta?: string | undefined;
  disabled?: boolean | undefined;
  danger?: boolean | undefined;
}

export type MenuEntry = string | MenuItemData | { divider: true } | { group: string };

export function normalizeMenuItems(items: MenuEntry[]): (MenuItemData | MenuEntry)[] {
  return items.map((entry) => (typeof entry === "string" ? { value: entry, label: entry } : entry));
}

function isMenuItem(entry: MenuEntry | MenuItemData): entry is MenuItemData {
  return typeof entry === "object" && "value" in entry && "label" in entry;
}

function isSelectedValue(value: string | string[] | undefined, itemValue: string): boolean {
  if (value === undefined) return false;
  return Array.isArray(value) ? value.includes(itemValue) : value === itemValue;
}

function activateRow(
  event: KeyboardEvent<HTMLDivElement>,
  entry: MenuItemData,
  onSelect: ((item: MenuItemData) => void) | undefined
) {
  if (entry.disabled === true) return;
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    onSelect?.(entry);
  }
}

/** Empty-list row for data-driven panels (Combobox / ActionMenu / Select). */
export function MenuEmpty({ children }: { children: ReactNode }) {
  return <div className={menuPanelVariants().empty()}>{children}</div>;
}

export interface MenuPanelProps {
  items?: MenuEntry[] | undefined;
  value?: string | string[] | undefined;
  onSelect?: ((item: MenuItemData) => void) | undefined;
  role?: "menu" | "listbox" | undefined;
  id?: string | undefined;
  emptyText?: string | undefined;
  /** 52px rows when the panel is a phone sheet. */
  isSheet?: boolean | undefined;
  /** Keyboard-active row index (Select / Combobox / design Menu). */
  activeIndex?: number | undefined;
  /** Reports the highlighted row when it moves (design Menu `onActiveChange`). */
  onActiveChange?: ((index: number) => void) | undefined;
  "aria-label"?: string | undefined;
}

/**
 * Data-driven option list (design Menu). Compound `Menu` / `MenuItem` stay for ActionMenu-style
 * menus (R134); Select / Combobox / ActionMenu import this panel (R132).
 */
export function MenuPanel({
  items = [],
  value,
  onSelect,
  role = "menu",
  id,
  emptyText = "Nothing here yet.",
  isSheet = false,
  activeIndex = -1,
  onActiveChange,
  "aria-label": ariaLabel,
}: MenuPanelProps) {
  const autoId = useId();
  const uid = id ?? autoId;
  const list = normalizeMenuItems(items);
  const slots = menuPanelVariants({ isSheet });
  const optionRole = role === "listbox" ? "option" : "menuitem";

  if (list.length === 0) {
    // Empty listbox must not claim `role="listbox"` without options (aria-required-children).
    return (
      <div role="status" id={uid} aria-label={ariaLabel} className={slots.content()}>
        <MenuEmpty>{emptyText}</MenuEmpty>
      </div>
    );
  }

  return (
    <div role={role} id={uid} aria-label={ariaLabel} className={slots.content()}>
      {list.map((entry, index) => {
        if (typeof entry === "object" && "divider" in entry) {
          return <div key={`d-${String(index)}`} role="separator" className={slots.divider()} />;
        }
        if (typeof entry === "object" && "group" in entry) {
          return (
            <div key={`g-${String(index)}`} role="presentation" className={slots.label()}>
              {entry.group}
            </div>
          );
        }
        if (!isMenuItem(entry)) return null;
        const isChosen = isSelectedValue(value, entry.value);
        const isActive = index === activeIndex && entry.disabled !== true;
        const color = entry.danger === true ? "danger" : "default";
        const row = menuPanelVariants({ isSheet, color, isSelected: isChosen });
        const isDisabled = entry.disabled === true;
        return (
          <div
            key={`${entry.value}-${String(index)}`}
            id={`${uid}-o${String(index)}`}
            role={optionRole}
            tabIndex={isDisabled ? -1 : 0}
            {...(role === "listbox" ? { "aria-selected": isChosen } : {})}
            {...(isDisabled ? { "aria-disabled": true } : {})}
            {...(isChosen ? { "data-selected": "" } : {})}
            {...(isActive ? { "data-highlighted": "" } : {})}
            className={row.item()}
            onClick={() => {
              if (!isDisabled) onSelect?.(entry);
            }}
            onFocus={() => {
              if (!isDisabled) onActiveChange?.(index);
            }}
            onKeyDown={(event) => {
              activateRow(event, entry, onSelect);
            }}
          >
            {entry.icon === undefined ? null : (
              <Icon icon={entry.icon} size="md" className={row.icon()} />
            )}
            <span className={row.text()}>
              <span className="truncate">{entry.label}</span>
              {isShown(entry.description) ? (
                <span className={row.description()}>{entry.description}</span>
              ) : null}
            </span>
            {isShown(entry.meta) ? <span className={row.meta()}>{entry.meta}</span> : null}
            {role === "listbox" ? (
              <span className={row.diamond()}>
                {isChosen ? <BrandDiamond size="14px" fill="brand" /> : null}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
