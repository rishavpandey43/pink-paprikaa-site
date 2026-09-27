import type { CSSProperties } from "react";

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: string;
  /** Pill/round placeholder for avatars and chips. */
  circle?: boolean;
  /** Render N stacked text lines with varied widths. */
  lines?: number;
  style?: CSSProperties;
}
export function Skeleton(props: SkeletonProps): JSX.Element;
