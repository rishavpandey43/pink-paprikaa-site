import type { CSSProperties } from "react";

export interface BreadcrumbItem { label: string; href?: string }

export interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  style?: CSSProperties;
}
export function Breadcrumb(props: BreadcrumbProps): JSX.Element;
