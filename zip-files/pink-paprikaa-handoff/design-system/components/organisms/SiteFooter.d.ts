import type { CSSProperties } from "react";

export interface FooterColumn { heading: string; links: string[] }

/**
 * Flooded-pink site footer.
 */
export interface SiteFooterProps {
  columns?: FooterColumn[];
  blurb?: string;
  /** Lucide brand glyph names. */
  social?: string[];
  legal?: string;
  policies?: string[];
  /** Website, phone, email lines under the blurb. Defaults from brand.js; null hides. */
  contact?: string[] | null;
  base?: string;
  style?: CSSProperties;
}
export function SiteFooter(props: SiteFooterProps): JSX.Element;
