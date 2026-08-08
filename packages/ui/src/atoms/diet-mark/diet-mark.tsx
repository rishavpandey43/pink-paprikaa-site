import type { ComponentPropsWithoutRef } from "react";

import { componentVariants, type VariantProps } from "../../lib/component-variants";

const dietMark = componentVariants({
  slots: {
    // A square outline with a filled dot — the statutory Indian vegetarian mark. `shrink-0` keeps
    // it square inside a flex row that is running out of width.
    root: "inline-grid shrink-0 place-items-center rounded-1 border-2",
    // The dot inherits the outline's colour through `currentColor`, so a tone is set once.
    dot: "rounded-6 bg-current",
  },
  variants: {
    /**
     * `veg` is the green square-and-dot every item carries. `egg` is the turmeric dot used on the
     * few bakes that contain egg. There is deliberately no non-veg mark — the kitchen is 100%
     * vegetarian, and adding one would misdescribe the menu.
     */
    variant: {
      veg: { root: "border-status-success text-status-success" },
      egg: { root: "border-turmeric text-turmeric" },
    },
    /** 14 / 16 / 20px. `md` is the menu-row size; `sm` sits inline beside caption text. */
    size: {
      xs: { root: "size-3.5", dot: "size-1.5" },
      sm: { root: "size-4", dot: "size-2" },
      md: { root: "size-5", dot: "size-2.5" },
      lg: { root: "size-6", dot: "size-3" },
    },
  },
  defaultVariants: { variant: "veg", size: "md" },
});

/** What each mark is announced as when the caller does not override it. */
const DEFAULT_LABEL = { veg: "Vegetarian", egg: "Contains egg" } as const;

export interface DietMarkProps
  extends Omit<ComponentPropsWithoutRef<"span">, "children">, VariantProps<typeof dietMark> {
  /**
   * Accessible name. The default already says the right thing in English; override it only when
   * the surrounding copy needs different wording.
   */
  label?: string | undefined;
}

export function DietMark({ className, variant = "veg", size, label, ...props }: DietMarkProps) {
  const { root, dot } = dietMark({ variant, size });
  return (
    <span
      aria-label={label ?? DEFAULT_LABEL[variant]}
      className={root({ className })}
      role="img"
      {...props}
    >
      <span className={dot()} />
    </span>
  );
}
