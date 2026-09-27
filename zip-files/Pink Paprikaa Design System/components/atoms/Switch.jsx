import React from "react";

/** Instant-effect toggle. Never used to submit a form. */
export function Switch({ label, description, checked, onChange, disabled, style, ...rest }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 14, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, ...style }}>
      <span style={{ display: "grid", gap: 2, flex: 1 }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 15, color: "var(--text-body)" }}>{label}</span>
        {description ? <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{description}</span> : null}
      </span>
      <input type="checkbox" role="switch" checked={!!checked} onChange={onChange} disabled={disabled} style={{ position: "absolute", opacity: 0, width: 1, height: 1 }} {...rest} />
      <span
        aria-hidden="true"
        style={{
          width: 46, height: 28, flex: "0 0 auto", borderRadius: "var(--radius-pill)",
          background: checked ? "var(--pink-500)" : "var(--ink-300)",
          position: "relative", transition: "background var(--dur-base) var(--ease-out)",
        }}
      >
        <span style={{
          position: "absolute", top: 3, left: checked ? 21 : 3, width: 22, height: 22,
          borderRadius: "var(--radius-pill)", background: "var(--ink-000)",
          boxShadow: "var(--shadow-1)", transition: "left var(--dur-base) var(--ease-out)",
        }} />
      </span>
    </label>
  );
}
