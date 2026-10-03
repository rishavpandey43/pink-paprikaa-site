import { render, screen } from "@testing-library/react";
import { MessageCircle, Phone } from "lucide-react";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { SiteFooter } from "../site-footer/site-footer";
import { ActionDock, type DockAction } from "./action-dock";

// R15: a path from import.meta.dirname — Vite rewrites `new URL(…, import.meta.url)` under jsdom.
const theme = readFileSync(
  join(import.meta.dirname, "../../../../design-tokens/dist/theme.css"),
  "utf8"
);

const PRIMARY: DockAction = {
  label: "WhatsApp us",
  href: "https://wa.me/919090704001",
  icon: MessageCircle,
};
const SECONDARY: DockAction = { label: "Call", href: "tel:+919090704001", icon: Phone };

const dockOf = (link: HTMLElement) => link.closest('[data-surface="light"]');

describe("ActionDock", () => {
  it("offers the primary action as a labelled link", () => {
    render(<ActionDock primary={PRIMARY} secondary={SECONDARY} />);
    expect(screen.getByRole("link", { name: "WhatsApp us" })).toHaveAttribute("href", PRIMARY.href);
  });

  it("offers the secondary action as an icon link on phones only", () => {
    render(<ActionDock primary={PRIMARY} secondary={SECONDARY} />);
    const call = screen.getByRole("link", { name: "Call" });
    expect(call).toHaveAttribute("href", SECONDARY.href);
    expect(call).toHaveClass("md:hidden");
  });

  it("renders only the primary action when there is no secondary", () => {
    render(<ActionDock primary={PRIMARY} />);
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });

  it("pins to the viewport bottom on the dock layer, above the header and below overlays", () => {
    render(<ActionDock primary={PRIMARY} />);
    const dock = dockOf(screen.getByRole("link", { name: "WhatsApp us" }));
    expect(dock).toHaveClass("fixed", "bottom-0", "z-dock");
    expect(dock).toHaveClass("md:right-6", "md:inset-x-auto");
  });

  it("pads for the iOS home indicator on phones and floats clear of it from md", () => {
    render(<ActionDock primary={PRIMARY} />);
    const dock = dockOf(screen.getByRole("link", { name: "WhatsApp us" }));
    expect(dock).toHaveClass("pb-action-dock-bottom", "md:bottom-action-dock-float");
    expect(theme).toContain(
      "--spacing-action-dock-bottom: calc(10px + env(safe-area-inset-bottom, 0px));"
    );
    expect(theme).toContain(
      "--spacing-action-dock-float: calc(24px + env(safe-area-inset-bottom, 0px));"
    );
  });

  it("never covers the footer's last links: the footer pads clear of the dock", () => {
    render(
      <>
        <SiteFooter
          columns={[
            { heading: "Eat with us", items: [{ label: "Homely Meals", href: "#homely" }] },
          ]}
          policies={[{ label: "Privacy Policy", href: "#privacy" }]}
          hasDockClearance
        />
        <ActionDock primary={PRIMARY} secondary={SECONDARY} />
      </>
    );
    expect(screen.getByRole("contentinfo")).toHaveClass("pb-site-footer-dock-clearance");
    // 110px + inset clears the tallest dock: phone bar 10 + 48 + 10 (+ inset), desktop pill 24 + 54 (+ inset).
    expect(theme).toContain(
      "--spacing-site-footer-dock-clearance: calc(110px + env(safe-area-inset-bottom, 0px));"
    );
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<ActionDock primary={PRIMARY} secondary={SECONDARY} />);
    await expectNoA11yViolations(container);
  });
});
