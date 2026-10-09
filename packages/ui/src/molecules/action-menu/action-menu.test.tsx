import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Flag, Share2 } from "lucide-react";

import { expectNoA11yViolations } from "#vitest.setup";

import { ActionMenu, type ActionMenuItem } from "./action-menu";

const ITEMS: ActionMenuItem[] = [
  { value: "share", label: "Share outlet", icon: Share2 },
  { value: "call", label: "Call Sector 57" },
  { divider: true },
  { value: "report", label: "Report a problem", icon: Flag, isDanger: true },
];

describe("ActionMenu", () => {
  it("opens from a ghost sm More actions IconButton (ellipsis)", async () => {
    const user = userEvent.setup();
    render(<ActionMenu items={ITEMS} />);
    const trigger = screen.getByRole("button", { name: "More actions" });
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger.querySelector(".lucide-ellipsis-vertical")).toBeInTheDocument();
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("menu", { name: "More actions" })).toBeVisible();
  });

  it("selects an item, fires onSelect, closes and returns focus", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<ActionMenu items={ITEMS} onSelect={onSelect} />);
    const trigger = screen.getByRole("button", { name: "More actions" });
    await user.click(trigger);
    await user.click(screen.getByRole("menuitem", { name: "Share outlet" }));
    expect(onSelect).toHaveBeenCalledWith(
      "share",
      expect.objectContaining({ value: "share", label: "Share outlet" })
    );
    expect(screen.queryByRole("menu")).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it("Escape closes and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    render(<ActionMenu items={ITEMS} />);
    const trigger = screen.getByRole("button", { name: "More actions" });
    await user.click(trigger);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it("puts the danger row last after a divider", () => {
    render(<ActionMenu items={ITEMS} defaultOpen />);
    const menu = screen.getByRole("menu");
    const rows = within(menu).getAllByRole("menuitem");
    expect(rows.at(-1)).toHaveTextContent("Report a problem");
    expect(rows.at(-1)?.className).toMatch(/text-text-danger/);
  });

  it("sheet=true opens as a bottom sheet titled from label", async () => {
    const user = userEvent.setup();
    render(<ActionMenu items={ITEMS} sheet title="Outlet actions" />);
    await user.click(screen.getByRole("button", { name: "More actions" }));
    expect(document.querySelector('[class*="animate-sheet-in"]')).not.toBeNull();
    expect(screen.getByText("Outlet actions")).toBeVisible();
  });

  it("is accessible open and closed", async () => {
    const user = userEvent.setup();
    const { container } = render(<ActionMenu items={ITEMS} />);
    await expectNoA11yViolations(container);
    await user.click(screen.getByRole("button", { name: "More actions" }));
    await expectNoA11yViolations(screen.getByRole("menu"));
  });

  it("takes sx on the wrapper", () => {
    const { container } = render(<ActionMenu items={ITEMS} sx={{ mt: 4 }} />);
    expect(container.firstElementChild).toHaveClass("mt-4");
  });

  it("takes placement and minWidth on the open menu", () => {
    render(<ActionMenu items={ITEMS} defaultOpen placement="top-start" minWidth={280} />);
    const menu = screen.getByRole("menu");
    expect(menu).toHaveStyle({ minWidth: "280px" });
  });
});
