import type { CSSProperties } from "react";

export interface IconProps {
  /** Lucide icon name, kebab-case (e.g. "shopping-bag", "map-pin"). */
  name: string;
  /** 14 / 16 / 20 / 24 / 32, or an explicit pixel number. */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
  /** Accessible label. Omit for decorative icons. */
  title?: string;
  style?: CSSProperties;
}
export function Icon(props: IconProps): JSX.Element;
