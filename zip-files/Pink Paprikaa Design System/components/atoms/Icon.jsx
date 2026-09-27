import React from "react";

const SIZES = { xs: 14, sm: 16, md: 20, lg: 24, xl: 32 };
const CACHE = new Map();

/* Lucide (lucide-static) glyphs. The SVG markup is fetched once per icon and
   inlined, so `stroke="currentColor"` resolves against the element's own colour.
   (A CSS mask does NOT work here — currentColor has no context inside a mask
   image and the glyph renders as a solid block.)
   No icon set was supplied with the brand assets — Lucide is the documented
   substitution (24px grid, geometric, round caps).
   Offline builds may define window.__ppIconUrl(name) to return a local URL. */
export function Icon({ name, size = "md", strokeWidth, style, title, ...rest }) {
  const px = typeof size === "number" ? size : SIZES[size] || SIZES.md;
  const sw = strokeWidth != null ? strokeWidth : px <= 16 ? 2 : 1.75;
  const url = typeof window !== "undefined" && window.__ppIconUrl
    ? window.__ppIconUrl(name)
    : `https://unpkg.com/lucide-static@0.408.0/icons/${name}.svg`;
  const key = url + "|" + sw;
  const [svg, setSvg] = React.useState(() => CACHE.get(key) || null);

  React.useEffect(() => {
    if (CACHE.has(key)) { setSvg(CACHE.get(key)); return; }
    let live = true;
    fetch(url)
      .then((r) => r.text())
      .then((t) => {
        const clean = t
          .replace(/<!--[\s\S]*?-->/g, "")
          .replace(/\swidth="24"/, "")
          .replace(/\sheight="24"/, "")
          .replace(/stroke-width="2"/, `stroke-width="${sw}"`)
          .replace(/<svg/, '<svg width="100%" height="100%"')
          .trim();
        CACHE.set(key, clean);
        if (live) setSvg(clean);
      })
      .catch(() => {});
    return () => { live = false; };
  }, [key, url, sw]);

  return (
    <span
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      dangerouslySetInnerHTML={{ __html: svg || "" }}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: px, height: px, flex: "0 0 auto", lineHeight: 0,
        color: "inherit", ...style,
      }}
      {...rest}
    />
  );
}
