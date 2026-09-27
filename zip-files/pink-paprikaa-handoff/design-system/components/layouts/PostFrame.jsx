import React from "react";

const FORMATS = {
  post: { w: 1080, h: 1080, label: "Feed 1:1" },
  portrait: { w: 1080, h: 1350, label: "Feed 4:5" },
  story: { w: 1080, h: 1920, label: "Story 9:16" },
  landscape: { w: 1200, h: 628, label: "Link / OG" },
  wide: { w: 1920, h: 1080, label: "Screen 16:9" },
  mpu: { w: 300, h: 250, label: "MPU" },
  leaderboard: { w: 728, h: 90, label: "Leaderboard" },
};

/** Fixed-pixel marketing artboard that scales to fit its container.
    Children are laid out at true canvas size — 1080px thinking, not screen thinking. */
const surfaceOf = (bg) => { const b = String(bg || ""); if (/pink-500|pink-600|pink-700|#ee2c68/i.test(b)) return "brand"; if (/ink-900|ink-800|#1a1216/i.test(b)) return "ink"; if (/pink-50\b|pink-100|pink-200|#ffdbe8|#fff5f8/i.test(b)) return "soft"; return undefined; };

export function PostFrame({ format = "post", scale, fit, background = "var(--ink-000)", padding, safeArea, children, style, ...rest }) {
  const f = FORMATS[format] || FORMATS.post;
  const ref = React.useRef(null);
  const [auto, setAuto] = React.useState(null);
  React.useEffect(() => {
    if (!fit || !ref.current) return;
    const el = ref.current;
    const measure = () => {
      const w = el.parentElement ? el.parentElement.clientWidth : 0;
      if (w) setAuto(Math.min(1, w / f.w));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (el.parentElement) ro.observe(el.parentElement);
    return () => ro.disconnect();
  }, [fit, f.w]);
  const s = scale != null ? scale : auto != null ? auto : 1;
  const pad = padding != null ? padding : f.w >= 1080 ? "var(--canvas-pad)" : 20;
  return (
    <div ref={ref} style={{ width: f.w * s, height: f.h * s, flex: "0 0 auto", overflow: "hidden", ...style }} {...rest}>
      <div
        data-surface={surfaceOf(background)}
        style={{
          width: f.w, height: f.h, transform: "scale(" + s + ")", transformOrigin: "top left",
          background: background, position: "relative", overflow: "hidden",
          display: "flex", flexDirection: "column", padding: pad, boxSizing: "border-box",
        }}
      >
        {safeArea && format === "story" ? (
          <React.Fragment>
            <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: "var(--story-safe-top)", outline: "2px dashed rgba(255,255,255,.4)", outlineOffset: -2, pointerEvents: "none" }} />
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "var(--story-safe-bottom)", outline: "2px dashed rgba(255,255,255,.4)", outlineOffset: -2, pointerEvents: "none" }} />
          </React.Fragment>
        ) : null}
        {children}
      </div>
    </div>
  );
}

export const POST_FORMATS = FORMATS;
