import type { ComponentProps, ReactNode } from "react";

import { ChevronDown } from "lucide-react";
import { useId } from "react";

import { Icon } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";

const accordion = componentVariants({
  slots: {
    root: "border-t border-border-subtle",
    item: "group details-content-motion border-b border-border-subtle",
    summary:
      "flex cursor-pointer list-none items-center justify-between gap-4 py-4.5 font-display text-accordion-question text-text-heading transition-colors duration-fast ease-out group-open:text-text-brand hover:text-text-brand",
    question: "min-w-0",
    chevron: "transition-transform duration-base ease-out group-open:rotate-180",
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

export interface AccordionProps extends ComponentProps<"div"> {
  items: AccordionItem[];
  /** Let several answers stay open at once. */
  isMultiple?: boolean | undefined;
  /** Items open on load (default: the first). */
  defaultOpen?: string[] | undefined;
  /** The single-open group's name (default: generated). Two accordions never share one. */
  name?: string | undefined;
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
  className,
  ...props
}: AccordionProps) {
  const generatedName = useId();
  const groupName = isMultiple ? undefined : (name ?? generatedName);
  const openValues = new Set(defaultOpen ?? items.slice(0, 1).map((item) => item.value));
  const styles = accordion();

  return (
    <div className={styles.root({ className })} {...props}>
      {items.map((item) => (
        <details
          key={item.value}
          name={groupName}
          open={openValues.has(item.value)}
          className={styles.item()}
        >
          <summary className={styles.summary()}>
            <span className={styles.question()}>{item.question}</span>
            <Icon icon={ChevronDown} size="md" className={styles.chevron()} />
          </summary>
          <div className={styles.answer()}>{item.answer}</div>
        </details>
      ))}
    </div>
  );
}
