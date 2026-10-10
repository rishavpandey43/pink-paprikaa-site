import React from "react";
import { Icon } from "./Icon.jsx";

/** Shared interaction state for every pressable thing in the system:
    hover (pointer only), press (pointer or Space/Enter), and keyboard focus-visible. */
export function usePress(disabled) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const [focus, setFocus] = React.useState(false);
  React.useEffect(() => { if (disabled) { setHover(false); setPress(false); } }, [disabled]);
  const bind = {
    onPointerEnter: (e) => { if (!disabled && e.pointerType !== "touch") setHover(true); },
    onPointerLeave: () => { setHover(false); setPress(false); },
    onPointerDown: () => { if (!disabled) setPress(true); },
    onPointerUp: () => setPress(false),
    onPointerCancel: () => setPress(false),
    onFocus: (e) => { if (e.target !== e.currentTarget) return; let v = true; try { v = e.target.matches(":focus-visible"); } catch (x) {} setFocus(v); },
    onBlur: () => { setFocus(false); setPress(false); },
    onKeyDown: (e) => { if (!disabled && (e.key === " " || e.key === "Enter")) setPress(true); },
    onKeyUp: () => setPress(false),
  };
  return { hover: hover && !disabled, press: press && !disabled, focus, bind };
}

/** Merge consumer handlers with usePress handlers so neither is lost. */
export function mergeHandlers(bind, rest) {
  const out = { ...rest };
  Object.keys(bind).forEach((k) => {
    const mine = bind[k], theirs = rest[k];
    out[k] = theirs ? (e) => { mine(e); theirs(e); } : mine;
  });
  return out;
}

const INK = {
  light: {
    brand: { c: "var(--pink-600)", ch: "var(--pink-700)", h: "var(--state-hover)", p: "var(--state-press)" },
    neutral: { c: "var(--ink-700)", ch: "var(--ink-900)", h: "var(--state-hover-neutral)", p: "var(--state-press-neutral)" },
    danger: { c: "var(--status-danger)", ch: "var(--status-danger)", h: "var(--status-danger-soft)", p: "var(--state-press-danger)" },
    off: "var(--ink-400)", ring: "var(--pink-500)",
  },
  dark: {
    brand: { c: "var(--pink-300)", ch: "var(--pink-200)", h: "var(--state-hover-on-color)", p: "var(--state-press-on-color)" },
    neutral: { c: "var(--ink-000)", ch: "var(--ink-000)", h: "var(--state-hover-on-color)", p: "var(--state-press-on-color)" },
    danger: { c: "#ff9a9a", ch: "#ffbdbd", h: "var(--state-hover-on-color)", p: "var(--state-press-on-color)" },
    off: "rgba(255,255,255,.4)", ring: "var(--ink-000)",
  },
  brand: {
    brand: { c: "var(--ink-000)", ch: "var(--ink-000)", h: "var(--state-hover-on-color)", p: "var(--state-press-on-color)" },
    neutral: { c: "var(--ink-000)", ch: "var(--ink-000)", h: "var(--state-hover-on-color)", p: "var(--state-press-on-color)" },
    danger: { c: "var(--ink-000)", ch: "var(--ink-000)", h: "var(--state-hover-on-color)", p: "var(--state-press-on-color)" },
    off: "rgba(255,255,255,.5)", ring: "var(--ink-000)",
  },
};

/** Text-only action: toast and snackbar CTAs, "Undo", "Edit", "View all", inline card actions.
    Looks like a word at rest; on hover it gets a tinted pill, on press it darkens and
    shrinks, on keyboard focus it gets a ring, and disabled is dimmed and inert. */
export function TextButton({
  children, tone = "brand", on = "light", size = "md", caps, icon, iconAfter,
  disabled, loading, state, type = "button", onClick, style, ...rest
}) {
  const off = disabled || loading;
  const p = usePress(off);
  const hover = state ? state === "hover" : p.hover;
  const press = state ? state === "press" : p.press;
  const focus = state ? state === "focus" : p.focus;
  const set = INK[on] || INK.light;
  const t = set[tone] || set.brand;
  const h = size === "sm" ? 30 : 36;
  return (
    <button
      type={type} disabled={off} onClick={onClick} aria-busy={loading || undefined}
      {...mergeHandlers(p.bind, rest)}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, flex: "0 0 auto",
        height: h, padding: size === "sm" ? "0 10px" : "0 12px",
        border: "none", borderRadius: "var(--radius-pill)",
        background: off ? "transparent" : press ? t.p : hover ? t.h : "transparent",
        color: off ? set.off : hover || press ? t.ch : t.c,
        fontFamily: "var(--font-display)", fontWeight: 700, lineHeight: 1, whiteSpace: "nowrap",
        fontSize: caps ? (size === "sm" ? 12 : 12.5) : size === "sm" ? 13.5 : 15,
        letterSpacing: caps ? ".06em" : "-.005em", textTransform: caps ? "uppercase" : "none",
        textDecoration: hover && !caps ? "underline" : "none", textUnderlineOffset: 3, textDecorationThickness: 1.5,
        cursor: off ? "not-allowed" : "pointer",
        transform: press ? "scale(var(--press-scale))" : "none",
        outline: focus && !off ? "2px solid " + set.ring : "none", outlineOffset: 2,
        transition: "background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out), transform var(--dur-instant) var(--ease-out)",
        ...style,
      }}
    >
      {loading ? <Icon name="loader-circle" size="sm" style={{ animation: "pp-rotate 1s linear infinite" }} /> : icon ? <Icon name={icon} size="sm" /> : null}
      {children}
      {iconAfter ? <Icon name={iconAfter} size="sm" /> : null}
    </button>
  );
}
