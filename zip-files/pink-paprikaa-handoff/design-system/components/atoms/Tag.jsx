import React from "react";
import { Icon } from "./Icon.jsx";

/** Selectable filter pill used across menu category rails. */
export function Tag({ children, selected, icon, onClick, disabled, style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const interactive = !!onClick;
  return (
    <button
      type="button" disabled={disabled} onClick={onClick}
      aria-pressed={interactive ? !!selected : undefined}
      onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        height: 38, padding: "0 16px",
        fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 14, lineHeight: 1,
        borderRadius: "var(--radius-pill)",
        flex: "0 0 auto",
        border: selected ? "1px solid var(--pink-500)" : "1px solid var(--border-default)",
        background: selected ? "var(--pink-500)" : hover && interactive ? "var(--pink-50)" : "var(--ink-000)",
        color: selected ? "var(--ink-000)" : "var(--ink-700)",
        cursor: disabled ? "not-allowed" : interactive ? "pointer" : "default",
        opacity: disabled ? 0.5 : 1, whiteSpace: "nowrap",
        transition: "background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)",
        ...style,
      }}
      {...rest}
    >
      {icon ? <Icon name={icon} size="sm" /> : null}
      {children}
    </button>
  );
}
