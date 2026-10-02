import { type ComponentProps, useEffect, useId, useRef, useState } from "react";

/** What names a scrolling table: an element's id (caption or heading), else the generic words. */
type RegionName =
  { kind: "source"; id: string; ordinal: number } | { kind: "generic"; ordinal: number };

/** One mounted ProseTable, as the page-wide naming pass sees it. */
interface ProseRegion {
  node: HTMLDivElement;
  isScrolling: boolean;
  /** Given to a caption or heading that has no id of its own. */
  fallbackId: string;
  setName: (name: RegionName | null) => void;
}

const GENERIC_NAME = "Scrollable table";
const regions = new Set<ProseRegion>();

/**
 * The last shown, worded heading before `node`, or null. Storybook keeps hidden headings of its own
 * in the preview ("No Preview", an empty error heading), and a story embedded in a docs page has
 * its own, so neither names a prose table.
 */
function headingAbove(node: Element) {
  const headings = [...document.querySelectorAll("h1, h2, h3, h4, h5, h6")].reverse();
  const heading = headings.find(
    (candidate) =>
      candidate.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING &&
      candidate.closest(".docs-story") === null &&
      candidate.checkVisibility() &&
      candidate.textContent.trim() !== ""
  );
  return heading ?? null;
}

/**
 * Names every scrolling table on the page, in document order, whenever one starts or stops
 * scrolling: two regions never share a name (axe landmark-unique), even under two headings with
 * the same words, because the ordinal counts the name's words, not the element behind them.
 */
function renameRegions() {
  const scrolling = [...regions]
    .filter((region) => region.isScrolling && region.node.isConnected)
    .sort((a, b) =>
      a.node.compareDocumentPosition(b.node) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
    );
  const counts = new Map<string, number>();
  for (const region of [...regions].filter((candidate) => !scrolling.includes(candidate))) {
    region.setName(null);
  }
  for (const region of scrolling) {
    const source =
      region.node.querySelector(":scope > table > caption") ?? headingAbove(region.node);
    const words = source === null ? GENERIC_NAME : source.textContent.trim();
    const ordinal = (counts.get(words) ?? 0) + 1;
    counts.set(words, ordinal);
    if (source === null) {
      region.setName({ kind: "generic", ordinal });
    } else {
      if (source.id === "") source.id = region.fallbackId;
      region.setName({ kind: "source", id: source.id, ordinal });
    }
  }
}

/**
 * A markdown table in the docs prose. A GFM table cannot narrow its columns below their content,
 * so at 360px it scrolls inside its own frame instead of scrolling the page. Like the library's
 * Table, the frame becomes a named, focusable region only while it actually scrolls: a table that
 * fits adds no tab stop.
 *
 * The region is named by the table's caption, else the nearest heading above it; a later table
 * whose name has the same words adds "table 2" ("Scrollable table 2" for the generic fallback,
 * used only when neither exists).
 */
export function ProseTable(props: ComponentProps<"table">) {
  const id = useId();
  const frame = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [name, setName] = useState<RegionName | null>(null);

  useEffect(() => {
    const node = frame.current;
    if (node === null) return;
    const region: ProseRegion = { node, isScrolling: false, fallbackId: `${id}-name`, setName };
    regions.add(region);
    const observer = new ResizeObserver(() => {
      const isOverflowing = node.scrollWidth > node.clientWidth;
      if (isOverflowing === region.isScrolling) return;
      region.isScrolling = isOverflowing;
      setIsScrolling(isOverflowing);
      renameRegions();
    });
    observer.observe(node);
    if (node.firstElementChild !== null) observer.observe(node.firstElementChild);
    return () => {
      observer.disconnect();
      regions.delete(region);
      renameRegions();
    };
  }, [id]);

  const ordinalId = `${id}-ordinal`;
  const hasOrdinal = name !== null && name.ordinal > 1;
  const isNamedBySource = isScrolling && name?.kind === "source";

  return (
    <div
      ref={frame}
      role={isScrolling ? "region" : undefined}
      aria-labelledby={
        isNamedBySource ? (hasOrdinal ? `${name.id} ${ordinalId}` : name.id) : undefined
      }
      aria-label={
        isScrolling && !isNamedBySource
          ? hasOrdinal
            ? `${GENERIC_NAME} ${String(name.ordinal)}`
            : GENERIC_NAME
          : undefined
      }
      tabIndex={isScrolling ? 0 : undefined}
      className="max-w-full overflow-x-auto"
    >
      <table {...props} />
      {isNamedBySource && hasOrdinal ? (
        <span id={ordinalId} hidden>
          {`table ${String(name.ordinal)}`}
        </span>
      ) : null}
    </div>
  );
}

/** The MDX element overrides every docs page renders with (`parameters.docs.components`). */
export const PROSE_COMPONENTS = { table: ProseTable };
