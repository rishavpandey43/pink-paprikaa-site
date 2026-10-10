import React from "react";
import { Icon } from "./Icon.jsx";
import { usePress, mergeHandlers } from "./TextButton.jsx";

const H = { xs: 28, sm: 32, md: 40, lg: 48 };

function skin(variant, on) {
  if (on === "brand") {
    if (variant === "primary") return { bg: "var(--ink-000)", bgH: "var(--pink-50)", bgP: "var(--pink-100)", c: "var(--pink-600)", bd: "none", ring: "var(--ink-000)" };
    if (variant === "secondary") return { bg: "transparent", bgH: "var(--state-hover-on-color)", bgP: "var(--state-press-on-color)", c: "var(--ink-000)", bd: "1px solid rgba(255,255,255,.6)", ring: "var(--ink-000)" };
    return { bg: "transparent", bgH: "var(--state-hover-on-color)", bgP: "var(--state-press-on-color)", c: "var(--ink-000)", bd: "none", ring: "var(--ink-000)" };
  }
  if (on === "tint") return { bg: "transparent", bgH: "var(--state-hover-tint)", bgP: "var(--state-press-tint)", c: "currentColor", bd: "none", ring: "currentColor" };
  switch (variant) {
    case "primary": return { bg: "var(--pink-500)", bgH: "var(--brand-hover)", bgP: "var(--brand-active)", c: "var(--ink-000)", bd: "none", ring: "var(--pink-500)" };
    case "secondary": return { bg: "var(--ink-000)", bgH: "var(--state-hover)", bgP: "var(--state-press)", c: "var(--pink-600)", bd: "1px solid var(--border-default)", bdH: "1px solid var(--pink-300)", ring: "var(--pink-500)" };
    case "glass": return { bg: "var(--surface-glass)", bgH: "var(--ink-000)", bgP: "var(--pink-50)", c: "var(--ink-900)", bd: "none", ring: "var(--ink-000)", blur: true };
    default: return { bg: "transparent", bgH: "var(--state-hover)", bgP: "var(--state-press)", c: "var(--ink-700)", cH: "var(--pink-600)", bd: "none", ring: "var(--pink-500)" };
  }
}

/** Square-footprint circular button carrying a single Lucide glyph.
    Rest, hover, press, focus-visible and disabled on every variant and surface.
    on="tint" inherits the parent's text colour (for dismiss buttons inside coloured blocks). */
export function IconButton({ icon, label, variant = "ghost", size = "md", on = "light", disabled, state, style, onClick, ...rest }) {
  const s = skin(variant, on);
  const p = usePress(disabled);
  const hover = state ? state === "hover" : p.hover;
  const press = state ? state === "press" : p.press;
  const focus = state ? state === "focus" : p.focus;
  const px = H[size] || H.md;
  const onColour = on === "brand";
  return (
    <button
      type="button" aria-label={label} title={undefined} disabled={disabled} onClick={onClick}
      {...mergeHandlers(p.bind, rest)}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto",
        width: px, height: px, borderRadius: "var(--radius-pill)", padding: 0,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out), transform var(--dur-instant) var(--ease-out)",
        transform: press ? "scale(.92)" : "none",
        background: disabled ? (variant === "primary" && !onColour ? "var(--ink-200)" : "transparent") : press ? s.bgP : hover ? s.bgH : s.bg,
        color: disabled ? (onColour ? "rgba(255,255,255,.45)" : "var(--ink-400)") : hover && s.cH ? s.cH : s.c,
        border: disabled && s.bd !== "none" ? (onColour ? "1px solid rgba(255,255,255,.3)" : "1px solid var(--ink-200)") : hover && s.bdH ? s.bdH : s.bd,
        backdropFilter: s.blur ? "var(--blur-glass)" : undefined,
        outline: focus && !disabled ? "2px solid " + s.ring : "none", outlineOffset: 2,
        ...style,
      }}
    >
      <Icon name={icon} size={size === "xs" || size === "sm" ? "sm" : size === "lg" ? "lg" : "md"} />
    </button>
  );
}
