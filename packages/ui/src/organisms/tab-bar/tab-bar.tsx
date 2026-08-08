"use client";

import type { LucideIcon } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";

import { useState } from "react";

import { Icon } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";

const tabBar = componentVariants({
  slots: {
    root: "w-full shrink-0 border-t border-border-subtle bg-surface-card",
    // The bar is exactly 64px (`--layout-tabbar-h`) and never grows: it is chrome, and a taller
    // one eats the screen the menu is meant to fill.
    list: "m-0 flex h-(--layout-tabbar-h) w-full min-w-0 list-none p-0",
    item: "flex min-w-0 flex-1",
    trigger: [
      "grid h-full w-full min-w-0 min-h-(--layout-hit-min) cursor-pointer",
      "place-items-center content-center gap-1 border-0 bg-transparent px-1",
      "transition-colors duration-(--duration-fast) ease-out",
      "not-disabled:active:scale-(--motion-press-scale)",
      "not-disabled:active:duration-(--duration-instant)",
    ],
    /** Positions the count pill against the glyph rather than the whole destination. */
    glyph: "relative inline-flex",
    /** The waiting count, drawn as a pink pill on the glyph — decorative, announced below. */
    count: [
      "absolute -top-1 -right-2 grid h-4.5 min-w-4.5 place-items-center rounded-6 px-1",
      "bg-brand-primary font-display font-bold text-overline leading-overline text-text-on-brand",
    ],
    label: "max-w-full truncate font-display text-overline leading-overline",
  },
  variants: {
    /** Derived from `value`, never passed — the bar decides which destination it is on. */
    isActive: {
      true: { trigger: "text-text-brand", label: "font-bold" },
      false: { trigger: "text-text-muted not-disabled:hover:text-text-link", label: "font-medium" },
    },
  },
  defaultVariants: { isActive: false },
});

export interface TabBarItem {
  /** Stable id for the destination — what `value` and `onValueChange` speak in. */
  value: string;
  /** One word where possible: it sits under a 24px glyph in an 11.5px label. */
  label: string;
  /** The Lucide glyph itself, imported by name: `import { House } from "lucide-react"`. */
  icon: LucideIcon;
  /** A waiting count, e.g. items in the cart. Announced as "2 items" after the label. */
  count?: number;
}

export interface TabBarProps extends Omit<ComponentPropsWithoutRef<"nav">, "onChange"> {
  /** Four or five destinations, never more — six will not clear the 44px hit target at 360px. */
  items: TabBarItem[];
  /** The destination in view. Pass it with `onValueChange` to drive the bar from the router. */
  value?: string | undefined;
  /** Where the bar starts when it keeps its own state. Defaults to the first destination. */
  defaultValue?: string | undefined;
  /** Fires with the destination the guest tapped, controlled or not. */
  onValueChange?: ((value: string) => void) | undefined;
  /** Names the bar for assistive tech. "Primary" unless the screen has two navigations. */
  label?: string | undefined;
}

/**
 * The ordering app's fixed bottom navigation: a 64px bar of four or five destinations, the one in
 * view in pink with a Poppins Bold label. It is a `<nav>` of links-as-buttons, not a tab list —
 * each destination is a page, so the active one carries `aria-current="page"`.
 */
export function TabBar({
  className,
  defaultValue,
  items,
  label = "Primary",
  onValueChange,
  value,
  ...props
}: TabBarProps) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? items[0]?.value);
  const current = value ?? internalValue;
  const { list, root } = tabBar();

  return (
    <nav aria-label={label} className={root({ class: className })} {...props}>
      <ul className={list()}>
        {items.map((item) => {
          const isActive = item.value === current;
          const slots = tabBar({ isActive });

          return (
            <li className={slots.item()} key={item.value}>
              <button
                aria-current={isActive ? "page" : undefined}
                className={slots.trigger()}
                onClick={() => {
                  if (value === undefined) {
                    setInternalValue(item.value);
                  }
                  onValueChange?.(item.value);
                }}
                type="button"
              >
                <span className={slots.glyph()}>
                  <Icon icon={item.icon} size="lg" />
                  {item.count === undefined ? null : (
                    <span aria-hidden className={slots.count()}>
                      {item.count}
                    </span>
                  )}
                </span>
                <span className={slots.label()}>{item.label}</span>
                {/*
                 * The pill is decorative — the count is announced here instead, after the label,
                 * so the destination reads "Cart, 2 items" rather than "2 Cart". The leading comma
                 * is load-bearing: accessible-name computation concatenates sibling text with no
                 * separator, so without it the name runs together as "Cart2 items".
                 */}
                {item.count === undefined ? null : (
                  <span className="sr-only">
                    {item.count === 1 ? ", 1 item" : `, ${String(item.count)} items`}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
