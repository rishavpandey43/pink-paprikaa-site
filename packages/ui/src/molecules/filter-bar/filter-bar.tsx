"use client";

import { Leaf } from "lucide-react";
import { ToggleGroup } from "radix-ui";
import { type ReactNode, useState } from "react";

import { Badge } from "../../atoms/badge/badge";
import { Icon, type IconComponent } from "../../atoms/icon/icon";
import { tagVariants } from "../../atoms/tag/tag";
import { componentVariants } from "../../lib/component-variants";

export interface FilterOption {
  value: string;
  label: string;
  icon?: IconComponent | undefined;
}

export interface FilterBarProps {
  /** Accessible name of the radio group, e.g. "Menu category". */
  label: string;
  options: FilterOption[];
  value?: string | undefined;
  /** Uncontrolled starting filter. Default: the first option. */
  defaultValue?: string | undefined;
  onValueChange?: ((value: string) => void) | undefined;
  /** Wrap onto more rows (the website) instead of scrolling on one line (the app). */
  isWrapping?: boolean | undefined;
  /** A static statement pinned after the filters, e.g. "100% Vegetarian". */
  note?: ReactNode | undefined;
  trailing?: ReactNode | undefined;
  className?: string | undefined;
}

const filterBar = componentVariants({
  slots: {
    root: "flex items-center gap-2.5",
    group: "flex gap-2.5",
    // Neither the statement badge nor the trailing control is squeezed by a long rail.
    note: "shrink-0",
    trailing: "shrink-0",
  },
  variants: {
    isWrapping: {
      true: { root: "flex-wrap", group: "flex-wrap" },
      false: { root: "flex-nowrap overflow-x-auto pb-1", group: "flex-nowrap" },
    },
  },
});

/** Menu category rail. Exactly one filter is chosen at a time; the rail scrolls unless it wraps. */
export function FilterBar({
  label,
  options,
  value,
  defaultValue,
  onValueChange,
  isWrapping = false,
  note,
  trailing,
  className,
}: FilterBarProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(
    defaultValue ?? options[0]?.value ?? ""
  );
  const selected = value ?? uncontrolledValue;
  const styles = filterBar({ isWrapping });

  const handleValueChange = (next: string) => {
    // Radix clears a single group when the chosen item is pressed again; a filter always has one.
    if (next === "") return;
    setUncontrolledValue(next);
    onValueChange?.(next);
  };

  return (
    <div className={styles.root({ className })}>
      <ToggleGroup.Root
        type="single"
        aria-label={label}
        value={selected}
        onValueChange={handleValueChange}
        className={styles.group()}
      >
        {options.map((option) => {
          const tag = tagVariants({ isSelected: option.value === selected, isInteractive: true });
          return (
            <ToggleGroup.Item key={option.value} value={option.value} className={tag.root()}>
              {option.icon === undefined ? null : <Icon icon={option.icon} size="sm" />}
              <span className={tag.label()}>{option.label}</span>
            </ToggleGroup.Item>
          );
        })}
      </ToggleGroup.Root>
      {note ? (
        <Badge tone="success" icon={Leaf} className={styles.note()}>
          {note}
        </Badge>
      ) : null}
      {trailing ? <div className={styles.trailing()}>{trailing}</div> : null}
    </div>
  );
}
