import type { CSSProperties } from "react";

export interface TabItem { value: string; label: string }

export interface TabsProps {
  items?: (string | TabItem)[];
  value?: string;
  onChange?: (value: string) => void;
  style?: CSSProperties;
}
export function Tabs(props: TabsProps): JSX.Element;
