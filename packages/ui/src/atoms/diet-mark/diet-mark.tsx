import type { ComponentProps } from "react";

import { componentVariants } from "../../lib/component-variants";

const dietMark = componentVariants({
  base: "inline-flex shrink-0 text-veg",
  variants: {
    size: { sm: "size-diet-mark-sm", md: "size-diet-mark-md", lg: "size-diet-mark-lg" },
  },
  defaultVariants: { size: "md" },
});

export interface DietMarkProps extends ComponentProps<"span"> {
  /** sm 14px (beside a dish name) · md 16px · lg 20px. = "md" */
  size?: "sm" | "md" | "lg" | undefined;
  /** = "Vegetarian" */
  label?: string | undefined;
}

/**
 * The statutory Indian vegetarian mark: a green square outline with a green dot at half its size.
 * The only diet mark in this system — the kitchen is pure veg, not even egg (spec C10). The
 * outline keeps a 1.5px stroke at every size (non-scaling stroke), as the design system's border.
 */
export function DietMark({
  size = "md",
  label = "Vegetarian",
  className,
  ...props
}: DietMarkProps) {
  return (
    <span role="img" aria-label={label} className={dietMark({ size, className })} {...props}>
      <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" className="size-full">
        <rect
          x="0.75"
          y="0.75"
          width="14.5"
          height="14.5"
          rx="2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx="8" cy="8" r="4" fill="currentColor" />
      </svg>
    </span>
  );
}
