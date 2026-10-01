import type { ComponentProps, ReactNode } from "react";

import { createElement } from "react";

import { componentVariants } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";
import { isShown } from "../../lib/is-shown";

export interface StepsItem {
  title: ReactNode;
  description?: ReactNode | undefined;
}

export interface StepsProps extends ComponentProps<"ol"> {
  items: StepsItem[];
  /** `circle`: a pink disc per step, stacked. `rule`: a brand top rule and "01", in a grid. */
  variant?: "circle" | "rule" | undefined;
  headingLevel?: HeadingLevel | undefined;
}

type StepsVariant = NonNullable<StepsProps["variant"]>;

/** How each variant writes a step's number. */
const STEP_NUMBER: Readonly<Record<StepsVariant, (step: number) => string>> = {
  circle: (step) => String(step),
  rule: (step) => String(step).padStart(2, "0"),
};

const steps = componentVariants({
  slots: {
    root: "m-0",
    item: "",
    marker: "font-display font-black",
    body: "flex min-w-0 flex-col gap-1",
    title: "font-display text-steps-title text-text-heading",
    description: "m-0 max-w-none text-body text-text-body",
  },
  variants: {
    variant: {
      circle: {
        root: "flex flex-col gap-5",
        item: "flex items-start gap-3.5",
        marker:
          "grid size-11 shrink-0 place-items-center rounded-pill bg-surface-brand text-body text-text-on-brand",
      },
      rule: {
        root: "grid autogrid-min-md gap-4",
        item: "flex flex-col gap-2 border-t-3 border-border-brand pt-4",
        marker: "text-h2 leading-none text-text-brand",
      },
    },
  },
});

/** Numbered steps: Home "How it works", Catering "How to book", Homely Meals "Starting takes one message". */
export function Steps({
  items,
  variant = "circle",
  headingLevel = 3,
  className,
  ...props
}: StepsProps) {
  const styles = steps({ variant });

  return (
    // Not redundant in practice: Safari/VoiceOver drops list semantics from a list-style:none list.
    // eslint-disable-next-line jsx-a11y/no-redundant-roles -- the explicit role restores them.
    <ol role="list" className={styles.root({ className })} {...props}>
      {items.map((item, index) => (
        <li key={index} className={styles.item()}>
          <span className={styles.marker()}>{STEP_NUMBER[variant](index + 1)}</span>
          <div className={styles.body()}>
            {/* createElement, not `const Heading = headingTag(…)` (R83): the React Compiler lint reads
                a capitalised call result as a component created during render. */}
            {createElement(headingTag(headingLevel), { className: styles.title() }, item.title)}
            {isShown(item.description) ? (
              <p className={styles.description()}>{item.description}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
