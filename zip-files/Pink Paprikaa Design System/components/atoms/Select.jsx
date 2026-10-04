import React from "react";
import { Icon } from "./Icon.jsx";
import { Menu, normalizeItems } from "./Menu.jsx";

const STATUS = {
  default: { border: "var(--border-default)", ring: "var(--focus-ring)", accent: "var(--pink-500)", icon: null, text: "var(--text-subtle)" },
  error: { border: "var(--status-danger)", ring: "0 0 0 3px var(--status-danger-soft)", accent: "var(--status-danger)", icon: "circle-alert", text: "var(--status-danger)" },
  success: { border: "var(--status-success)", ring: "0 0 0 3px var(--status-success-soft)", accent: "var(--status-success)", icon: "circle-check", text: "#186c51" },
  warning: { border: "var(--status-warning)", ring: "0 0 0 3px var(--status-warning-soft)", accent: "var(--status-warning)", icon: "triangle-alert", text: "#8a5c00" },
};
const resolve = (p) => (p.error ? "error" : p.success ? "success" : p.warning ? "warning" : p.status || "default");
const messageOf = (p) => (typeof p.error === "string" ? p.error : typeof p.success === "string" ? p.success : typeof p.warning === "string" ? p.warning : p.hint);

/** Brand dropdown. Our own trigger and list panel — never the browser's popup.
    Matches Input metrics and states exactly; becomes a bottom sheet on phones. */
export function Select({
  label, hint, error, success, warning, status, options = [], value, defaultValue, onChange, onValueChange,
  id, name, placeholder, disabled, readOnly, required, optional, size = "md", icon,
  base = "/assets", sheet = "auto", defaultOpen = false, style, ...rest
}) {
  const opts = normalizeItems(options);
  const first = opts.find((o) => !o.disabled && !o.divider && !o.group);
  const [inner, setInner] = React.useState(defaultValue !== undefined ? defaultValue : placeholder ? "" : first ? first.value : "");
  const v = value !== undefined ? value : inner;
  const [open, setOpen] = React.useState(defaultOpen);
  const [focus, setFocus] = React.useState(false);
  const [hov, setHov] = React.useState(false);
  const btnRef = React.useRef(null);
  const autoId = React.useId();
  const uid = id || autoId;
  const key = resolve({ error, success, warning, status });
  const s = STATUS[key];
  const message = messageOf({ error, success, warning, hint });
  const active = key !== "default" || focus || open;
  const h = size === "sm" ? 40 : size === "lg" ? 56 : 48;
  const cur = opts.find((o) => o.value === v);
  const locked = disabled || readOnly;

  const close = React.useCallback((why) => { setOpen(false); if (why === "escape" && btnRef.current) btnRef.current.focus(); }, []);
  const choose = (o) => {
    if (value === undefined) setInner(o.value);
    if (onChange) onChange({ target: { value: o.value, name }, currentTarget: { value: o.value, name }, value: o.value });
    if (onValueChange) onValueChange(o.value);
    setOpen(false);
    btnRef.current && btnRef.current.focus();
  };

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
        <button
          ref={btnRef} id={uid} type="button" role="combobox" disabled={disabled}
          aria-haspopup="listbox" aria-expanded={open} aria-controls={uid + "-list"}
          aria-invalid={key === "error" || undefined} aria-required={required || undefined} aria-readonly={readOnly || undefined}
          aria-describedby={message ? uid + "-msg" : undefined}
          onClick={() => !locked && setOpen((o) => !o)}
          onKeyDown={(e) => { if (!locked && !open && ["ArrowDown", "ArrowUp", "Enter", " "].indexOf(e.key) > -1) { e.preventDefault(); setOpen(true); } }}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          onPointerEnter={() => setHov(true)} onPointerLeave={() => setHov(false)}
          style={{
            width: "100%", height: h, display: "flex", alignItems: "center", gap: 10, padding: "0 14px", textAlign: "left",
            background: disabled ? "var(--ink-100)" : readOnly ? "var(--surface-sunken)" : "var(--ink-000)",
            border: (active ? 2 : 1) + "px solid " + (disabled ? "var(--border-subtle)" : active ? s.border : hov && !locked ? "var(--border-strong)" : "var(--border-default)"),
            borderRadius: "var(--radius-md)", fontFamily: "var(--font-body)", fontSize: size === "sm" ? 14 : 15,
            color: disabled ? "var(--ink-400)" : "var(--text-body)",
            boxShadow: (focus || open) && !disabled ? s.ring : "none", outline: "none",
            cursor: locked ? "not-allowed" : "pointer",
            transition: "border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)",
          }}
          {...rest}
        >
          {icon ? <Icon name={icon} size="md" style={{ flex: "0 0 auto", color: disabled ? "var(--ink-400)" : active ? s.accent : "var(--ink-500)" }} /> : null}
          <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: cur ? undefined : "var(--text-subtle)" }}>
            {cur ? cur.label : placeholder || "\u00a0"}
          </span>
          {readOnly && !s.icon ? <Icon name="lock" size="sm" style={{ flex: "0 0 auto", color: "var(--ink-400)" }} /> : (
            <Icon name={s.icon || "chevron-down"} size="md" style={{
              flex: "0 0 auto", color: s.icon ? s.accent : disabled ? "var(--ink-400)" : open ? "var(--pink-500)" : "var(--ink-500)",
              transform: open && !s.icon ? "rotate(180deg)" : "none", transition: "transform var(--dur-fast) var(--ease-out)",
            }} />
          )}
        </button>
        {name ? <input type="hidden" name={name} value={v} /> : null}
        <Menu open={open} onClose={close} items={opts} value={v} onSelect={choose} role="listbox" id={uid + "-list"}
          base={base} sheet={sheet} title={label || placeholder} />
      </div>
      {message ? <span id={uid + "-msg"} style={{ fontSize: 12.5, color: key === "default" ? "var(--text-subtle)" : s.text }}>{message}</span> : null}
    </div>
  );
}
