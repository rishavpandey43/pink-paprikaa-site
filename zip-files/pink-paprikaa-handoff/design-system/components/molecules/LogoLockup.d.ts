import type { CSSProperties } from "react";

export interface LogoLockupProps {
  tone?: "pink" | "white" | "badge";
  /** Rendered width in canvas px. Keep >= 200 so the tagline reads. */
  size?: number;
  /** false drops to the wordmark-only artwork. */
  /** Drop the tagline. Only for units under ~120px wide, where it cannot read. */
  tagline?: boolean;
  align?: "start" | "center";
  base?: string;
  style?: CSSProperties;
}
export function LogoLockup(props: LogoLockupProps): JSX.Element;
