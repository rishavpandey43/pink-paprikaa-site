import type { CSSProperties } from "react";

export interface StatBandItem { value: string; label: string; sub?: string; icon?: string }

export interface StatBandProps {
  /** Three or four items. More than four reads as noise. */
  stats?: StatBandItem[];
  tone?: "soft" | "brand" | "ink";
  base?: string;
  style?: CSSProperties;
}
export function StatBand(props: StatBandProps): JSX.Element;
