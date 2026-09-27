import type { CSSProperties, ReactNode } from "react";

export interface SocialHeadlineProps {
  children?: ReactNode;
  /** hero 132 · h1 96 · h2 72 · body 34 · caption 26 · overline 24 (canvas px) */
  size?: "hero" | "h1" | "h2" | "body" | "caption" | "overline";
  on?: "brand" | "ink" | "soft" | "light";
  align?: "start" | "center" | "end";
  /** Measure cap, default 18ch — keeps headlines to 2–3 balanced lines. */
  max?: string;
  style?: CSSProperties;
}
export function SocialHeadline(props: SocialHeadlineProps): JSX.Element;
