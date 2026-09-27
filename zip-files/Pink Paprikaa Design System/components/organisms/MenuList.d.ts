import type { CSSProperties, ReactNode } from "react";

export interface MenuListItem {
  name: string; price: number; cat?: string; description?: string;
  diet?: "veg" | "egg"; spice?: 1 | 2 | 3 | 4; badge?: string; was?: number; image?: string;
}

/**
 * The filterable menu section.
 */
export interface MenuListProps {
  items?: MenuListItem[];
  /** Defaults to "All" plus every distinct cat found in items. */
  categories?: string[];
  overline?: string;
  /** Pass null to render the filters with no section header. */
  title?: string | null;
  action?: ReactNode;
  /** "grid" = cards then an overflow list · "list" = rows only (the app pattern) */
  variant?: "grid" | "list";
  /** How many items show as cards before the list takes over. */
  gridCount?: number;
  /** Statement badge in the filter bar. */
  note?: string;
  /** Assets folder holding the brand symbol files. Default "/assets". */
  base?: string;
  onAdd?: (item: MenuListItem) => void;
  onOpen?: (item: MenuListItem) => void;
  style?: CSSProperties;
}
export function MenuList(props: MenuListProps): JSX.Element;
