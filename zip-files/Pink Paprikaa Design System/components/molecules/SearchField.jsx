import React from "react";
import { Icon } from "../atoms/Icon.jsx";
import { Spinner } from "../atoms/Spinner.jsx";

const BORDER = { default: "var(--border-default)", error: "var(--status-danger)", success: "var(--status-success)", warning: "var(--status-warning)" };

/** Pill search input. The app and site both use this exact shape. */
export function SearchField({
  value, onChange, onClear, placeholder = "Search chai, paneer, kulfi...",
  size = "md", status = "default", disabled, loading, hint, style, ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const h = size === "sm" ? 40 : 48;
  const active = status !== "default" || focus;
  const border = disabled ? "var(--border-subtle)" : active ? BORDER[status] || "var(--pink-500)" : "var(--border-default)";
  const accent = status === "default" ? "var(--pink-500)" : BORDER[status];
  return (
    <div style={{ display: "grid", gap: 6, minWidth: 0, ...style }}>
      <div
        style={{
          display: "flex", alignItems: "center", gap: 10, width: "100%", minWidth: 0,
          height: h, padding: "0 16px",
          background: disabled ? "var(--ink-100)" : "var(--ink-000)",
          borderRadius: "var(--radius-pill)",
          border: (active ? 2 : 1) + "px solid " + border,
          boxShadow: focus && !disabled ? "var(--focus-ring)" : "none",
          cursor: disabled ? "not-allowed" : undefined,
          transition: "border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)",
        }}
      >
        <Icon name="search" size="md" style={{ color: disabled ? "var(--ink-400)" : focus ? accent : "var(--ink-500)" }} />
        <input
          type="search" value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", fontFamily: "var(--font-body)", fontSize: 15, color: disabled ? "var(--ink-400)" : "var(--text-body)", cursor: disabled ? "not-allowed" : undefined }}
          {...rest}
        />
        {loading ? <Spinner size={18} /> : null}
        {!loading && value && onClear ? (
          <button type="button" aria-label="Clear search" onClick={onClear}
            style={{ border: "none", background: "transparent", color: "var(--ink-500)", cursor: "pointer", display: "grid", placeItems: "center", padding: 2, flex: "0 0 auto" }}>
            <Icon name="x" size="sm" />
          </button>
        ) : null}
      </div>
      {hint ? <span style={{ fontSize: 12.5, paddingInline: 16, color: status === "default" ? "var(--text-subtle)" : BORDER[status] }}>{hint}</span> : null}
    </div>
  );
}
