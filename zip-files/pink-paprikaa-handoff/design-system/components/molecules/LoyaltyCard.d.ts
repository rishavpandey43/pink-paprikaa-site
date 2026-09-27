import type { CSSProperties } from "react";

export interface LoyaltyCardProps {
  visits?: number;
  goal?: number;
  /** What the guest earns, lowercase: "chai", "a kulfi". */
  reward?: string;
  variant?: "feature" | "brand";
  base?: string;
  style?: CSSProperties;
}
export function LoyaltyCard(props: LoyaltyCardProps): JSX.Element;
