import { type ComponentProps, useId } from "react";

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

export interface SpinnerProps extends Omit<ComponentProps<"span">, "aria-label"> {
  /**
   * Not accepted: the status is named by `aria-labelledby`, which would silently outrank it — use
   * `label`. Declared `never` because JSX skips excess-property checks on hyphenated attributes.
   */
  "aria-label"?: never;
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
  const labelId = useId();
  // A live region announces its content, not its name: the label is sr-only text inside it,
  // and aria-labelledby points at that text so the status keeps its name (status is named by author only).
  return (
    <span role="status" aria-labelledby={labelId} className={styles.root({ className })} {...props}>
      <SymbolMark className={styles.mark()} />
      <span id={labelId} className="sr-only">
        {label}
      </span>
    </span>
  );
}
