import React from "react";
import { usePress, mergeHandlers } from "../atoms/TextButton.jsx";

function Tab({ t, on, onPick }) {
  const p = usePress(t.disabled);
  return (
    <button
      role="tab" aria-selected={on} type="button" disabled={t.disabled} onClick={onPick} {...p.bind}
      style={{
        border: "none", background: "transparent", cursor: t.disabled ? "not-allowed" : "pointer",
        padding: "0 0 12px", position: "relative", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, letterSpacing: "-.005em",
        color: t.disabled ? "var(--ink-300)" : p.press ? "var(--pink-700)" : on || p.hover ? "var(--text-heading)" : "var(--text-subtle)",
        outline: p.focus ? "2px solid var(--pink-500)" : "none", outlineOffset: 4, borderRadius: 4,
        transition: "color var(--dur-fast) var(--ease-out)",
      }}
    >
      {t.label}
      <span style={{ position: "absolute", left: 0, right: 0, bottom: -1, height: 3, borderRadius: "3px 3px 0 0", background: on ? (p.press ? "var(--brand-active)" : "var(--pink-500)") : p.press ? "var(--pink-300)" : p.hover ? "var(--ink-200)" : "transparent", transition: "background var(--dur-base) var(--ease-out)" }} />
    </button>
  );
}

/** Underline tab set for in-page section switching. */
export function Tabs({ items = [], value, onChange, style, ...rest }) {
  return (
    <div role="tablist" style={{ display: "flex", gap: 28, borderBottom: "1px solid var(--border-subtle)", ...style }} {...rest}>
      {items.map((it) => {
        const t = typeof it === "string" ? { value: it, label: it } : it;
        const on = t.value === value;
        return <Tab key={t.value} t={t} on={on} onPick={() => onChange && onChange(t.value)} />;
      })}
    </div>
  );
}
