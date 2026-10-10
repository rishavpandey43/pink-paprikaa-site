import React from "react";
import { Icon } from "../atoms/Icon.jsx";
import { usePress, mergeHandlers } from "../atoms/TextButton.jsx";

function PageButton({ children, current, disabled, onClick, label, state, ...rest }) {
  const p = usePress(disabled || current);
  const hover = state ? state === "hover" : p.hover;
  const press = state ? state === "press" : p.press;
  const focus = state ? state === "focus" : p.focus;
  return (
    <button
      type="button" onClick={onClick} aria-label={label} aria-current={current ? "page" : undefined} disabled={disabled}
      {...mergeHandlers(p.bind, rest)}
      style={{
        minWidth: 40, height: 40, padding: "0 10px", borderRadius: "var(--radius-pill)", display: "grid", placeItems: "center",
        border: current ? "1px solid var(--pink-500)" : "1px solid " + (disabled ? "var(--ink-200)" : hover || press ? "var(--pink-300)" : "var(--border-default)"),
        background: current ? "var(--pink-500)" : disabled ? "var(--state-disabled-fill)" : press ? "var(--state-press)" : hover ? "var(--state-hover)" : "var(--ink-000)",
        color: current ? "var(--ink-000)" : disabled ? "var(--ink-400)" : hover || press ? "var(--pink-700)" : "var(--ink-700)",
        fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, fontVariantNumeric: "tabular-nums",
        cursor: disabled ? "not-allowed" : current ? "default" : "pointer",
        transform: press ? "scale(.94)" : "none",
        outline: focus && !disabled ? "2px solid var(--pink-500)" : "none", outlineOffset: 2,
        transition: "background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out), transform var(--dur-instant) var(--ease-out)",
      }}
    >
      {children}
    </button>
  );
}

/** Page control for blog / press listings. Every page button has hover, press,
    focus-visible and current states; prev/next disable at the ends. */
export function Pagination({ page = 1, pages = 1, onChange, style, ...rest }) {
  const go = (p) => onChange && p >= 1 && p <= pages && p !== page && onChange(p);
  const nums = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) nums.push(i);
    else if (nums[nums.length - 1] !== "…") nums.push("…");
  }
  return (
    <nav aria-label="Pagination" style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", ...style }} {...rest}>
      <PageButton label="Previous page" disabled={page <= 1} onClick={() => go(page - 1)}><Icon name="chevron-left" size="sm" /></PageButton>
      {nums.map((n, i) => n === "…"
        ? <span key={"e" + i} aria-hidden="true" style={{ minWidth: 24, textAlign: "center", fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--ink-400)" }}>…</span>
        : <PageButton key={n} current={n === page} label={"Page " + n} onClick={() => go(n)}>{n}</PageButton>)}
      <PageButton label="Next page" disabled={page >= pages} onClick={() => go(page + 1)}><Icon name="chevron-right" size="sm" /></PageButton>
    </nav>
  );
}

export { PageButton };
