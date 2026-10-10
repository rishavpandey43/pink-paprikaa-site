import type { CSSProperties } from "react";
import type { MenuItem } from "../atoms/Menu";

export interface ComboboxProps {
  label?: string;
  hint?: string;
  error?: boolean | string;
  success?: boolean | string;
  warning?: boolean | string;
  status?: "default" | "error" | "success" | "warning";
  options?: (string | MenuItem)[];
  value?: string;
  onChange?: (value: string, item: MenuItem) => void;
  placeholder?: string;
  /** Leading Lucide icon. Default "search". */
  icon?: string;
  emptyText?: string;
  /** Custom match. Default: case-insensitive "contains" on the label. */
  filter?: (item: MenuItem, query: string) => boolean;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  required?: boolean;
  optional?: boolean;
  name?: string;
  base?: string;
  /** Docs/specimens only. */
  defaultQuery?: string;
  defaultOpen?: boolean;
  style?: CSSProperties;
}
export function Combobox(props: ComboboxProps): JSX.Element;
