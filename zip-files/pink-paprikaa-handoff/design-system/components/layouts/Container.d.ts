import type { CSSProperties, ReactNode } from "react";

export interface ContainerProps {
  children?: ReactNode;
  /** default 1200 - wide 1440 - prose 64ch - full 100% - or any CSS length. */
  size?: "default" | "wide" | "prose" | "full" | string;
  as?: string;
  /** Drop the gutters (for a child that must run edge to edge). */
  bleed?: boolean;
  style?: CSSProperties;
}
export function Container(props: ContainerProps): JSX.Element;
