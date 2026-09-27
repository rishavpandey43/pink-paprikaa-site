import React from "react";

/** Underline tab set for in-page section switching. */
export function Tabs({ items = [], value, onChange, style, ...rest }) {
  return (
    <div role="tablist" style={{ display: "flex", gap: 28, borderBottom: "1px solid var(--border-subtle)", ...style }} {...rest}>
      {items.map((it) => {
        const t = typeof it === "string" ? { value: it, label: it } : it;
        const on = t.value === value;
        return (
          <button
            key={t.value} role="tab" aria-selected={on} type="button"
            onClick={() => onChange && onChange(t.value)}
            style={{
              border: "none", background: "transparent", cursor: "pointer",
              padding: "0 0 12px", position: "relative",
              fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15,
              letterSpacing: "-.005em",
              color: on ? "var(--text-heading)" : "var(--text-subtle)",
              transition: "color var(--dur-fast) var(--ease-out)",
            }}
          >
            {t.label}
            <span style={{ position: "absolute", left: 0, right: 0, bottom: -1, height: 3, borderRadius: "3px 3px 0 0", background: on ? "var(--pink-500)" : "transparent", transition: "background var(--dur-base) var(--ease-out)" }} />
          </button>
        );
      })}
    </div>
  );
}
