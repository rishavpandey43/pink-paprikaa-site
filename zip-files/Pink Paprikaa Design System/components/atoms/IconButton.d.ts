import type { CSSProperties, MouseEventHandler } from "react";

export interface IconButtonProps {
  /** Lucide icon name. */
  icon: string;
  /** Required accessible label. */
  label: string;
  variant?: "primary" | "secondary" | "ghost" | "glass";
  size?: "xs" | "sm" | "md" | "lg";
  /** "tint" inherits the parent text colour — dismiss buttons inside Alerts. */
  on?: "light" | "brand" | "tint";
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** Force a visual state — docs/specimens only. */
  state?: "hover" | "press" | "focus";
  style?: CSSProperties;
}
export function IconButton(props: IconButtonProps): JSX.Element;
