import type { CSSProperties, ReactNode } from "react";

export interface AccordionItem { q: string; a: ReactNode }

export interface AccordionProps {
  items?: AccordionItem[];
  /** Allow several panels open at once. */
  multiple?: boolean;
  /** Question strings to start open. */
  defaultOpen?: string[];
  style?: CSSProperties;
}
export function Accordion(props: AccordionProps): JSX.Element;
