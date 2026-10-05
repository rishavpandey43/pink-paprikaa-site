import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Dialog, Drawer } from "./dialog";

const TRIGGER = <button type="button">Book a table</button>;

/** A dialog the app opens from its own button: no `trigger`, so Radix has nothing to refocus. */
function ConfirmRemoval() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
        }}
      >
        Remove
      </button>
      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Remove this item?"
        footer={
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
            }}
          >
            Keep it
          </button>
        }
      />
    </>
  );
}

describe("Dialog", () => {
  it("opens from its trigger, named by its title and described by its description", async () => {
    const user = userEvent.setup();
    render(
      <Dialog trigger={TRIGGER} title="Book a table" description="We hold it for 15 minutes.">
        Pick your outlet.
      </Dialog>
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Book a table" }));
    const dialog = screen.getByRole("dialog", { name: "Book a table" });
    expect(dialog).toHaveAccessibleDescription("We hold it for 15 minutes.");
    expect(within(dialog).getByText("Pick your outlet.")).toBeInTheDocument();
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    render(<Dialog trigger={TRIGGER} title="Book a table" />);
    const trigger = screen.getByRole("button", { name: "Book a table" });
    await user.click(trigger);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("returns focus to what had it when a dialog without a trigger closes", async () => {
    const user = userEvent.setup();
    render(<ConfirmRemoval />);
    const opener = screen.getByRole("button", { name: "Remove" });
    await user.click(opener);
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Keep it" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
    await user.click(opener);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it("moves focus into the dialog when it opens", async () => {
    const user = userEvent.setup();
    render(<Dialog trigger={TRIGGER} title="Book a table" />);
    await user.click(screen.getByRole("button", { name: "Book a table" }));
    expect(screen.getByRole("dialog").contains(document.activeElement)).toBe(true);
  });

  it("closes from its labelled close button", async () => {
    const user = userEvent.setup();
    render(<Dialog trigger={TRIGGER} title="Book a table" />);
    await user.click(screen.getByRole("button", { name: "Book a table" }));
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("reports open changes and stays open when controlled", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Dialog open onOpenChange={onOpenChange} title="Remove this item?">
        Chilli Paneer will come off your order.
      </Dialog>
    );
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole("dialog", { name: "Remove this item?" })).toBeInTheDocument();
  });

  it("hides only the close button with hasCloseButton={false}; Escape and the scrim still ask to close", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Dialog
        open
        onOpenChange={onOpenChange}
        hasCloseButton={false}
        title="Remove this item?"
        footer={<button type="button">Keep it</button>}
      >
        Chilli Paneer will come off your order.
      </Dialog>
    );
    const dialog = screen.getByRole("dialog", { name: "Remove this item?" });
    expect(within(dialog).queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Keep it" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
    onOpenChange.mockClear();
    // A click outside the panel lands on the scrim: it asks too, and the controlled dialog stays.
    const scrim = document.querySelector<HTMLElement>(".bg-surface-overlay");
    if (scrim === null) throw new Error("no scrim");
    await user.click(scrim);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole("dialog", { name: "Remove this item?" })).toBeInTheDocument();
  });

  it("merges a caller className onto the panel", () => {
    render(<Dialog defaultOpen title="Book a table" className="shadow-2" />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveClass("shadow-2");
    expect(dialog).not.toHaveClass("shadow-4");
  });

  it("locks page scroll while open", async () => {
    const user = userEvent.setup();
    render(<Dialog trigger={TRIGGER} title="Book a table" />);
    await user.click(screen.getByRole("button", { name: "Book a table" }));
    expect(document.body).toHaveAttribute("data-scroll-locked");
    await user.keyboard("{Escape}");
    expect(document.body).not.toHaveAttribute("data-scroll-locked");
  });

  it("lays the ink scrim over the page behind it", () => {
    render(<Dialog defaultOpen title="Book a table" />);
    expect(document.querySelector(".bg-surface-overlay")).toBeInTheDocument();
  });

  it("renders the sheet with a grab handle and top-only corners", () => {
    render(<Dialog defaultOpen variant="sheet" title="Remove this item?" />);
    const sheet = screen.getByRole("dialog");
    expect(sheet).toHaveClass("rounded-t-xl");
    expect(sheet).not.toHaveClass("rounded-xl");
    expect(sheet.querySelector('[aria-hidden="true"] .rounded-pill')).toBeInTheDocument();
  });

  it("scrolls its body, never the header or footer, so the actions stay on screen", () => {
    render(
      <Dialog
        defaultOpen
        title="Book a table"
        footer={<button type="button">Hold my table</button>}
      >
        Pick your outlet.
      </Dialog>
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveClass("overflow-hidden");
    expect(within(dialog).getByText("Pick your outlet.")).toHaveClass(
      "min-h-0",
      "flex-1",
      "overflow-y-auto"
    );
    expect(within(dialog).getByRole("button", { name: "Hold my table" }).parentElement).toHaveClass(
      "shrink-0"
    );
  });

  it.each([
    ["sm", "max-w-dialog-sm"],
    ["md", "max-w-dialog-md"],
    ["lg", "max-w-dialog-lg"],
  ] as const)("sizes the modal %s", (size, widthClass) => {
    render(<Dialog defaultOpen size={size} title="Book a table" />);
    expect(screen.getByRole("dialog")).toHaveClass(widthClass);
  });

  it("renders the footer actions", () => {
    render(
      <Dialog
        defaultOpen
        title="Remove this item?"
        footer={<button type="button">Remove</button>}
      />
    );
    expect(
      within(screen.getByRole("dialog")).getByRole("button", { name: "Remove" })
    ).toBeInTheDocument();
  });

  it("portals into the given container instead of the page body", () => {
    const frame = document.createElement("div");
    document.body.append(frame);
    render(<Dialog defaultOpen title="Remove this item?" portalContainer={frame} />);
    expect(frame).toContainElement(screen.getByRole("dialog"));
    frame.remove();
  });

  it("has no accessibility violations while open", async () => {
    render(
      <Dialog
        defaultOpen
        title="Book a table"
        description="We hold it for 15 minutes."
        footer={<button type="button">Hold my table</button>}
      >
        Pick your outlet.
      </Dialog>
    );
    // Scoped to the dialog: Radix hides the rest of the page (aria-hidden) while focus is trapped.
    await expectNoA11yViolations(screen.getByRole("dialog"));
  });

  it("forwards id, data-*, aria-* and ref to its panel, and takes sx", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Dialog
        ref={ref}
        defaultOpen
        title="Book a table"
        id="booking"
        data-section="reserve"
        sx={{ mt: 4 }}
        className="italic"
      />
    );
    const panel = screen.getByRole("dialog", { name: "Book a table" });
    expect(ref.current).toBe(panel);
    expect(panel).toHaveAttribute("id", "booking");
    expect(panel).toHaveAttribute("data-section", "reserve");
    expect(panel).toHaveClass("mt-4", "italic");
  });

  it("still opens, names and closes through the Radix root with native props on the panel", async () => {
    const user = userEvent.setup();
    render(<Dialog trigger={TRIGGER} title="Book a table" data-section="reserve" />);
    await user.click(screen.getByRole("button", { name: "Book a table" }));
    expect(screen.getByRole("dialog", { name: "Book a table" })).toHaveAttribute(
      "data-section",
      "reserve"
    );
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls onClose when the dialog closes", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Dialog trigger={TRIGGER} title="Book a table" onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: "Book a table" }));
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledWith("dismiss");
  });
});

function DrawerHarness() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
        }}
      >
        Filters
      </button>
      <Drawer open={isOpen} onOpenChange={setIsOpen} title="Filters">
        Jain only
      </Drawer>
    </>
  );
}

