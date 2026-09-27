import React from "react";

/** Single-choice control. Used for size, spice and payment method. */
export function Radio({ label, description, checked, onChange, name, value, disabled, error, price, style, ...rest }) {
  return (
    <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, ...style }}>
      <input type="radio" name={name} value={value} checked={!!checked} onChange={onChange} disabled={disabled} style={{ position: "absolute", opacity: 0, width: 1, height: 1 }} {...rest} />
      <span
        aria-hidden="true"
        style={{
          width: 22, height: 22, flex: "0 0 auto", marginTop: 1, borderRadius: "var(--radius-pill)",
          border: checked ? "6px solid var(--pink-500)" : "2px solid " + (error ? "var(--status-danger)" : "var(--border-default)"),
          background: "var(--ink-000)",
          transition: "border var(--dur-fast) var(--ease-out)",
        }}
      />
      <span style={{ display: "grid", gap: 2, flex: 1 }}>
        <span style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 15, color: "var(--text-body)" }}>{label}</span>
          {price != null ? <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text-heading)" }}>₹{price}</span> : null}
        </span>
        {description ? <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{description}</span> : null}
      </span>
    </label>
  );
}
