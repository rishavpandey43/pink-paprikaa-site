import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { Text } from "../../atoms/text/text";
import { componentVariants, type VariantProps } from "../../lib/component-variants";

const sectionHeader = componentVariants({
  slots: {
    // `items-end` sits the trailing action on the heading's baseline edge; `flex-wrap` drops it
    // onto its own line before it can squeeze the title (responsive contract).
    root: "flex w-full flex-wrap items-end gap-6",
    body: "min-w-0",
    // The gaps hang off the optional parts, so a header with no overline has no stray top margin.
    overline: "mb-2",
    title: "",
    lede: "mt-3",
    action: "shrink-0",
  },
  variants: {
    /** `center` is the standalone opener — no action, prose centred under the heading. */
    align: {
      start: { root: "justify-between", body: "max-w-(--measure-prose)" },
      center: { root: "justify-center text-center", body: "mx-auto max-w-(--measure-prose)" },
    },
    /** `brand` when the section floods pink or ink — every tone lifts to white on the fill. */
    on: {
      light: {
        overline: "block text-text-brand",
        title: "text-text-heading",
        lede: "text-text-muted",
      },
      brand: {
        overline: "block text-text-on-brand",
        title: "text-text-on-brand",
        lede: "text-text-on-brand",
      },
    },
  },
  defaultVariants: { align: "start", on: "light" },
});

/**
 * The rendered element for each heading level. A lookup rather than a computed `h${level}` string,
 * because a template literal widens to `string`, which is not an `ElementType`.
 */
const HEADING_ELEMENT = { 1: "h1", 2: "h2", 3: "h3", 4: "h4", 5: "h5", 6: "h6" } as const;

export interface SectionHeaderProps
  extends Omit<ComponentPropsWithoutRef<"div">, "title">, VariantProps<typeof sectionHeader> {
  /** ALL CAPS eyebrow naming the section — two or three words, never a sentence. */
  overline?: string | undefined;
  /** The section's heading. */
  title: ReactNode;
  /** One-sentence lede under the heading, roughly twenty words at most. */
  lede?: string | undefined;
  /** Trailing element, usually a ghost `Button`. Not rendered when `align` is `center`. */
  action?: ReactNode | undefined;
  /**
   * The heading level in the document outline, independent of how big the heading looks: the type
   * step is always the fluid `h2` so a section opener reads the same everywhere, while the level
   * follows whatever the page around it needs. Set it so headings never skip a level.
   */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6 | undefined;
}

export function SectionHeader({
  action,
  align,
  className,
  headingLevel = 2,
  lede,
  on,
  overline,
  title,
  ...props
}: SectionHeaderProps) {
  const parts = sectionHeader({ align, on });
  return (
    <div className={parts.root({ className })} {...props}>
      <div className={parts.body()}>
        {overline === undefined ? null : (
          <Text as="p" className={parts.overline()} variant="overline">
            {overline}
          </Text>
        )}
        <Text as={HEADING_ELEMENT[headingLevel]} className={parts.title()} isFluid variant="h2">
          {title}
        </Text>
        {lede === undefined ? null : (
          <Text className={parts.lede()} isFluid variant="body1">
            {lede}
          </Text>
        )}
      </div>
      {action !== undefined && align !== "center" ? (
        <div className={parts.action()}>{action}</div>
      ) : null}
    </div>
  );
}
