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
  style?: CSSProperties;
}
export function Avatar(props: AvatarProps): JSX.Element;
