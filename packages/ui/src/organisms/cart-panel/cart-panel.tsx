"use client";

import { MapPin } from "lucide-react";
import {
  type ComponentProps,
  createElement,
  type ReactNode,
  useId,
  useLayoutEffect,
  useRef,
} from "react";

import { Card } from "../../atoms/card/card";
import { DietMark } from "../../atoms/diet-mark/diet-mark";
import { Icon } from "../../atoms/icon/icon";
import { PriceTag } from "../../atoms/price-tag/price-tag";
import { Text } from "../../atoms/text/text";
import { componentVariants } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";
import { isShown } from "../../lib/is-shown";
import { EmptyState } from "../../molecules/empty-state/empty-state";
import { PriceSummary } from "../../molecules/price-summary/price-summary";
import { QuantityStepper } from "../../molecules/quantity-stepper/quantity-stepper";
import { type CartLine, cartTotals } from "./cart-totals";

export type { CartLine, CartTotals } from "./cart-totals";
export { cartTotals } from "./cart-totals";

const cartPanel = componentVariants({
  slots: {
    root: "flex min-h-0 flex-1 flex-col overflow-hidden",
    header: "px-5 pt-1 pb-3",
    meta: "mt-1.5 flex items-center gap-1.5 text-text-muted",
    body: "min-h-0 flex-1 overflow-y-auto px-5 py-1",
    lines: "m-0",
    line: "flex items-center gap-3.5 border-b border-border-subtle py-4",
    thumb: "size-cart-panel-thumb shrink-0 rounded-md bg-pink-100",
    details: "min-w-0 flex-1",
    nameRow: "flex min-w-0 items-center gap-1.5",
    name: "min-w-0 truncate font-display text-body-sm font-bold text-text-heading",
    note: "mt-0.75 truncate text-caption text-text-subtle",
    price: "mt-1.5",
    noteField: "mt-4.5",
    totals: "py-4.5",
    payBar: "border-t border-border-subtle bg-surface-page px-5 py-3",
    empty: "grid flex-1 place-items-center p-8",
  },
});

export interface CartPanelProps extends Omit<ComponentProps<"section">, "title"> {
  lines: CartLine[];
  title?: ReactNode | undefined;
  meta?: ReactNode | undefined;
  /** Defaults to 0.05 (5% GST). */
  gstRate?: number | undefined;
  onQuantityChange?: ((id: string, quantity: number) => void) | undefined;
  placeAction?: ReactNode | undefined;
  browseAction?: ReactNode | undefined;
  emptyTitle?: ReactNode | undefined;
  emptyBody?: ReactNode | undefined;
  noteField?: ReactNode | undefined;
  note?: ReactNode | undefined;
  subtotalLabel?: string | undefined;
  taxLabel?: string | undefined;
  totalLabel?: string | undefined;
  headingLevel?: HeadingLevel | undefined;
}

/**
 * The whole cart: lines with a stepper, a kitchen-note field, PriceSummary totals, and a pay bar
 * outside the scroll. An empty cart is its own EmptyState.
 */
export function CartPanel({
  lines,
  title = "Your order",
  meta,
  gstRate = 0.05,
  onQuantityChange,
  placeAction,
  browseAction,
  emptyTitle = "Nothing here yet.",
  emptyBody = "Let's fix that.",
  noteField,
  note,
  subtotalLabel = "Subtotal",
  taxLabel = "GST",
  totalLabel = "Total",
  headingLevel = 2,
  className,
  ...props
}: CartPanelProps) {
  const headingId = useId();
  const rootRef = useRef<HTMLElement>(null);
  const pendingFocus = useRef<"heading" | { line: string } | null>(null);
  const slots = cartPanel();
  const hasTitle = isShown(title);
  const hasLines = lines.length > 0;
  const totals = cartTotals(lines, gstRate);
  const taxPercent = Math.round(gstRate * 100);
  const taxName = `${taxLabel} (${String(taxPercent)}%)`;
  const emptyHeading = isShown(emptyTitle) ? emptyTitle : "Nothing here yet.";

  useLayoutEffect(() => {
    const target = pendingFocus.current;
    if (target === null) return;
    pendingFocus.current = null;
    const root = rootRef.current;
    if (root === null) return;
    if (target === "heading") {
      const heading = root.querySelector("h1, h2, h3, h4, h5, h6");
      if (heading instanceof HTMLElement) {
        heading.tabIndex = -1;
        heading.focus();
      }
      return;
    }
    const group = root.querySelector(`[role="group"][aria-label="${CSS.escape(target.line)}"]`);
    const decrement = group?.querySelector("button");
    if (decrement instanceof HTMLElement) decrement.focus();
  }, [lines]);

  if (!hasLines) {
    return (
      <section className={slots.root({ className })} {...props} ref={rootRef}>
        <div className={slots.empty()}>
          <EmptyState
            variant="symbol"
            title={emptyHeading}
            body={emptyBody}
            action={browseAction}
            headingLevel={headingLevel}
          />
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby={hasTitle ? headingId : undefined}
      className={slots.root({ className })}
      {...props}
      ref={rootRef}
    >
      {hasTitle || isShown(meta) ? (
        <header className={slots.header()}>
          {hasTitle
            ? createElement(
                headingTag(headingLevel),
                {
                  id: headingId,
                  tabIndex: -1,
                  className: "font-display text-h3 text-text-heading",
                },
                title
              )
            : null}
          {isShown(meta) ? (
            <span className={slots.meta()}>
              <Icon icon={MapPin} size="sm" />
              <Text variant="body-sm" tone="muted" as="span">
                {meta}
              </Text>
            </span>
          ) : null}
        </header>
      ) : null}
      <div className={slots.body()}>
        <ul role="list" className={slots.lines()}>
          {lines.map((line) => (
            <li key={line.id} className={slots.line()}>
              <div className={slots.thumb()} aria-hidden />
              <div className={slots.details()}>
                <span className={slots.nameRow()}>
                  <DietMark size="sm" />
                  <span className={slots.name()}>{line.name}</span>
                </span>
                {isShown(line.note) ? <div className={slots.note()}>{line.note}</div> : null}
                <div className={slots.price()}>
                  <PriceTag amount={line.price} size="sm" />
                </div>
              </div>
              <QuantityStepper
                label={line.name}
                size="sm"
                min={0}
                value={line.quantity}
                onValueChange={(quantity) => {
                  if (quantity <= 0) {
                    const index = lines.findIndex((item) => item.id === line.id);
                    const next = lines[index + 1] ?? lines[index - 1];
                    pendingFocus.current = next === undefined ? "heading" : { line: next.name };
                  }
                  onQuantityChange?.(line.id, quantity);
                }}
              />
            </li>
          ))}
        </ul>
        {isShown(noteField) ? (
          <Card variant="quiet" padding="sm" data-slot="note-field" className={slots.noteField()}>
            {noteField}
          </Card>
        ) : null}
        <PriceSummary
          className={slots.totals()}
          total={totals.total}
          totalLabel={totalLabel}
          note={note}
          lines={[
            { label: subtotalLabel, amount: totals.subtotal },
            { label: taxName, amount: totals.tax },
          ]}
        />
      </div>
      {isShown(placeAction) ? (
        <div data-slot="pay-bar" className={slots.payBar()}>
          {placeAction}
        </div>
      ) : null}
    </section>
  );
}
