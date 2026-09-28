import type { ComponentProps, ReactNode } from "react";

import { Utensils } from "lucide-react";
import { createElement } from "react";

import { Icon, type IconComponent } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";
import { SymbolMark } from "../../lib/symbol-mark";

const emptyState = componentVariants({
  slots: {
    root: "grid justify-items-center gap-2.5 text-center",
    symbol: "mb-1 text-empty-state-symbol opacity-85",
    icon: "mb-1 text-empty-state-icon",
    title: "m-0 font-display text-text-heading",
    body: "m-0 max-w-text-measure-narrow text-body-sm text-text-muted",
    action: "mt-2",
  },
  variants: {
    size: {
      md: { root: "px-5 py-10", symbol: "size-10", title: "text-h4" },
      lg: {
        root: "px-6 py-16",
        symbol: "size-empty-state-symbol-lg",
        icon: "size-10",
        title: "text-h3",
      },
    },
  },
  defaultVariants: { size: "md" },
});

export interface EmptyStateProps extends Omit<ComponentProps<"div">, "title"> {
  /** Short and plain: "Nothing here yet." */
  title: ReactNode;
  /** One line that says what to do next. */
  body?: ReactNode;
  /** Lucide glyph for the icon variant (default Utensils). */
  icon?: IconComponent | undefined;
  /** `symbol` uses the brand diamond instead of a glyph — the warmer option. */
  variant?: "icon" | "symbol" | undefined;
  /** Exactly one action, usually a Button — never two. */
  action?: ReactNode;
  size?: "md" | "lg" | undefined;
  headingLevel?: HeadingLevel | undefined;
}

/** Empty cart, no search results, no orders yet. Always says what to do next; never apologetic. */
export function EmptyState({
  title,
  body,
  icon = Utensils,
  variant = "icon",
  action,
  size = "md",
  headingLevel = 3,
  className,
  ...props
}: EmptyStateProps) {
  const styles = emptyState({ size });

  return (
    <div className={styles.root({ className })} {...props}>
      {variant === "symbol" ? (
        <SymbolMark className={styles.symbol()} />
      ) : (
        <Icon icon={icon} size="xl" className={styles.icon()} />
      )}
      {/* createElement, not `const Heading = headingTag(…)`: the React Compiler lint reads a
          capitalised call result as a component created during render. */}
      {createElement(headingTag(headingLevel), { className: styles.title() }, title)}
      {body === undefined || body === null ? null : <p className={styles.body()}>{body}</p>}
      {action === undefined || action === null ? null : (
        <div className={styles.action()}>{action}</div>
      )}
    </div>
  );
}
