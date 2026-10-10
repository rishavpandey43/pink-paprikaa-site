import type { CSSProperties } from "react";

export interface AvatarProps {
  /** Used for initials and the title attribute. */
  name?: string;
  src?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
  /** Lucide glyph instead of initials. */
  icon?: string;
  /** Pink halo, for the signed-in guest. */
  ring?: boolean;
  /** Show the name in our Tooltip on hover/focus (never the browser's title bubble). */
  tooltip?: boolean;
  style?: CSSProperties;
}
export function Avatar(props: AvatarProps): JSX.Element;
