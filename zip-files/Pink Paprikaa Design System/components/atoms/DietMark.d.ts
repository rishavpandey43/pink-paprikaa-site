import type { CSSProperties } from "react";

export interface DietMarkProps {
  /** veg = green square + dot. egg = turmeric dot, for the few egg-containing bakes. */
  type?: "veg" | "egg";
  size?: number;
  style?: CSSProperties;
}
export function DietMark(props: DietMarkProps): JSX.Element;
