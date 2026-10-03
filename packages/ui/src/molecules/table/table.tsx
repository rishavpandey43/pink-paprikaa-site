import { type ComponentProps, type ReactNode, useId } from "react";

import type { BaseProps } from "../../lib/common-props";

import { componentVariants } from "../../lib/component-variants";
import { withSx } from "../../lib/sx";

const table = componentVariants({
  slots: {
    frame: "rounded-xl border border-border-subtle bg-surface-card shadow-1",
    table: "w-full border-collapse text-left text-body-sm text-text-body",
    caption: "px-5 pt-4 pb-2 text-left font-display text-body font-bold text-text-heading",
  },
  variants: {
    // The frame clips the pink head to its radius either way. Only a table with a floor scrolls:
    // `none` clips (not a scroll container, so no unfocusable scroll region) and must fit.
    minWidth: {
      none: { frame: "overflow-clip" },
      sm: { frame: "overflow-x-auto", table: "min-w-table-sm" },
      md: { frame: "overflow-x-auto", table: "min-w-table-md" },
      lg: { frame: "overflow-x-auto", table: "min-w-table-lg" },
    },
    isCaptionVisible: { true: {}, false: { caption: "sr-only" } },
  },
});

const tableHead = componentVariants({
  base: "border-b border-border-subtle bg-surface-brand-soft",
});
const tableBody = componentVariants({ base: "divide-y divide-border-subtle" });

const tableHeaderCell = componentVariants({
  base: "px-3 first:pl-5 last:pr-5",
  variants: {
    isRowHeader: {
      false: "py-3.5 align-bottom font-display text-table-head text-text-heading",
      true: "py-3 align-top font-display font-bold text-text-heading",
    },
    isHighlighted: { true: "", false: "" },
  },
  compoundVariants: [{ isRowHeader: false, isHighlighted: true, class: "text-pink-700" }],
});

const tableCell = componentVariants({
  base: "p-3 align-top first:pl-5 last:pr-5",
  variants: { isHighlighted: { true: "font-semibold text-text-heading", false: "" } },
});

export interface TableProps extends BaseProps<"table"> {
  /** Names the table (and its scroll region). Visually hidden unless `isCaptionVisible`. */
  caption: ReactNode;
  isCaptionVisible?: boolean | undefined;
  /** Below this width the table scrolls sideways inside its frame (460 / 620 / 720px). */
  minWidth?: "none" | "sm" | "md" | "lg" | undefined;
}

export type TableHeadProps = ComponentProps<"thead">;
export type TableBodyProps = ComponentProps<"tbody">;
export type TableRowProps = ComponentProps<"tr">;

export interface TableHeaderCellProps extends ComponentProps<"th"> {
  /**
   * Marks the recommended column (its header turns brand). Colour alone does not tell a guest why
   * (WCAG 1.4.1): say it in the header text too, e.g. "Classic · Our pick".
   */
  isHighlighted?: boolean | undefined;
}

export interface TableCellProps extends ComponentProps<"td"> {
  /** Marks a cell of the recommended column. */
  isHighlighted?: boolean | undefined;
}

/**
 * A semantic table in a white frame (the handoff's price matrix, box comparison, offers and glance
 * tables — div grids there). `className` styles the frame. With a `minWidth`, a narrow screen
 * scrolls the table inside a named, keyboard-focusable region instead of squashing its columns.
 */
export function Table({
  caption,
  isCaptionVisible = false,
  minWidth = "none",
  sx,
  className,
  children,
  ...props
}: TableProps) {
  const captionId = useId();
  const styles = table({ minWidth, isCaptionVisible });
  const isScrollable = minWidth !== "none";

  return (
    <div
      data-surface="light"
      role={isScrollable ? "region" : undefined}
      aria-labelledby={isScrollable ? captionId : undefined}
      tabIndex={isScrollable ? 0 : undefined}
      className={styles.frame({ className: withSx(sx, className) })}
    >
      <table className={styles.table()} {...props}>
        <caption id={captionId} className={styles.caption()}>
          {caption}
        </caption>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ className, ...props }: TableHeadProps) {
  return <thead className={tableHead({ className })} {...props} />;
}

export function TableBody({ className, ...props }: TableBodyProps) {
  return <tbody className={tableBody({ className })} {...props} />;
}

export function TableRow(props: TableRowProps) {
  return <tr {...props} />;
}

/** `scope="col"` by default; `scope="row"` for the first cell of a body row. */
export function TableHeaderCell({
  scope = "col",
  isHighlighted = false,
  className,
  ...props
}: TableHeaderCellProps) {
  const isRowHeader = scope === "row" || scope === "rowgroup";
  return (
    <th
      scope={scope}
      className={tableHeaderCell({ isRowHeader, isHighlighted, className })}
      {...props}
    />
  );
}

export function TableCell({ isHighlighted = false, className, ...props }: TableCellProps) {
  return <td className={tableCell({ isHighlighted, className })} {...props} />;
}
