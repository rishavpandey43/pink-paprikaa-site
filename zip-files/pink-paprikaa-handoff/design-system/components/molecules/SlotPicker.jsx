import React from "react";

/** Pickup / table time slots. Wraps freely; 44px minimum hit height. */
export function SlotPicker({ slots = [], value, onChange, label, columns, error, disabled, style, ...rest }) {
  return (
    <div style={{ display: "grid", gap: 10, ...style }} {...rest}>
      {label ? <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 14, color: "var(--text-body)" }}>{label}</span> : null}
      <div style={{ display: "grid", gap: 10, gridTemplateColumns: columns ? "repeat(" + columns + ", minmax(0,1fr))" : "repeat(auto-fit,minmax(96px,1fr))" }}>
        {slots.map((s) => {
          const slot = typeof s === "string" ? { value: s, label: s } : s;
          const on = slot.value === value;
          const off = slot.disabled || disabled;
          return (
            <button
              key={slot.value} type="button" disabled={off}
              onClick={() => onChange && onChange(slot.value)}
              aria-pressed={on}
              style={{
                minHeight: "var(--hit-min)", padding: "8px 10px",
                borderRadius: "var(--radius-md)",
                border: on ? "2px solid var(--pink-500)" : "1px solid " + (error ? "var(--status-danger)" : "var(--border-default)"),
                background: on ? "var(--pink-50)" : off ? "var(--ink-100)" : "var(--ink-000)",
                color: off ? "var(--ink-400)" : on ? "var(--pink-700)" : "var(--ink-700)",
                fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14,
                cursor: off ? "not-allowed" : "pointer",
                textDecoration: slot.disabled ? "line-through" : "none",
                display: "grid", placeItems: "center", gap: 2, minWidth: 0,
              }}
            >
              <span>{slot.label}</span>
              {slot.note ? <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: 11.5, color: "var(--text-subtle)" }}>{slot.note}</span> : null}
            </button>
          );
        })}
      </div>
      {typeof error === "string" ? <span style={{ fontSize: 12.5, color: "var(--status-danger)" }}>{error}</span> : null}
    </div>
  );
}
