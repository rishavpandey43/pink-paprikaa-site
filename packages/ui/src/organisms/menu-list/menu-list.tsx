import type { ReactNode } from "react";

import type { BaseProps } from "../../lib/common-props";
import type { HeadingLevel } from "../../lib/heading";
import type { LinkAs } from "../../lib/link-as";

import { Divider } from "../../atoms/divider/divider";
import { componentVariants, type VariantProps } from "../../lib/component-variants";
import { isShown } from "../../lib/is-shown";
import { withSx } from "../../lib/sx";
import { MenuItemCard } from "../../molecules/menu-item-card/menu-item-card";
import { type MenuItemImage, MenuItemRow } from "../../molecules/menu-item-row/menu-item-row";
import { SectionHeader } from "../../molecules/section-header/section-header";
import { MenuListFilter } from "./menu-list-filter";

export interface MenuListItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string | undefined;
  spice?: 1 | 2 | 3 | 4 | undefined;
  badge?: string | undefined;
  was?: number | undefined;
  image?: MenuItemImage | undefined;
  /** Placeholder label while the photo is missing. */
  imageLabel?: string | undefined;
}

/** How many dishes show as cards before the grid variant hands over to rows (design system). */
const DEFAULT_GRID_COUNT = 4;

/** Dish headings sit one level below the section title. */
const CHILD_LEVEL: Readonly<Record<HeadingLevel, HeadingLevel>> = {
  1: 2,
  2: 3,
  3: 4,
  4: 5,
  5: 6,
  6: 6,
};

const menuList = componentVariants({
  slots: {
    root: "section-y",
    inner: "container-page",
    filter: "flex flex-col",
    cards: "mt-8 autogrid",
    card: "flex",
    cardBody: "flex-1",
    overflow: "",
    rows: "",
    empty: "mt-6",
  },
  variants: {
    variant: {
      grid: { overflow: "mt-12", rows: "mt-2" },
      list: { overflow: "mt-5" },
    },
    hasHeader: { true: { filter: "mt-7" } },
  },
  defaultVariants: { variant: "grid", hasHeader: true },
});

/** A dish's display props — the list's own fields (id, category) stay out of the card's DOM. */
function dishOf({ id: _id, category: _category, ...dish }: MenuListItem) {
  return dish;
}

export interface MenuListProps
  extends Omit<BaseProps<"section">, "title">, Pick<VariantProps<typeof menuList>, "variant"> {
  items: MenuListItem[];
  /** Filter order and subset; defaults to every category in the dishes, in order. "All" is always first. */
  categories?: string[] | undefined;
  allLabel?: string | undefined;
  /** The category chosen on arrival; "All" when omitted or not on offer. */
  defaultCategory?: string | undefined;
  /** Accessible name of the filter group. */
  filterLabel?: string | undefined;
  overline?: ReactNode;
  /** Omit (or pass null) for filters with no section header — the app pattern. */
  title?: ReactNode | null | undefined;
  /** One sentence under the heading (shown only with a `title`). */
  lede?: ReactNode;
  action?: ReactNode;
  /** How many dishes show as cards before rows take over. */
  gridCount?: number | undefined;
  /** Statement badge in the filter bar, e.g. "100% Vegetarian". */
  note?: ReactNode;
  /** Divider label above the overflow rows, e.g. "Also on the menu". */
  overflowLabel?: string | undefined;
  /** Shown for a category with no dishes. */
  emptyState?: ReactNode;
  /** Runs on the server with the organism: the dish's add/order control. */
  renderItemAction?: ((item: MenuListItem) => ReactNode) | undefined;
  /** Runs on the server with the organism: makes each card a link. */
  getItemHref?: ((item: MenuListItem) => string) | undefined;
  linkAs?: LinkAs | undefined;
  headingLevel?: HeadingLevel | undefined;
}

/**
 * The filterable menu section — use it rather than assembling cards by hand. Every dish is
 * rendered on the server, once per filter option; only the chosen option is client state.
 */
export function MenuList({
  items,
  categories,
  allLabel = "All",
  defaultCategory,
  filterLabel = "Filter the menu",
  overline,
  title,
  lede,
  action,
  variant = "grid",
  gridCount = DEFAULT_GRID_COUNT,
  note,
  overflowLabel,
  emptyState,
  renderItemAction,
  getItemHref,
  linkAs = "a",
  headingLevel = 2,
  sx,
  className,
  ...props
}: MenuListProps) {
  const hasHeader = isShown(title);
  const slots = menuList({ variant, hasHeader });
  const itemLevel = CHILD_LEVEL[headingLevel];
  const categoryNames = (categories ?? [...new Set(items.map((item) => item.category))]).filter(
    (name) => name !== allLabel
  );
  const options = [allLabel, ...categoryNames].map((name) => ({ value: name, label: name }));
  const initial =
    defaultCategory !== undefined && categoryNames.includes(defaultCategory)
      ? defaultCategory
      : allLabel;

  const panelFor = (dishes: MenuListItem[]): ReactNode => {
    if (dishes.length === 0) {
      return isShown(emptyState) ? <div className={slots.empty()}>{emptyState}</div> : null;
    }
    const cardDishes = variant === "grid" ? dishes.slice(0, gridCount) : [];
    const rowDishes = variant === "grid" ? dishes.slice(gridCount) : dishes;
    return (
      <>
        {cardDishes.length > 0 ? (
          <ul role="list" className={slots.cards()}>
            {cardDishes.map((item) => (
              <li key={item.id} className={slots.card()}>
                <MenuItemCard
                  {...dishOf(item)}
                  action={renderItemAction?.(item)}
                  href={getItemHref?.(item)}
                  linkAs={linkAs}
                  headingLevel={itemLevel}
                  className={slots.cardBody()}
                />
              </li>
            ))}
          </ul>
        ) : null}
        {rowDishes.length > 0 ? (
          <div className={slots.overflow()}>
            {variant === "grid" ? <Divider label={overflowLabel} /> : null}
            <ul role="list" className={slots.rows()}>
              {rowDishes.map((item, index) => (
                <li key={item.id}>
                  <MenuItemRow
                    {...dishOf(item)}
                    action={renderItemAction?.(item)}
                    hasDivider={index < rowDishes.length - 1}
                    headingLevel={itemLevel}
                  />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </>
    );
  };

  const panels = options.map(({ value }) => ({
    value,
    content: panelFor(value === allLabel ? items : items.filter((item) => item.category === value)),
  }));

  return (
    <section className={slots.root({ className: withSx(sx, className) })} {...props}>
      <div className={slots.inner()}>
        {hasHeader ? (
          <SectionHeader
            overline={overline}
            title={title}
            lede={lede}
            action={action}
            headingLevel={headingLevel}
          />
        ) : null}
        <MenuListFilter
          label={filterLabel}
          options={options}
          panels={panels}
          defaultValue={initial}
          note={note}
          className={slots.filter()}
        />
      </div>
    </section>
  );
}
