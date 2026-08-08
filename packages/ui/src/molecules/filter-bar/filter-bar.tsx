"use client";

import type { LucideIcon } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { Leaf } from "lucide-react";

import { Badge } from "../../atoms/badge/badge";
import { Tag } from "../../atoms/tag/tag";
import { componentVariants, type VariantProps } from "../../lib/component-variants";

const filterBar = componentVariants({
  slots: {
    root: "flex items-center gap-2.5",
    // Neither the statement badge nor the trailing control ever gets squeezed by a long rail.
    note: "shrink-0",
    trailing: "shrink-0",
  },
  variants: {
    /**
     * Wrapping is the website rail — every category visible at once, no hidden right edge. The
     * scrolling default is the app pattern; it keeps the rail one line tall on a phone, with
     * `pb-1` reserving room for the scrollbar so the pills are not clipped.
     */
    isWrapping: {
      true: { root: "flex-wrap" },
      false: { root: "flex-nowrap overflow-x-auto pb-1" },
    },
  },
  defaultVariants: { isWrapping: false },
});

/** A category with its own glyph. Plain strings are expanded into this shape. */
export interface FilterOption {
  /** The value handed back to `onChange`. */
  value: string;
  /** What the pill says, in Title Case. */
  label: string;
  /** Lucide glyph before the label. */
  icon?: LucideIcon;
}

export interface FilterBarProps
  extends
    Omit<ComponentPropsWithoutRef<"div">, "children" | "onChange">,
    VariantProps<typeof filterBar> {
  /** The categories. A bare string is both the value and the label. */
  options: (FilterOption | string)[];
  /** The selected category. Exactly one option is selected at a time. */
  value?: string | undefined;
  /** Called with the option's `value` when a pill is pressed. */
  onChange?: ((value: string) => void) | undefined;
  /**
   * Names the group for assistive tech — a rail of pills with no name is announced as a bare list
   * of buttons. Say what is being filtered: "Filter the menu by category".
   */
  label?: string | undefined;
  /** A standing statement pinned after the pills, not a filter: "100% Vegetarian Kitchen". */
  note?: string | undefined;
  /** A control pinned to the end of the rail — a sort select, a clear-all. */
  trailing?: ReactNode | undefined;
}

export function FilterBar({
  options,
  value,
  onChange,
  label = "Filter by category",
  note,
  trailing,
  isWrapping,
  className,
  ...props
}: FilterBarProps) {
  const slots = filterBar({ isWrapping });
  return (
    <div aria-label={label} className={slots.root({ className })} role="group" {...props}>
      {options.map((option) => {
        const item: FilterOption =
          typeof option === "string" ? { value: option, label: option } : option;
        return (
          <Tag
            icon={item.icon}
            isSelected={item.value === value}
            key={item.value}
            onClick={() => {
              onChange?.(item.value);
            }}
          >
            {item.label}
          </Tag>
        );
      })}
      {note === undefined ? null : (
        <Badge className={slots.note()} icon={Leaf} tone="success">
          {note}
        </Badge>
      )}
      {trailing === undefined ? null : <div className={slots.trailing()}>{trailing}</div>}
    </div>
  );
}
