import type { CSSProperties, ReactNode } from "react";

export interface PatternFieldProps {
  tone?: "brand" | "ink" | "soft" | "light";
  /** Tile size in px — 96 on a 1080 canvas, 56–72 on screen. */
  tile?: number;
  /** Defaults to .08 on dark tones, .09 on light. Never above .12. */
  opacity?: number;
  /** Path to the assets folder, default "/assets". */
  base?: string;
  radius?: string;
  children?: ReactNode;
  style?: CSSProperties;
}
export function PatternField(props: PatternFieldProps): JSX.Element;
