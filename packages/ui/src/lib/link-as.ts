import type { ElementType, MouseEventHandler, ReactNode } from "react";

/**
 * What a link-list component (footer, header, breadcrumb, tab bar) hands to each link it renders.
 * Only props a plain `<a>` and every router link both accept, so the system never knows routers.
 */
export interface LinkAsProps {
  href: string;
  className?: string | undefined;
  children?: ReactNode;
  "aria-current"?: "page" | "step" | "true" | undefined;
  onClick?: MouseEventHandler<HTMLAnchorElement> | undefined;
}

/** The element or component a link list renders its links with — `"a"` by default, or `next/link`. */
export type LinkAs = ElementType<LinkAsProps>;
