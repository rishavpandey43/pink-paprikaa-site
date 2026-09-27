import React from "react";
import { DietMark } from "../atoms/DietMark.jsx";
import { SpiceLevel } from "../atoms/SpiceLevel.jsx";
import { PriceTag } from "../atoms/PriceTag.jsx";
import { Badge } from "../atoms/Badge.jsx";
import { Button } from "../atoms/Button.jsx";

/** The menu list atom: hairline-separated row, thumbnail on the right. */
export function MenuItemRow({
  name, nameDevanagari, description, price, was, diet = "veg", spice, base = "/assets",
  badge, image, imageLabel = "Dish photo", onAdd, action, divider = true, style, ...rest
}) {
  return (
    <div
      style={{
        display: "flex", gap: 20, alignItems: "flex-start",
        padding: "20px 0", borderBottom: divider ? "1px solid var(--border-subtle)" : "none",
        ...style,
      }}
      {...rest}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <DietMark type={diet} size={15} />
          <h4 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, letterSpacing: "-.005em", color: "var(--text-heading)" }}>{name}</h4>
          {nameDevanagari ? <span style={{ fontFamily: "var(--font-devanagari)", fontWeight: 600, fontSize: 15, color: "var(--pink-500)" }}>{nameDevanagari}</span> : null}
          {badge ? <Badge tone="soft">{badge}</Badge> : null}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 8 }}>
          <PriceTag amount={price} was={was} size="sm" />
          {spice ? <SpiceLevel level={spice} size={12} base={base} /> : null}
        </div>
        {description ? (
          <p style={{ margin: "8px 0 0", fontSize: 14, lineHeight: 1.55, color: "var(--text-muted)", maxWidth: "46ch" }}>{description}</p>
        ) : null}
        {action || onAdd ? (
          <div style={{ marginTop: 14 }}>{action || <Button size="sm" variant="secondary" icon="plus" onClick={onAdd}>Add</Button>}</div>
        ) : null}
      </div>
      <div
        style={{
          width: 104, height: 104, flex: "0 0 auto", borderRadius: "var(--radius-md)",
          background: image ? `center/cover no-repeat url(${image})` : "var(--pink-100)",
          display: "grid", placeItems: "center", overflow: "hidden",
        }}
      >
        {!image ? (
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 9.5, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--pink-400)", textAlign: "center", padding: "0 8px" }}>{imageLabel}</span>
        ) : null}
      </div>
    </div>
  );
}
