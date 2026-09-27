import React from "react";
import { Card } from "../atoms/Card.jsx";
import { Text } from "../atoms/Text.jsx";
import { Icon } from "../atoms/Icon.jsx";
import { StatusDot } from "../atoms/StatusDot.jsx";
import { ImageSlot } from "../atoms/ImageSlot.jsx";

/** An outlet in the locator. */
export function OutletCard({ name, city, address, hours, status = "open", statusLabel, image, imageLabel = "Outlet interior 16:9", action, onClick, base = "/assets", style, ...rest }) {
  const fallback = status === "open" ? "Open now" : status === "busy" ? "Busy" : "Closed";
  return (
    <Card interactive={!!onClick} onClick={onClick} padding={0} style={{ display: "flex", flexDirection: "column", ...style }} {...rest}>
      {image !== false ? <ImageSlot src={image} ratio="16:9" radius="0" label={imageLabel} /> : null}
      <div style={{ padding: 18, display: "grid", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ minWidth: 0 }}>
            {city ? <Text variant="overline" tone="brand" as="div">{city}</Text> : null}
            <Text variant="h4" as="div" style={{ marginTop: 4 }}>{name}</Text>
          </div>
          <StatusDot tone={status} label={statusLabel || fallback} base={base} />
        </div>
        {address ? (
          <span style={{ display: "flex", gap: 8, alignItems: "flex-start", color: "var(--text-muted)" }}>
            <Icon name="map-pin" size="sm" style={{ marginTop: 3 }} />
            <Text variant="body-sm" tone="muted" as="span">{address}</Text>
          </span>
        ) : null}
        {hours ? (
          <span style={{ display: "flex", gap: 8, alignItems: "center", color: "var(--text-muted)" }}>
            <Icon name="clock" size="sm" />
            <Text variant="body-sm" tone="muted" as="span">{hours}</Text>
          </span>
        ) : null}
        {action ? <div style={{ marginTop: 4 }}>{action}</div> : null}
      </div>
    </Card>
  );
}
