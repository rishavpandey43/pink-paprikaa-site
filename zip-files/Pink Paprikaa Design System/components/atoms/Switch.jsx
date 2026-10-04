import React from "react";
import { usePress } from "./TextButton.jsx";

/** Instant-effect toggle. Never used to submit a form. */
export function Switch({ label, description, checked, onChange, disabled, style, ...rest }) {
  const p = usePress(disabled);
  return (
    <label onPointerEnter={p.bind.onPointerEnter} onPointerLeave={p.bind.onPointerLeave} onPointerDown={p.bind.onPointerDown} onPointerUp={p.bind.onPointerUp}
      style={{ position: "relative", background: disabled ? "transparent" : p.press ? "var(--state-press)" : p.hover ? "var(--state-hover)" : "transparent", padding: "10px 12px", margin: "0 -12px", borderRadius: "var(--radius-md)", transition: "background var(--dur-fast) var(--ease-out)", display: "flex", alignItems: "center", gap: 14, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, ...style }}>
      <span style={{ display: "grid", gap: 2, flex: 1 }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 15, color: "var(--text-body)" }}>{label}</span>
        {description ? <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{description}</span> : null}
      </span>
      <input type="checkbox" role="switch" checked={!!checked} onChange={onChange} disabled={disabled} onFocus={p.bind.onFocus} onBlur={p.bind.onBlur} onKeyDown={p.bind.onKeyDown} onKeyUp={p.bind.onKeyUp} style={{ position: "absolute", opacity: 0, width: 1, height: 1 }} {...rest} />
      <span
        aria-hidden="true"
        style={{
          width: 46, height: 28, flex: "0 0 auto", borderRadius: "var(--radius-pill)",
          background: checked ? (p.press ? "var(--brand-active)" : p.hover ? "var(--brand-hover)" : "var(--pink-500)") : p.press ? "var(--ink-500)" : p.hover ? "var(--ink-400)" : "var(--ink-300)",
          outline: p.focus ? "2px solid var(--pink-500)" : "none", outlineOffset: 2,
          position: "relative", transition: "background var(--dur-base) var(--ease-out)",
        }}
      >
        <span style={{
          position: "absolute", top: 3, left: checked ? (p.press ? 17 : 21) : 3, width: p.press ? 26 : 22, height: 22,
          borderRadius: "var(--radius-pill)", background: "var(--ink-000)",
          boxShadow: "var(--shadow-1)", transition: "left var(--dur-base) var(--ease-out), width var(--dur-fast) var(--ease-out)",
        }} />
      </span>
    </label>
  );
}
