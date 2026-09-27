import React from "react";
import { Text } from "../atoms/Text.jsx";
import { Icon } from "../atoms/Icon.jsx";
import { Button } from "../atoms/Button.jsx";
import { Card } from "../atoms/Card.jsx";
import { Input } from "../atoms/Input.jsx";
import { DietMark } from "../atoms/DietMark.jsx";
import { PriceTag } from "../atoms/PriceTag.jsx";
import { QuantityStepper } from "../molecules/QuantityStepper.jsx";
import { PriceSummary } from "../molecules/PriceSummary.jsx";
import { EmptyState } from "../molecules/EmptyState.jsx";

/** The order panel: line items, note, totals, sticky pay bar. */
export function CartPanel({ lines = [], title = "Your order", meta = "Pickup \u00B7 Sector 57 \u00B7 12 min", gstRate = 0.05, base = "/assets", onQty, onPlace, onBrowse, style, ...rest }) {
  const sub = lines.reduce((n, l) => n + l.price * l.qty, 0);
  const gst = Math.round(sub * gstRate);
  const total = sub + gst;
  if (!lines.length) {
    return (
      <div style={{ flex: 1, display: "grid", placeItems: "center", padding: 32, ...style }} {...rest}>
        <EmptyState symbol base={base} title="Nothing here yet." body="Let's fix that."
          action={<Button onClick={onBrowse}>Browse the Menu</Button>} />
      </div>
    );
  }
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", ...style }} {...rest}>
      <div style={{ padding: "4px 20px 12px" }}>
        <Text variant="h3" as="h3">{title}</Text>
        {meta ? (
          <span style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 6, color: "var(--text-muted)" }}>
            <Icon name="map-pin" size="sm" /><Text variant="body-sm" tone="muted" as="span">{meta}</Text>
          </span>
        ) : null}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px" }}>
        {lines.map((l) => (
          <div key={l.name} style={{ display: "flex", gap: 14, alignItems: "center", padding: "16px 0", borderBottom: "1px solid var(--border-subtle)" }}>
            <div style={{ width: 56, height: 56, borderRadius: "var(--radius-md)", background: "var(--pink-100)", flex: "0 0 auto" }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <DietMark type={l.diet} size={13} />
                <Text variant="body-sm" weight={700} as="span" style={{ fontFamily: "var(--font-display)" }}>{l.name}</Text>
              </span>
              <Text variant="caption" tone="subtle" as="div" style={{ marginTop: 3 }}>{l.note || "Regular \u00B7 Hot"}</Text>
              <div style={{ marginTop: 6 }}><PriceTag amount={l.price} size="sm" /></div>
            </div>
            <QuantityStepper size="sm" value={l.qty} min={0} onChange={(n) => onQty && onQty(l.name, n)} />
          </div>
        ))}
        <Card variant="quiet" padding={16} style={{ marginTop: 18 }}>
          <Input placeholder="Any notes for the kitchen?" icon="pencil" />
        </Card>
        <PriceSummary style={{ padding: "18px 0 20px" }} total={total} note="Inclusive of all taxes."
          lines={[{ label: "Subtotal", amount: sub }, { label: "GST (5%)", amount: gst }]} />
      </div>
      <div style={{ padding: "12px 20px 14px", borderTop: "1px solid var(--border-subtle)", background: "var(--ink-000)" }}>
        <Button fullWidth size="lg" iconAfter="arrow-right" onClick={onPlace}>{"Pay \u20B9" + total}</Button>
      </div>
    </div>
  );
}
