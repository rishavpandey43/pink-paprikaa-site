import type { ComponentProps } from "react";

import { PatternField } from "../../atoms/pattern-field/pattern-field";
import { componentVariants } from "../../lib/component-variants";
import { Container, type ContainerSize } from "../container/container";

export type SectionTone = "page" | "alt" | "sunken" | "soft" | "brand" | "ink";

/**
 * The surface each tone establishes. Light tones say `light` explicitly, so a light band nested in
 * a dark one restores dark text (the light island, spec §3.2.3) instead of inheriting white. The
 * same value is the PatternField tone, whose four tones are the surfaces.
 */
const SURFACE = {
  page: "light",
  alt: "light",
  sunken: "light",
  soft: "soft",
  brand: "brand",
  ink: "ink",
} as const satisfies Record<SectionTone, "light" | "soft" | "brand" | "ink">;

const section = componentVariants({
  variants: {
    tone: {
      page: "bg-surface-page",
      alt: "bg-surface-page-alt",
      sunken: "bg-surface-sunken",
      soft: "bg-surface-brand-soft",
      brand: "bg-surface-brand",
      ink: "bg-surface-inverse",
    },
    space: {
      none: "py-0",
      tight: "py-section-tight",
      default: "py-section",
      loose: "py-section-loose",
    },
    // The pattern layer is placed absolutely against the band.
    hasPattern: { true: "relative" },
  },
});

export interface SectionProps extends ComponentProps<"section"> {
  /** page · alt (pink-50) · sunken · soft (pink-100) · brand (flooded pink) · ink. Sets data-surface. */
  tone?: SectionTone | undefined;
  /** The diamond tile behind the band. `faint` (4%) is the handoff's ink-section texture. */
  pattern?: "none" | "default" | "faint" | undefined;
  /** Container size passed through; ignored when `isBare`. */
  size?: ContainerSize | undefined;
  /** Vertical rhythm: none · tight clamp(36,4vw,56) · default clamp(48,8vw,96) · loose clamp(72,9vw,128). */
  space?: "none" | "tight" | "default" | "loose" | undefined;
  /** Skip the Container — the child handles its own width. */
  isBare?: boolean | undefined;
  as?: "section" | "div" | "header" | "footer" | "aside" | undefined;
}

/**
 * One page band. It owns the background colour, the surface its content reads on and the vertical
 * rhythm, and it wraps content in a Container. At most two background colours per page:
 * white/alt plus one flooded brand or ink band.
 */
export function Section({
  as = "section",
  tone = "page",
  pattern = "none",
  size = "content",
  space = "default",
  isBare = false,
  className,
  children,
  ...props
}: SectionProps) {
  // tsc -b TS2322: the spread `ref` is an HTMLElement ref, which a div ref rejects. A narrow cast,
  // not a looser type — every member of the `as` union is an HTMLElement with the same props shape.
  const Element = as as "section";
  const surface = SURFACE[tone];
  const hasPattern = pattern !== "none";
  const content = isBare ? children : <Container size={size}>{children}</Container>;

  return (
    <Element
      data-surface={surface}
      className={section({ tone, space, hasPattern, className })}
      {...props}
    >
      {hasPattern ? (
        <>
          <PatternField
            aria-hidden
            tone={surface}
            density={pattern}
            className="pointer-events-none absolute inset-0 bg-transparent"
          />
          <div className="relative">{content}</div>
        </>
      ) : (
        content
      )}
    </Element>
  );
}
