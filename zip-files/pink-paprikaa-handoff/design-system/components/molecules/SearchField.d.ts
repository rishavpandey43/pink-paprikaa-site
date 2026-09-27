import type { CSSProperties, ChangeEventHandler } from "react";

export interface SearchFieldProps {
  value?: string;
  placeholder?: string;
  size?: "sm" | "md";
  /** Border + hint colour. */
  status?: "default" | "error" | "success" | "warning";
  disabled?: boolean;
  /** Trailing spinner while results load. */
  loading?: boolean;
  /** Small line under the field, e.g. "No matches for that." */
  hint?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onClear?: () => void;
  style?: CSSProperties;
}
export function SearchField(props: SearchFieldProps): JSX.Element;
