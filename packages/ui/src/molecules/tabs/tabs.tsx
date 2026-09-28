"use client";

import type { ReactNode } from "react";

import { Tabs as RadixTabs } from "radix-ui";

import { componentVariants } from "../../lib/component-variants";
import { useControllableState } from "../../lib/use-controllable-state";

const tabs = componentVariants({
  slots: {
    root: "grid min-w-0 gap-6",
    list: "flex min-w-0",
    // `inline-flex gap-2`: a glyph passed in a ReactNode `label` sits beside its text (dev parity).
    trigger:
      "inline-flex shrink-0 items-center justify-center gap-2 font-display font-bold whitespace-nowrap transition-colors duration-fast ease-out disabled:cursor-not-allowed disabled:text-ink-400",
    panel: "min-w-0",
  },
  variants: {
    variant: {
      underline: {
        list: "flex-wrap gap-x-7 gap-y-3 border-b border-border-subtle",
        trigger:
          "relative min-h-hit pb-3 text-tabs-label text-text-subtle after:absolute after:inset-x-0 after:-bottom-px after:h-0.75 after:rounded-t-xs after:transition-colors after:duration-base after:ease-out not-disabled:hover:text-text-heading aria-selected:text-text-heading aria-selected:after:bg-tabs-indicator",
      },
      segmented: {
        list: "flex-wrap gap-1 justify-self-start rounded-pill border border-border-subtle bg-surface-card p-1",
        trigger:
          "min-h-hit rounded-pill px-4 py-2.5 text-body-sm text-tabs-segmented-fg not-disabled:hover:bg-surface-page-alt aria-selected:bg-surface-brand aria-selected:text-text-on-brand aria-selected:not-disabled:hover:bg-brand-hover",
      },
    },
    /** Equal shares across the row (dev parity, R39): the tabs shrink rather than wrap. */
    isFullWidth: {
      true: { list: "flex-nowrap justify-self-stretch", trigger: "min-w-0 flex-1 shrink" },
    },
  },
  compoundVariants: [{ variant: "underline", isFullWidth: true, class: { list: "gap-x-0" } }],
  defaultVariants: { variant: "underline", isFullWidth: false },
});

export interface TabItem {
  value: string;
  label: ReactNode;
  content: ReactNode;
  /** An inert section ("off today"): shown, not selectable, skipped by the arrow keys. */
  isDisabled?: boolean | undefined;
}

export interface TabsProps {
  /** Accessible name of the tab list, e.g. "Menu sections". */
  label: string;
  items: TabItem[];
  value?: string | undefined;
  /** Default: the first tab that is not disabled. */
  defaultValue?: string | undefined;
  onValueChange?: ((value: string) => void) | undefined;
  /** `underline` (design system) or the handoff's `segmented` pill rail. */
  variant?: "underline" | "segmented" | undefined;
  /** Share the row equally between the tabs, e.g. across a card. */
  isFullWidth?: boolean | undefined;
  className?: string | undefined;
}

/**
 * Switch sections inside one page. `underline` (design system): Poppins 700 with a 3px pink bar
 * under the active tab. `segmented` (handoff): a white pill rail with a pink active pill. For
 * filtering a list use FilterBar; for app navigation use TabBar.
 */
export function Tabs({
  label,
  items,
  value,
  defaultValue,
  onValueChange,
  variant,
  isFullWidth = false,
  className,
}: TabsProps) {
  const [selected, setSelected] = useControllableState({
    value,
    // A disabled tab is never the starting pick: its panel would open on a tab no one can select.
    defaultValue: defaultValue ?? items.find((item) => item.isDisabled !== true)?.value ?? "",
    onChange: onValueChange,
  });
  const styles = tabs({ variant, isFullWidth });

  return (
    <RadixTabs.Root
      value={selected}
      onValueChange={setSelected}
      className={styles.root({ className })}
    >
      <RadixTabs.List
        aria-label={label}
        data-surface={variant === "segmented" ? "light" : undefined}
        className={styles.list()}
      >
        {items.map((item) => (
          <RadixTabs.Trigger
            key={item.value}
            value={item.value}
            disabled={item.isDisabled === true}
            className={styles.trigger()}
          >
            {item.label}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {items.map((item) => (
        <RadixTabs.Content
          key={item.value}
          value={item.value}
          forceMount
          hidden={item.value !== selected}
          className={styles.panel()}
        >
          {item.content}
        </RadixTabs.Content>
      ))}
    </RadixTabs.Root>
  );
}
