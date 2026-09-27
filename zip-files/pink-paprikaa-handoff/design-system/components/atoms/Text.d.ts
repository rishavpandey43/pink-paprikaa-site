import type { CSSProperties, ReactNode } from "react";

/**
 * The system's single typography primitive.
 */
export interface TextProps {
  children?: ReactNode;
  /** The type ramp step. */
  variant?: "display-1" | "display-2" | "h1" | "h2" | "h3" | "h4" | "body-lg" | "body" | "body-sm" | "caption" | "overline" | "mono";
  /** Semantic colour, or any CSS colour string. */
  tone?: "heading" | "body" | "muted" | "subtle" | "brand" | "inverse" | "on-brand" | "danger" | string;
  /** Override the rendered element. */
  as?: string;
  /** Override the ramp's weight (400-800). */
  weight?: number;
  align?: "left" | "center" | "right";
  /** Use the clamp() fluid size for this step — always do this in responsive layouts. */
  fluid?: boolean;
  /** Truncate to N lines. */
  clamp?: number;
  /** "prose" (64ch), "narrow" (44ch) or any CSS length. */
  measure?: "prose" | "narrow" | string;
  style?: CSSProperties;
}
export function Text(props: TextProps): JSX.Element;
