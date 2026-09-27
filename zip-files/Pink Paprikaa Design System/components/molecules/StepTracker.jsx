import React from "react";
import { Text } from "../atoms/Text.jsx";
import { Icon } from "../atoms/Icon.jsx";

const markScale = (s) => (s < 14 ? 0.86 : s < 20 ? 0.8 : 0.74);
const markAlpha = (s) => (s < 14 ? 0.8 : s < 20 ? 0.62 : 0.5);

/** Vertical or horizontal progress through named steps. Brand diamond markers. */
export function StepTracker({ steps = [], current = 0, orientation = "vertical", tone = "light", base = "/assets", style, ...rest }) {
  const inverse = tone === "inverse";
  const vertical = orientation === "vertical";
  const empty = inverse ? "rgba(255,255,255,.25)" : "var(--ink-200)";
  return (
    <div style={{ display: vertical ? "grid" : "flex", gap: vertical ? 14 : 8, ...style }} {...rest}>
      {steps.map((s, i) => {
        const step = typeof s === "string" ? { label: s } : s;
        const done = i < current;
        const active = i === current;
        const on = i <= current;
        return (
          <div key={step.label} style={{ display: "flex", flexDirection: vertical ? "row" : "column", gap: vertical ? 14 : 8, alignItems: vertical ? "flex-start" : "stretch", flex: vertical ? undefined : 1, minWidth: 0 }}>
            {vertical ? (
              <span style={{ position: "relative", width: 22, height: 22, marginTop: 2, flex: "0 0 auto" }}>
                <span style={{ position: "absolute", inset: 0, transform: "rotate(45deg)", borderRadius: 3, overflow: "hidden", background: on ? "var(--pink-500)" : empty, display: "grid", placeItems: "center" }}>
                  <img src={base + "/symbol-" + (on ? "white" : "pink") + ".svg"} alt=""
                    style={{ width: markScale(22) * 100 + "%", height: markScale(22) * 100 + "%", objectFit: "contain", transform: "rotate(-45deg)", opacity: markAlpha(22) }} />
                </span>
                {done ? (
                  <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
                    <Icon name="check" size={12} style={{ color: "#fff" }} />
                  </span>
                ) : null}
              </span>
            ) : (
              <span style={{ height: 5, borderRadius: 99, background: on ? "var(--pink-500)" : empty, transition: "background var(--dur-base) var(--ease-out)" }} />
            )}
            <div style={{ minWidth: 0 }}>
              <Text variant={vertical ? "body-sm" : "caption"} weight={active ? 700 : 500} as="div"
                tone={inverse ? (on ? "inverse" : "rgba(255,255,255,.55)") : on ? "heading" : "subtle"}
                style={{ fontFamily: "var(--font-display)" }}>{step.label}</Text>
              {step.note && vertical ? <Text variant="caption" tone={inverse ? "rgba(255,255,255,.6)" : "muted"} as="div">{step.note}</Text> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
