import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { DemoTrigger } from "../../lib/demo-triggers";
import { Popover } from "./popover";

const TRIGGER = <DemoTrigger>What&apos;s in the thali?</DemoTrigger>;

async function openPopover(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "What's in the thali?" }));
  return screen.getByRole("dialog", { name: "Thali" });
}

describe("Popover", () => {
  it("opens from its trigger, is named by its title, and Escape returns focus", async () => {
    const user = userEvent.setup();
    render(
      <Popover trigger={TRIGGER} title="Thali">
        Dal, sabzi, 3 rotis, rice, raita.
      </Popover>
    );
    expect(screen.queryByRole("dialog")).toBeNull();
    const trigger = screen.getByRole("button", { name: "What's in the thali?" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("dialog", { name: "Thali" })).toBeVisible();
    expect(screen.getByText("Dal, sabzi, 3 rotis, rice, raita.")).toBeVisible();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it("renders the title as an h2 by default and at the requested headingLevel", async () => {
    const user = userEvent.setup();
    render(
      <Popover trigger={TRIGGER} title="Thali" headingLevel={4}>
        Dal.
      </Popover>
    );
    await openPopover(user);
    expect(screen.getByRole("heading", { level: 4, name: "Thali" })).toBeInTheDocument();
  });

  it("defaults the title to an h2", async () => {
    const user = userEvent.setup();
    render(
      <Popover trigger={TRIGGER} title="Thali">
        Dal.
      </Popover>
    );
    await openPopover(user);
    expect(screen.getByRole("heading", { level: 2, name: "Thali" })).toBeInTheDocument();
  });

  it("close button closes it", async () => {
    const user = userEvent.setup();
    render(
      <Popover trigger={TRIGGER} title="Thali" hasCloseButton>
        Dal.
      </Popover>
    );
    const dialog = await openPopover(user);
    await user.click(within(dialog).getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("names the close button with closeLabel", async () => {
    const user = userEvent.setup();
    render(
      <Popover trigger={TRIGGER} title="Thali" hasCloseButton closeLabel="Dismiss">
        Dal.
      </Popover>
    );
    const dialog = await openPopover(user);
    expect(within(dialog).getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
  });

  it("has no close button unless asked", async () => {
    const user = userEvent.setup();
    render(
      <Popover trigger={TRIGGER} title="Thali">
        Dal.
      </Popover>
    );
    const dialog = await openPopover(user);
    expect(within(dialog).queryByRole("button")).toBeNull();
  });

  it("passes side and align to the content", async () => {
    const user = userEvent.setup();
    render(
      <Popover trigger={TRIGGER} title="Thali" side="top" align="start">
        Dal.
      </Popover>
    );
    const dialog = await openPopover(user);
    expect(dialog).toHaveAttribute("data-side", "top");
    expect(dialog).toHaveAttribute("data-align", "start");
  });

  it("defaults to the bottom side, centred", async () => {
    const user = userEvent.setup();
    render(
      <Popover trigger={TRIGGER} title="Thali">
        Dal.
      </Popover>
    );
    const dialog = await openPopover(user);
    expect(dialog).toHaveAttribute("data-side", "bottom");
    expect(dialog).toHaveAttribute("data-align", "center");
  });

  it("draws the panel look from tokens", async () => {
    const user = userEvent.setup();
    render(
      <Popover trigger={TRIGGER} title="Thali">
        Dal.
      </Popover>
    );
    const dialog = await openPopover(user);
    expect(dialog).toHaveClass(
      "bg-surface-card",
      "border-default",
      "border-border-subtle",
      "rounded-lg",
      "shadow-3",
      "z-overlay",
      "p-popover-pad",
      "max-w-popover-max-w"
    );
  });

  it("draws an arrow only with hasArrow", async () => {
    const user = userEvent.setup();
    const { unmount } = render(
      <Popover trigger={TRIGGER} title="Thali">
        Dal.
      </Popover>
    );
    expect((await openPopover(user)).querySelector("svg.fill-surface-card")).toBeNull();
    unmount();
    render(
      <Popover trigger={TRIGGER} title="Thali" hasArrow>
        Dal.
      </Popover>
    );
    expect((await openPopover(user)).querySelector("svg.fill-surface-card")).not.toBeNull();
  });

  it("works without a title (the caller names it with aria-label)", async () => {
    const user = userEvent.setup();
    render(
      <Popover trigger={TRIGGER} aria-label="Thali contents">
        Dal.
      </Popover>
    );
    await user.click(screen.getByRole("button", { name: "What's in the thali?" }));
    expect(screen.getByRole("dialog", { name: "Thali contents" })).toBeVisible();
    expect(screen.queryByRole("heading")).toBeNull();
  });

  it("is controlled by open and reports onOpenChange", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Popover trigger={TRIGGER} title="Thali" open onOpenChange={onOpenChange}>
        Dal.
      </Popover>
    );
    expect(screen.getByRole("dialog", { name: "Thali" })).toBeVisible();
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole("dialog", { name: "Thali" })).toBeVisible();
  });

  it("opens on mount with defaultOpen", () => {
    render(
      <Popover trigger={TRIGGER} title="Thali" defaultOpen>
        Dal.
      </Popover>
    );
    expect(screen.getByRole("dialog", { name: "Thali" })).toBeVisible();
  });

  it("portals into the given container", async () => {
    const user = userEvent.setup();
    function Framed() {
      const [frame, setFrame] = useState<HTMLDivElement | null>(null);
      return (
        <div ref={setFrame} data-testid="frame">
          <Popover trigger={TRIGGER} title="Thali" portalContainer={frame}>
            Dal.
          </Popover>
        </div>
      );
    }
    render(<Framed />);
    await user.click(screen.getByRole("button", { name: "What's in the thali?" }));
    expect(screen.getByTestId("frame")).toContainElement(screen.getByRole("dialog"));
  });

  it("forwards native props and ref to the content, and takes sx", async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLDivElement>();
    render(
      <Popover trigger={TRIGGER} title="Thali" ref={ref} data-section="thali" sx={{ mt: 4 }}>
        Dal.
      </Popover>
    );
    const dialog = await openPopover(user);
    expect(ref.current).toBe(dialog);
    expect(dialog).toHaveAttribute("data-section", "thali");
    expect(dialog).toHaveClass("mt-4");
  });

  it("is accessible open", async () => {
    const user = userEvent.setup();
    render(
      <Popover trigger={TRIGGER} title="Thali" hasCloseButton hasArrow>
        Dal, sabzi, 3 rotis, rice, raita.
      </Popover>
    );
    await openPopover(user);
    await expectNoA11yViolations(document.body);
  });
});
