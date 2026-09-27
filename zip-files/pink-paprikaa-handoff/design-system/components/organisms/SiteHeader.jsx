import React from "react";
import { Logo } from "../atoms/Logo.jsx";
import { Link } from "../atoms/Link.jsx";
import { Button } from "../atoms/Button.jsx";
import { IconButton } from "../atoms/IconButton.jsx";

/** Website masthead. Sticky, goes translucent once scrolled. */
export function SiteHeader({ links = ["Menu", "Our Story", "Outlets", "Franchise", "Careers"], cart = 0, scrolled, base = "/assets", onOrder, onBook, onSearch, onCart, style, ...rest }) {
  const [w, setW] = React.useState(typeof window === "undefined" ? 1440 : window.innerWidth);
  React.useEffect(() => {
    const f = () => setW(window.innerWidth);
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);
  const shown = w >= 1280 ? links : w >= 1080 ? links.slice(0, 4) : w >= 860 ? links.slice(0, 3) : [];
  return (
    <header
      style={{
        position: "sticky", top: 0, zIndex: 30, height: "var(--header-h)",
        display: "flex", alignItems: "center", gap: 24, padding: "0 var(--gutter-fluid)",
        background: scrolled ? "var(--surface-glass)" : "var(--ink-000)",
        backdropFilter: scrolled ? "var(--blur-glass)" : "none",
        borderBottom: "1px solid " + (scrolled ? "var(--border-subtle)" : "transparent"),
        transition: "background var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out)",
        ...style,
      }}
      {...rest}
    >
      <a href="#" style={{ display: "flex", alignItems: "center", flex: "0 0 auto" }}><Logo base={base} height={60} /></a>
      <nav style={{ display: "flex", gap: 24, marginLeft: 12, flex: "0 0 auto" }}>
        {shown.map((l) => <Link key={l} variant="quiet" style={{ whiteSpace: "nowrap" }}>{l}</Link>)}
      </nav>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12, flex: "0 0 auto", whiteSpace: "nowrap" }}>
        <IconButton icon="search" label="Search the menu" onClick={onSearch} />
        <div style={{ position: "relative" }}>
          <IconButton icon="shopping-bag" label="Your order" onClick={onCart} />
          {cart > 0 ? (
            <span style={{ position: "absolute", top: -2, right: -2, minWidth: 18, height: 18, borderRadius: 99, background: "var(--pink-500)", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 10.5, display: "grid", placeItems: "center", padding: "0 5px" }}>{cart}</span>
          ) : null}
        </div>
        {w >= 720 ? <Button variant="secondary" size="sm" onClick={onBook}>Book a Table</Button> : null}
        <Button size="sm" icon="shopping-bag" onClick={onOrder}>Order Now</Button>
      </div>
    </header>
  );
}
