import type { CSSProperties } from "react";

export interface ProgressBarProps {
  value?: number;
  max?: number;
  /** Render as N discrete segments (loyalty stamps) instead of a continuous bar. */
  segments?: number;
  label?: string;
  tone?: "brand" | "mint" | "inverse";
  height?: number;
  style?: CSSProperties;
}
export function ProgressBar(props: ProgressBarProps): JSX.Element;
