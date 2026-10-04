import React from "react";
import { usePress, mergeHandlers } from "./TextButton.jsx";

const SKINS = {
  default: { background: "var(--surface-card)", border: "1px solid var(--border-subtle)", radius: "var(--radius-lg)", shadow: "var(--shadow-1)" },
  feature: { background: "var(--pink-100)", border: "none", radius: "var(--radius-xl)", shadow: "none" },
  brand: { background: "var(--pink-500)", border: "none", radius: "var(--radius-xl)", shadow: "var(--shadow-brand)" },
  ink: { background: "var(--ink-900)", border: "none", radius: "var(--radius-xl)", shadow: "none" },
  quiet: { background: "var(--surface-sunken)", border: "none", radius: "var(--radius-lg)", shadow: "none" },
};

/** Content container. Never gets a coloured left border. */
export function Card({ children, variant = "default", padding = 20, interactive, onClick, style, ...rest }) {
  const p = usePress(!interactive);
  const hover = p.hover, press = p.press;
  const clickable = interactive && !!onClick;
  const s = SKINS[variant] || SKINS.default;
  return (
    <div
      data-surface={variant === "brand" ? "brand" : variant === "ink" ? "ink" : variant === "feature" ? "soft" : undefined}
      onClick={onClick}
      {...(interactive ? mergeHandlers(p.bind, clickable ? { onKeyDown: (e) => { if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onClick(e); } } } : {}) : {})}
      role={clickable ? "button" : undefined} tabIndex={clickable ? 0 : undefined}
      style={{
        background: s.background, border: s.border, borderRadius: s.radius,
        boxShadow: interactive && press ? "var(--shadow-1)" : interactive && hover ? "var(--shadow-3)" : s.shadow,
        transform: interactive && press ? "scale(.99)" : interactive && hover ? "translateY(var(--lift-y))" : "none",
        outline: interactive && p.focus ? "2px solid var(--pink-500)" : "none", outlineOffset: 2,
        transition: "box-shadow var(--dur-base) var(--ease-out), transform " + (press ? "var(--dur-instant)" : "var(--dur-base)") + " var(--ease-out)",
        padding, overflow: "hidden",
        cursor: interactive ? "pointer" : undefined,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
