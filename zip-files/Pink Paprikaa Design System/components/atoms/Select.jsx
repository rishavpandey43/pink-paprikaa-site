import React from "react";
import { Icon } from "./Icon.jsx";

const STATUS = {
  default: { border: "var(--border-default)", ring: "var(--focus-ring)", accent: "var(--pink-500)", icon: null, text: "var(--text-subtle)" },
  error: { border: "var(--status-danger)", ring: "0 0 0 3px var(--status-danger-soft)", accent: "var(--status-danger)", icon: "circle-alert", text: "var(--status-danger)" },
  success: { border: "var(--status-success)", ring: "0 0 0 3px var(--status-success-soft)", accent: "var(--status-success)", icon: "circle-check", text: "#186c51" },
  warning: { border: "var(--status-warning)", ring: "0 0 0 3px var(--status-warning-soft)", accent: "var(--status-warning)", icon: "triangle-alert", text: "#8a5c00" },
};
const resolve = (p) => (p.error ? "error" : p.success ? "success" : p.warning ? "warning" : p.status || "default");
const messageOf = (p) => (typeof p.error === "string" ? p.error : typeof p.success === "string" ? p.success : typeof p.warning === "string" ? p.warning : p.hint);

/** Native select in brand clothing. Matches Input metrics and states exactly. */
export function Select({
  label, hint, error, success, warning, status, options = [], value, onChange, id,
  placeholder, disabled, readOnly, required, optional, size = "md", icon, style, ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const uid = id || React.useId();
  const key = resolve({ error, success, warning, status });
  const s = STATUS[key];
  const message = messageOf({ error, success, warning, hint });
  const active = key !== "default" || focus;
  const h = size === "sm" ? 40 : size === "lg" ? 56 : 48;

  return (
    <div style={{ display: "grid", gap: 6, minWidth: 0, ...style }}>
      {label ? (
        <label htmlFor={uid} style={{ display: "flex", alignItems: "baseline", gap: 6, fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 14, color: disabled ? "var(--text-subtle)" : "var(--text-body)" }}>
          {label}
          {required ? <span style={{ color: "var(--pink-500)" }}>*</span> : null}
          {optional ? <span style={{ fontSize: 12.5, color: "var(--text-subtle)" }}>optional</span> : null}
        </label>
      ) : null}
      <div style={{ position: "relative", minWidth: 0 }}>
        {icon ? <Icon name={icon} size="md" style={{ position: "absolute", left: 14, top: (h - 20) / 2, color: disabled ? "var(--ink-400)" : active ? s.accent : "var(--ink-500)", pointerEvents: "none" }} /> : null}
        <select
          id={uid} value={value} onChange={onChange} disabled={disabled || readOnly} required={required}
          aria-invalid={key === "error" || undefined}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{
            width: "100%", height: h, paddingRight: 42, paddingLeft: icon ? 42 : 14,
            appearance: "none", WebkitAppearance: "none",
            background: disabled ? "var(--ink-100)" : readOnly ? "var(--surface-sunken)" : "var(--ink-000)",
            border: (active ? 2 : 1) + "px solid " + (disabled ? "var(--border-subtle)" : active ? s.border : "var(--border-default)"),
            borderRadius: "var(--radius-md)",
            fontFamily: "var(--font-body)", fontSize: size === "sm" ? 14 : 15,
            color: disabled ? "var(--ink-400)" : "var(--text-body)",
            boxShadow: focus && !disabled ? s.ring : "none", outline: "none",
            cursor: disabled || readOnly ? "not-allowed" : "pointer",
            transition: "border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)",
          }}
          {...rest}
        >
          {placeholder ? <option value="" disabled>{placeholder}</option> : null}
          {options.map((o) => {
            const opt = typeof o === "string" ? { value: o, label: o } : o;
            return <option key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</option>;
          })}
        </select>
        <Icon name={s.icon || "chevron-down"} size="md"
          style={{ position: "absolute", right: 14, top: (h - 20) / 2, color: s.icon ? s.accent : disabled ? "var(--ink-400)" : "var(--ink-500)", pointerEvents: "none" }} />
      </div>
      {message ? <span style={{ fontSize: 12.5, color: key === "default" ? "var(--text-subtle)" : s.text }}>{message}</span> : null}
    </div>
  );
}
