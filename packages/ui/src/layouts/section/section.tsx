import { PatternField } from "../../atoms/pattern-field/pattern-field";
import { type BaseProps, SURFACE_BG, SURFACE_DATA, type SurfaceProp } from "../../lib/common-props";
import { componentVariants } from "../../lib/component-variants";
import { withSx } from "../../lib/sx";
import { Container, type ContainerSize } from "../container/container";

const section = componentVariants({
  variants: {
    surface: SURFACE_BG,
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

export interface SectionProps extends BaseProps<"section"> {
  /** page · alt (pink-50) · sunken · soft (pink-100) · brand (flooded pink) · ink. Sets data-surface. */
  surface?: SurfaceProp | undefined;
  /** The diamond tile behind the band. `faint` (4%) is the handoff's ink-section texture. */
  pattern?: "none" | "default" | "faint" | undefined;
  /** Container size passed through; ignored when `isBare`. */
  size?: ContainerSize | undefined;
  /** Vertical rhythm: none · tight clamp(36,4vw,56) · default clamp(56,7vw,96) · loose clamp(72,9vw,128). */
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
  surface = "page",
  pattern = "none",
  size = "content",
  space = "default",
  isBare = false,
  sx,
  className,
  children,
  ...props
}: SectionProps) {
  // tsc -b TS2322: the spread `ref` is an HTMLElement ref, which a div ref rejects. A narrow cast,
  // not a looser type — every member of the `as` union is an HTMLElement with the same props shape.
  const Element = as as "section";
  const dataSurface = SURFACE_DATA[surface];
  const hasPattern = pattern !== "none";
  const content = isBare ? children : <Container size={size}>{children}</Container>;

  return (
    <Element
      data-surface={dataSurface}
      className={section({ surface, space, hasPattern, className: withSx(sx, className) })}
      {...props}
    >
      {hasPattern ? (
        <>
          <PatternField
            aria-hidden
            surface={dataSurface === "light" ? "page" : dataSurface}
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
