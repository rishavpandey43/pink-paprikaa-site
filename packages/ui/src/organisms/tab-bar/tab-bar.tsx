import type { ComponentProps } from "react";

import type { LinkAs } from "../../lib/link-as";

import { Icon, type IconComponent } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";

export interface TabBarItem {
  value: string;
  label: string;
  icon: IconComponent;
  /** Badge count, e.g. cart items; 0 or omitted hides it. */
  count?: number | undefined;
  /** Makes the tab a link (rendered through `linkAs`); without it the tab is a button. */
  href?: string | undefined;
}

const tabBar = componentVariants({
  slots: {
    root: "h-tabbar border-t border-border-subtle bg-surface-card",
    list: "flex h-full",
    item: "flex min-w-0 flex-1",
    // The controls fill the bar edge to edge, so a ring drawn outside them is cut by the screen or
    // a phone frame's clip: it is drawn inset.
    control:
      "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 font-display text-tab-bar-label text-text-subtle no-underline transition-colors duration-fast ease-out hover:text-text-heading focus-visible:-outline-offset-4 active:press-scale",
    glyph: "relative inline-flex",
    label: "max-w-full truncate",
    count:
      "absolute -top-1 -right-2 grid h-tab-bar-count min-w-tab-bar-count place-items-center rounded-pill bg-surface-brand px-1 font-display text-tab-bar-count text-text-on-brand",
  },
  variants: {
    isActive: { true: { control: "font-bold text-text-brand hover:text-text-brand" } },
  },
});

export interface TabBarProps extends ComponentProps<"nav"> {
  /** Four or five destinations, never more. */
  items: TabBarItem[];
  value: string;
  /** Called by button tabs. Link tabs navigate instead. Only a client parent can pass it. */
  onValueChange?: ((value: string) => void) | undefined;
  linkAs?: LinkAs | undefined;
  /** The landmark's name. */
  label?: string | undefined;
}

/**
 * The app's fixed 64px bottom navigation. The active destination is brand pink with a bold label;
 * a count renders as a pink pill on the icon and is read out with the label ("Cart (2)").
 */
export function TabBar({
  items,
  value,
  onValueChange,
  linkAs: LinkComponent = "a",
  label = "Primary",
  className,
  ...props
}: TabBarProps) {
  const slots = tabBar();
  return (
    <nav aria-label={label} data-surface="light" className={slots.root({ className })} {...props}>
      <ul className={slots.list()}>
        {items.map((item) => {
          const isActive = item.value === value;
          const control = slots.control({ isActive });
          const hasCount = item.count !== undefined && item.count > 0;
          const content = (
            <>
              <span className={slots.glyph()}>
                <Icon icon={item.icon} size="lg" />
                {hasCount ? (
                  <span aria-hidden className={slots.count()}>
                    {item.count}
                  </span>
                ) : null}
              </span>
              <span className={slots.label()}>{item.label}</span>
              {/* The space sits outside the span: a name drops a child's edge whitespace. */}
              {hasCount ? (
                <>
                  {" "}
                  <span className="sr-only">({item.count})</span>
                </>
              ) : null}
            </>
          );
          return (
            <li key={item.value} className={slots.item()}>
              {item.href === undefined ? (
                <button
                  type="button"
                  aria-current={isActive ? "page" : undefined}
                  className={control}
                  onClick={
                    onValueChange === undefined
                      ? undefined
                      : () => {
                          onValueChange(item.value);
                        }
                  }
                >
                  {content}
                </button>
              ) : (
                <LinkComponent
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={control}
                >
                  {content}
                </LinkComponent>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
