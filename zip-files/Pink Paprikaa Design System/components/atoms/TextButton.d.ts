import type { CSSProperties, MouseEventHandler, ReactNode } from "react";

export interface TextButtonProps {
  children?: ReactNode;
  /** Ink colour family. */
  tone?: "brand" | "neutral" | "danger";
  /** Surface it sits on: light page, dark ink (toasts/snackbars), or a flooded brand/status colour. */
  on?: "light" | "dark" | "brand";
  size?: "sm" | "md";
  /** Uppercase, tracked label — toast and snackbar actions. */
  caps?: boolean;
  icon?: string;
  iconAfter?: string;
  disabled?: boolean;
  loading?: boolean;
  /** Force a visual state — docs/specimens only. */
  state?: "hover" | "press" | "focus";
  type?: "button" | "submit" | "reset";
  onClick?: MouseEventHandler<HTMLButtonElement>;
  style?: CSSProperties;
}
export function TextButton(props: TextButtonProps): JSX.Element;
