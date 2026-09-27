import React from "react";
import { Card } from "../atoms/Card.jsx";
import { DietMark } from "../atoms/DietMark.jsx";
import { SpiceLevel } from "../atoms/SpiceLevel.jsx";
import { PriceTag } from "../atoms/PriceTag.jsx";
import { Badge } from "../atoms/Badge.jsx";
import { IconButton } from "../atoms/IconButton.jsx";

/** Grid/rail card for a dish. Image-first, 4:3 crop. */
export function MenuItemCard({
  name, description, price, was, diet = "veg", spice, badge, base = "/assets",
  image, imageLabel = "Dish photo", onAdd, onClick, width, style, ...rest
}) {
  return (
    <Card interactive padding={0} onClick={onClick} style={{ width, display: "flex", flexDirection: "column", ...style }} {...rest}>
      <div style={{ position: "relative", aspectRatio: "4 / 3", background: image ? `center/cover no-repeat url(${image})` : "var(--pink-100)", display: "grid", placeItems: "center" }}>
        {!image ? (
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 10.5, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--pink-400)" }}>{imageLabel}</span>
        ) : null}
        {badge ? <div style={{ position: "absolute", top: 12, left: 12 }}><Badge tone="brand">{badge}</Badge></div> : null}
        {onAdd ? (
          <div style={{ position: "absolute", bottom: -18, right: 14 }}>
            <IconButton icon="plus" label={`Add ${name}`} variant="primary" size="lg" onClick={(e) => { e.stopPropagation(); onAdd(); }} style={{ boxShadow: "var(--shadow-brand)" }} />
          </div>
        ) : null}
      </div>
      <div style={{ padding: "18px 18px 18px", display: "grid", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <DietMark type={diet} size={14} />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16.5, letterSpacing: "-.005em", color: "var(--text-heading)" }}>{name}</span>
        </div>
        {description ? <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: "var(--text-muted)" }}>{description}</p> : null}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 2 }}>
          <PriceTag amount={price} was={was} />
          {spice ? <SpiceLevel level={spice} size={12} base={base} /> : null}
        </div>
      </div>
    </Card>
  );
}
