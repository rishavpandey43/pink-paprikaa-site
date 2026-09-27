import type { CSSProperties, ReactNode } from "react";

export interface BadgeProps {
  children?: ReactNode;
  tone?: "brand" | "soft" | "ink" | "success" | "warning" | "danger" | "neutral";
  /** Optional 12px Lucide glyph. */
  icon?: string;
  style?: CSSProperties;
}
export function Badge(props: BadgeProps): JSX.Element;
