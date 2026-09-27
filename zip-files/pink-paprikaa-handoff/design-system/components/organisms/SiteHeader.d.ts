import type { CSSProperties } from "react";

/**
 * The website masthead.
 */
export interface SiteHeaderProps {
  /** Nav labels. The list shortens automatically below 1280 / 1080 / 860px. */
  links?: string[];
  /** Cart count badge; 0 hides it. */
  cart?: number;
  /** Switches to the translucent blurred treatment. */
  scrolled?: boolean;
  base?: string;
  onOrder?: () => void;
  onBook?: () => void;
  onSearch?: () => void;
  onCart?: () => void;
  style?: CSSProperties;
}
export function SiteHeader(props: SiteHeaderProps): JSX.Element;
