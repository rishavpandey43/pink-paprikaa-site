import React from "react";
import { usePress } from "./TextButton.jsx";

/** Single-choice control. Used for size, spice and payment method. */
export function Radio({ label, description, checked, onChange, name, value, disabled, error, price, style, ...rest }) {
  const p = usePress(disabled);
  const ring = checked ? (p.press ? "var(--brand-active)" : p.hover ? "var(--brand-hover)" : "var(--pink-500)") : error ? "var(--status-danger)" : p.hover || p.press ? "var(--pink-400)" : "var(--border-default)";
  return (
    <label onPointerEnter={p.bind.onPointerEnter} onPointerLeave={p.bind.onPointerLeave} onPointerDown={p.bind.onPointerDown} onPointerUp={p.bind.onPointerUp}
      style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, position: "relative", background: disabled ? "transparent" : p.press ? "var(--state-press)" : p.hover ? "var(--state-hover)" : "transparent", padding: "10px 12px", margin: "0 -12px", borderRadius: "var(--radius-md)", transition: "background var(--dur-fast) var(--ease-out)", ...style }}>
      <input type="radio" name={name} value={value} checked={!!checked} onChange={onChange} disabled={disabled} onFocus={p.bind.onFocus} onBlur={p.bind.onBlur} onKeyDown={p.bind.onKeyDown} onKeyUp={p.bind.onKeyUp} style={{ position: "absolute", opacity: 0, width: 1, height: 1 }} {...rest} />
      <span
        aria-hidden="true"
        style={{
          width: 22, height: 22, flex: "0 0 auto", marginTop: 1, borderRadius: "var(--radius-pill)",
          border: (checked ? "6px" : "2px") + " solid " + ring,
          background: !checked && (p.hover || p.press) ? (p.press ? "var(--state-press)" : "var(--state-hover)") : "var(--ink-000)",
          transform: p.press ? "scale(.92)" : "none",
          outline: p.focus ? "2px solid var(--pink-500)" : "none", outlineOffset: 2,
          transition: "border var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out), transform var(--dur-instant) var(--ease-out)",
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