describe("Drawer", () => {
  it.each(["start", "end"] as const)(
    "on the %s side is a full-height dialog on that edge",
    (side) => {
      render(
        <Drawer open title="Filters" side={side}>
          Jain only
        </Drawer>
      );
      const dialog = screen.getByRole("dialog", { name: "Filters" });
      expect(dialog).toHaveClass("h-full", side === "start" ? "start-0" : "end-0");
      expect(dialog).toHaveClass(`animate-drawer-in-${side}`);
      expect(dialog).not.toHaveClass("rounded-xl", "rounded-t-xl");
    }
  );

  it("defaults to the end side", () => {
    render(
      <Drawer open title="Filters">
        Jain only
      </Drawer>
    );
    expect(screen.getByRole("dialog")).toHaveClass("end-0");
  });

  it("closes on Escape and returns focus to its trigger", async () => {
    const user = userEvent.setup();
    render(<DrawerHarness />);
    await user.click(screen.getByRole("button", { name: "Filters" }));
    expect(screen.getByRole("dialog", { name: "Filters" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByRole("button", { name: "Filters" })).toHaveFocus();
  });

  it.each([
    ["sm", "max-w-dialog-drawer-sm"],
    ["md", "max-w-dialog-drawer-md"],
    ["lg", "max-w-dialog-drawer-lg"],
  ] as const)("size %s", (size, widthClass) => {
    render(
      <Drawer open title="Cart" size={size}>
        x
      </Drawer>
    );
    expect(screen.getByRole("dialog")).toHaveClass(widthClass, "w-full");
  });

  it("is a drawer by default width md, with no grab handle", () => {
    render(
      <Drawer open title="Cart">
        x
      </Drawer>
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveClass("max-w-dialog-drawer-md");
    expect(dialog.querySelector('[aria-hidden="true"] .rounded-pill')).toBeNull();
  });

  it("has no accessibility violations while open", async () => {
    render(
      <Drawer open title="Filters" description="Narrow the menu.">
        Jain only
      </Drawer>
    );
    await expectNoA11yViolations(screen.getByRole("dialog"));
  });
});
