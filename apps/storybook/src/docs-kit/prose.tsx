import { type ComponentProps, useEffect, useId, useRef, useState } from "react";

/** The element a scrolling table is named by, and its place among the tables it names. */
interface RegionName {
  id: string;
  ordinal: number;
}

/**
 * The last shown, worded heading before `node`, or null. Storybook keeps hidden headings of its own
 * in the preview ("No Preview", an empty error heading), which must never name a table.
 */
function headingAbove(node: Element) {
  const headings = [...document.querySelectorAll("h1, h2, h3, h4, h5, h6")].reverse();
  const heading = headings.find(
    (candidate) =>
      candidate.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING &&
      candidate.checkVisibility() &&
      candidate.textContent.trim() !== ""
  );
  return heading ?? null;
}

/**
 * A markdown table in the docs prose. A GFM table cannot narrow its columns below their content,
 * so at 360px it scrolls inside its own frame instead of scrolling the page. Like the library's
 * Table, the frame becomes a named, focusable region only while it actually scrolls: a table that
 * fits adds no tab stop.
 *
 * The region is named by the table's caption, else the nearest heading above it, so two scrolling
 * tables on a page are told apart (axe landmark-unique); a second table under the same heading
 * adds "table 2". "Scrollable table" is only the fallback when neither exists.
 */
export function ProseTable(props: ComponentProps<"table">) {
  const id = useId();
  const frame = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [name, setName] = useState<RegionName | null>(null);

  useEffect(() => {
    const node = frame.current;
    if (node === null) return;
    const observer = new ResizeObserver(() => {
      setIsScrolling(node.scrollWidth > node.clientWidth);
    });
    observer.observe(node);
    if (node.firstElementChild !== null) observer.observe(node.firstElementChild);
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const node = frame.current;
    if (node === null || !isScrolling) return;
    const source = node.querySelector(":scope > table > caption") ?? headingAbove(node);
    if (source === null) return;
    if (source.id === "") source.id = `${id}-name`;
    node.dataset.nameSource = source.id;
    const named = [...document.querySelectorAll(`[data-name-source="${CSS.escape(source.id)}"]`)];
    setName({ id: source.id, ordinal: named.indexOf(node) + 1 });
    return () => {
      delete node.dataset.nameSource;
      setName(null);
    };
  }, [id, isScrolling]);

  const ordinalId = `${id}-ordinal`;
  const hasOrdinal = name !== null && name.ordinal > 1;
  const labelledBy = name === null ? undefined : hasOrdinal ? `${name.id} ${ordinalId}` : name.id;

  return (
    <div
      ref={frame}
      role={isScrolling ? "region" : undefined}
      aria-labelledby={isScrolling ? labelledBy : undefined}
      aria-label={isScrolling && name === null ? "Scrollable table" : undefined}
      tabIndex={isScrolling ? 0 : undefined}
      className="max-w-full overflow-x-auto"
    >
      <table {...props} />
      {hasOrdinal ? (
        <span id={ordinalId} hidden>
          {`table ${String(name.ordinal)}`}
        </span>
      ) : null}
    </div>
  );
}

/** The MDX element overrides every docs page renders with (`parameters.docs.components`). */
export const PROSE_COMPONENTS = { table: ProseTable };
