/**
 * Heading levels. Every titled component takes `headingLevel?: HeadingLevel`, so a page keeps one
 * `h1` and a correct outline wherever the component lands (spec §5.5, §8.1).
 */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

const HEADING_TAG = { 1: "h1", 2: "h2", 3: "h3", 4: "h4", 5: "h5", 6: "h6" } as const;

/** The element for a heading level: `headingTag(2)` → `"h2"`. */
export function headingTag(level: HeadingLevel): "h1" | "h2" | "h3" | "h4" | "h5" | "h6" {
  return HEADING_TAG[level];
}
