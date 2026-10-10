"use client";

import { type ReactNode, useState } from "react";

import { FilterBar, type FilterOption } from "../../molecules/filter-bar/filter-bar";

export interface MenuListPanel {
  value: string;
  /** The dishes for this option, rendered by the server organism. */
  content: ReactNode;
}

export interface MenuListFilterProps {
  label: string;
  options: FilterOption[];
  /** The option chosen on arrival; one of `options`. */
  defaultValue: string;
  panels: MenuListPanel[];
  note?: ReactNode;
  className?: string | undefined;
}

/**
 * MenuList's client corner: it holds the chosen option and shows that option's pre-rendered
 * panel. (FilterBar already ignores Radix's `""` when the chosen option is pressed again.)
 */
export function MenuListFilter({
  label,
  options,
  defaultValue,
  panels,
  note,
  className,
}: MenuListFilterProps) {
  const [value, setValue] = useState(defaultValue);
  const panel = panels.find((candidate) => candidate.value === value);
  return (
    <div className={className}>
      <FilterBar
        label={label}
        options={options}
        value={value}
        onValueChange={setValue}
        isWrapping
        note={note}
      />
      {panel?.content}
    </div>
  );
}
