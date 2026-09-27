import type { CSSProperties } from "react";

export interface FaqItem { q: string; a: string }

export interface FaqSectionProps {
  overline?: string;
  title?: string;
  lede?: string;
  items?: FaqItem[];
  /** Allow several answers open at once. */
  multiple?: boolean;
  style?: CSSProperties;
}
export function FaqSection(props: FaqSectionProps): JSX.Element;
