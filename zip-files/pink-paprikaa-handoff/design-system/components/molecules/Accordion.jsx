import React from "react";
import { Icon } from "../atoms/Icon.jsx";

/** FAQ / allergen disclosure list. One open at a time by default. */
export function Accordion({ items = [], multiple, defaultOpen = [], style, ...rest }) {
  const [open, setOpen] = React.useState(defaultOpen);
  const toggle = (k) => setOpen((o) => (o.includes(k) ? o.filter((x) => x !== k) : multiple ? [...o, k] : [k]));
  return (
    <div style={{ borderTop: "1px solid var(--border-subtle)", ...style }} {...rest}>
      {items.map((it) => {
        const on = open.includes(it.q);
        return (
          <div key={it.q} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <button
              type="button" onClick={() => toggle(it.q)} aria-expanded={on}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                gap: 16, padding: "18px 0", border: "none", background: "transparent",
                cursor: "pointer", textAlign: "left",
                fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16.5,
                letterSpacing: "-.005em", color: on ? "var(--pink-600)" : "var(--text-heading)",
              }}
            >
              <span style={{ minWidth: 0 }}>{it.q}</span>
              <Icon name="chevron-down" size="md" style={{ flex: "0 0 auto", transform: on ? "rotate(180deg)" : "none", transition: "transform var(--dur-base) var(--ease-out)" }} />
            </button>
            <div style={{ display: "grid", gridTemplateRows: on ? "1fr" : "0fr", transition: "grid-template-rows var(--dur-base) var(--ease-out)" }}>
              <div style={{ overflow: "hidden" }}>
                <div style={{ paddingBottom: 18, fontSize: 15, lineHeight: 1.6, color: "var(--text-muted)", maxWidth: "62ch", textWrap: "pretty" }}>{it.a}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
