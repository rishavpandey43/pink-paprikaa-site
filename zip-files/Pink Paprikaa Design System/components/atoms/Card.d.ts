import type { CSSProperties, MouseEventHandler, ReactNode } from "react";

/**
 * Content container in the brand's five surface skins.
 */
export interface CardProps {
  children?: ReactNode;
  variant?: "default" | "feature" | "brand" | "ink" | "quiet";
  /** Inner padding in px. Pass 0 for full-bleed media cards. */
  padding?: number;
  /** Adds the −2px hover lift to --shadow-3. */
  interactive?: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
  style?: CSSProperties;
}
export function Card(props: CardProps): JSX.Element;
