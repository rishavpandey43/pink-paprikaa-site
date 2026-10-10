import type { CSSProperties, MouseEventHandler, ReactNode } from "react";

export interface LinkProps {
  children?: ReactNode;
  href?: string;
  /** default = pink underline · subtle = muted · inverse = on pink/ink · quiet = nav links */
  variant?: "default" | "subtle" | "inverse" | "quiet";
  size?: "sm" | "md" | "lg";
  icon?: string;
  iconAfter?: string;
  /** Opens in a new tab and appends the arrow glyph. */
  external?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  disabled?: boolean;
  /** Force a visual state — docs/specimens only. */
  state?: "hover" | "press" | "focus";
  style?: CSSProperties;
}
export function Link(props: LinkProps): JSX.Element;
