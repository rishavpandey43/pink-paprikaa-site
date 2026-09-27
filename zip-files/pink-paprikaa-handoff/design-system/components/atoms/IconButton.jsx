import React from "react";
import { Icon } from "./Icon.jsx";

const H = { sm: 32, md: 40, lg: 48 };

/** Square-footprint circular button carrying a single Lucide glyph. */
export function IconButton({ icon, label, variant = "ghost", size = "md", on = "light", disabled, style, onClick, ...rest }) {
  const [press, setPress] = React.useState(false);
  const [hover, setHover] = React.useState(false);
  const skins = {
    primary: { background: "var(--pink-500)", color: "var(--ink-000)", border: "none" },
    secondary: { background: "var(--ink-000)", color: "var(--pink-600)", border: "1px solid var(--border-default)" },
    ghost: { background: hover ? (on === "brand" ? "rgba(255,255,255,.16)" : "var(--pink-50)") : "transparent", color: on === "brand" ? "var(--ink-000)" : "var(--ink-700)", border: "none" },
    glass: { background: "var(--surface-glass)", color: "var(--ink-900)", border: "none", backdropFilter: "var(--blur-glass)" },
  };
  const s = skins[variant] || skins.ghost;
  return (
    <button
      type="button" aria-label={label} disabled={disabled} onClick={onClick}
      onPointerDown={() => setPress(true)} onPointerUp={() => setPress(false)}
      onPointerEnter={() => setHover(true)} onPointerLeave={() => { setHover(false); setPress(false); }}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: H[size], height: H[size], borderRadius: "var(--radius-pill)",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background var(--dur-fast) var(--ease-out), transform var(--dur-instant) var(--ease-out)",
        transform: press && !disabled ? "scale(var(--press-scale))" : "none",
        opacity: disabled ? 0.45 : 1, ...s, ...style,
      }}
      {...rest}
    >
      <Icon name={icon} size={size === "sm" ? "sm" : size === "lg" ? "lg" : "md"} />
    </button>
  );
}
