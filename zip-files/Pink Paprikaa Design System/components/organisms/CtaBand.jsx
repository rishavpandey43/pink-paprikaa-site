import React from "react";
import { PatternField } from "../atoms/PatternField.jsx";
import { Text } from "../atoms/Text.jsx";
import { Button } from "../atoms/Button.jsx";

/** Full-width call-to-action band. The page's closing argument. */
export function CtaBand({ overline, title, body, action, tone = "ink", align = "split", base = "/assets", style, ...rest }) {
  const dark = tone === "ink" || tone === "brand";
  const center = align === "center";
  return (
    <PatternField tone={tone === "brand" ? "brand" : tone === "soft" ? "soft" : "ink"} tile={72} base={base} style={style} {...rest}>
      <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "clamp(48px,6vw,72px) var(--gutter-fluid)", display: "flex", alignItems: center ? "center" : "flex-end", justifyContent: center ? "center" : "space-between", flexDirection: center ? "column" : "row", gap: 32, flexWrap: "wrap", textAlign: center ? "center" : "left" }}>
        <div style={{ minWidth: 0, maxWidth: center ? "44ch" : "36ch" }}>
          {overline ? <Text variant="overline" as="div" tone={dark ? "var(--pink-300)" : "brand"}>{overline}</Text> : null}
          <Text variant="h2" fluid as="h2" tone={dark ? "inverse" : "heading"} style={{ marginTop: 10 }}>{title}</Text>
          {body ? <Text variant="body-lg" as="p" tone={dark ? "rgba(255,255,255,.72)" : "muted"} style={{ marginTop: 12 }}>{body}</Text> : null}
        </div>
        {action ? <div style={{ flex: "0 0 auto" }}>{action}</div> : null}
      </div>
    </PatternField>
  );
}
