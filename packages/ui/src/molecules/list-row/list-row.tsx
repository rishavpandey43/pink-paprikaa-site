import type { LucideIcon } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";

import { ChevronRight } from "lucide-react";

import { Icon } from "../../atoms/icon/icon";
import { Text } from "../../atoms/text/text";
import { componentVariants, type VariantProps } from "../../lib/component-variants";

const listRow = componentVariants({
  slots: {
    // Hairline separated, never a stack of cards. `min-h` holds the 44px hit target even when the
    // row carries a single short line.
    root: "flex w-full min-h-(--layout-hit-min) items-center gap-3 rounded-2 px-3 py-3 text-left",
    glyph: "text-text-muted",
    // `min-w-0` so a long title truncates instead of shoving the value and chevron off the row.
    body: "grid min-w-0 flex-1 gap-1",
    title: "font-medium",
    description: "",
    value: "shrink-0",
    chevron: "text-text-subtle",
  },
  variants: {
    /** Hairline under the row. Turn it off on the last row of a group. */
    hasDivider: { true: { root: "border-b border-border-subtle" }, false: {} },
    /** Destructive rows — "Delete my account". Colours the glyph and the title, nothing else. */
    isDanger: { true: { glyph: "text-status-danger", title: "text-status-danger" }, false: {} },
    /**
     * Set by `onClick`, not by the caller: an interactive row renders a real `<button>`, so it
     * takes the hover tint and the press treatment.
     */
    isInteractive: {
      true: {
        root: [
          "cursor-pointer transition-[background-color,transform] duration-(--duration-fast)",
          "ease-out not-disabled:hover:bg-brand-tint",
          "not-disabled:active:scale-(--motion-press-scale) not-disabled:active:bg-brand-soft",
        ],
      },
      false: {},
    },
  },
  defaultVariants: { hasDivider: true, isDanger: false, isInteractive: false },
});

export interface ListRowProps
  extends
    Omit<HTMLAttributes<HTMLElement>, "children" | "title">,
    Omit<VariantProps<typeof listRow>, "isInteractive"> {
  /** The row's label — sentence case, one line. */
  title: string;
  /** Second line explaining the row. Clamped to two lines. */
  description?: string | undefined;
  /** Leading element — a thumbnail or an avatar. Takes precedence over `icon`. */
  leading?: ReactNode | undefined;
  /** Lucide glyph on the left, used when there is no `leading` element. */
  icon?: LucideIcon | undefined;
  /** Right-aligned muted value, e.g. the currently chosen outlet. */
  value?: string | undefined;
  /**
   * Right-aligned element, e.g. a `Badge`. Never put a control here on a row that also has
   * `onClick` — the row is a `<button>` then, and a nested control is not reachable.
   */
  trailing?: ReactNode | undefined;
  /** Trailing chevron. Only ever on a row that navigates somewhere. */
  hasChevron?: boolean | undefined;
}

export function ListRow({
  className,
  description,
  hasChevron = false,
  hasDivider,
  icon,
  isDanger,
  leading,
  onClick,
  title,
  trailing,
  value,
  ...props
}: ListRowProps) {
  const isInteractive = onClick !== undefined;
  const parts = listRow({ hasDivider, isDanger, isInteractive });

  const content = (
    <>
      {leading ??
        (icon === undefined ? null : <Icon className={parts.glyph()} icon={icon} size="lg" />)}
      <span className={parts.body()}>
        <Text
          as="span"
          className={parts.title()}
          tone={isDanger ? "danger" : "heading"}
          variant="body2"
        >
          {title}
        </Text>
        {description === undefined ? null : (
          <Text
            as="span"
            className={parts.description()}
            lineClamp={2}
            tone="subtle"
            variant="caption"
          >
            {description}
          </Text>
        )}
      </span>
      {value === undefined ? null : (
        <Text as="span" className={parts.value()} tone="muted" variant="body2">
          {value}
        </Text>
      )}
      {trailing}
      {hasChevron ? <Icon className={parts.chevron()} icon={ChevronRight} size="md" /> : null}
    </>
  );

  // A real `<button>` rather than a `<div role="button">` with a hand-rolled key handler: Enter,
  // Space, focus and the disabled state all come for free and cannot drift.
  if (onClick === undefined) {
    return (
      <div className={parts.root({ className })} {...props}>
        {content}
      </div>
    );
  }

  return (
    <button className={parts.root({ className })} onClick={onClick} type="button" {...props}>
      {content}
    </button>
  );
}
