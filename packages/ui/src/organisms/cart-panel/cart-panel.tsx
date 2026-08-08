"use client";

import type { ReactNode } from "react";

import { ArrowRight, MapPin, Pencil, X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";

import { Button } from "../../atoms/button/button";
import { Card } from "../../atoms/card/card";
import { DietMark } from "../../atoms/diet-mark/diet-mark";
import { IconButton } from "../../atoms/icon-button/icon-button";
import { Icon } from "../../atoms/icon/icon";
import { Input } from "../../atoms/input/input";
import { PriceTag } from "../../atoms/price-tag/price-tag";
import { componentVariants, type VariantProps } from "../../lib/component-variants";
import { EmptyState } from "../../molecules/empty-state/empty-state";
import { PriceSummary } from "../../molecules/price-summary/price-summary";
import { QuantityStepper } from "../../molecules/quantity-stepper/quantity-stepper";

const cartPanel = componentVariants({
  slots: {
    overlay: "inset-0 z-50 bg-surface-overlay animate-pp-fade",
    /**
     * A side sheet: full height on the trailing edge, full width until 400px, and only the leading
     * corners rounded — the edge it is attached to has no corners to round.
     */
    content: [
      "inset-y-0 right-0 z-50 flex w-full max-w-100 flex-col rounded-l-5",
      "bg-surface-card shadow-elevation4 animate-pp-rise",
    ],
    header: "flex shrink-0 items-start justify-between gap-4 px-5 pt-5 pb-3",
    heading: "flex min-w-0 flex-col gap-1-5",
    title: "min-w-0 font-display font-bold text-h3 leading-h3 tracking-h3 text-text-heading",
    meta: "flex min-w-0 items-center gap-1-5 font-body text-body2 leading-body2 text-text-muted",
    /** The one scrolling region: lines, kitchen note and totals move together under the header. */
    scroller: "min-h-0 flex-1 overflow-y-auto px-5",
    list: "m-0 flex list-none flex-col p-0",
    line: "flex items-center gap-3.5 border-b border-border-subtle py-4",
    /** A fixed square so a line keeps its shape before the photograph arrives. */
    thumb: "size-14 shrink-0 rounded-3 bg-brand-soft",
    lineBody: "flex min-w-0 flex-1 flex-col gap-0-5",
    lineHead: "flex min-w-0 items-center gap-1-5",
    lineName: "min-w-0 truncate font-display font-bold text-body2 text-text-heading",
    lineNote: "truncate font-body text-caption leading-caption text-text-subtle",
    note: "mt-4.5",
    summary: "py-4.5",
    /** The pay bar never scrolls away — the total is the thing being decided on. */
    payBar: "shrink-0 border-t border-border-subtle bg-surface-card px-5 pt-3 pb-3.5",
    empty: "grid min-h-0 flex-1 place-items-center px-5 py-8",
  },
  variants: {
    /**
     * `container` swaps `fixed` for `absolute` so the cart can be previewed inside a phone frame —
     * pass that frame as `container` too, or it portals to the body and the anchoring is lost.
     */
    position: {
      viewport: { content: "fixed", overlay: "fixed" },
      container: { content: "absolute", overlay: "absolute" },
    },
  },
  defaultVariants: { position: "viewport" },
});

/**
 * The one correct way to print a rupee figure on the pay bar: rupee sign with no space, Indian
 * digit grouping, and no decimals on a whole-rupee amount. Never hand-write a price string.
 */
function formatRupees(value: number): string {
  return `₹${value.toLocaleString("en-IN", {
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  })}`;
}

export interface CartLine {
  /** The dish, exactly as the menu names it. It is also the line's identity. */
  name: string;
  /** Unit price in whole rupees, before quantity. */
  price: number;
  /** How many of it. Stepping to zero is what removes the line. */
  quantity: number;
  /** Which mark the dish carries. Defaults to `veg` — the kitchen is 100% vegetarian. */
  diet?: "egg" | "veg";
  /** The chosen options, e.g. "Sharing · Extra hot". */
  note?: string;
}

export interface CartPanelProps extends VariantProps<typeof cartPanel> {
  /** The order, in the sequence it was built. An empty array renders the empty state. */
  lines?: CartLine[] | undefined;
  /** Heading for the sheet. */
  title?: string | undefined;
  /** The fulfilment line under the title — outlet and wait, never a marketing claim. */
  meta?: string | undefined;
  /** Tax rate applied to the subtotal. Defaults to 0.05 (5% GST). */
  gstRate?: number | undefined;
  /** Fires with the dish and its new count. Zero means the guest removed the line. */
  onQuantityChange?: ((name: string, quantity: number) => void) | undefined;
  /** Fires when the pay bar is used. */
  onPlaceOrder?: (() => void) | undefined;
  /** Fires from the empty state's only action. */
  onBrowse?: (() => void) | undefined;
  /** The control that opens the cart — usually the floating cart button. */
  trigger?: ReactNode | undefined;
  /** Drive it from outside. Leave unset and the trigger runs it. */
  isOpen?: boolean | undefined;
  /** Open it on mount — for stories and specimens, not for real pages. */
  isDefaultOpen?: boolean | undefined;
  /** Fires whenever the cart opens or closes, controlled or not. */
  onOpenChange?: ((isOpen: boolean) => void) | undefined;
  /** Accessible name for the close glyph. */
  closeLabel?: string | undefined;
  /** Portal target. Pass the positioned ancestor when `position` is `container`. */
  container?: HTMLElement | null | undefined;
  className?: string | undefined;
}

/**
 * The cart, whole: line items with their own steppers, a note for the kitchen, the totals, and a
 * pay bar that never scrolls away. It is a Radix Dialog side sheet, so it traps focus, closes on
 * Escape and locks the page behind it. It renders its own empty state.
 */
export function CartPanel({
  className,
  closeLabel = "Close",
  container,
  gstRate = 0.05,
  isDefaultOpen,
  isOpen,
  lines = [],
  meta = "Pickup · Sector 57 · 12 min",
  onBrowse,
  onOpenChange,
  onPlaceOrder,
  onQuantityChange,
  position,
  title = "Your order",
  trigger,
}: CartPanelProps) {
  const slots = cartPanel({ position });

  const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const gst = Math.round(subtotal * gstRate);
  const total = subtotal + gst;

  // Radix declares these three without `| undefined`, and the workspace runs
  // `exactOptionalPropertyTypes`, so an unset prop has to be left off rather than passed through
  // as `undefined` — which is also exactly what "uncontrolled" means to Radix.
  const rootProps: DialogPrimitive.DialogProps = {};
  if (isDefaultOpen !== undefined) rootProps.defaultOpen = isDefaultOpen;
  if (isOpen !== undefined) rootProps.open = isOpen;
  if (onOpenChange !== undefined) rootProps.onOpenChange = onOpenChange;

  const portalProps: DialogPrimitive.DialogPortalProps = {};
  if (container !== null && container !== undefined) portalProps.container = container;

  return (
    <DialogPrimitive.Root {...rootProps}>
      {trigger === undefined ? null : (
        <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      )}
      <DialogPrimitive.Portal {...portalProps}>
        <DialogPrimitive.Overlay className={slots.overlay()} />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={slots.content({ class: className })}
        >
          <div className={slots.header()}>
            <div className={slots.heading()}>
              <DialogPrimitive.Title className={slots.title()}>{title}</DialogPrimitive.Title>
              {meta === "" ? null : (
                <span className={slots.meta()}>
                  <Icon icon={MapPin} size="sm" />
                  {meta}
                </span>
              )}
            </div>
            <DialogPrimitive.Close asChild>
              <IconButton icon={X} label={closeLabel} size="sm" />
            </DialogPrimitive.Close>
          </div>

          {lines.length === 0 ? (
            <div className={slots.empty()}>
              <EmptyState
                action={<Button onClick={onBrowse}>Browse the Menu</Button>}
                body="Let's fix that."
                hasSymbol
                title="Nothing here yet."
              />
            </div>
          ) : (
            <>
              <div className={slots.scroller()}>
                <ul className={slots.list()}>
                  {lines.map((line) => (
                    <li className={slots.line()} key={line.name}>
                      <span aria-hidden className={slots.thumb()} />
                      <div className={slots.lineBody()}>
                        <span className={slots.lineHead()}>
                          <DietMark size="sm" variant={line.diet ?? "veg"} />
                          <span className={slots.lineName()}>{line.name}</span>
                        </span>
                        {line.note === undefined ? null : (
                          <span className={slots.lineNote()}>{line.note}</span>
                        )}
                        <PriceTag amount={line.price * line.quantity} size="sm" />
                      </div>
                      <QuantityStepper
                        decrementLabel={`Remove one ${line.name}`}
                        incrementLabel={`Add one ${line.name}`}
                        label={`${line.name} quantity`}
                        min={0}
                        onChange={(quantity) => {
                          onQuantityChange?.(line.name, quantity);
                        }}
                        size="sm"
                        value={line.quantity}
                      />
                    </li>
                  ))}
                </ul>

                <Card className={slots.note()} padding="sm" variant="quiet">
                  <Input
                    aria-label="Notes for the kitchen"
                    icon={Pencil}
                    placeholder="Any notes for the kitchen?"
                  />
                </Card>

                <PriceSummary
                  className={slots.summary()}
                  lines={[
                    { label: "Subtotal", amount: subtotal },
                    { label: `GST (${String(Math.round(gstRate * 100))}%)`, amount: gst },
                  ]}
                  note="Inclusive of all taxes."
                  total={total}
                  totalLabel="To Pay"
                />
              </div>

              <div className={slots.payBar()}>
                <Button
                  iconAfter={ArrowRight}
                  isFullWidth
                  onClick={onPlaceOrder}
                  size="lg"
                >{`Pay ${formatRupees(total)}`}</Button>
              </div>
            </>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
