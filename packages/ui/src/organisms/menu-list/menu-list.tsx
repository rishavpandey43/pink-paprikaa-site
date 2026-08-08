"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { useState } from "react";

import { Divider } from "../../atoms/divider/divider";
import { componentVariants, type VariantProps } from "../../lib/component-variants";
import { EmptyState } from "../../molecules/empty-state/empty-state";
import { FilterBar } from "../../molecules/filter-bar/filter-bar";
import { MenuItemCard } from "../../molecules/menu-item-card/menu-item-card";
import { MenuItemRow } from "../../molecules/menu-item-row/menu-item-row";
import { SectionHeader } from "../../molecules/section-header/section-header";

const menuList = componentVariants({
  slots: {
    root: "w-full",
    inner: [
      "mx-auto w-full max-w-(--layout-container-max)",
      "px-(--layout-gutter-fluid) py-(--layout-section-y-fluid)",
    ],
    filters: "",
    /**
     * `min(260px,100%)` is what keeps the section alive at 360px: a bare `1fr` track has a
     * min-content floor, so one long dish name would push the row wider than the viewport.
     */
    grid: [
      "mt-8 grid gap-(--layout-gap-grid)",
      "grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))]",
    ],
    overflow: "mt-12",
    rows: "mt-2",
    list: "mt-5",
    empty: "mt-6",
  },
  variants: {
    hasHeader: { true: { filters: "mt-7" }, false: { filters: "" } },
  },
  defaultVariants: { hasHeader: true },
});

/** The category pill that means "show everything". */
const ALL_CATEGORY = "All";

/**
 * The fields a dish hands straight to `MenuItemCard` / `MenuItemRow`.
 *
 * They are spread in conditionally rather than passed as `badge={item.badge}`: the workspace runs
 * `exactOptionalPropertyTypes`, so handing an optional prop an explicit `undefined` is an error.
 */
function dishProps(item: MenuListItem) {
  return {
    name: item.name,
    price: item.price,
    ...(item.was === undefined ? {} : { was: item.was }),
    ...(item.description === undefined ? {} : { description: item.description }),
    ...(item.diet === undefined ? {} : { diet: item.diet }),
    ...(item.spice === undefined ? {} : { spice: item.spice }),
    ...(item.badge === undefined ? {} : { badge: item.badge }),
    ...(item.image === undefined ? {} : { image: item.image }),
  };
}

/** One dish, exactly as the kitchen prints it. */
export interface MenuListItem {
  /** The dish, in Title Case. Doubles as the list key, so it must be unique in `items`. */
  name: string;
  /** Live price in whole rupees. */
  price: number;
  /** Pre-discount price, printed struck through after the live one. */
  was?: number;
  /** The category the filter pills derive from — "Small Plates", "Chai & Coffee". */
  category?: string;
  /** Ingredient-led, at most fourteen words. */
  description?: string;
  /** Always pass it — the mark is what makes a 100% vegetarian kitchen legible at a glance. */
  diet?: "veg" | "egg";
  /** 1 Mild · 2 Medium · 3 Hot · 4 Extra Hot. Omit it on anything that carries no heat. */
  spice?: 1 | 2 | 3 | 4;
  /** One short marker — "Bestseller", "New". Never more than one. */
  badge?: string;
  /** The dish photograph. Leave it off and the labelled placeholder holds the space. */
  image?: string;
  /** The dish's own page. Passing it turns the whole card into one link. */
  href?: string;
}

