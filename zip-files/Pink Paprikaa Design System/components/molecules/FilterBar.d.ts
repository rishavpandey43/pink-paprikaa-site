import type { CSSProperties, ReactNode } from "react";

export interface FilterOption { value: string; label: string; icon?: string }

export interface FilterBarProps {
  options?: (string | FilterOption)[];
  value?: string;
  onChange?: (value: string) => void;
  /** Wrap to multiple rows instead of scrolling horizontally. */
  wrap?: boolean;
  /** A static statement badge pinned after the filters, e.g. "100% Vegetarian". */
  note?: string;
  trailing?: ReactNode;
  style?: CSSProperties;
}
export function FilterBar(props: FilterBarProps): JSX.Element;
