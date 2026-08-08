import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { componentVariants } from "../../lib/component-variants";
import { Accordion, type AccordionItem } from "../../molecules/accordion/accordion";
import {
  SectionHeader,
  type SectionHeaderProps,
} from "../../molecules/section-header/section-header";

const faqSection = componentVariants({
  slots: {
    root: [
      "mx-auto w-full max-w-(--layout-container-max)",
      "px-(--layout-gutter-fluid) py-(--layout-section-y-fluid)",
    ],
    // Heading left, questions right, stacking below roughly 720px. `min(320px,100%)` is what makes
    // the stack happen at all — a bare `1fr` track would keep both columns down to 360px.
    grid: [
      "grid items-start gap-[clamp(28px,4vw,56px)]",
      "grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))]",
    ],
  },
});

/**
 * The level the questions take under the section heading. Headings must never skip a level, so the
 * questions always sit exactly one below whatever the section itself is.
 */
const QUESTION_LEVEL = { 2: 3, 3: 4 } as const;

export interface FaqSectionProps extends Omit<
  ComponentPropsWithoutRef<"section">,
  "children" | "title"
> {
  /** ALL CAPS eyebrow naming the section — "Questions", "Franchise". */
  overline?: string | undefined;
  /** The section heading. */
  title: ReactNode;
  /** One-sentence lede under the heading. */
  lede?: string | undefined;
  /** The questions, in the order a guest would ask them. Answers are one or two short sentences. */
  items: AccordionItem[];
  /** Lets several answers stay open at once. Off by default: one answer, one focus. */
  isMultiple?: boolean | undefined;
  /**
   * Questions open on first render. Defaults to the first one — it is the answer most guests came
   * for, and an all-closed FAQ reads as a wall of chevrons. Pass `[]` to open none.
   */
  defaultOpen?: string[] | undefined;
  /** Where the section heading sits in the document outline. The questions follow one below. */
  headingLevel?: 2 | 3 | undefined;
}

export function FaqSection({
  className,
  defaultOpen,
  headingLevel = 2,
  isMultiple = false,
  items,
  lede,
  overline,
  title,
  ...props
}: FaqSectionProps) {
  const parts = faqSection();
  const first = items[0];
  const open = defaultOpen ?? (first === undefined ? [] : [first.value ?? first.question]);

  // `exactOptionalPropertyTypes` forbids handing an optional prop an explicit `undefined`.
  const headerProps: Pick<SectionHeaderProps, "lede" | "overline"> = {};
  if (overline !== undefined) headerProps.overline = overline;
  if (lede !== undefined) headerProps.lede = lede;

  return (
    <section className={parts.root({ className })} {...props}>
      <div className={parts.grid()}>
        <SectionHeader headingLevel={headingLevel} title={title} {...headerProps} />
        <Accordion
          defaultOpen={open}
          headingLevel={QUESTION_LEVEL[headingLevel]}
          isMultiple={isMultiple}
          items={items}
        />
      </div>
    </section>
  );
}
