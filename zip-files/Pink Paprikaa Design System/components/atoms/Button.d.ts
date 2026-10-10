import type { CSSProperties, MouseEventHandler, ReactNode } from "react";

/**
 * Primary call to action. Pill-shaped, Poppins 700, Title Case label.
 */
export interface ButtonProps {
  children?: ReactNode;
  /** primary = flooded pink; secondary = pink outline; ghost = text only; inverse = ink. */
  variant?: "primary" | "secondary" | "ghost" | "inverse";
  size?: "sm" | "md" | "lg";
  /** Set "brand" when the button sits on a flooded pink panel. */
  on?: "light" | "brand";
  /** Lucide icon name rendered before the label. */
  icon?: string;
  /** Lucide icon name rendered after the label. */
  iconAfter?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** Force a visual state — docs/specimens only. */
  state?: "hover" | "press" | "focus";
  style?: CSSProperties;
}
export function Button(props: ButtonProps): JSX.Element;
