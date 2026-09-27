import React from "react";
import { Container } from "./Container.jsx";

const TONES = { page: "var(--surface-page)", alt: "var(--surface-page-alt)", sunken: "var(--surface-sunken)", brand: "var(--pink-500)", ink: "var(--ink-900)" };

/** Vertical page rhythm. Wraps content in a Container by default. */
export function Section({ children, tone = "page", size = "default", space = "default", bare, as = "section", style, ...rest }) {
  const Tag = as;
  const pad = space === "tight" ? "clamp(36px,4vw,56px)" : space === "loose" ? "clamp(72px,9vw,128px)" : "var(--section-y-fluid)";
  return (
    <Tag data-surface={tone === "brand" || tone === "ink" || tone === "alt" ? (tone === "alt" ? undefined : tone) : undefined} style={{ background: TONES[tone] || tone, paddingBlock: space === "none" ? 0 : pad, ...style }} {...rest}>
      {bare ? children : <Container size={size}>{children}</Container>}
    </Tag>
  );
}
