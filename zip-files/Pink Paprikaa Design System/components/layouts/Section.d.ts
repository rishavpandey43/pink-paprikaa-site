import type { CSSProperties, ReactNode } from "react";

export interface SectionProps {
  children?: ReactNode;
  /** page - alt (pink-50) - sunken - brand (flooded pink) - ink - or any CSS colour. */
  tone?: "page" | "alt" | "sunken" | "brand" | "ink" | string;
  /** Container size passed through. */
  size?: "default" | "wide" | "prose" | "full";
  /** Vertical rhythm: none - tight - default - loose. */
  space?: "none" | "tight" | "default" | "loose";
  /** Skip the Container (the child handles its own width). */
  bare?: boolean;
  as?: string;
  style?: CSSProperties;
}
export function Section(props: SectionProps): JSX.Element;
