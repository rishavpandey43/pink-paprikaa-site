import type { CSSProperties, ReactNode } from "react";

/**
 * Page-opening hero band.
 */
export interface HeroBannerProps {
  overline?: string;
  title?: ReactNode;
  body?: string;
  /** One or two Buttons. */
  actions?: ReactNode;
  /** Short facts separated by the diamond glyph, e.g. ["Est. 2025","Sector 57, Gurgaon"]. */
  meta?: string[];
  image?: string;
  imageLabel?: string;
  tone?: "brand" | "ink" | "soft";
  /** "split" = copy + image · "center" = stacked, no image */
  layout?: "split" | "center";
  base?: string;
  style?: CSSProperties;
}
export function HeroBanner(props: HeroBannerProps): JSX.Element;
