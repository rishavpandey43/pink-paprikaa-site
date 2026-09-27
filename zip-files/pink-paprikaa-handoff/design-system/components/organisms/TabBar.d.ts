import type { CSSProperties } from "react";

export interface TabBarItem {
  value: string;
  label: string;
  /** Lucide icon name. */
  icon: string;
  /** Badge count, e.g. cart items. */
  count?: number;
}

export interface TabBarProps {
  items?: TabBarItem[];
  value?: string;
  onChange?: (value: string) => void;
  style?: CSSProperties;
}
export function TabBar(props: TabBarProps): JSX.Element;
