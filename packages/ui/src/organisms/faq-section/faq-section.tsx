import type { ReactNode } from "react";

import type { BaseProps } from "../../lib/common-props";
import type { HeadingLevel } from "../../lib/heading";

import { componentVariants } from "../../lib/component-variants";
import { withSx } from "../../lib/sx";
import { Accordion, type AccordionItem } from "../../molecules/accordion/accordion";
import { SectionHeader } from "../../molecules/section-header/section-header";

const faqSection = componentVariants({
  slots: {
    root: "section-y",
    inner: "container-page grid items-start gap-faq-section-gap lg:grid-cols-2",
    lead: "flex min-w-0 flex-col gap-6 lg:sticky lg:top-faq-section-sticky",
  },
});

export interface FaqSectionProps extends Omit<BaseProps<"section">, "title"> {
  overline?: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  /** One or two short sentences per answer. The first opens by default. */
  items: AccordionItem[];
  /**
   * The `value`s of the answers open on arrival (default: the first; `[]` for none). Name more
   * than one only with `isMultiple`: a single-open group keeps one answer open.
   */
  defaultOpen?: string[] | undefined;
  /** Allow several answers open at once. */
  isMultiple?: boolean | undefined;
  /** Beside the heading, sticky at lg and up — e.g. the handoff's "Still have a question?" card. */
  aside?: ReactNode;
  /** The title's level; each question is a heading one level below it (h6 at most). */
  headingLevel?: HeadingLevel | undefined;
}

const QUESTION_LEVEL: Readonly<Record<HeadingLevel, HeadingLevel>> = {
  1: 2,
  2: 3,
  3: 4,
  4: 5,
  5: 6,
  6: 6,
};

/** Two-column FAQ — heading (and aside) left, native accordion right, stacking below lg. */
export function FaqSection({
  overline,
  title,
  lede,
  items,
  defaultOpen,
  isMultiple = false,
  aside,
  headingLevel = 2,
  sx,
  className,
  ...props
}: FaqSectionProps) {
  const slots = faqSection();
  return (
    <section className={slots.root({ className: withSx(sx, className) })} {...props}>
      <div className={slots.inner()}>
        <div className={slots.lead()}>
          <SectionHeader
            overline={overline}
            title={title}
            lede={lede}
            headingLevel={headingLevel}
          />
          {aside}
        </div>
        <Accordion
          items={items}
          // Organism keeps "first open" when omitted; Accordion molecule defaults to none (design).
          defaultOpen={defaultOpen ?? (items[0] === undefined ? [] : [items[0].value])}
          isMultiple={isMultiple}
          headingLevel={QUESTION_LEVEL[headingLevel]}
        />
      </div>
    </section>
  );
}
