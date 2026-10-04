import type { CSSProperties, ReactNode } from "react";

export interface ToastProps {
  children?: ReactNode;
  tone?: "brand" | "ink" | "success" | "danger";
  /** Override the tone's default Lucide glyph. */
  icon?: string;
  /** Uppercase inline action label, e.g. "VIEW CART". */
  action?: string;
  onAction?: () => void;
  /** Play the single-overshoot --ease-pop entrance (add-to-cart only). */
  pop?: boolean;
  actionDisabled?: boolean;
  /** Force the action's visual state — docs only. */
  actionState?: "hover" | "press" | "focus";
  style?: CSSProperties;
}
export function Toast(props: ToastProps): JSX.Element;
