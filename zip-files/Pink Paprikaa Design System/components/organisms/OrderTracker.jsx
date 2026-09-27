import React from "react";
import { PatternField } from "../atoms/PatternField.jsx";
import { Text } from "../atoms/Text.jsx";
import { Badge } from "../atoms/Badge.jsx";
import { Card } from "../atoms/Card.jsx";
import { Button } from "../atoms/Button.jsx";
import { Divider } from "../atoms/Divider.jsx";
import { StepTracker } from "../molecules/StepTracker.jsx";

const DEFAULT_STEPS = [
  { label: "Order in", note: "Kitchen's on it." },
  { label: "On the tandoor", note: "Chilli paneer is charring." },
  { label: "Ready for pickup", note: "Counter 2, ask for Paprikaa." },
];

/** Live order status screen. */
export function OrderTracker({ steps = DEFAULT_STEPS, current = 0, code = "PPK-4821", outlet = "SECTOR 57, GURGAON", total = 0, payment = "UPI", base = "/assets", onDone, style, ...rest }) {
  const last = current >= steps.length - 1;
  const step = steps[Math.min(current, steps.length - 1)];
  return (
    <div style={{ flex: 1, overflowY: "auto", ...style }} {...rest}>
      <PatternField tone="brand" tile={58} base={base}>
        <div style={{ padding: "18px 20px 30px", color: "#fff" }}>
          <Badge tone="ink">{last ? "Ready" : "Preparing"}</Badge>
          <Text variant="h2" as="div" tone="inverse" style={{ marginTop: 12 }}>{step.label}</Text>
          <Text variant="body" as="div" tone="rgba(255,255,255,.88)" style={{ marginTop: 6 }}>{step.note}</Text>
          <Text variant="mono" as="div" tone="rgba(255,255,255,.85)" style={{ marginTop: 18 }}>{"ORDER #" + code + " \u00B7 " + outlet}</Text>
        </div>
      </PatternField>
      <div style={{ padding: 20, display: "grid", gap: 14 }}>
        <StepTracker steps={steps} current={current} base={base} />
        <Divider variant="diamond" base={base} style={{ margin: "6px 0" }} />
        <Card variant="quiet" padding={16}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <Text variant="body-sm" tone="muted" as="span">{"Paid \u00B7 " + payment}</Text>
            <Text variant="body-sm" weight={700} as="span" style={{ fontFamily: "var(--font-display)" }}>{"\u20B9" + total}</Text>
          </div>
        </Card>
        {onDone ? <Button variant="secondary" fullWidth onClick={onDone}>Back to Home</Button> : null}
      </div>
    </div>
  );
}
