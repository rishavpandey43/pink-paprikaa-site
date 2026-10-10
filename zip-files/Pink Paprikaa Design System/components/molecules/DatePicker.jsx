import React from "react";
import { Icon } from "../atoms/Icon.jsx";
import { IconButton } from "../atoms/IconButton.jsx";
import { Popover } from "../atoms/Popover.jsx";

const STATUS = {
  default: { border: "var(--border-default)", ring: "var(--focus-ring)", accent: "var(--pink-500)", icon: null, text: "var(--text-subtle)" },
  error: { border: "var(--status-danger)", ring: "0 0 0 3px var(--status-danger-soft)", accent: "var(--status-danger)", icon: "circle-alert", text: "var(--status-danger)" },
  success: { border: "var(--status-success)", ring: "0 0 0 3px var(--status-success-soft)", accent: "var(--status-success)", icon: "circle-check", text: "#186c51" },
  warning: { border: "var(--status-warning)", ring: "0 0 0 3px var(--status-warning-soft)", accent: "var(--status-warning)", icon: "triangle-alert", text: "#8a5c00" },
};
const resolve = (p) => (p.error ? "error" : p.success ? "success" : p.warning ? "warning" : p.status || "default");
const messageOf = (p) => (typeof p.error === "string" ? p.error : typeof p.success === "string" ? p.success : typeof p.warning === "string" ? p.warning : p.hint);

