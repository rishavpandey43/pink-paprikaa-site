import type { CSSProperties } from "react";

export interface PriceTagProps {
  /** Whole rupees. */
  amount: number;
  /** Original price, rendered struck through. */
  was?: number;
  /** Upper bound — renders "₹180–₹320". */
  to?: number;
  size?: "sm" | "md" | "lg";
  tone?: "ink" | "brand" | "inverse";
  style?: CSSProperties;
}
export function PriceTag(props: PriceTagProps): JSX.Element;
