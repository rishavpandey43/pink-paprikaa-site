import { type ComponentProps, type ReactNode, useId } from "react";

import { PatternField } from "../../atoms/pattern-field/pattern-field";
import { Typography } from "../../atoms/typography/typography";
import { componentVariants, type VariantProps } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";
import { isShown } from "../../lib/is-shown";
import { StruckPrice } from "../../lib/struck-price";
import { type KeyValueItem, KeyValueList } from "../../molecules/key-value-list/key-value-list";

const quotePanel = componentVariants({
  slots: {
    root: "relative overflow-hidden rounded-xl p-quote-panel-pad",
    // A decorative layer only: the panel's own ground (or a caller's) shows through it.
    pattern: "absolute inset-0 bg-transparent",
    body: "relative flex flex-col gap-4",
    header: "flex flex-wrap items-start justify-between gap-3",
    price: "flex flex-wrap items-baseline gap-x-2.5 gap-y-1",
    amount: "font-display text-quote-panel-amount text-text-heading",
    unit: "text-body-sm text-text-muted",
    was: "text-body-sm",
    lines: "border-t border-border-subtle pt-1.5",
    total:
      "flex justify-between gap-3 border-t border-border-subtle pt-2.5 font-display text-h4 font-black text-text-heading",
    note: "text-caption text-text-muted",
    alerts: "flex flex-col gap-2",
    action: "flex flex-col gap-2",
    footnote: "text-center text-caption text-text-muted",
  },
  variants: {
    tone: {
      brand: { root: "bg-surface-brand" },
      // The Dawat and Office quotes set their lines in mono (handoff).
      ink: { root: "bg-surface-inverse", lines: "font-mono" },
      light: { root: "bg-surface-card", lines: "font-mono" },
    },
  },
  defaultVariants: { tone: "brand" },
});

type QuoteTone = NonNullable<VariantProps<typeof quotePanel>["tone"]>;

/** Title colour: white on brand and pink-300 on ink (both `brand` there), ink-600 on the white card. */
const TITLE_TONE: Readonly<Record<QuoteTone, "brand" | "muted">> = {
  brand: "brand",
  ink: "brand",
  light: "muted",
};

export interface QuotePanelProps
  extends Omit<ComponentProps<"section">, "title">, Pick<VariantProps<typeof quotePanel>, "tone"> {
  /** The overline title, e.g. "Classic · Weekday plan". */
  title: ReactNode;
  badge?: ReactNode;
  /** The big number, already formatted ("₹130"). */
  amount: ReactNode;
  unit?: ReactNode;
  /** The struck regular price, already formatted. */
  was?: ReactNode;
  /** Read before the struck price by screen readers, which do not announce strike-through. */
  wasLabel?: string | undefined;
  lines?: KeyValueItem[] | undefined;
  total?: { label: ReactNode; value: ReactNode } | undefined;
  note?: ReactNode;
  /** Warnings and offers — usually Alerts. */
  alerts?: ReactNode;
  /** Usually one full-width `size="lg"` Button. */
  action?: ReactNode;
  footnote?: ReactNode;
  headingLevel?: HeadingLevel | undefined;
}

/**
 * The estimate panel of the Plan, Dawat and Office calculators: brand pink with the diamond,
 * ink, or a white card (a light island inside an ink section). Shows numbers it is given — the
 * pricing logic lives in the app.
 */
export function QuotePanel({
  tone = "brand",
  title,
  badge,
  amount,
  unit,
  was,
  wasLabel = "was",
  lines = [],
  total,
  note,
  alerts,
  action,
  footnote,
  headingLevel = 3,
  className,
  ...props
}: QuotePanelProps) {
  const titleId = useId();
  const slots = quotePanel({ tone });
  return (
    <section
      data-surface={tone}
      aria-labelledby={titleId}
      className={slots.root({ className })}
      {...props}
    >
      {tone === "brand" ? (
        <PatternField aria-hidden tone="brand" tile={64} className={slots.pattern()} />
      ) : null}
      <div className={slots.body()}>
        <div className={slots.header()}>
          <Typography
            as={headingTag(headingLevel)}
            id={titleId}
            variant="overline"
            color={TITLE_TONE[tone]}
          >
            {title}
          </Typography>
          {badge}
        </div>
        <div className={slots.price()}>
          <span className={slots.amount()}>{amount}</span>
          {isShown(unit) ? <span className={slots.unit()}>{unit}</span> : null}
          {isShown(was) ? (
            <StruckPrice label={wasLabel} className={slots.was()}>
              {was}
            </StruckPrice>
          ) : null}
        </div>
        {lines.length > 0 ? (
          <KeyValueList
            items={lines}
            density="compact"
            hasDividers={false}
            className={slots.lines()}
          />
        ) : null}
        {total ? (
          <dl className={slots.total()}>
            <dt>{total.label}</dt>
            <dd>{total.value}</dd>
          </dl>
        ) : null}
        {isShown(note) ? <div className={slots.note()}>{note}</div> : null}
        {isShown(alerts) ? <div className={slots.alerts()}>{alerts}</div> : null}
        {isShown(action) ? <div className={slots.action()}>{action}</div> : null}
        {isShown(footnote) ? <div className={slots.footnote()}>{footnote}</div> : null}
      </div>
    </section>
  );
}
