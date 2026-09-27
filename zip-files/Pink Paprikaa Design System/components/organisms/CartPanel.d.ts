import type { CSSProperties } from "react";

export interface CartLine {
  name: string; price: number; qty: number;
  diet?: "veg" | "egg";
  /** Chosen options, e.g. "Sharing - Extra Hot". */
  note?: string;
}

/**
 * The order panel with totals and pay bar.
 */
export interface CartPanelProps {
  lines?: CartLine[];
  title?: string;
  /** Fulfilment line under the title. */
  meta?: string;
  /** Defaults to 0.05 (5% GST). */
  gstRate?: number;
  base?: string;
  onQty?: (name: string, qty: number) => void;
  onPlace?: () => void;
  onBrowse?: () => void;
  style?: CSSProperties;
}
export function CartPanel(props: CartPanelProps): JSX.Element;
