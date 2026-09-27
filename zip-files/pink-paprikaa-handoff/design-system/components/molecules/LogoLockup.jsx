import React from "react";
import { Logo } from "../atoms/Logo.jsx";

/** Canvas-scale signature for marketing artwork.
    The tagline is part of the supplied artwork, never live type. */
export function LogoLockup({ tone = "white", size = 260, tagline = true, align = "start", base = "/assets", style, ...rest }) {
  return (
    <div style={{ display: "grid", justifyItems: align === "center" ? "center" : "start", ...style }} {...rest}>
      <Logo base={base} tone={tone} variant={tagline ? "lockup" : "wordmark"} width={size} />
    </div>
  );
}
