import type { CSSProperties, ReactNode, MouseEventHandler } from "react";

export interface PaginationProps {
  page?: number;
  pages?: number;
  onChange?: (page: number) => void;
  style?: CSSProperties;
}
export function Pagination(props: PaginationProps): JSX.Element;

/** One page button (also exported for custom pagers). Rest / hover / press / focus / current / disabled. */
export interface PageButtonProps {
  children?: ReactNode;
  current?: boolean;
  disabled?: boolean;
  label?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** Force a visual state — docs/specimens only. */
  state?: "hover" | "press" | "focus";
}
export function PageButton(props: PageButtonProps): JSX.Element;
