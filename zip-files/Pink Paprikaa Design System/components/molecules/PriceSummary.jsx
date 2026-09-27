import React from "react";
import { Text } from "../atoms/Text.jsx";
import { Divider } from "../atoms/Divider.jsx";
import { PriceTag } from "../atoms/PriceTag.jsx";

/** Cart / invoice totals block. Enforces the money formatting rules. */
export function PriceSummary({ lines = [], total, totalLabel = "Total", note, tone = "light", style, ...rest }) {
  const inverse = tone === "inverse";
  return (
    <div style={{ display: "grid", gap: 8, ...style }} {...rest}>
      {lines.map((l) => (
        <div key={l.label} style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <Text variant="body-sm" tone={inverse ? "rgba(255,255,255,.75)" : l.strong ? "heading" : "muted"} as="span">{l.label}</Text>
          <Text variant="body-sm" tone={inverse ? "rgba(255,255,255,.9)" : l.discount ? "var(--mint)" : "body"} weight={l.strong ? 500 : 400} as="span">
            {(l.discount ? "-" : "") + "₹" + Math.abs(l.amount).toLocaleString("en-IN")}
          </Text>
        </div>
      ))}
      <Divider on={inverse ? "brand" : "light"} style={{ margin: "4px 0" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <Text variant="h4" as="span" tone={inverse ? "inverse" : "heading"}>{totalLabel}</Text>
        <PriceTag amount={total} size="lg" tone={inverse ? "inverse" : "ink"} />
      </div>
      {note ? <Text variant="caption" tone={inverse ? "rgba(255,255,255,.65)" : "subtle"} as="span">{note}</Text> : null}
    </div>
  );
}
