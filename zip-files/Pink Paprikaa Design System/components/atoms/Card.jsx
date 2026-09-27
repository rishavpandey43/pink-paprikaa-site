import React from "react";

const SKINS = {
  default: { background: "var(--surface-card)", border: "1px solid var(--border-subtle)", radius: "var(--radius-lg)", shadow: "var(--shadow-1)" },
  feature: { background: "var(--pink-100)", border: "none", radius: "var(--radius-xl)", shadow: "none" },
  brand: { background: "var(--pink-500)", border: "none", radius: "var(--radius-xl)", shadow: "var(--shadow-brand)" },
  ink: { background: "var(--ink-900)", border: "none", radius: "var(--radius-xl)", shadow: "none" },
  quiet: { background: "var(--surface-sunken)", border: "none", radius: "var(--radius-lg)", shadow: "none" },
};

/** Content container. Never gets a coloured left border. */
export function Card({ children, variant = "default", padding = 20, interactive, onClick, style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const s = SKINS[variant] || SKINS.default;
  return (
    <div
      data-surface={variant === "brand" ? "brand" : variant === "ink" ? "ink" : variant === "feature" ? "soft" : undefined}
      onClick={onClick}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      style={{
        background: s.background, border: s.border, borderRadius: s.radius,
        boxShadow: interactive && hover ? "var(--shadow-3)" : s.shadow,
        transform: interactive && hover ? "translateY(var(--lift-y))" : "none",
        transition: "box-shadow var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out)",
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
