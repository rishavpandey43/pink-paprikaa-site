import React from "react";

function useMedia(q) {
  const get = () => (typeof window !== "undefined" && window.matchMedia ? window.matchMedia(q).matches : false);
  const [m, setM] = React.useState(get);
  React.useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia(q);
    const f = () => setM(mq.matches);
    mq.addEventListener ? mq.addEventListener("change", f) : mq.addListener(f);
    return () => (mq.removeEventListener ? mq.removeEventListener("change", f) : mq.removeListener(f));
  }, [q]);
  return m;
}

/** Floating surface every custom picker opens into. Anchors to its parent element,
    flips above when there is no room below, closes on outside press and Esc,
    and becomes a bottom sheet on phones. Never the browser's own popup. */
export function Popover({
  open, onClose, children, title, placement = "bottom-start", sheet = "auto", inline,
  width, minWidth, maxHeight = 320, offset = 6, bodyRef, bodyProps, padding = 6, style,
}) {
  const rootRef = React.useRef(null);
  const panelRef = React.useRef(null);
  const mobile = useMedia("(max-width: 640px)");
  const asSheet = sheet === true || (sheet === "auto" && mobile);
  const [pos, setPos] = React.useState(null);

  React.useLayoutEffect(() => {
    if (!open || inline || asSheet) return;
    const place = () => {
      const anchor = rootRef.current && rootRef.current.parentElement;
      if (!anchor) return;
      const r = anchor.getBoundingClientRect();
      const ph = panelRef.current ? panelRef.current.offsetHeight : maxHeight;
      const below = window.innerHeight - r.bottom, above = r.top;
      const up = placement.indexOf("top") === 0 ? above >= ph + offset || above > below : below < ph + offset + 8 && above > below;
      const end = /end$/.test(placement);
      setPos({
        top: up ? undefined : r.bottom + offset,
        bottom: up ? window.innerHeight - r.top + offset : undefined,
        left: end ? undefined : Math.max(8, Math.min(r.left, window.innerWidth - 8 - (panelRef.current ? panelRef.current.offsetWidth : 0))),
        right: end ? Math.max(8, window.innerWidth - r.right) : undefined,
        minWidth: minWidth != null ? minWidth : r.width, up,
      });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => { window.removeEventListener("resize", place); window.removeEventListener("scroll", place, true); };
  }, [open, inline, asSheet, placement, minWidth, maxHeight, offset]);

  React.useEffect(() => {
    if (!open || inline) return;
    const down = (e) => {
      if (panelRef.current && panelRef.current.contains(e.target)) return;
      const anchor = rootRef.current && rootRef.current.parentElement;
      if (!asSheet && anchor && anchor.contains(e.target)) return;
      onClose && onClose("outside");
    };
    const key = (e) => { if (e.key === "Escape") { e.stopPropagation(); onClose && onClose("escape"); } };
    document.addEventListener("pointerdown", down);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("pointerdown", down); document.removeEventListener("keydown", key); };
  }, [open, inline, asSheet, onClose]);

  if (!open && !inline) return null;

  const body = (
    <div ref={bodyRef} {...bodyProps}
      style={{ maxHeight: asSheet ? "min(70vh, 520px)" : maxHeight, overflowY: "auto", overscrollBehavior: "contain", padding: asSheet ? "4px 12px 16px" : padding, outline: "none", ...(bodyProps && bodyProps.style) }}>
      {children}
    </div>
  );

  if (asSheet) {
    const panel = (
      <div ref={panelRef} style={{
        width: "100%", background: "var(--surface-card)", borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
        boxShadow: "var(--shadow-4)", paddingBottom: "env(safe-area-inset-bottom)",
        animation: inline ? "none" : "pp-sheet-in var(--dur-base) var(--ease-entrance)", ...style,
      }}>
        <div style={{ display: "grid", placeItems: "center", paddingTop: 10 }}><span style={{ width: 40, height: 4, borderRadius: 99, background: "var(--ink-300)" }} /></div>
        {title ? <div style={{ padding: "14px 24px 6px", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, letterSpacing: "-.01em", color: "var(--text-heading)" }}>{title}</div> : null}
        {body}
      </div>
    );
    if (inline) return <div ref={rootRef}>{panel}</div>;
    return (
      <div ref={rootRef} style={{ position: "fixed", inset: 0, zIndex: 80, background: "var(--surface-overlay)", display: "flex", alignItems: "flex-end" }}>
        {panel}
      </div>
    );
  }

  return (
    <div ref={(el) => { rootRef.current = el; panelRef.current = el; }}
      style={{
        ...(inline ? { position: "relative" } : {
          position: "fixed", zIndex: 80, top: pos && pos.top, bottom: pos && pos.bottom, left: pos && pos.left, right: pos && pos.right,
          visibility: pos ? "visible" : "hidden",
          animation: "pp-pop-in var(--dur-fast) var(--ease-out)", transformOrigin: pos && pos.up ? "bottom" : "top",
        }),
        width, maxWidth: "calc(100vw - 16px)", minWidth: inline ? minWidth : pos ? pos.minWidth : minWidth,
        background: "var(--surface-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-3)", overflow: "hidden", ...style,
      }}>
      {body}
    </div>
  );
}
