import type { CSSProperties, ReactNode } from "react";

export interface EmptyStateProps {
  /** Short and plain: "Nothing here yet." */
  title?: string;
  /** One line that says what to do next. */
  body?: string;
  /** Lucide glyph. Ignored when symbol is set. */
  icon?: string;
  /** Use the brand diamond instead of an icon - the warmer option. */
  symbol?: boolean;
  /** Usually a single Button. */
  action?: ReactNode;
  size?: "md" | "lg";
  base?: string;
  style?: CSSProperties;
}
export function EmptyState(props: EmptyStateProps): JSX.Element;
