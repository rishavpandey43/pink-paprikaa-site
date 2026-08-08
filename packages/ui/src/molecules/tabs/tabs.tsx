"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Tabs as TabsPrimitive } from "radix-ui";

import { Icon } from "../../atoms/icon/icon";
import { componentVariants, type VariantProps } from "../../lib/component-variants";

const tabs = componentVariants({
  slots: {
    root: "flex w-full min-w-0 flex-col gap-6",
    // Scrolls rather than wraps: an underline row that wraps loses the single baseline the
    // underline is drawn against. At 360px four sections still reach with one thumb swipe.
    list: "flex w-full items-stretch gap-7 overflow-x-auto border-b border-border-subtle",
    trigger: [
      "group relative inline-flex min-h-(--layout-hit-min) shrink-0 cursor-pointer items-center",
      "justify-center gap-2 border-0 bg-transparent pb-3 whitespace-nowrap",
      "font-display font-bold text-body1 tracking-subtitle1 text-text-subtle",
      "transition-colors duration-(--duration-fast) ease-out",
      "not-disabled:hover:text-text-heading",
      "data-[state=active]:text-text-heading",
      "disabled:cursor-not-allowed disabled:text-text-subtle",
      // The 3px pink underline sits *on* the list's hairline, so the active tab reads as joined
      // to its panel rather than floating above it.
      "after:absolute after:inset-x-0 after:-bottom-px after:h-0.75 after:rounded-t-1",
      "after:bg-transparent after:transition-colors after:duration-(--duration-base) after:ease-out",
      "data-[state=active]:after:bg-brand-primary",
    ],
    panel: "min-w-0",
  },
  variants: {
    /**
     * Splits the row into equal shares. Use it for two or three short sections that should span
     * the card; leave it off for a real section list, where equal shares waste the long names.
     */
    isFullWidth: {
      true: { list: "gap-0", trigger: "flex-1" },
      false: {},
    },
  },
  defaultVariants: { isFullWidth: false },
});

export interface TabItem {
  /** Stable id for the section — what `value` and `onValueChange` speak in. */
  value: string;
  /** The section name, Title Case and short enough not to need two lines. */
  label: string;
  /** Lucide glyph before the label. */
  icon?: LucideIcon;
  /** The panel body. Leave it off when the tab only drives a list elsewhere on the page. */
  content?: ReactNode;
  /** Greys the tab out and takes it out of the arrow-key order. */
  isDisabled?: boolean;
}

export interface TabsProps
  extends Omit<TabsPrimitive.TabsProps, "children">, VariantProps<typeof tabs> {
  /** The sections, in the order they should read. */
  items: TabItem[];
  /**
   * Names the tab row for assistive tech — "Menu sections", "Outlet details". Without it the row
   * is announced as an unnamed tab list.
   */
  label?: string | undefined;
}

export function Tabs({
  className,
  items,
  label,
  isFullWidth,
  value,
  defaultValue,
  ...props
}: TabsProps) {
  const { root, list, trigger, panel } = tabs({ isFullWidth });

  // Radix declares `value` and `defaultValue` without `| undefined`, and the workspace runs
  // `exactOptionalPropertyTypes`, so an unset one has to be left off rather than passed through.
  // An uncontrolled set with nothing selected shows no panel at all, so the first tab opens.
  const rootProps: TabsPrimitive.TabsProps = {};
  if (value !== undefined) rootProps.value = value;
  if (defaultValue !== undefined) rootProps.defaultValue = defaultValue;
  const firstValue = items[0]?.value;
  if (value === undefined && defaultValue === undefined && firstValue !== undefined) {
    rootProps.defaultValue = firstValue;
  }

  return (
    <TabsPrimitive.Root className={root({ class: className })} {...rootProps} {...props}>
      <TabsPrimitive.List aria-label={label} className={list()}>
        {items.map((item) => (
          <TabsPrimitive.Trigger
            className={trigger()}
            disabled={item.isDisabled ?? false}
            key={item.value}
            value={item.value}
          >
            {item.icon ? <Icon icon={item.icon} size="sm" /> : null}
            {item.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {items.map((item) => (
        <TabsPrimitive.Content className={panel()} key={item.value} value={item.value}>
          {item.content}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
}
