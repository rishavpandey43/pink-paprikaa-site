import type { CSSProperties, ReactNode } from "react";

export interface SnackbarProps {
  open?: boolean;
  /** One short sentence. */
  children?: ReactNode;
  tone?: "ink" | "brand" | "success" | "danger";
  /** Override the tone's default Lucide glyph. */
  icon?: string;
  /** Uppercase text action, e.g. "UNDO". */
  action?: string;
  onAction?: () => void;
  /** Provide to show the dismiss button and enable auto-hide. */
  onClose?: () => void;
  /** Auto-hide delay in ms; 0 disables. Needs onClose. */
  duration?: number;
  position?: "bottom-center" | "bottom-left" | "bottom-right" | "top-center" | "top-right";
  /** Distance from the anchored edges. */
  inset?: number;
  width?: number;
  style?: CSSProperties;
}
export function Snackbar(props: SnackbarProps): JSX.Element | null;