export interface MenuListProps
  extends
    Omit<ComponentPropsWithoutRef<"section">, "onChange" | "title">,
    VariantProps<typeof menuList> {
  /** The dishes, in the order the kitchen wants them read. */
  items: MenuListItem[];
  /** Override the derived pills. By default it is "All" plus every distinct `category`. */
  categories?: string[] | undefined;
  /** ALL CAPS eyebrow over the heading. */
  overline?: string | undefined;
  /** The section heading. Omit it and the filters render with no header at all. */
  title?: string | undefined;
  /** One-sentence lede under the heading. */
  lede?: string | undefined;
  /** Trailing element in the header, usually a ghost `Button`. */
  action?: ReactNode | undefined;
  /** The heading level so the page outline never skips a step. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6 | undefined;
  /**
   * `grid` is the website — cards first, then the rest as rows. `list` is the app pattern: rows
   * only, which is also what a phone gets the most menu onto one screen with.
   */
  variant?: "grid" | "list" | undefined;
  /** How many dishes show as cards before the overflow list takes over. Ignored by `list`. */
  gridCount?: number | undefined;
  /** The standing statement pinned after the pills. Not a filter. */
  note?: string | undefined;
  /** The selected category. Pass it with `onCategoryChange` to drive the filter from outside. */
  category?: string | undefined;
  /** The category selected on first render when the component owns its own state. */
  defaultCategory?: string | undefined;
  /** Called with the category a pill selects. */
  onCategoryChange?: ((category: string) => void) | undefined;
  /** Called with the dish behind the Add control. Omit it and no Add control is drawn. */
  onAdd?: ((item: MenuListItem) => void) | undefined;
}

/**
 * The whole menu section — header, category filters, and the dishes. Reach for this rather than
 * assembling cards by hand, so the filters and the empty state stay wired to the same list.
 */
export function MenuList({
  action,
  categories,
  category,
  className,
  defaultCategory,
  gridCount = 4,
  headingLevel = 2,
  items,
  lede,
  note = "100% Vegetarian Kitchen",
  onAdd,
  onCategoryChange,
  overline = "The Menu",
  title,
  variant = "grid",
  ...props
}: MenuListProps) {
  const derived = [...new Set(items.map((item) => item.category).filter((c) => c !== undefined))];
  const pills = categories ?? [ALL_CATEGORY, ...derived];
  const fallback = defaultCategory ?? pills[0] ?? ALL_CATEGORY;

  const [ownCategory, setOwnCategory] = useState(fallback);
  const active = category ?? ownCategory;

  const slots = menuList({ hasHeader: title !== undefined });
  const shown = items.filter((item) => active === ALL_CATEGORY || item.category === active);
  const cards = variant === "grid" ? shown.slice(0, gridCount) : [];
  const rows = variant === "grid" ? shown.slice(gridCount) : shown;

  const addProps = (item: MenuListItem) =>
    onAdd === undefined
      ? {}
      : {
          onAdd: () => {
            onAdd(item);
          },
        };

  const renderRows = (list: MenuListItem[]) =>
    list.map((item, index) => (
      <MenuItemRow
        {...dishProps(item)}
        {...addProps(item)}
        hasDivider={index < list.length - 1}
        key={item.name}
      />
    ));

  return (
    <section className={slots.root({ className })} {...props}>
      <div className={slots.inner()}>
        {title === undefined ? null : (
          <SectionHeader
            action={action}
            headingLevel={headingLevel}
            {...(lede === undefined ? {} : { lede })}
            overline={overline}
            title={title}
          />
        )}

        <FilterBar
          className={slots.filters()}
          isWrapping
          label="Filter the menu by category"
          note={note}
          onChange={(next) => {
            setOwnCategory(next);
            onCategoryChange?.(next);
          }}
          options={pills}
          value={active}
        />

        {shown.length === 0 ? (
          <EmptyState
            body="Try another category."
            className={slots.empty()}
            hasSymbol
            title="Nothing matches that yet."
          />
        ) : variant === "list" ? (
          <div className={slots.list()}>{renderRows(rows)}</div>
        ) : (
          <>
            <div className={slots.grid()}>
              {cards.map((item) => (
                <MenuItemCard
                  {...dishProps(item)}
                  {...addProps(item)}
                  {...(item.href === undefined ? {} : { href: item.href })}
                  key={item.name}
                />
              ))}
            </div>
            {rows.length === 0 ? null : (
              <div className={slots.overflow()}>
                <Divider label="Also On The Menu" />
                <div className={slots.rows()}>{renderRows(rows)}</div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
