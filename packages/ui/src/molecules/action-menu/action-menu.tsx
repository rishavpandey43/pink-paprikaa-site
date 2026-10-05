"use client";

import type { ReactNode } from "react";

import { Ellipsis, EllipsisVertical } from "lucide-react";

import type { IconComponent } from "../../atoms/icon/icon";
import type { SxProp } from "../../lib/common-props";
import type { SheetMode } from "../../lib/popover-shell";

import { IconButton } from "../../atoms/icon-button/icon-button";
import {
  Menu,
  MenuContent,
  MenuDivider,
  MenuItem,
  MenuLabel,
  MenuTrigger,
} from "../../atoms/menu/menu";
import { placementSideAlign } from "../../lib/popover-shell";
import { withSx } from "../../lib/sx";

export type ActionMenuItem =
  | {
      value: string;
      label: ReactNode;
      icon?: IconComponent | undefined;
      description?: ReactNode | undefined;
      meta?: ReactNode | undefined;
      disabled?: boolean | undefined;
      /** Destructive action — keep last, after a divider (design prompt). */
      isDanger?: boolean | undefined;
    }
  | { divider: true }
  | { group: string };

export interface ActionMenuProps extends SxProp {
  items?: ActionMenuItem[] | undefined;
  onSelect?:
    ((value: string, item: Extract<ActionMenuItem, { value: string }>) => void) | undefined;
  /** Accessible name for the trigger. Default "More actions". */
  label?: string | undefined;
  /** `ellipsis-vertical` (default) or `ellipsis`. */
  icon?: "ellipsis-vertical" | "ellipsis" | undefined;
  variant?: "primary" | "secondary" | "ghost" | "glass" | undefined;
  size?: "sm" | "md" | "lg" | undefined;
  sheet?: SheetMode | undefined;
  /** Sheet heading; falls back to `label`. */
  title?: ReactNode | undefined;
  defaultOpen?: boolean | undefined;
  open?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
  className?: string | undefined;
  placement?: "bottom-start" | "bottom-end" | "top-start" | "top-end" | undefined;
  minWidth?: number | undefined;
}

function isDivider(item: ActionMenuItem): item is { divider: true } {
  return "divider" in item;
}

function isGroup(item: ActionMenuItem): item is { group: string } {
  return "group" in item;
}

/**
 * Row/card overflow menu: ghost sm IconButton (ellipsis) → Menu atom (R134).
 * Data `items` API; compound Menu stays for custom trees. Destructive rows use `isDanger`
 * and should sit last after a divider.
 */
export function ActionMenu({
  items = [],
  onSelect,
  label = "More actions",
  icon = "ellipsis-vertical",
  variant = "ghost",
  size = "sm",
  sheet = "auto",
  title,
  defaultOpen = false,
  open,
  onOpenChange,
  sx,
  className,
  placement = "bottom-end",
  minWidth,
}: ActionMenuProps) {
  const TriggerIcon = icon === "ellipsis" ? Ellipsis : EllipsisVertical;
  const sheetTitle = title ?? label;
  const placed = placementSideAlign(placement);

  return (
    <span className={withSx(sx, `inline-flex ${className ?? ""}`.trim())}>
      <Menu defaultOpen={defaultOpen} open={open} onOpenChange={onOpenChange}>
        <MenuTrigger asChild>
          <IconButton icon={TriggerIcon} label={label} variant={variant} size={size} />
        </MenuTrigger>
        <MenuContent
          aria-label={label}
          title={sheetTitle}
          sheet={sheet}
          side={placed.side ?? "bottom"}
          align={placed.align ?? "end"}
          placement={placement}
          minWidth={minWidth}
        >
          {items.map((item, index) => {
            if (isDivider(item)) {
              return <MenuDivider key={`d-${String(index)}`} />;
            }
            if (isGroup(item)) {
              return <MenuLabel key={`g-${String(index)}`}>{item.group}</MenuLabel>;
            }
            return (
              <MenuItem
                key={item.value}
                icon={item.icon}
                description={item.description}
                meta={item.meta}
                disabled={item.disabled}
                color={item.isDanger === true ? "danger" : "default"}
                onSelect={() => {
                  onSelect?.(item.value, item);
                }}
              >
                {item.label}
              </MenuItem>
            );
          })}
        </MenuContent>
      </Menu>
    </span>
  );
}
