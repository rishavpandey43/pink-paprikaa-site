import React from "react";
import { IconButton } from "../atoms/IconButton.jsx";
import { Menu } from "../atoms/Menu.jsx";

/** The "more" menu: an icon button that opens our Menu panel of actions.
    Use for row and card overflow (edit, share, remove). */
export function ActionMenu({
  items = [], onSelect, label = "More actions", icon = "ellipsis-vertical", variant = "ghost", size = "sm", on,
  placement = "bottom-end", sheet = "auto", title, defaultOpen = false, minWidth = 200, style,
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const wrap = React.useRef(null);
  const refocus = () => { const b = wrap.current && wrap.current.querySelector("button"); b && b.focus(); };
  const close = React.useCallback((why) => { setOpen(false); if (why === "escape") refocus(); }, []);
  return (
    <span ref={wrap} style={{ position: "relative", display: "inline-flex", ...style }}>
      <IconButton icon={icon} label={label} variant={variant} size={size} on={on}
        aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)} />
      <Menu open={open} onClose={close} items={items} placement={placement} sheet={sheet} title={title || label} minWidth={minWidth}
        onSelect={(it) => { setOpen(false); refocus(); onSelect && onSelect(it.value, it); }} />
    </span>
  );
}
