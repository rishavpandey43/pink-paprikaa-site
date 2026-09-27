import React from "react";
import { Icon } from "./Icon.jsx";

/** Add-on / consent checkbox. 6px radius, pink when checked. */
export function Checkbox({ label, description, checked, onChange, disabled, error, price, style, ...rest }) {
  const line = error ? "var(--status-danger)" : "var(--border-default)";
  return (
    <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, ...style }}>
      <input type="checkbox" checked={!!checked} onChange={onChange} disabled={disabled} style={{ position: "absolute", opacity: 0, width: 1, height: 1 }} {...rest} />
      <span
        aria-hidden="true"
        style={{
          width: 22, height: 22, flex: "0 0 auto", marginTop: 1,
          borderRadius: "var(--radius-sm)",
          border: checked ? "2px solid var(--pink-500)" : "2px solid " + line,
          background: checked ? "var(--pink-500)" : "var(--ink-000)",
          display: "grid", placeItems: "center", color: "var(--ink-000)",
          transition: "background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)",
        }}
      >
        {checked ? <Icon name="check" size={14} /> : null}
      </span>
      <span style={{ display: "grid", gap: 2, flex: 1 }}>
        <span style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 15, color: "var(--text-body)" }}>{label}</span>
          {price != null ? <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text-heading)" }}>+₹{price}</span> : null}
        </span>
        {description ? <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{description}</span> : null}
      </span>
      {error && typeof error === "string" ? (
        <span style={{ gridColumn: "2", fontSize: 12.5, color: "var(--status-danger)" }}>{error}</span>
      ) : null}
    </label>
  );
}
