import React from "react";
import { MenuItemRow } from "../molecules/MenuItemRow.jsx";
import { MenuItemCard } from "../molecules/MenuItemCard.jsx";
import { FilterBar } from "../molecules/FilterBar.jsx";
import { SectionHeader } from "../molecules/SectionHeader.jsx";
import { EmptyState } from "../molecules/EmptyState.jsx";
import { Divider } from "../atoms/Divider.jsx";

/** Filterable menu. Grid or list presentation. */
export function MenuList({ items = [], categories, overline = "The Menu", title = "Most ordered this week", action, variant = "grid", gridCount = 4, note = "100% Vegetarian", base = "/assets", onAdd, onOpen, style, ...rest }) {
  const cats = categories || ["All", ...Array.from(new Set(items.map((i) => i.cat).filter(Boolean)))];
  const [cat, setCat] = React.useState(cats[0] || "All");
  const list = items.filter((i) => cat === "All" || i.cat === cat);
  const grid = variant === "grid";
  return (
    <section style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "var(--section-y-fluid) var(--gutter-fluid)", ...style }} {...rest}>
      {title ? <SectionHeader overline={overline} title={title} action={action} /> : null}
      <FilterBar options={cats} value={cat} onChange={setCat} wrap note={note} style={{ marginTop: 28 }} />
      {list.length === 0 ? (
        <EmptyState symbol base={base} title="Nothing matches that yet." body="Try another category." style={{ marginTop: 24 }} />
      ) : grid ? (
        <React.Fragment>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(240px,100%), 1fr))", gap: "var(--gap-grid)", marginTop: 32 }}>
            {list.slice(0, gridCount).map((m) => <MenuItemCard key={m.name} base={base} {...m} onAdd={onAdd ? () => onAdd(m) : undefined} onClick={onOpen ? () => onOpen(m) : undefined} />)}
          </div>
          {list.length > gridCount ? (
            <div style={{ marginTop: 48 }}>
              <Divider label="Also On The Menu" />
              <div style={{ marginTop: 8 }}>
                {list.slice(gridCount).map((m, i, a) => <MenuItemRow key={m.name} base={base} {...m} divider={i < a.length - 1} onAdd={onAdd ? () => onAdd(m) : undefined} />)}
              </div>
            </div>
          ) : null}
        </React.Fragment>
      ) : (
        <div style={{ marginTop: 20 }}>
          {list.map((m, i) => <MenuItemRow key={m.name} base={base} {...m} divider={i < list.length - 1} onAdd={onAdd ? () => onAdd(m) : undefined} />)}
        </div>
      )}
    </section>
  );
}
