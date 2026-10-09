import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MapPin, MessageCircle, Phone } from "lucide-react";
import { useState } from "react";

import { expectNoA11yViolations } from "#vitest.setup";

import { SpeedDial, type SpeedDialAction } from "./speed-dial";

function actions(onSelect = vi.fn()): SpeedDialAction[] {
  return [
    { icon: Phone, label: "Call", href: "tel:+911244000000" },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      href: "https://wa.me/911244000000",
      target: "_blank",
    },
    { icon: MapPin, label: "Directions", onSelect },
  ];
}

describe("SpeedDial", () => {
  it("toggles open with aria-expanded and shows its actions", async () => {
    const user = userEvent.setup();
    render(<SpeedDial label="Contact us" actions={actions()} />);
    const trigger = screen.getByRole("button", { name: "Contact us" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: "Call" })).toBeNull();
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).toHaveAttribute("aria-controls", screen.getByRole("list").id);
    expect(screen.getByRole("link", { name: "Call" })).toBeVisible();
    expect(screen.getByRole("link", { name: /WhatsApp.*Opens in a new tab/ })).toBeVisible();
    expect(screen.getByRole("button", { name: "Directions" })).toBeVisible();
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("opens new-tab links safely", async () => {
    const user = userEvent.setup();
    render(<SpeedDial label="Contact us" actions={actions()} defaultOpen />);
    const link = screen.getByRole("link", { name: /WhatsApp/ });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer noopener");
    expect(screen.getByRole("link", { name: "Call" })).not.toHaveAttribute("target");
    await user.keyboard("{Escape}");
  });

  it("shows each label as a visible chip", () => {
    render(<SpeedDial label="Contact us" actions={actions()} defaultOpen />);
    expect(screen.getByText("Directions", { selector: "span:not(.sr-only)" })).toBeVisible();
  });

  it("arrows move between actions, Escape closes and refocuses the trigger", async () => {
    const user = userEvent.setup();
    render(<SpeedDial label="Contact us" actions={actions()} />);
    const trigger = screen.getByRole("button", { name: "Contact us" });
    await user.click(trigger);
    // direction "up" (default): ArrowUp goes outward, ArrowDown comes back in.
    await user.keyboard("{ArrowUp}");
    expect(screen.getByRole("link", { name: "Call" })).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    expect(screen.getByRole("link", { name: /WhatsApp/ })).toHaveFocus();
    await user.keyboard("{ArrowUp}{ArrowUp}");
    expect(screen.getByRole("button", { name: "Directions" })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("link", { name: /WhatsApp/ })).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("uses the horizontal arrows for left and right dials", async () => {
    const user = userEvent.setup();
    render(<SpeedDial label="Contact us" actions={actions()} direction="right" defaultOpen />);
    screen.getByRole("button", { name: "Contact us" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("link", { name: "Call" })).toHaveFocus();
    await user.keyboard("{ArrowRight}{ArrowLeft}{ArrowLeft}");
    expect(screen.getByRole("button", { name: "Contact us" })).toHaveFocus();
  });

  it.each([
    ["up", "flex-col-reverse"],
    ["down", "flex-col"],
    ["left", "flex-row-reverse"],
    ["right", "flex-row"],
  ] as const)("direction %s lays the dial out as %s", (direction, cls) => {
    const { container } = render(
      <SpeedDial label="Contact us" actions={actions()} direction={direction} />
    );
    expect(container.firstElementChild).toHaveClass("flex", cls);
  });

  it("onSelect fires and closes the dial", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<SpeedDial label="Contact us" actions={actions(onSelect)} />);
    const trigger = screen.getByRole("button", { name: "Contact us" });
    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "Directions" }));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("closes on a press outside, not on a press inside", async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">Outside</button>
        <SpeedDial label="Contact us" actions={actions()} />
      </>
    );
    const trigger = screen.getByRole("button", { name: "Contact us" });
    await user.click(trigger);
    await user.click(screen.getByText("Directions", { selector: "span:not(.sr-only)" }));
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await user.click(screen.getByRole("button", { name: "Outside" }));
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("is controlled by open and reports onOpenChange", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <SpeedDial label="Contact us" actions={actions()} open={false} onOpenChange={onOpenChange} />
    );
    const trigger = screen.getByRole("button", { name: "Contact us" });
    await user.click(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    rerender(<SpeedDial label="Contact us" actions={actions()} open onOpenChange={onOpenChange} />);
    expect(screen.getByRole("link", { name: "Call" })).toBeVisible();
  });

  it("works controlled from a parent", async () => {
    const user = userEvent.setup();
    function Parent() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <SpeedDial label="Contact us" actions={actions()} open={isOpen} onOpenChange={setIsOpen} />
      );
    }
    render(<Parent />);
    await user.click(screen.getByRole("button", { name: "Contact us" }));
    expect(screen.getByRole("link", { name: "Call" })).toBeVisible();
  });

  it("pins the dial to a corner", () => {
    const { container } = render(
      <SpeedDial label="Contact us" actions={actions()} position="bottom-end" />
    );
    expect(container.firstElementChild).toHaveClass("fixed", "end-4", "z-dock");
  });

  it("merges sx", () => {
    const { container } = render(
      <SpeedDial label="Contact us" actions={actions()} sx={{ mt: 2 }} />
    );
    expect(container.firstElementChild).toHaveClass("mt-2");
  });

  it("is accessible closed and open", async () => {
    const user = userEvent.setup();
    const { container } = render(<SpeedDial label="Contact us" actions={actions()} />);
    await expectNoA11yViolations(container);
    await user.click(screen.getByRole("button", { name: "Contact us" }));
    await expectNoA11yViolations(container);
  });
});
