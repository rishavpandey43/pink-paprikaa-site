import React from "react";
import { Icon } from "./Icon.jsx";
import { usePress, mergeHandlers } from "./TextButton.jsx";

const PAD = { sm: "0 14px", md: "0 20px", lg: "0 28px" };
const H = { sm: 36, md: 44, lg: 54 };
const FS = { sm: 13, md: 15, lg: 17 };

// rest / hover / press for every variant × surface. Hover darkens one step, press two.
function skin(variant, on) {
  if (on === "brand") {
    return variant === "primary"
      ? { bg: "var(--ink-000)", bgH: "var(--pink-50)", bgP: "var(--pink-100)", c: "var(--pink-600)", cH: "var(--pink-700)", bd: "none", bdH: "none", sh: "var(--shadow-2)", ring: "var(--ink-000)", offBg: "rgba(255,255,255,.3)", offC: "rgba(255,255,255,.7)", offBd: "none" }
      : { bg: "transparent", bgH: "var(--state-hover-on-color)", bgP: "var(--state-press-on-color)", c: "var(--ink-000)", cH: "var(--ink-000)", bd: "2px solid rgba(255,255,255,.7)", bdH: "2px solid var(--ink-000)", sh: "none", ring: "var(--ink-000)", offBg: "transparent", offC: "rgba(255,255,255,.5)", offBd: "2px solid rgba(255,255,255,.3)" };
  }
  switch (variant) {
    case "secondary":
      return { bg: "var(--ink-000)", bgH: "var(--state-hover)", bgP: "var(--state-press)", c: "var(--pink-600)", cH: "var(--pink-700)", bd: "2px solid var(--pink-500)", bdH: "2px solid var(--pink-600)", sh: "none", ring: "var(--pink-500)", offBg: "var(--ink-000)", offC: "var(--ink-400)", offBd: "2px solid var(--ink-200)" };
    case "ghost":
      return { bg: "transparent", bgH: "var(--state-hover)", bgP: "var(--state-press)", c: "var(--pink-600)", cH: "var(--pink-700)", bd: "none", bdH: "none", sh: "none", ring: "var(--pink-500)", offBg: "transparent", offC: "var(--ink-400)", offBd: "none" };
    case "inverse":
      return { bg: "var(--ink-900)", bgH: "var(--ink-800)", bgP: "var(--ink-700)", c: "var(--ink-000)", cH: "var(--ink-000)", bd: "none", bdH: "none", sh: "var(--shadow-2)", ring: "var(--ink-900)", offBg: "var(--ink-200)", offC: "var(--ink-400)", offBd: "none" };
    default:
      return { bg: "var(--pink-500)", bgH: "var(--brand-hover)", bgP: "var(--brand-active)", c: "var(--text-on-brand)", cH: "var(--text-on-brand)", bd: "none", bdH: "none", sh: "var(--shadow-brand)", ring: "var(--pink-500)", offBg: "var(--ink-200)", offC: "var(--ink-400)", offBd: "none" };
  }
}

/** Primary action. Pill, Poppins 700, Title Case label.
    Every variant has rest, hover, press, focus-visible, loading and disabled. */
export function Button({
  children, variant = "primary", size = "md", on = "light",
  icon, iconAfter, fullWidth, disabled, loading, state, style, onClick, type = "button", ...rest
}) {
  const s = skin(variant, on);
  const off = disabled || loading;
  const p = usePress(off);
  const hover = state ? state === "hover" : p.hover;
  const press = state ? state === "press" : p.press;
  const focus = state ? state === "focus" : p.focus;
  return (
    <button
      type={type} disabled={off} onClick={onClick} aria-busy={loading || undefined}
      {...mergeHandlers(p.bind, rest)}
      style={{
        display: fullWidth ? "flex" : "inline-flex", width: fullWidth ? "100%" : undefined,
        alignItems: "center", justifyContent: "center", gap: size === "sm" ? 6 : 8,
        height: H[size], minWidth: H[size], padding: PAD[size],
        fontFamily: "var(--font-display)", fontWeight: 700, fontSize: FS[size], letterSpacing: "-.005em", lineHeight: 1,
        whiteSpace: "nowrap", flex: fullWidth ? undefined : "0 0 auto", borderRadius: "var(--radius-pill)",
        cursor: disabled ? "not-allowed" : loading ? "progress" : "pointer",
        transition: "background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out), transform var(--dur-instant) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)",
        transform: press && !off ? "scale(var(--press-scale))" : "none",
        background: off ? s.offBg : press ? s.bgP : hover ? s.bgH : s.bg,
        color: off ? s.offC : hover || press ? s.cH : s.c,
        border: off ? s.offBd : hover || press ? s.bdH : s.bd,
        boxShadow: off || press ? "none" : s.sh,
        outline: focus && !off ? "2px solid " + s.ring : "none", outlineOffset: 2,
        ...style,
      }}
    >
      {loading ? <Icon name="loader-circle" size={size === "lg" ? "lg" : "md"} style={{ animation: "pp-rotate 1s linear infinite" }} /> : icon ? <Icon name={icon} size={size === "sm" ? "sm" : "md"} /> : null}
      {children}
      {iconAfter ? <Icon name={iconAfter} size={size === "sm" ? "sm" : "md"} /> : null}
    </button>
  );
}
