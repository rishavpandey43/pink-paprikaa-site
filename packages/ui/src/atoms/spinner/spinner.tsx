import { useId } from "react";

import type { BasePropsWithColor } from "../../lib/common-props";
import { componentVariants } from "../../lib/component-variants";
import { withSx } from "../../lib/sx";
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
    color: {
      brand: { mark: "text-pink-500" },
      neutral: { mark: "text-ink-900" },
      inverse: { mark: "text-ink-000" },
    },
  },
  defaultVariants: { size: "md", color: "brand" },
});

export interface SpinnerProps extends Omit<BasePropsWithColor<"span">, "aria-label"> {
  /**
   * Not accepted: the status is named by `aria-labelledby`, which would silently outrank it — use
   * `label`. Declared `never` because JSX skips excess-property checks on hyphenated attributes.
   */
  "aria-label"?: never;
  size?: "sm" | "md" | "lg" | undefined;
  /** `inverse` is the white mark, for pink or ink panels. */
  color?: "brand" | "neutral" | "inverse" | undefined;
  /** The status announced to assistive tech. = "Loading" */
  label?: string | undefined;
}

/** Whole-view loading. For content with a known shape, Skeleton is the better default. */
export function Spinner({
  size = "md",
  color = "brand",
  label = "Loading",
  sx,
  className,
  ...props
}: SpinnerProps) {
  const styles = spinner({ size, color });
  const labelId = useId();
  // A live region announces its content, not its name: the label is sr-only text inside it,
  // and aria-labelledby points at that text so the status keeps its name (status is named by author only).
  return (
    <span
      role="status"
      aria-labelledby={labelId}
      className={styles.root({ className: withSx(sx, className) })}
      {...props}
    >
      <SymbolMark className={styles.mark()} />
      <span id={labelId} className="sr-only">
        {label}
      </span>
    </span>
  );
}
