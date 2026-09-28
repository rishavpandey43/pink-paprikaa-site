import type { ComponentProps } from "react";

import { componentVariants } from "../../lib/component-variants";
import { SymbolMark } from "../../lib/symbol-mark";

/** The loader is the bare brand mark, pulsing at 1.2s — never a gradient ring (readme §3.8). */
const spinner = componentVariants({
  slots: {
    root: "inline-flex",
    mark: "block shrink-0 motion-safe:animate-mark-pulse",
  },
  variants: {
    size: {
      sm: { mark: "size-spinner-sm" },
      md: { mark: "size-spinner-md" },
      lg: { mark: "size-spinner-lg" },
    },
    tone: {
      brand: { mark: "text-pink-500" },
      ink: { mark: "text-ink-900" },
      inverse: { mark: "text-ink-000" },
    },
  },
  defaultVariants: { size: "md", tone: "brand" },
});

export interface SpinnerProps extends ComponentProps<"span"> {
  size?: "sm" | "md" | "lg" | undefined;
  /** `inverse` is the white mark, for pink or ink panels. */
  tone?: "brand" | "ink" | "inverse" | undefined;
  /** The status announced to assistive tech. = "Loading" */
  label?: string | undefined;
}

/** Whole-view loading. For content with a known shape, Skeleton is the better default. */
export function Spinner({
  size = "md",
  tone = "brand",
  label = "Loading",
  className,
  ...props
}: SpinnerProps) {
  const styles = spinner({ size, tone });
  return (
    <span role="status" aria-label={label} className={styles.root({ className })} {...props}>
      <SymbolMark className={styles.mark()} />
    </span>
  );
}
