import React from "react";
import { Icon } from "./Icon.jsx";
import { usePress, mergeHandlers } from "./TextButton.jsx";

/** Selectable filter pill used across menu category rails. */
export function Tag({ children, selected, icon, onClick, disabled, state, style, ...rest }) {
  const interactive = !!onClick;
  const p = usePress(disabled || !interactive);
  const hover = state ? state === "hover" : p.hover;
  const press = state ? state === "press" : p.press;
  const focus = state ? state === "focus" : p.focus;
  return (
    <button
      type="button" disabled={disabled} onClick={onClick}
      aria-pressed={interactive ? !!selected : undefined}
      {...mergeHandlers(p.bind, rest)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        height: 38, padding: "0 16px",
        fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 14, lineHeight: 1,
        borderRadius: "var(--radius-pill)",
        flex: "0 0 auto",
        border: "1px solid " + (disabled ? "var(--ink-200)" : selected ? (press ? "var(--brand-active)" : hover ? "var(--brand-hover)" : "var(--pink-500)") : hover || press ? "var(--pink-300)" : "var(--border-default)"),
        background: disabled ? "var(--state-disabled-fill)" : selected ? (press ? "var(--brand-active)" : hover ? "var(--brand-hover)" : "var(--pink-500)") : press ? "var(--state-press)" : hover ? "var(--state-hover)" : "var(--ink-000)",
        color: disabled ? "var(--ink-400)" : selected ? "var(--ink-000)" : hover || press ? "var(--pink-700)" : "var(--ink-700)",
        cursor: disabled ? "not-allowed" : interactive ? "pointer" : "default",
        transform: press ? "scale(var(--press-scale))" : "none",
        outline: focus ? "2px solid var(--pink-500)" : "none", outlineOffset: 2, whiteSpace: "nowrap",
        transition: "background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out), transform var(--dur-instant) var(--ease-out)",
        ...style,
      }}
    >
      {icon ? <Icon name={icon} size="sm" /> : null}
      {children}
    </button>
  );
}
