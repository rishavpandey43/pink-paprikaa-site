import type { CSSProperties } from "react";

export interface WallReview { name: string; quote: string; meta?: string; rating?: number; avatar?: string }

export interface TestimonialWallProps {
  overline?: string;
  title?: string;
  reviews?: WallReview[];
  /** Assets folder holding the brand symbol files. Default "/assets". */
  base?: string;
  variant?: "default" | "brand";
  style?: CSSProperties;
}
export function TestimonialWall(props: TestimonialWallProps): JSX.Element;
