import { type ReactNode, useId } from "react";

export interface DocTableProps {
  /** Visible caption and the table's accessible name. */
  caption: string;
  headers: readonly string[];
  /**
   * The width below which the table scrolls sideways instead of squeezing; `"none"` never scrolls.
   * The semantics of the library `Table`'s `minWidth` (Plan 3b), not its values: on the swap,
   * `article` becomes `md` and `narrow` becomes `lg`.
   */
  minWidth: keyof typeof MIN_WIDTH;
  /** `<tr>` rows of `DocCell`s. */
  children: ReactNode;
}

const MIN_WIDTH = { none: "", article: "min-w-article", narrow: "min-w-narrow" } as const;

/**
 * A captioned docs table. With a `minWidth` it sits in a focusable region named by its caption, so
 * a keyboard user can scroll it (axe `scrollable-region-focusable`). Native markup until the
 * library's `Table` molecule lands (Plan 3b); then callers move to `Table` with the `minWidth`
 * values remapped (`article` → `md`, `narrow` → `lg`).
 */
export function DocTable({ caption, headers, minWidth, children }: DocTableProps) {
  const captionId = useId();
  const isScrollable = minWidth !== "none";
  return (
    <div
      role={isScrollable ? "region" : undefined}
      aria-labelledby={isScrollable ? captionId : undefined}
      tabIndex={isScrollable ? 0 : undefined}
      className="max-w-full overflow-x-auto"
    >
      <table className={`w-full border-collapse text-left text-body-sm ${MIN_WIDTH[minWidth]}`}>
        <caption id={captionId} className="pb-3 text-left font-semibold text-text-heading">
          {caption}
        </caption>
        <thead>
          <tr className="border-b-2 border-border-default">
            {headers.map((header) => (
              <th key={header} scope="col" className="px-3 py-2 font-semibold text-text-heading">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export interface DocCellProps {
  className?: string | undefined;
  children: ReactNode;
}

export function DocCell({ className, children }: DocCellProps) {
  return (
    <td className={`border-b border-border-subtle px-3 py-2 align-top ${className ?? ""}`}>
      {children}
    </td>
  );
}
