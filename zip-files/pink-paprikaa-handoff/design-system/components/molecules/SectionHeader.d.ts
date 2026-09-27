import type { CSSProperties, ReactNode } from "react";

export interface SectionHeaderProps {
  /** Uppercase eyebrow. */
  overline?: string;
  title?: ReactNode;
  /** One-sentence lede, max ~20 words. */
  lede?: string;
  /** Trailing element, usually a ghost Button. Ignored when centred. */
  action?: ReactNode;
  align?: "start" | "center";
  on?: "light" | "brand";
  style?: CSSProperties;
}
export function SectionHeader(props: SectionHeaderProps): JSX.Element;
