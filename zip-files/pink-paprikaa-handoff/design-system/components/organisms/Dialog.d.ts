import type { CSSProperties, ReactNode } from "react";

export interface DialogProps {
  open?: boolean;
  title?: string;
  children?: ReactNode;
  /** Buttons, right-aligned. */
  footer?: ReactNode;
  /** Bottom-sheet presentation with a grab handle — the app default. */
  sheet?: boolean;
  width?: number;
  onClose?: () => void;
  style?: CSSProperties;
}
export function Dialog(props: DialogProps): JSX.Element | null;
