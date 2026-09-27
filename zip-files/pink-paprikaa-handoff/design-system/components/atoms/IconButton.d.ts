import type { CSSProperties, MouseEventHandler } from "react";

export interface IconButtonProps {
  /** Lucide icon name. */
  icon: string;
  /** Required accessible label. */
  label: string;
  variant?: "primary" | "secondary" | "ghost" | "glass";
  size?: "sm" | "md" | "lg";
  on?: "light" | "brand";
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  style?: CSSProperties;
}
export function IconButton(props: IconButtonProps): JSX.Element;
