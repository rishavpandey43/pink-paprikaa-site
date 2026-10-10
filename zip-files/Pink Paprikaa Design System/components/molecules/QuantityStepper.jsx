import React from "react";
import { Icon } from "../atoms/Icon.jsx";
import { usePress, mergeHandlers } from "../atoms/TextButton.jsx";

function StepButton({ icon, label, disabled, onClick, h, small }) {
  const p = usePress(disabled);
  return (
    <button
      type="button" aria-label={label} onClick={onClick} disabled={disabled} {...p.bind}
      style={{
        width: h, height: h, display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-pill)",
        background: disabled ? "transparent" : p.press ? "var(--pink-200)" : p.hover ? "var(--pink-100)" : "transparent",
        color: disabled ? "var(--ink-300)" : p.hover || p.press ? "var(--pink-700)" : "var(--pink-600)",
        cursor: disabled ? "not-allowed" : "pointer", transform: p.press ? "scale(.9)" : "none",
        outline: p.focus ? "2px solid var(--pink-500)" : "none", outlineOffset: -2,
        transition: "background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out), transform var(--dur-instant) var(--ease-out)",
      }}
    >
      <Icon name={icon} size={small ? "sm" : "md"} />
    </button>
  );
}

/** −/+ quantity control used in cart rows and item detail. */
export function QuantityStepper({ value = 1, min = 0, max = 20, onChange, size = "md", style, ...rest }) {
  const h = size === "sm" ? 32 : 40;
  const step = (d) => { const n = Math.min(max, Math.max(min, value + d)); if (n !== value && onChange) onChange(n); };
  const btn = (icon, d, label) => (
    <StepButton icon={icon} label={label} h={h} small={size === "sm"} onClick={() => step(d)} disabled={d < 0 ? value <= min : value >= max} />
  );
  return (
    <div
      style={{
        display: "inline-flex", alignItems: "center",
        border: "1px solid var(--pink-200)", background: "var(--pink-50)",
        borderRadius: "var(--radius-pill)", ...style,
      }}
      {...rest}
    >
      {btn("minus", -1, "Remove one")}
      <span style={{ minWidth: 22, textAlign: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: size === "sm" ? 14 : 16, color: "var(--text-heading)" }}>{value}</span>
      {btn("plus", 1, "Add one")}
    </div>
  );
}
