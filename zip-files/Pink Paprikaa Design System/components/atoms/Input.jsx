import React from "react";
import { Icon } from "./Icon.jsx";
import { Spinner } from "./Spinner.jsx";

const STATUS = {
  default: { border: "var(--border-default)", ring: "var(--focus-ring)", accent: "var(--pink-500)", icon: null, text: "var(--text-subtle)" },
  error: { border: "var(--status-danger)", ring: "0 0 0 3px var(--status-danger-soft)", accent: "var(--status-danger)", icon: "circle-alert", text: "var(--status-danger)" },
  success: { border: "var(--status-success)", ring: "0 0 0 3px var(--status-success-soft)", accent: "var(--status-success)", icon: "circle-check", text: "#186c51" },
  warning: { border: "var(--status-warning)", ring: "0 0 0 3px var(--status-warning-soft)", accent: "var(--status-warning)", icon: "triangle-alert", text: "#8a5c00" },
};
const resolve = (p) => (p.error ? "error" : p.success ? "success" : p.warning ? "warning" : p.status || "default");
const messageOf = (p) => (typeof p.error === "string" ? p.error : typeof p.success === "string" ? p.success : typeof p.warning === "string" ? p.warning : p.hint);

// Types that open a browser-native picker or spinner. We route them to our own components.
const NATIVE = { date: "DatePicker", "datetime-local": "DatePicker", month: "DatePicker", week: "DatePicker", time: "SlotPicker", color: null, file: null, range: null };
const warned = {};

/** Text field. Carries the system's full status set. Never renders a browser picker. */
export function Input({
  label, hint, error, success, warning, status, icon, suffix, trailing, id,
  multiline, rows = 4, value, onChange, placeholder, type = "text",
  disabled, readOnly, loading, required, optional, size = "md", style, ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const [hov, setHov] = React.useState(false);
  const uid = id || React.useId();
  const key = resolve({ error, success, warning, status });
  const s = STATUS[key];
  const message = messageOf({ error, success, warning, hint });
  const active = key !== "default" || focus;
  const Tag = multiline ? "textarea" : "input";
  const h = size === "sm" ? 40 : size === "lg" ? 56 : 48;
  let safeType = type, inputMode;
  if (type === "number") { safeType = "text"; inputMode = "decimal"; }
  else if (Object.prototype.hasOwnProperty.call(NATIVE, type)) {
    safeType = "text";
    if (!warned[type]) { warned[type] = 1; console.warn('Input type="' + type + '" opens a browser picker. ' + (NATIVE[type] ? "Use " + NATIVE[type] + " instead." : "Not supported in this system.")); }
  }

  return (
    <div style={{ display: "grid", gap: 6, minWidth: 0, ...style }}>
      {label ? (
        <label htmlFor={uid} style={{ display: "flex", alignItems: "baseline", gap: 6, fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 14, color: disabled ? "var(--text-subtle)" : "var(--text-body)" }}>
          {label}
          {required ? <span style={{ color: "var(--pink-500)" }}>*</span> : null}
          {optional ? <span style={{ fontSize: 12.5, color: "var(--text-subtle)" }}>optional</span> : null}
        </label>
      ) : null}
      <div
        onPointerEnter={() => setHov(true)} onPointerLeave={() => setHov(false)}
        style={{
          display: "flex", alignItems: multiline ? "flex-start" : "center", gap: 10, minWidth: 0,
          background: disabled ? "var(--ink-100)" : readOnly ? "var(--surface-sunken)" : "var(--ink-000)",
          border: (active ? 2 : 1) + "px solid " + (disabled ? "var(--border-subtle)" : active ? s.border : hov && !readOnly ? "var(--border-strong)" : "var(--border-default)"),
          borderRadius: "var(--radius-md)",
          padding: multiline ? "12px 14px" : "0 14px",
          height: multiline ? undefined : h,
          boxShadow: focus && !disabled ? s.ring : "none",
          cursor: disabled ? "not-allowed" : undefined,
          transition: "border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out)",
        }}
      >
        {icon ? <Icon name={icon} size="md" style={{ color: disabled ? "var(--ink-400)" : focus || key !== "default" ? s.accent : "var(--ink-500)" }} /> : null}
        <Tag
          id={uid} type={multiline ? undefined : safeType} inputMode={multiline ? undefined : inputMode} rows={multiline ? rows : undefined}
          value={value} onChange={onChange} placeholder={placeholder}
          disabled={disabled} readOnly={readOnly} aria-required={required || undefined}
          aria-invalid={key === "error" || undefined}
          aria-describedby={message ? uid + "-msg" : undefined}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{
            flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent",
            fontFamily: "var(--font-body)", fontSize: size === "sm" ? 14 : 15,
            color: disabled ? "var(--ink-400)" : "var(--text-body)",
            padding: 0, resize: multiline ? "vertical" : undefined,
            cursor: disabled ? "not-allowed" : readOnly ? "default" : undefined,
          }}
          {...rest}
        />
        {loading ? <Spinner size={18} /> : null}
        {!loading && s.icon ? <Icon name={s.icon} size="md" style={{ color: s.accent, flex: "0 0 auto" }} /> : null}
        {readOnly && !s.icon && !loading ? <Icon name="lock" size="sm" style={{ color: "var(--ink-400)", flex: "0 0 auto" }} /> : null}
        {suffix ? <span style={{ flex: "0 0 auto", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-subtle)" }}>{suffix}</span> : null}
        {trailing}
      </div>
      {message ? (
        <span id={uid + "-msg"} style={{ fontSize: 12.5, color: key === "default" ? "var(--text-subtle)" : s.text }}>{message}</span>
      ) : null}
    </div>
  );
}
