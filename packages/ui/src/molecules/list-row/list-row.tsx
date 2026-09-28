import type { ComponentProps, ElementType, ReactNode } from "react";

import { ChevronRight } from "lucide-react";
import { Slot } from "radix-ui";

import { Icon, type IconComponent } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";

const listRow = componentVariants({
  slots: {
    root: "-mx-3",
    row: "flex min-h-hit w-full min-w-0 items-center gap-3.5 rounded-sm px-3 py-3.5 text-start",
    icon: "text-text-muted",
    body: "grid min-w-0 flex-1 gap-0.5",
    title: "text-body-sm font-medium text-text-heading",
    description: "line-clamp-2 text-caption text-text-subtle",
    value: "shrink-0 text-body-sm text-text-muted",
    chevron: "text-ink-400",
  },
  variants: {
    hasDivider: { true: { root: "border-b border-border-subtle" } },
    isDanger: { true: { icon: "text-text-danger", title: "text-text-danger" } },
    isInteractive: {
      true: {
        // Hover tint and press feedback (dev parity) on a row rendered into a link or button.
        row: "cursor-pointer no-underline transition-colors duration-fast ease-out hover:bg-surface-page-alt active:press-scale",
      },
    },
  },
  defaultVariants: { hasDivider: true, isDanger: false, isInteractive: false },
});

export interface ListRowProps extends Omit<ComponentProps<"div">, "title"> {
  title: ReactNode;
  description?: ReactNode;
  /** Replaces the glyph, e.g. an Avatar. */
  leading?: ReactNode;
  icon?: IconComponent | undefined;
  /** Right-aligned muted value, e.g. "Sector 57". */
  value?: ReactNode;
  /** Right-aligned control, e.g. a Switch. Never combine with `asChild`. */
  trailing?: ReactNode;
  hasChevron?: boolean | undefined;
  hasDivider?: boolean | undefined;
  /** A destructive row — "Delete my account". */
  isDanger?: boolean | undefined;
  /** Render the row into its single child — an `<a>`, `next/link` or `<button>`. */
  asChild?: boolean | undefined;
}

/**
 * Settings, account and detail rows. Hairline separated — never a stack of cards — and at least
 * 44px tall. With `asChild` the whole row is the link or button, hover-tinted.
 */
export function ListRow({
  title,
  description,
  leading,
  icon,
  value,
  trailing,
  hasChevron = false,
  hasDivider = true,
  isDanger = false,
  asChild = false,
  className,
  children,
  ...props
}: ListRowProps) {
  const Row: ElementType = asChild ? Slot.Root : "div";
  const styles = listRow({ hasDivider, isDanger, isInteractive: asChild });
  const glyph =
    icon === undefined ? null : <Icon icon={icon} size="lg" className={styles.icon()} />;

  return (
    <div className={styles.root({ className })} {...props}>
      <Row className={styles.row()}>
        <Slot.Slottable child={children}>
          {(content) => (
            <>
              {leading ?? glyph}
              <span className={styles.body()}>
                <span className={styles.title()}>{title}</span>
                {description === undefined || description === null ? null : (
                  <span className={styles.description()}>{description}</span>
                )}
              </span>
              {value === undefined || value === null ? null : (
                <span className={styles.value()}>{value}</span>
              )}
              {trailing}
              {hasChevron ? (
                <Icon icon={ChevronRight} size="md" className={styles.chevron()} />
              ) : null}
              {content}
            </>
          )}
        </Slot.Slottable>
      </Row>
    </div>
  );
}
