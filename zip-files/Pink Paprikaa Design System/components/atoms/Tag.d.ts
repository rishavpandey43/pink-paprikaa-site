import type { CSSProperties, MouseEventHandler, ReactNode } from "react";

export interface TagProps {
  children?: ReactNode;
  /** Selected pills flood pink. */
  selected?: boolean;
  icon?: string;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** Force a visual state — docs/specimens only. */
  state?: "hover" | "press" | "focus";
  style?: CSSProperties;
}
export function Tag(props: TagProps): JSX.Element;
