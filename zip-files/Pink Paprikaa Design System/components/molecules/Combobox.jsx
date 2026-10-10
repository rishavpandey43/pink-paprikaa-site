import React from "react";
import { Icon } from "../atoms/Icon.jsx";
import { Menu, normalizeItems } from "../atoms/Menu.jsx";
import { IconButton } from "../atoms/IconButton.jsx";

const STATUS = {
  default: { border: "var(--border-default)", ring: "var(--focus-ring)", accent: "var(--pink-500)", icon: null, text: "var(--text-subtle)" },
  error: { border: "var(--status-danger)", ring: "0 0 0 3px var(--status-danger-soft)", accent: "var(--status-danger)", icon: "circle-alert", text: "var(--status-danger)" },
  success: { border: "var(--status-success)", ring: "0 0 0 3px var(--status-success-soft)", accent: "var(--status-success)", icon: "circle-check", text: "#186c51" },
  warning: { border: "var(--status-warning)", ring: "0 0 0 3px var(--status-warning-soft)", accent: "var(--status-warning)", icon: "triangle-alert", text: "#8a5c00" },
};
const resolve = (p) => (p.error ? "error" : p.success ? "success" : p.warning ? "warning" : p.status || "default");
const messageOf = (p) => (typeof p.error === "string" ? p.error : typeof p.success === "string" ? p.success : typeof p.warning === "string" ? p.warning : p.hint);
const textOf = (o) => String(o.text != null ? o.text : o.label);

function highlight(label, q) {
  if (!q || typeof label !== "string") return label;
  const i = label.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return label;
  return <>{label.slice(0, i)}<span style={{ color: "var(--pink-700)", fontWeight: 700 }}>{label.slice(i, i + q.length)}</span>{label.slice(i + q.length)}</>;
}

/** Type-to-filter dropdown for long lists — dishes, localities, corporate accounts.
    Same field shell as Input and Select; the list is our Menu panel. */
export function Combobox({
  label, hint, error, success, warning, status, options = [], value, onChange, placeholder = "Start typing...",
  icon = "search", emptyText = "No matches. Try a shorter word.", size = "md", disabled, required, optional,
  base = "/assets", filter, defaultQuery, defaultOpen = false, id, name, style, ...rest
}) {
  const opts = normalizeItems(options);
  const cur = opts.find((o) => o.value === value);
  const [q, setQ] = React.useState(defaultQuery != null ? defaultQuery : null);
  const [open, setOpen] = React.useState(defaultOpen);
  const [focus, setFocus] = React.useState(false);
  const [hov, setHov] = React.useState(false);
  const [active, setActive] = React.useState(-1);
  const inputRef = React.useRef(null);
  const autoId = React.useId();
  const uid = id || autoId;
  const key = resolve({ error, success, warning, status });
  const s = STATUS[key];
  const message = messageOf({ error, success, warning, hint });
  const h = size === "sm" ? 40 : size === "lg" ? 56 : 48;
  const lit = key !== "default" || focus;

  const query = q || "";
  const matches = query
    ? opts.filter((o) => o.divider || o.group ? false : filter ? filter(o, query) : textOf(o).toLowerCase().indexOf(query.toLowerCase()) > -1)
    : opts;
  const shown = matches.map((o) => ({ ...o, text: textOf(o), label: highlight(o.label, query) }));
  const can = (i) => shown[i] && !shown[i].disabled && !shown[i].divider && !shown[i].group;
  const firstOk = () => shown.findIndex((_, i) => can(i));

  React.useEffect(() => { if (open) setActive(firstOk()); }, [open, query]);

  const choose = (o) => { onChange && onChange(o.value, o); setQ(null); setOpen(false); };
  const move = (dir) => {
    if (!open) { setOpen(true); return; }
    for (let n = 1; n <= shown.length; n++) { const i = (active + dir * n + shown.length * 2) % shown.length; if (can(i)) { setActive(i); return; } }
  };
  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
    else if (e.key === "Enter" && open && can(active)) { e.preventDefault(); choose(shown[active]); }
    else if (e.key === "Escape") { if (open) setOpen(false); else setQ(null); }
    else if (e.key === "Tab") setOpen(false);
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
      <div style={{
        position: "relative", display: "flex", alignItems: "center", gap: 10, minWidth: 0, height: h, padding: "0 14px",
        background: disabled ? "var(--ink-100)" : "var(--ink-000)",
        border: (lit ? 2 : 1) + "px solid " + (disabled ? "var(--border-subtle)" : lit ? s.border : hov ? "var(--border-strong)" : "var(--border-default)"),
        borderRadius: "var(--radius-md)", boxShadow: focus && !disabled ? s.ring : "none",
        cursor: disabled ? "not-allowed" : "text",
        transition: "border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)",
      }} onClick={() => inputRef.current && inputRef.current.focus()} onPointerEnter={() => setHov(true)} onPointerLeave={() => setHov(false)}>
        {icon ? <Icon name={icon} size="md" style={{ flex: "0 0 auto", color: disabled ? "var(--ink-400)" : lit ? s.accent : "var(--ink-500)" }} /> : null}
        <input
          ref={inputRef} id={uid} type="text" role="combobox" autoComplete="off" spellCheck={false}
          aria-expanded={open} aria-controls={uid + "-list"} aria-autocomplete="list"
          aria-activedescendant={open && active > -1 ? uid + "-list-o" + active : undefined}
          aria-invalid={key === "error" || undefined} aria-required={required || undefined}
          aria-describedby={message ? uid + "-msg" : undefined}
          value={q != null ? q : cur ? textOf(cur) : ""} placeholder={placeholder} disabled={disabled}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setFocus(true)} onBlur={() => { setFocus(false); setOpen(false); setQ(null); }}
          onKeyDown={onKeyDown}
          style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", padding: 0, fontFamily: "var(--font-body)", fontSize: size === "sm" ? 14 : 15, color: disabled ? "var(--ink-400)" : "var(--text-body)", cursor: disabled ? "not-allowed" : undefined }}
          {...rest}
        />
        {query && !disabled ? (
          <IconButton icon="x" label="Clear" size="xs" tabIndex={-1} onMouseDown={(e) => e.preventDefault()} onClick={() => { setQ(""); inputRef.current && inputRef.current.focus(); }} style={{ marginRight: -6 }} />
        ) : s.icon ? <Icon name={s.icon} size="md" style={{ flex: "0 0 auto", color: s.accent }} /> : (
          <Icon name="chevron-down" size="md" style={{ flex: "0 0 auto", color: open ? "var(--pink-500)" : "var(--ink-500)", transform: open ? "rotate(180deg)" : "none", transition: "transform var(--dur-fast) var(--ease-out)" }} />
        )}
        {name ? <input type="hidden" name={name} value={value || ""} /> : null}
        <Menu open={open && !disabled} onClose={() => setOpen(false)} items={shown} value={value} onSelect={choose}
          role="listbox" id={uid + "-list"} autoFocus={false} activeIndex={active} onActiveChange={setActive}
          base={base} sheet={false} emptyText={emptyText} />
      </div>
      {message ? <span id={uid + "-msg"} style={{ fontSize: 12.5, color: key === "default" ? "var(--text-subtle)" : s.text }}>{message}</span> : null}
    </div>
  );
}
