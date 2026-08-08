import type { LucideIcon } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { Utensils } from "lucide-react";

import { Icon } from "../../atoms/icon/icon";
import { Logo } from "../../atoms/logo/logo";
import { Text } from "../../atoms/text/text";
import { componentVariants, type VariantProps } from "../../lib/component-variants";

const emptyState = componentVariants({
  slots: {
    root: "grid justify-items-center gap-2.5 text-center",
    /** Pink-300 rather than the full brand pink: the mark sets the mood, the copy does the work. */
    glyph: "mb-1 text-pink-300",
    symbol: "mb-1",
    action: "mt-2",
  },
  variants: {
    size: {
      md: { root: "px-5 py-10" },
      lg: { root: "px-6 py-16" },
    },
  },
  defaultVariants: { size: "md" },
});

/** The wordmark's diamond, at the size each layout wants. */
const SYMBOL_SIZE = { md: "md", lg: "lg" } as const;

export interface EmptyStateProps
  extends
    Omit<ComponentPropsWithoutRef<"div">, "color" | "title">,
    VariantProps<typeof emptyState> {
  /** Short and plain, never apologetic — "Nothing here yet." */
  title?: string | undefined;
  /** One line saying what to do next. Two short sentences in total, across both. */
  body?: string | undefined;
  /** The Lucide glyph, drawn at 32px. Ignored when `hasSymbol` is set. */
  icon?: LucideIcon | undefined;
  /** Swap the glyph for the brand diamond — the warmer of the two, and the default for a cart. */
  hasSymbol?: boolean | undefined;
  /** Exactly one control, usually a `Button`. Never two. */
  action?: ReactNode | undefined;
}

/**
 * The nothing-here state: an empty cart, a search that matched nothing, a first-time order list.
 * It always names what is missing and always says what to do next.
 */
export function EmptyState({
  className,
  title = "Nothing here yet.",
  body = "Let's fix that.",
  icon,
  hasSymbol = false,
  action,
  size,
  ...props
}: EmptyStateProps) {
  const slots = emptyState({ size });
  const Glyph = icon ?? Utensils;

  return (
    <div className={slots.root({ className })} {...props}>
      {hasSymbol ? (
        <Logo
          className={slots.symbol()}
          label=""
          size={SYMBOL_SIZE[size ?? "md"]}
          tone="brand"
          variant="symbol"
        />
      ) : (
        <Icon className={slots.glyph()} icon={Glyph} size="xl" />
      )}
      <Text as="p" variant={size === "lg" ? "h3" : "subtitle1"}>
        {title}
      </Text>
      {body === "" ? null : (
        <Text measure="narrow" tone="muted" variant="body2">
          {body}
        </Text>
      )}
      {action === undefined ? null : <div className={slots.action()}>{action}</div>}
    </div>
  );
}
