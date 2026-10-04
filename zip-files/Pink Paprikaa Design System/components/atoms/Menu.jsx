import React from "react";
import { Icon } from "./Icon.jsx";
import { StatusDot } from "./StatusDot.jsx";
import { Popover } from "./Popover.jsx";

export const normalizeItems = (items) => items.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
const selectable = (it) => it && !it.divider && !it.group && !it.disabled;

/** The option list behind Select, Combobox and ActionMenu. Brand diamond marks the
    chosen row; arrows, Home/End, Enter and type-to-jump all work. */
export function Menu({
  items = [], value, onSelect, open = true, onClose, autoFocus = true,
  activeIndex: activeProp, onActiveChange, role = "menu", id, base = "/assets",
  emptyText = "Nothing here yet.", title, sheet = "auto", placement, inline, width, minWidth, maxHeight, style,
}) {
  const list = normalizeItems(items);
  const autoId = React.useId();
  const uid = id || autoId;
  const bodyRef = React.useRef(null);
  const typed = React.useRef({ s: "", t: 0 });
  const isSel = (it) => (Array.isArray(value) ? value.indexOf(it.value) > -1 : value !== undefined && value === it.value);
  const firstIdx = () => { const s = list.findIndex((it) => selectable(it) && isSel(it)); return s > -1 ? s : list.findIndex(selectable); };
  const [activeIn, setActiveIn] = React.useState(-1);
  const [pressed, setPressed] = React.useState(-1);
  const active = activeProp !== undefined ? activeProp : activeIn;
  const setActive = (i) => { setActiveIn(i); onActiveChange && onActiveChange(i); };

  React.useEffect(() => {
    if (!open) return;
    if (activeProp === undefined) setActiveIn(firstIdx());
    if (autoFocus && !inline) requestAnimationFrame(() => bodyRef.current && bodyRef.current.focus({ preventScroll: true }));
  }, [open]);

  React.useEffect(() => {
    const b = bodyRef.current;
    const el = b && active > -1 ? b.querySelector('[data-idx="' + active + '"]') : null;
    if (!el) return;
    if (el.offsetTop < b.scrollTop) b.scrollTop = el.offsetTop - 6;
    else if (el.offsetTop + el.offsetHeight > b.scrollTop + b.clientHeight) b.scrollTop = el.offsetTop + el.offsetHeight - b.clientHeight + 6;
  }, [active, open]);

  const step = (from, dir) => {
    for (let n = 1; n <= list.length; n++) {
      const i = (from + dir * n + list.length * 2) % list.length;
      if (selectable(list[i])) return i;
    }
    return from;
  };
  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(step(active, 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(step(active < 0 ? 0 : active, -1)); }
    else if (e.key === "Home") { e.preventDefault(); setActive(step(-1, 1)); }
    else if (e.key === "End") { e.preventDefault(); setActive(step(list.length, -1)); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (selectable(list[active])) onSelect && onSelect(list[active]); }
    else if (e.key === "Tab") { onClose && onClose("tab"); }
    else if (e.key.length === 1 && /\S/.test(e.key)) {
      const now = Date.now();
      typed.current.s = (now - typed.current.t > 600 ? "" : typed.current.s) + e.key.toLowerCase();
      typed.current.t = now;
      const hit = list.findIndex((it) => selectable(it) && String(it.text || it.label).toLowerCase().indexOf(typed.current.s) === 0);
      if (hit > -1) setActive(hit);
    }
  };

  const optRole = role === "listbox" ? "option" : "menuitem";
  const big = sheet === true;

  return (
    <Popover open={open} onClose={onClose} title={title} sheet={sheet} placement={placement} inline={inline}
      width={width} minWidth={minWidth} maxHeight={maxHeight} style={style} bodyRef={bodyRef}
      bodyProps={{
        id: uid, role, tabIndex: autoFocus ? -1 : undefined, onKeyDown: autoFocus ? onKeyDown : undefined,
        "aria-activedescendant": active > -1 ? uid + "-o" + active : undefined, "aria-label": title,
      }}>
      {list.length === 0 ? (
        <div style={{ padding: "14px 12px", fontSize: 14, color: "var(--text-subtle)" }}>{emptyText}</div>
      ) : list.map((it, i) => {
        if (it.divider) return <div key={"d" + i} role="separator" style={{ height: 1, background: "var(--border-subtle)", margin: "6px 4px" }} />;
        if (it.group) return <div key={"g" + i} role="presentation" style={{ padding: "10px 12px 4px", fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--text-subtle)" }}>{it.group}</div>;
        const sel = isSel(it), act = i === active && !it.disabled;
        const tone = it.disabled ? "var(--ink-400)" : it.danger ? "var(--status-danger)" : sel ? "var(--pink-700)" : "var(--text-body)";
        return (
          <div key={it.value + "-" + i} id={uid + "-o" + i} data-idx={i} role={optRole}
            aria-selected={role === "listbox" ? sel : undefined} aria-disabled={it.disabled || undefined}
            onPointerMove={() => !it.disabled && i !== active && setActive(i)}
            onMouseDown={(e) => e.preventDefault()}
            onPointerDown={() => !it.disabled && setPressed(i)} onPointerUp={() => setPressed(-1)} onPointerLeave={() => setPressed(-1)}
            onClick={() => !it.disabled && onSelect && onSelect(it)}
            style={{
              display: "flex", alignItems: "center", gap: 12, minHeight: big ? 52 : 44, padding: "8px 12px",
              borderRadius: "var(--radius-sm)", cursor: it.disabled ? "not-allowed" : "pointer",
              background: pressed === i && !it.disabled ? (it.danger ? "var(--state-press-danger)" : "var(--state-press)") : act ? (it.danger ? "var(--status-danger-soft)" : "var(--state-hover)") : "transparent",
              color: tone, fontFamily: "var(--font-body)", fontSize: 15, fontWeight: sel ? 600 : 400,
              transition: "background var(--dur-instant) var(--ease-out)", userSelect: "none",
            }}>
            {it.icon ? <Icon name={it.icon} size="md" style={{ flex: "0 0 auto", color: it.disabled ? "var(--ink-300)" : it.danger ? "var(--status-danger)" : act || sel ? "var(--pink-500)" : "var(--ink-500)" }} /> : null}
            <span style={{ display: "grid", gap: 1, flex: 1, minWidth: 0 }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.label}</span>
              {it.description ? <span style={{ fontSize: 13, fontWeight: 400, color: it.disabled ? "var(--ink-400)" : "var(--text-muted)" }}>{it.description}</span> : null}
            </span>
            {it.meta ? <span style={{ flex: "0 0 auto", fontFamily: "var(--font-mono)", fontSize: 12, color: it.disabled ? "var(--ink-400)" : "var(--text-subtle)" }}>{it.meta}</span> : null}
            {role === "listbox" ? (
              <span style={{ width: 14, flex: "0 0 auto", display: "grid", placeItems: "center" }}>{sel ? <StatusDot tone="live" size={14} base={base} /> : null}</span>
            ) : null}
          </div>
        );
      })}
    </Popover>
  );
}
