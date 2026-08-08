"use client";

import { type ComponentPropsWithoutRef, useId } from "react";

import { componentVariants, type VariantProps } from "../../lib/component-variants";
import { SYMBOL_PATHS, SYMBOL_VIEW_BOX } from "../logo/logo-paths";

const patternField = componentVariants({
  slots: {
    // `isolate` keeps the texture layer's stacking context inside the panel, so a card that
    // overlaps the field cannot slide underneath it.
    root: "relative isolate overflow-hidden",
    // The texture is the diamond symbol and nothing else — no noise, no grain, no gradient. Colour
    // comes from `currentColor` on the layer, opacity from the tone (never above 12%).
    texture: "pointer-events-none absolute inset-0 size-full",
    content: "relative h-full",
  },
  variants: {
    tone: {
      brand: { root: "bg-surface-brand", texture: "text-text-on-brand opacity-8" },
      ink: { root: "bg-surface-inverse", texture: "text-text-on-inverse opacity-8" },
      soft: { root: "bg-surface-brand-soft", texture: "text-text-brand opacity-9" },
      light: { root: "bg-surface-card", texture: "text-text-brand opacity-9" },
    },
    radius: {
      none: {},
      md: { root: "rounded-4" },
      lg: { root: "rounded-5" },
    },
  },
  defaultVariants: { tone: "brand", radius: "none" },
});

export interface PatternFieldProps
  extends ComponentPropsWithoutRef<"div">, VariantProps<typeof patternField> {
  /**
   * Tile edge in px. 56–72 on screen, 96 on a 1080 marketing canvas. It is a number rather than a
   * class because it lands on the SVG pattern's own geometry, which no token can express.
   */
  tile?: number | undefined;
}

export function PatternField({
  children,
  className,
  radius,
  tile = 64,
  tone,
  ...props
}: PatternFieldProps) {
  // `useId()` includes punctuation React reserves; strip it so the value is a legal SVG fragment
  // reference, and unique per instance so two fields on one page cannot share a paint server.
  const patternId = `pp-pattern-field-${useId().replace(/\W/g, "")}`;
  const { content, root, texture } = patternField({ radius, tone });

  return (
    <div className={root({ class: className })} {...props}>
      <svg aria-hidden className={texture()} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            height={tile}
            id={patternId}
            patternUnits="userSpaceOnUse"
            viewBox={SYMBOL_VIEW_BOX}
            width={tile}
          >
            {SYMBOL_PATHS.map((d) => (
              <path d={d} fill="currentColor" key={d} />
            ))}
          </pattern>
        </defs>
        <rect fill={`url(#${patternId})`} height="100%" width="100%" />
      </svg>
      <div className={content()}>{children}</div>
    </div>
  );
}
