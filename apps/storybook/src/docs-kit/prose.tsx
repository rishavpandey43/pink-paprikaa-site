import { type ComponentProps, useEffect, useRef, useState } from "react";

/**
 * A markdown table in the docs prose. A GFM table cannot narrow its columns below their content,
 * so at 360px it scrolls inside its own frame instead of scrolling the page. Like the library's
 * Table, the frame becomes a named, focusable region only while it actually scrolls: a table that
 * fits adds no tab stop.
 */
export function ProseTable(props: ComponentProps<"table">) {
  const frame = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);

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

  return (
    <div
      ref={frame}
      role={isScrolling ? "region" : undefined}
      aria-label={isScrolling ? "Scrollable table" : undefined}
      tabIndex={isScrolling ? 0 : undefined}
      className="max-w-full overflow-x-auto"
    >
      <table {...props} />
    </div>
  );
}

/** The MDX element overrides every docs page renders with (`parameters.docs.components`). */
export const PROSE_COMPONENTS = { table: ProseTable };
