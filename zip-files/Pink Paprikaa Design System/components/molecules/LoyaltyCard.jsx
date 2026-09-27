import React from "react";
import { Card } from "../atoms/Card.jsx";
import { Text } from "../atoms/Text.jsx";
import { ProgressBar } from "../atoms/ProgressBar.jsx";

/** Loyalty stamp card. The one place segmented progress is used. */
export function LoyaltyCard({ visits = 3, goal = 6, reward = "chai", variant = "feature", base = "/assets", style, ...rest }) {
  const left = Math.max(0, goal - visits);
  const done = left === 0;
  const brand = variant === "brand";
  const headline = done ? "Your " + reward + " is on us." : left + " more " + (left === 1 ? "visit" : "visits") + " and " + reward + " is on us.";
  return (
    <Card variant={brand ? "brand" : "feature"} padding={16} style={{ display: "flex", alignItems: "center", gap: 14, ...style }} {...rest}>
      <img src={base + "/symbol-" + (brand ? "white" : "pink") + ".svg"} alt="" style={{ width: 34, flex: "0 0 auto" }} />
      <div style={{ flex: 1, minWidth: 0, display: "grid", gap: 8 }}>
        <Text variant="body-sm" weight={700} as="span" tone={brand ? "on-brand" : "var(--pink-800)"} style={{ fontFamily: "var(--font-display)" }}>{headline}</Text>
        <ProgressBar segments={goal} value={visits} tone={brand ? "inverse" : "brand"} height={6} />
      </div>
    </Card>
  );
}
