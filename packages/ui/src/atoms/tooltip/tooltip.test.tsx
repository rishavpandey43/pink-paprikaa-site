import type { ReactNode } from "react";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Tooltip, TooltipProvider } from "./tooltip";

function renderInProvider(ui: ReactNode) {
  return render(<TooltipProvider>{ui}</TooltipProvider>);
}

describe("Tooltip", () => {
  it("keeps the hint closed until the trigger is reached", () => {
    renderInProvider(
      <Tooltip label="Contains dairy">
        <button type="button">Dairy</button>
      </Tooltip>
    );

    expect(screen.getByRole("button", { name: "Dairy" })).toBeInTheDocument();
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("opens on keyboard focus", async () => {
    renderInProvider(
      <Tooltip label="Contains dairy">
        <button type="button">Dairy</button>
      </Tooltip>
    );

    await userEvent.tab();

    expect(await screen.findByRole("tooltip")).toHaveTextContent("Contains dairy");
  });

  it("closes again when focus leaves", async () => {
    renderInProvider(
      <>
        <Tooltip label="Contains dairy">
          <button type="button">Dairy</button>
        </Tooltip>
        <button type="button">Elsewhere</button>
      </>
    );

    await userEvent.tab();
    expect(await screen.findByRole("tooltip")).toBeInTheDocument();

    await userEvent.tab();
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    renderInProvider(
      <Tooltip label="Contains dairy">
        <button type="button">Dairy</button>
      </Tooltip>
    );

    await userEvent.tab();
    expect(await screen.findByRole("tooltip")).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("describes the trigger it names while it is open", async () => {
    renderInProvider(
      <Tooltip isDefaultOpen label="Pickup only for now">
        <button type="button">Delivery</button>
      </Tooltip>
    );

    const trigger = screen.getByRole("button", { name: "Delivery" });
    const hint = await screen.findByRole("tooltip");

    expect(trigger).toHaveAttribute("aria-describedby", hint.id);
  });

  it("uses the caller's control as the trigger rather than adding one", () => {
    renderInProvider(
      <Tooltip label="Save for later">
        <button type="button">Save</button>
      </Tooltip>
    );

    expect(screen.getAllByRole("button")).toHaveLength(1);
  });

  it.each(["top", "bottom", "left", "right"] as const)(
    "places the hint on the %s",
    async (side) => {
      renderInProvider(
        <Tooltip isDefaultOpen label="Share" side={side}>
          <button type="button">Share</button>
        </Tooltip>
      );

      expect(await screen.findByRole("tooltip")).toHaveAttribute("data-side", side);
    }
  );

  it("reports every open and close", async () => {
    const handleOpenChange = vi.fn();
    renderInProvider(
      <Tooltip label="Contains dairy" onOpenChange={handleOpenChange}>
        <button type="button">Dairy</button>
      </Tooltip>
    );

    await userEvent.tab();

    expect(handleOpenChange).toHaveBeenCalledWith(true);
  });

  it("stays open when driven from outside", async () => {
    renderInProvider(
      <Tooltip isOpen label="Ground this morning">
        <button type="button">Info</button>
      </Tooltip>
    );

    expect(await screen.findByRole("tooltip")).toHaveTextContent("Ground this morning");
  });

  it("is an ink pill, not a bordered box", async () => {
    renderInProvider(
      <Tooltip isDefaultOpen label="Contains dairy">
        <button type="button">Dairy</button>
      </Tooltip>
    );
    const hint = await screen.findByRole("tooltip");

    expect(hint).toHaveClass("bg-surface-inverse");
    expect(hint).toHaveClass("text-text-on-inverse");
    expect(hint).toHaveClass("rounded-2");
  });

  it("merges a caller className", async () => {
    renderInProvider(
      <Tooltip className="rounded-4" isDefaultOpen label="Contains dairy">
        <button type="button">Dairy</button>
      </Tooltip>
    );
    const hint = await screen.findByRole("tooltip");

    expect(hint).toHaveClass("rounded-4");
    expect(hint).not.toHaveClass("rounded-2");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <TooltipProvider>
        <Tooltip label="Contains dairy">
          <button type="button">Dairy</button>
        </Tooltip>
        <Tooltip label="Save for later" side="bottom">
          <button type="button">Save</button>
        </Tooltip>
      </TooltipProvider>
    );
    await expectNoA11yViolations(container);
  });
});
