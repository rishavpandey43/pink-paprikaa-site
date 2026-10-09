import type { ReactNode } from "react";
import { createElement } from "react";

import type { BaseProps } from "../../lib/common-props";
import { componentVariants } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";
import { isShown } from "../../lib/is-shown";
import { withSx } from "../../lib/sx";

const sectionHeader = componentVariants({
  slots: {
    root: "flex flex-wrap items-end gap-6",
    copy: "min-w-0",
    overline: "m-0 font-display text-overline text-text-brand uppercase",
    title: "m-0 font-display text-h2-fluid text-pretty text-text-heading",
    lede: "m-0 mt-3 text-body-lg text-text-muted",
    action: "shrink-0",
  },
  variants: {
    align: {
      start: { root: "justify-between text-start", copy: "max-w-section-header-measure" },
      center: {
        root: "justify-center text-center",
        copy: "mx-auto max-w-section-header-measure-centered",
      },
    },
    hasOverline: { true: { title: "mt-2.5" } },
  },
  defaultVariants: { align: "start", hasOverline: false },
});

export interface SectionHeaderProps extends Omit<BaseProps<"div">, "title"> {
  /** Uppercase eyebrow. */
  overline?: ReactNode;
  title: ReactNode;
  headingLevel?: HeadingLevel | undefined;
  /** One sentence, at most about 20 words. */
  lede?: ReactNode;
  /** Trailing element, usually a ghost Button. Not rendered when centred. */
  action?: ReactNode;
  align?: "start" | "center" | undefined;
}

/** The standard section opener — every page section starts with one. */
export function SectionHeader({
  overline,
  title,
  headingLevel = 2,
  lede,
  action,
  align = "start",
  sx,
  className,
  ...props
}: SectionHeaderProps) {
  const hasOverline = isShown(overline);
  const styles = sectionHeader({ align, hasOverline });

  return (
    <div className={styles.root({ className: withSx(sx, className) })} {...props}>
      <div className={styles.copy()}>
        {hasOverline ? <p className={styles.overline()}>{overline}</p> : null}
        {/* createElement, not `const Heading = headingTag(…)` (R83): the React Compiler lint reads
            a capitalised call result as a component created during render. */}
        {createElement(headingTag(headingLevel), { className: styles.title() }, title)}
        {isShown(lede) ? <p className={styles.lede()}>{lede}</p> : null}
      </div>
      {isShown(action) && align === "start" ? (
        <div className={styles.action()}>{action}</div>
      ) : null}
    </div>
  );
}
