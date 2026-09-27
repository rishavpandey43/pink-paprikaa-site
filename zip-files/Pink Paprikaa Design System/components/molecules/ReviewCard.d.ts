import type { CSSProperties } from "react";

export interface ReviewCardProps {
  name: string;
  /** Outlet and date, e.g. "Sector 57 - March". */
  meta?: string;
  /** The review text, without quote marks - the component adds them. */
  quote?: string;
  rating?: number;
  avatar?: string;
  variant?: "default" | "brand";
  /** Drop the diamond and use the bare mark for the score. Default false. */
  symbol?: boolean;
  base?: string;
  style?: CSSProperties;
}
export function ReviewCard(props: ReviewCardProps): JSX.Element;
