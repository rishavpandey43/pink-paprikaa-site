import type { ComponentPropsWithoutRef } from "react";

import { componentVariants, type VariantProps } from "../../lib/component-variants";
import { SYMBOL_PATHS, SYMBOL_VIEW_BOX, WORDMARK_PATHS, WORDMARK_VIEW_BOX } from "./logo-paths";

const logo = componentVariants({
  slots: {
    root: "inline-flex shrink-0 items-center justify-center",
    // The marks carry `fill="currentColor"`, so the colourway is a text colour on the mark itself
    // and the same path data serves every tone. Width follows the viewBox so the lockup can never
    // be stretched.
    mark: "block w-auto",
  },
  variants: {
    variant: {
      wordmark: {},
      symbol: {},
    },
    tone: {
      brand: { mark: "text-text-brand" },
      white: { mark: "text-text-on-brand" },
      badge: { root: "bg-surface-brand", mark: "text-text-on-brand" },
    },
    /** Heights: 28 / 40 / 56px. The wordmark is ~1.9:1, so width follows. */
    size: {
      sm: { mark: "h-7" },
      md: { mark: "h-10" },
      lg: { mark: "h-14" },
    },
  },
  compoundVariants: [
    // The plate needs clear space around the mark — the guide sets it at the height of the "P".
    { tone: "badge", variant: "symbol", class: { root: "rounded-4 p-2" } },
    { tone: "badge", variant: "wordmark", class: { root: "rounded-4 px-4 py-3" } },
  ],
  defaultVariants: { variant: "wordmark", tone: "brand", size: "md" },
});

export interface LogoProps
  extends Omit<ComponentPropsWithoutRef<"span">, "children">, VariantProps<typeof logo> {
  /**
   * Accessible name. Defaults to the brand name; pass an empty string when the lockup sits beside
   * the words "Pink Paprikaa" in text, so the name is not announced twice.
   */
  label?: string | undefined;
}

export function Logo({
  className,
  label = "Pink Paprikaa",
  size,
  tone,
  variant = "wordmark",
  ...props
}: LogoProps) {
  const { mark, root } = logo({ size, tone, variant });
  const isDecorative = label === "";
  const paths = variant === "symbol" ? SYMBOL_PATHS : WORDMARK_PATHS;
  const viewBox = variant === "symbol" ? SYMBOL_VIEW_BOX : WORDMARK_VIEW_BOX;

  return (
    <span className={root({ class: className })} {...props}>
      <svg
        aria-hidden={isDecorative}
        aria-label={isDecorative ? undefined : label}
        className={mark()}
        fill="currentColor"
        role={isDecorative ? undefined : "img"}
        viewBox={viewBox}
        xmlns="http://www.w3.org/2000/svg"
      >
        {paths.map((d) => (
          <path d={d} key={d} />
        ))}
      </svg>
    </span>
  );
}
