"use client";

import type { ComponentPropsWithoutRef } from "react";

import { Separator } from "radix-ui";

import { componentVariants, type VariantProps } from "../../lib/component-variants";
import { SYMBOL_PATHS, SYMBOL_VIEW_BOX } from "../logo/logo-paths";
import { Text } from "../text/text";

const divider = componentVariants({
  slots: {
    root: "flex w-full items-center gap-3",
    // `min-w-0` so a long label can never push the rules out of the row.
    rule: "h-px w-full min-w-0 flex-1 border-0",
    mark: "block size-4 shrink-0",
    caption: "shrink-0",
  },
  variants: {
    /** On a flooded pink or ink panel the hairline becomes a translucent white. */
    on: {
      light: { rule: "bg-border-subtle", mark: "text-text-brand" },
      brand: { rule: "bg-text-on-brand/30", mark: "text-text-on-brand" },
    },
  },
  defaultVariants: { on: "light" },
});

export interface DividerProps
  extends ComponentPropsWithoutRef<"div">, VariantProps<typeof divider> {
  /**
   * `line` is the hairline that separates menu rows — use it instead of wrapping every row in its
   * own card. `diamond` is the brand's section break.
   */
  variant?: "diamond" | "line" | undefined;
  /** Centres an ALL CAPS overline in the rule. Ignored by the `diamond` variant. */
  label?: string | undefined;
}

export function Divider({ className, label, on, variant = "line", ...props }: DividerProps) {
  const { caption, mark, root, rule } = divider({ on });

  // A bare rule carries the separator semantics itself; the composed variants below wrap their
  // rules in a plain row, because a `separator` role hides everything inside it from assistive
  // tech — which would silence the label.
  if (variant === "line" && label === undefined) {
    return <Separator.Root className={rule({ class: className })} {...props} />;
  }

  return (
    <div className={root({ class: className })} {...props}>
      <Separator.Root className={rule()} decorative />
      {variant === "diamond" ? (
        <svg
          aria-hidden
          className={mark()}
          fill="currentColor"
          viewBox={SYMBOL_VIEW_BOX}
          xmlns="http://www.w3.org/2000/svg"
        >
          {SYMBOL_PATHS.map((d) => (
            <path d={d} key={d} />
          ))}
        </svg>
      ) : (
        <Text className={caption()} tone={on === "brand" ? "onBrand" : "subtle"} variant="overline">
          {label}
        </Text>
      )}
      <Separator.Root className={rule()} decorative />
    </div>
  );
}
