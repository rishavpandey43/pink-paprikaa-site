import type { CSSProperties } from "react";

export interface SpiceLevelProps {
  /** 1 Mild · 2 Medium · 3 Hot · 4 Extra Hot. */
  level?: 1 | 2 | 3 | 4;
  max?: number;
  /** Show the uppercase Hinglish heat name beside the diamonds. */
  showLabel?: boolean;
  size?: number;
  style?: CSSProperties;
}
export function SpiceLevel(props: SpiceLevelProps): JSX.Element;
