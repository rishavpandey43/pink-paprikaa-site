import React from "react";
import { Text } from "../atoms/Text.jsx";
import { Icon } from "../atoms/Icon.jsx";

/** Label + control + hint/error wrapper. Use around any bare control. */
export function Field({ label, hint, error, success, warning, required, optional, htmlFor, children, layout = "stack", style, ...rest }) {
  const side = layout === "side";
  const key = error ? "error" : success ? "success" : warning ? "warning" : null;
  const MSG = { error: { c: "var(--status-danger)", i: "circle-alert" }, success: { c: "#186c51", i: "circle-check" }, warning: { c: "#8a5c00", i: "triangle-alert" } };
  const m = key ? MSG[key] : null;
  const text = key ? (error || success || warning) : null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: side ? "minmax(0,160px) minmax(0,1fr)" : undefined, gap: side ? 16 : 6, alignItems: side ? "start" : undefined, ...style }} {...rest}>
      {label ? (
        <label htmlFor={htmlFor} style={{ display: "flex", alignItems: "baseline", gap: 6, paddingTop: side ? 13 : 0 }}>
          <Text variant="body-sm" weight={500} tone="body" as="span">{label}</Text>
          {required ? <Text variant="body-sm" tone="brand" as="span">*</Text> : null}
          {optional ? <Text variant="caption" tone="subtle" as="span">optional</Text> : null}
        </label>
      ) : null}
      <div style={{ display: "grid", gap: 6, minWidth: 0 }}>
        {children}
        {m ? (
          <span style={{ display: "flex", alignItems: "center", gap: 6, color: m.c }}>
            <Icon name={m.i} size={14} />
            <Text variant="caption" tone={m.c} as="span">{text}</Text>
          </span>
        ) : hint ? <Text variant="caption" tone="subtle" as="span">{hint}</Text> : null}
      </div>
    </div>
  );
}
