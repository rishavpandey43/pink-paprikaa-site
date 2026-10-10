import type { CSSProperties, ReactNode } from "react";

export interface MenuItem {
  value: string;
  label: ReactNode;
  /** Plain text used for type-to-jump when label is not a string. */
  text?: string;
  description?: string;
  /** Leading Lucide icon. */
  icon?: string;
  /** Trailing mono text, e.g. a price. */
  meta?: string;
  disabled?: boolean;
  danger?: boolean;
}
export type MenuEntry = string | MenuItem | { divider: true } | { group: string };

export interface MenuProps {
  items?: MenuEntry[];
  /** Selected value (or values) — marked with the brand diamond in listbox mode. */
  value?: string | string[];
  onSelect?: (item: MenuItem) => void;
  open?: boolean;
  onClose?: (reason: string) => void;
  /** Focus the list and handle keys itself. Set false when an input owns focus (Combobox). */
  autoFocus?: boolean;
  activeIndex?: number;
  onActiveChange?: (index: number) => void;
  role?: "menu" | "listbox";
  id?: string;
  /** Path to /assets for the brand mark. */
  base?: string;
  emptyText?: string;
  title?: string;
  sheet?: "auto" | boolean;
  placement?: "bottom-start" | "bottom-end" | "top-start" | "top-end";
  inline?: boolean;
  width?: number | string;
  minWidth?: number;
  maxHeight?: number;
  style?: CSSProperties;
}
export function Menu(props: MenuProps): JSX.Element | null;
