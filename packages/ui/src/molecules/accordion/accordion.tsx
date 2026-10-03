import type { ReactNode } from "react";

import { ChevronDown } from "lucide-react";
import { createElement, useId } from "react";

import type { BaseProps } from "../../lib/common-props";

import { Icon } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";
import { withSx } from "../../lib/sx";

const accordion = componentVariants({
  slots: {
    root: "border-t border-border-subtle",
    item: "group/accordion-item details-content-motion border-b border-border-subtle",
    summary:
      "flex cursor-pointer list-none items-center justify-between gap-4 py-4.5 font-display text-accordion-question text-text-heading transition-colors duration-fast ease-out group-open/accordion-item:text-text-brand hover:text-text-brand",
    question: "min-w-0",
    chevron: "transition-transform duration-base ease-out group-open/accordion-item:rotate-180",
    answer:
      "max-w-accordion-answer-measure pb-4.5 text-accordion-answer text-pretty text-text-muted",
  },
});

export interface AccordionItem {
  /** Stable key, and what `defaultOpen` names. */
  value: string;
  question: ReactNode;
  answer: ReactNode;
}

export interface AccordionProps extends BaseProps<"div"> {
  items: AccordionItem[];
  /** Let several answers stay open at once. */
  isMultiple?: boolean | undefined;
  /**
   * Items open on load (default: the first). The `<details>` own their open state after that, but
   * `defaultOpen` is not read only once: changing it re-applies it, so an item added to or removed
   * from the list opens or closes again, whatever the guest did with it.
   */
  defaultOpen?: string[] | undefined;
  /** The single-open group's name (default: generated). Two accordions never share one. */
  name?: string | undefined;
  /**
   * Make each question a heading at this level, inside its `<summary>` (an FAQ under a section
   * title). Omit it and the questions stay plain summary text.
   */
  headingLevel?: HeadingLevel | undefined;
}

/**
 * FAQ, allergen and franchise-detail disclosure. Hairline-separated rows, no card; the chevron turns
 * 180° and the active question turns brand. One answer open at a time unless `isMultiple`.
 */
export function Accordion({
  items,
  isMultiple = false,
  defaultOpen,
  name,
  headingLevel,
  sx,
  className,
  ...props
}: AccordionProps) {
  const generatedName = useId();
  const groupName = isMultiple ? undefined : (name ?? generatedName);
  const openValues = new Set(defaultOpen ?? items.slice(0, 1).map((item) => item.value));
  const styles = accordion();

  return (
    <div className={styles.root({ className: withSx(sx, className) })} {...props}>
      {items.map((item) => (
        <details
          key={item.value}
          name={groupName}
          open={openValues.has(item.value)}
          className={styles.item()}
        >
          <summary className={styles.summary()}>
            {/* createElement, not `const Heading = headingTag(…)` (R83): the React Compiler lint reads
                a capitalised call result as a component created during render. */}
            {createElement(
              headingLevel === undefined ? "span" : headingTag(headingLevel),
              { className: styles.question() },
              item.question
            )}
            <Icon icon={ChevronDown} size="md" className={styles.chevron()} />
          </summary>
          <div className={styles.answer()}>{item.answer}</div>
        </details>
      ))}
    </div>
  );
}
