import type { CSSProperties, ReactNode } from "react";

export interface AlertProps {
  tone?: "info" | "success" | "warning" | "danger" | "brand";
  title?: string;
  children?: ReactNode;
  /** Usually a small ghost Button. */
  action?: ReactNode;
  onDismiss?: () => void;
  style?: CSSProperties;
}
export function Alert(props: AlertProps): JSX.Element;
