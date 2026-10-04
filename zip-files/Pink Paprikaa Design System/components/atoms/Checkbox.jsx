import React from "react";
import { usePress } from "./TextButton.jsx";
import { Icon } from "./Icon.jsx";

/** Add-on / consent checkbox. 6px radius, pink when checked. */
export function Checkbox({ label, description, checked, onChange, disabled, error, price, style, ...rest }) {
  const p = usePress(disabled);
  const line = error ? "var(--status-danger)" : p.hover ? "var(--pink-400)" : "var(--border-default)";
  const fill = checked ? (p.press ? "var(--brand-active)" : p.hover ? "var(--brand-hover)" : "var(--pink-500)") : p.press ? "var(--state-press)" : p.hover ? "var(--state-hover)" : "var(--ink-000)";
  return (
    <label onPointerEnter={p.bind.onPointerEnter} onPointerLeave={p.bind.onPointerLeave} onPointerDown={p.bind.onPointerDown} onPointerUp={p.bind.onPointerUp}
      style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, position: "relative", background: disabled ? "transparent" : p.press ? "var(--state-press)" : p.hover ? "var(--state-hover)" : "transparent", padding: "10px 12px", margin: "0 -12px", borderRadius: "var(--radius-md)", transition: "background var(--dur-fast) var(--ease-out)", ...style }}>
      <input type="checkbox" checked={!!checked} onChange={onChange} disabled={disabled} onFocus={p.bind.onFocus} onBlur={p.bind.onBlur} onKeyDown={p.bind.onKeyDown} onKeyUp={p.bind.onKeyUp} style={{ position: "absolute", opacity: 0, width: 1, height: 1 }} {...rest} />
      <span
        aria-hidden="true"
        style={{
          width: 22, height: 22, flex: "0 0 auto", marginTop: 1,
          borderRadius: "var(--radius-sm)",
          border: "2px solid " + (checked ? fill : line),
          background: fill, transform: p.press ? "scale(.92)" : "none",
          boxShadow: p.focus ? "var(--focus-ring)" : "none", outline: p.focus ? "2px solid var(--pink-500)" : "none", outlineOffset: 2,
          display: "grid", placeItems: "center", color: "var(--ink-000)",
          transition: "background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out), transform var(--dur-instant) var(--ease-out)",
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
