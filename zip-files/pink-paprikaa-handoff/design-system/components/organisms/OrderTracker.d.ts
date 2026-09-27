import type { CSSProperties } from "react";

export interface OrderStep { label: string; note?: string }

/**
 * Live order status after checkout.
 */
export interface OrderTrackerProps {
  steps?: OrderStep[];
  /** Index of the current step. */
  current?: number;
  /** Order code, uppercase, without the hash. */
  code?: string;
  outlet?: string;
  total?: number;
  payment?: string;
  base?: string;
  onDone?: () => void;
  style?: CSSProperties;
}
export function OrderTracker(props: OrderTrackerProps): JSX.Element;
