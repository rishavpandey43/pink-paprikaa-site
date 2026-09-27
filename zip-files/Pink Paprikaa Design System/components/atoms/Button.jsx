import React from "react";
import { Icon } from "./Icon.jsx";

const PAD = { sm: "0 14px", md: "0 20px", lg: "0 28px" };
const H = { sm: 36, md: 44, lg: 54 };
const FS = { sm: 13, md: 15, lg: 17 };

function skin(variant, on) {
  if (on === "brand") {
    return variant === "primary"
      ? { background: "var(--ink-000)", color: "var(--pink-600)", border: "none", shadow: "var(--shadow-2)" }
      : { background: "transparent", color: "var(--ink-000)", border: "2px solid rgba(255,255,255,.7)", shadow: "none" };
  }
  switch (variant) {
    case "secondary":
      return { background: "var(--ink-000)", color: "var(--pink-600)", border: "2px solid var(--pink-500)", shadow: "none" };
    case "ghost":
      return { background: "transparent", color: "var(--pink-600)", border: "none", shadow: "none" };
    case "inverse":
      return { background: "var(--ink-900)", color: "var(--ink-000)", border: "none", shadow: "var(--shadow-2)" };
    default:
      return { background: "var(--pink-500)", color: "var(--text-on-brand)", border: "none", shadow: "var(--shadow-brand)" };
  }
}

/** Primary action. Pill, Poppins 700, Title Case label. */
export function Button({
  children, variant = "primary", size = "md", on = "light",
  icon, iconAfter, fullWidth, disabled, loading, style, onClick, type = "button", ...rest
}) {
  const s = skin(variant, on);
  const [press, setPress] = React.useState(false);
  const [hover, setHover] = React.useState(false);
  const off = disabled || loading;
  return (
    <button
      type={type}
      disabled={off}
      onClick={onClick}
      onPointerDown={() => setPress(true)}
      onPointerUp={() => setPress(false)}
      onPointerLeave={() => { setPress(false); setHover(false); }}
      onPointerEnter={() => setHover(true)}
      style={{
        display: fullWidth ? "flex" : "inline-flex",
        width: fullWidth ? "100%" : undefined,
        alignItems: "center",
        justifyContent: "center",
        gap: size === "sm" ? 6 : 8,
        height: H[size],
        minWidth: H[size],
        padding: PAD[size],
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: FS[size],
        letterSpacing: "-.005em",
        lineHeight: 1,
        whiteSpace: "nowrap",
        flex: fullWidth ? undefined : "0 0 auto",
        borderRadius: "var(--radius-pill)",
        cursor: off ? "not-allowed" : "pointer",
        transition: "background var(--dur-fast) var(--ease-out), transform var(--dur-instant) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)",
        transform: press && !off ? "scale(var(--press-scale))" : "none",
        background: off ? "var(--ink-200)" : hover && variant === "primary" && on === "light" ? "var(--brand-hover)" : hover && variant === "ghost" ? "var(--pink-50)" : s.background,
        color: off ? "var(--ink-400)" : s.color,
        border: off ? "none" : s.border,
        boxShadow: off ? "none" : s.shadow,
        ...style,
      }}
      {...rest}
    >
      {loading ? <Icon name="loader-circle" size={size === "lg" ? "lg" : "md"} style={{ animation: "pp-rotate 1s linear infinite" }} /> : icon ? <Icon name={icon} size={size === "sm" ? "sm" : "md"} /> : null}
      {children}
      {iconAfter ? <Icon name={iconAfter} size={size === "sm" ? "sm" : "md"} /> : null}
    </button>
  );
}
