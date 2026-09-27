import React from "react";
import { Stat } from "../molecules/Stat.jsx";
import { PatternField } from "../atoms/PatternField.jsx";

/** A row of big numbers. Three or four, never more. */
export function StatBand({ stats = [], tone = "soft", base = "/assets", style, ...rest }) {
  const inverse = tone === "brand" || tone === "ink";
  return (
    <PatternField tone={tone === "brand" ? "brand" : tone === "ink" ? "ink" : "soft"} tile={80} base={base} style={style} {...rest}>
      <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "clamp(40px,5vw,64px) var(--gutter-fluid)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(200px,100%), 1fr))", gap: "clamp(24px,3vw,40px)" }}>
        {stats.map((s) => <Stat key={s.label} {...s} tone={inverse ? "inverse" : "brand"} align="center" />)}
      </div>
    </PatternField>
  );
}
