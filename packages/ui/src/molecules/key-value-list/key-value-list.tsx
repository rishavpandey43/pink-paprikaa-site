import type { ReactNode } from "react";

import type { BaseProps } from "../../lib/common-props";

import { componentVariants } from "../../lib/component-variants";
import { withSx } from "../../lib/sx";

export interface KeyValueItem {
  key: ReactNode;
  value: ReactNode;
  /** Picks the value out in the brand colour (a changed or added item). */
  isEmphasised?: boolean | undefined;
}

export interface KeyValueListProps extends BaseProps<"dl"> {
  items: KeyValueItem[];
  density?: "compact" | "default" | undefined;
  /** A fixed key column (88 / 120px). Without it, key and value sit at either end of the row. */
  keyWidth?: "sm" | "md" | undefined;
  hasDividers?: boolean | undefined;
  /** `value`: muted key, strong value. `key`: strong key, muted value. */
  emphasis?: "value" | "key" | undefined;
}

const keyValueList = componentVariants({
  slots: {
    root: "m-0 text-body-sm",
    row: "flex gap-x-3 gap-y-1",
    key: "m-0",
    value: "m-0 min-w-0",
  },
  variants: {
    density: { compact: { row: "py-2" }, default: { row: "py-3" } },
    keyWidth: { sm: { key: "w-22 shrink-0" }, md: { key: "w-30 shrink-0" } },
    isSplit: {
      true: { row: "flex-wrap justify-between", value: "text-end" },
      false: { value: "flex-1" },
    },
    hasDividers: { true: { row: "border-t border-border-subtle" }, false: {} },
    emphasis: {
      value: { key: "text-text-muted", value: "text-text-heading" },
      key: { key: "font-display font-bold text-text-heading", value: "text-text-muted" },
    },
    isEmphasised: { true: { value: "font-semibold text-text-brand" }, false: {} },
  },
});

/**
 * Label/value rows as a `<dl>`: the calculator's "Your box", booking rules, customisations,
 * price lists and quote lines. Semantic tokens only, so it reads on any surface.
 */
export function KeyValueList({
  items,
  density = "default",
  keyWidth,
  hasDividers = true,
  emphasis = "value",
  sx,
  className,
  ...props
}: KeyValueListProps) {
  const styles = keyValueList({
    density,
    hasDividers,
    emphasis,
    isSplit: keyWidth === undefined,
    ...(keyWidth === undefined ? {} : { keyWidth }),
  });

  return (
    <dl className={styles.root({ className: withSx(sx, className) })} {...props}>
      {items.map((item, index) => (
        <div key={index} className={styles.row()}>
          <dt className={styles.key()}>{item.key}</dt>
          <dd className={styles.value({ isEmphasised: item.isEmphasised === true })}>
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
