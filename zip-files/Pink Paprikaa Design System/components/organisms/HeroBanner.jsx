import React from "react";
import { PatternField } from "../atoms/PatternField.jsx";
import { Text } from "../atoms/Text.jsx";
import { ImageSlot } from "../atoms/ImageSlot.jsx";

/** Page-opening hero. Flooded brand field with an image on the side. */
export function HeroBanner({ overline, title, body, actions, meta = [], image, imageLabel = "Hero food photography 4:5", tone = "brand", layout = "split", base = "/assets", style, ...rest }) {
  const dark = tone === "brand" || tone === "ink";
  const center = layout === "center";
  return (
    <PatternField tone={tone === "ink" ? "ink" : tone === "soft" ? "soft" : "brand"} tile={86} base={base} style={style} {...rest}>
      <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "clamp(44px,6vw,72px) var(--gutter-fluid) clamp(52px,7vw,80px)", display: "grid", gridTemplateColumns: center ? "1fr" : "repeat(auto-fit, minmax(min(340px,100%), 1fr))", gap: "clamp(32px,4vw,56px)", alignItems: "center", textAlign: center ? "center" : "left", justifyItems: center ? "center" : "stretch" }}>
        <div style={{ minWidth: 0, maxWidth: center ? "22ch" : undefined }}>
          {overline ? <Text variant="overline" as="div" tone={dark ? "rgba(255,255,255,.82)" : "brand"}>{overline}</Text> : null}
          <Text variant="display-1" fluid as="h1" tone={dark ? "inverse" : "heading"} style={{ marginTop: 18 }}>{title}</Text>
          {body ? <Text variant="body-lg" as="p" tone={dark ? "rgba(255,255,255,.9)" : "muted"} style={{ marginTop: 20, maxWidth: "42ch", marginInline: center ? "auto" : undefined }}>{body}</Text> : null}
          {actions ? <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap", justifyContent: center ? "center" : "flex-start" }}>{actions}</div> : null}
          {meta.length ? (
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 36, flexWrap: "wrap", justifyContent: center ? "center" : "flex-start" }}>
              {meta.map((m, i) => (
                <React.Fragment key={m}>
                  {i > 0 ? <img src={base + "/symbol-" + (dark ? "white" : "pink") + ".svg"} alt="" style={{ width: 12, opacity: 0.8 }} /> : null}
                  <Text variant="body-sm" as="span" tone={dark ? "rgba(255,255,255,.85)" : "muted"}>{m}</Text>
                </React.Fragment>
              ))}
            </div>
          ) : null}
        </div>
        {!center ? (
          <div style={{ minWidth: 0 }}>
            <ImageSlot src={image} ratio="4:5" radius="var(--radius-xl)" label={imageLabel} style={{ boxShadow: "var(--shadow-4)" }} />
          </div>
        ) : null}
      </div>
    </PatternField>
  );
}