const pad = (n) => (n < 10 ? "0" + n : "" + n);
const toISO = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
const fromISO = (s) => { if (!s) return null; const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const addMonths = (d, n) => { const t = new Date(d.getFullYear(), d.getMonth() + n, 1); const last = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate(); return new Date(t.getFullYear(), t.getMonth(), Math.min(d.getDate(), last)); };
const WD = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
export const formatDate = (iso) => { const d = fromISO(iso); return d ? d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : ""; };

function Calendar({ value, onPick, min, max, isDateDisabled, weekStart = 1, roomy, autoFocusDay }) {
  const today = toISO(new Date());
  const sel = fromISO(value);
  const [focusD, setFocusD] = React.useState(() => sel || fromISO(min && today < min ? min : today));
  const gridRef = React.useRef(null);
  const off = (iso) => (min && iso < min) || (max && iso > max) || (isDateDisabled && isDateDisabled(iso));
  const y = focusD.getFullYear(), m = focusD.getMonth();
  const lead = (new Date(y, m, 1).getDay() - weekStart + 7) % 7;
  const days = new Date(y, m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(new Date(y, m, d));
  const firstISO = toISO(new Date(y, m, 1)), lastISO = toISO(new Date(y, m, days));
  const prevOk = !min || toISO(new Date(y, m, 0)) >= min;
  const nextOk = !max || toISO(new Date(y, m + 1, 1)) <= max;
  const focusKey = toISO(focusD);
  const moved = React.useRef(false);

  React.useEffect(() => {
    if (!moved.current && !autoFocusDay) return;
    const b = gridRef.current && gridRef.current.querySelector('[data-iso="' + focusKey + '"]');
    b && b.focus({ preventScroll: true });
  }, [focusKey]);

  const go = (d) => { moved.current = true; setFocusD(d); };
  const onKeyDown = (e) => {
    const map = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (map[e.key]) { e.preventDefault(); go(addDays(focusD, map[e.key])); }
    else if (e.key === "PageUp") { e.preventDefault(); go(addMonths(focusD, -1)); }
    else if (e.key === "PageDown") { e.preventDefault(); go(addMonths(focusD, 1)); }
    else if (e.key === "Home") { e.preventDefault(); go(addDays(focusD, -((focusD.getDay() - weekStart + 7) % 7))); }
    else if (e.key === "End") { e.preventDefault(); go(addDays(focusD, 6 - ((focusD.getDay() - weekStart + 7) % 7))); }
  };
  const cell = roomy ? 44 : 40;
  const wd = WD.slice(weekStart).concat(WD.slice(0, weekStart));

  return (
    <div style={{ display: "grid", gap: 8, padding: roomy ? "4px 4px 8px" : 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <IconButton icon="chevron-left" label="Previous month" size="sm" disabled={!prevOk} onClick={() => setFocusD(addMonths(focusD, -1))} />
        <span aria-live="polite" style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, letterSpacing: "-.01em", color: "var(--text-heading)" }}>
          {focusD.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
        </span>
        <IconButton icon="chevron-right" label="Next month" size="sm" disabled={!nextOk} onClick={() => setFocusD(addMonths(focusD, 1))} />
      </div>
      <div role="grid" ref={gridRef} onKeyDown={onKeyDown} style={{ display: "grid", gridTemplateColumns: "repeat(7, " + (roomy ? "minmax(0,1fr)" : cell + "px") + ")", gap: 2, justifyContent: "center" }}>
        {wd.map((w) => <span key={w} role="columnheader" style={{ height: 28, display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--text-subtle)" }}>{w}</span>)}
        {cells.map((d, i) => {
          if (!d) return <span key={"b" + i} />;
          const iso = toISO(d), isSel = iso === value, isToday = iso === today, dis = off(iso);
          const tab = iso === focusKey || (focusKey < firstISO || focusKey > lastISO ? d.getDate() === 1 : false);
          return (
            <button key={iso} type="button" data-iso={iso} role="gridcell" tabIndex={tab ? 0 : -1} disabled={dis}
              aria-selected={isSel} aria-current={isToday ? "date" : undefined}
              aria-label={d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" }) + (dis ? ", unavailable" : "")}
              onClick={() => { setFocusD(d); onPick(iso); }}
              onFocus={() => iso !== focusKey && setFocusD(d)}
              style={{
                position: "relative", height: cell, border: "none", padding: 0, borderRadius: "var(--radius-sm)",
                transition: "background var(--dur-fast) var(--ease-out), transform var(--dur-instant) var(--ease-out)",
                background: "transparent", cursor: dis ? "not-allowed" : "pointer", display: "grid", placeItems: "center",
                fontFamily: "var(--font-body)", fontSize: 14.5, fontVariantNumeric: "tabular-nums",
                fontWeight: isSel || isToday ? 700 : 400,
                color: isSel ? "var(--ink-000)" : dis ? "var(--ink-300)" : isToday ? "var(--pink-700)" : "var(--text-body)",
                textDecoration: dis ? "line-through" : "none", textDecorationColor: "var(--ink-200)",
              }}
              onPointerEnter={(e) => { if (!isSel && !dis) e.currentTarget.style.background = "var(--pink-50)"; }}
              onPointerLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.transform = "none"; }}
              onPointerDown={(e) => { if (!dis) { if (!isSel) e.currentTarget.style.background = "var(--state-press)"; e.currentTarget.style.transform = "scale(.92)"; } }}
              onPointerUp={(e) => { e.currentTarget.style.transform = "none"; }}>
              {isSel ? <span aria-hidden="true" style={{ position: "absolute", width: cell * 0.7, height: cell * 0.7, borderRadius: 6, background: "var(--pink-500)", transform: "rotate(45deg)", boxShadow: "var(--shadow-brand)" }} /> : null}
              <span style={{ position: "relative" }}>{d.getDate()}</span>
              {isToday && !isSel ? <span aria-hidden="true" style={{ position: "absolute", bottom: 5, width: 5, height: 5, borderRadius: 1, background: "var(--pink-500)", transform: "rotate(45deg)" }} /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Brand date field. Our calendar in a popover (bottom sheet on phones) — never the
    browser's date input. Values are ISO strings: "2026-10-10". */
export function DatePicker({
  label, hint, error, success, warning, status, value, defaultValue, onChange, min, max, isDateDisabled,
  placeholder = "Pick a date", weekStart = 1, size = "md", disabled, readOnly, required, optional,
  icon = "calendar", sheet = "auto", inline, defaultOpen = false, format = formatDate, id, name, style,
}) {
  const [inner, setInner] = React.useState(defaultValue || "");
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
  const h = size === "sm" ? 40 : size === "lg" ? 56 : 48;
  const lit = key !== "default" || focus || open;
  const locked = disabled || readOnly;
  const pick = (iso) => { if (value === undefined) setInner(iso); onChange && onChange(iso); if (!inline) { setOpen(false); btnRef.current && btnRef.current.focus(); } };
  const close = React.useCallback((why) => { setOpen(false); if (why === "escape" && btnRef.current) btnRef.current.focus(); }, []);

  if (inline) {
    return (
      <div style={{ width: 312, maxWidth: "100%", background: "var(--surface-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-2)", ...style }}>
        <Calendar value={v} onPick={pick} min={min} max={max} isDateDisabled={isDateDisabled} weekStart={weekStart} />
      </div>
    );
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
      <div style={{ position: "relative", minWidth: 0 }}>
        <button ref={btnRef} id={uid} type="button" disabled={disabled}
          aria-haspopup="dialog" aria-expanded={open} aria-invalid={key === "error" || undefined}
          aria-required={required || undefined} aria-describedby={message ? uid + "-msg" : undefined}
          onClick={() => !locked && setOpen((o) => !o)}
          onKeyDown={(e) => { if (!locked && !open && e.key === "ArrowDown") { e.preventDefault(); setOpen(true); } }}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          onPointerEnter={() => setHov(true)} onPointerLeave={() => setHov(false)}
          style={{
            width: "100%", height: h, display: "flex", alignItems: "center", gap: 10, padding: "0 14px", textAlign: "left",
            background: disabled ? "var(--ink-100)" : readOnly ? "var(--surface-sunken)" : "var(--ink-000)",
            border: (lit ? 2 : 1) + "px solid " + (disabled ? "var(--border-subtle)" : lit ? s.border : hov && !readOnly ? "var(--border-strong)" : "var(--border-default)"),
            borderRadius: "var(--radius-md)", fontFamily: "var(--font-body)", fontSize: size === "sm" ? 14 : 15,
            color: disabled ? "var(--ink-400)" : "var(--text-body)", boxShadow: (focus || open) && !disabled ? s.ring : "none",
            outline: "none", cursor: locked ? "not-allowed" : "pointer",
            transition: "border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)",
          }}>
          <Icon name={icon} size="md" style={{ flex: "0 0 auto", color: disabled ? "var(--ink-400)" : lit ? s.accent : "var(--ink-500)" }} />
          <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: v ? undefined : "var(--text-subtle)" }}>{v ? format(v) : placeholder}</span>
          {s.icon ? <Icon name={s.icon} size="md" style={{ flex: "0 0 auto", color: s.accent }} /> : readOnly ? <Icon name="lock" size="sm" style={{ flex: "0 0 auto", color: "var(--ink-400)" }} /> : null}
        </button>
        {name ? <input type="hidden" name={name} value={v} /> : null}
        <Popover open={open} onClose={close} sheet={sheet} title={label || placeholder} width={312} padding={4} maxHeight={420}
          bodyProps={{ role: "dialog", "aria-label": label || placeholder }}>
          <Calendar value={v} onPick={pick} min={min} max={max} isDateDisabled={isDateDisabled} weekStart={weekStart} roomy={sheet === true} autoFocusDay />
        </Popover>
      </div>
      {message ? <span id={uid + "-msg"} style={{ fontSize: 12.5, color: key === "default" ? "var(--text-subtle)" : s.text }}>{message}</span> : null}
    </div>
  );
}
