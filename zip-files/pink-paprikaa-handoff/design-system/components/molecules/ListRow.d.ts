import type { CSSProperties, ReactNode } from "react";

export interface ListRowProps {
  title?: string;
  description?: string;
  /** Leading element - overrides icon. */
  leading?: ReactNode;
  /** Lucide glyph on the left. */
  icon?: string;
  /** Right-aligned muted value, e.g. "Sector 57". */
  value?: string;
  /** Right-aligned control, e.g. a Switch. */
  trailing?: ReactNode;
  chevron?: boolean;
  divider?: boolean;
  /** Destructive row - "Delete my account". */
  danger?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
}
export function ListRow(props: ListRowProps): JSX.Element;
