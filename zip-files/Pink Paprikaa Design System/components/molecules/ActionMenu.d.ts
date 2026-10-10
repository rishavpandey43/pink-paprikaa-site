import type { CSSProperties } from "react";
import type { MenuEntry, MenuItem } from "../atoms/Menu";

export interface ActionMenuProps {
  items?: MenuEntry[];
  onSelect?: (value: string, item: MenuItem) => void;
  /** Accessible label for the trigger. */
  label?: string;
  icon?: string;
  variant?: "primary" | "secondary" | "ghost" | "glass";
  size?: "sm" | "md" | "lg";
  on?: "light" | "brand";
  placement?: "bottom-start" | "bottom-end" | "top-start" | "top-end";
  sheet?: "auto" | boolean;
  title?: string;
  minWidth?: number;
  defaultOpen?: boolean;
  style?: CSSProperties;
}
export function ActionMenu(props: ActionMenuProps): JSX.Element;
