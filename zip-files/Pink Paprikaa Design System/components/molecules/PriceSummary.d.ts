import type { CSSProperties } from "react";

export interface PriceLine {
  label: string;
  /** Whole rupees. */
  amount: number;
  /** Renders in mint with a leading minus. */
  discount?: boolean;
  /** Emphasise this line. */
  strong?: boolean;
}

export interface PriceSummaryProps {
  lines?: PriceLine[];
  total: number;
  totalLabel?: string;
  /** Fine print under the total, e.g. "Inclusive of all taxes." */
  note?: string;
  tone?: "light" | "inverse";
  style?: CSSProperties;
}
export function PriceSummary(props: PriceSummaryProps): JSX.Element;
