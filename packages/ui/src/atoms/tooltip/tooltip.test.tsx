import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "#vitest.setup";

import { Tooltip } from "./tooltip";

function renderDairy() {
  return render(
    <Tooltip label="Contains dairy">
      <button type="button">Dairy</button>
    </Tooltip>
  );
}

// With no `aria-label` on the content, Radix gives the styled content itself role="tooltip" and
// points the trigger's aria-describedby at it, so the label renders once and is the element queried.
describe("Tooltip", () => {
  it("stays closed until its trigger is focused, then describes the trigger", async () => {
    const user = userEvent.setup();
    renderDairy();
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    await user.tab();
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Contains dairy");
    expect(screen.getByRole("button", { name: "Dairy" })).toHaveAccessibleDescription(
      "Contains dairy"
    );
  });

  it("opens on hover", async () => {
    const user = userEvent.setup();
    renderDairy();
    await user.hover(screen.getByRole("button", { name: "Dairy" }));
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Contains dairy");
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    renderDairy();
    await user.tab();
    await screen.findByRole("tooltip");
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });
  });

  it("closes when focus leaves the trigger", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Tooltip label="Contains dairy">
          <button type="button">Dairy</button>
        </Tooltip>
        <button type="button">Elsewhere</button>
      </>
    );
    await user.tab();
    await screen.findByRole("tooltip");
    await user.tab();
    expect(screen.getByRole("button", { name: "Elsewhere" })).toHaveFocus();
    await waitFor(() => {
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });
  });

  it("is an ink pill stacked above dialogs and toasts, capped so a long hint wraps", async () => {
    const user = userEvent.setup();
    renderDairy();
    await user.tab();
    expect(await screen.findByRole("tooltip")).toHaveClass(
      "z-tooltip",
      "max-w-56",
      "rounded-sm",
      "bg-surface-inverse",
      "text-text-on-inverse",
      "text-caption",
      "shadow-2"
    );
  });

  it.each(["top", "bottom", "left", "right"] as const)(
    "opens with side %s (placement itself is checked in the browser, story Sides)",
    async (side) => {
      const user = userEvent.setup();
      render(
        <Tooltip label="Share" side={side}>
          <button type="button">Share</button>
        </Tooltip>
      );
      await user.tab();
      expect(await screen.findByRole("tooltip")).toHaveTextContent("Share");
    }
  );

  it("keeps the trigger's own name and handlers", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Tooltip label="Pickup only for now">
        <button type="button" onClick={onClick}>
          Delivery
        </button>
      </Tooltip>
    );
    await user.click(screen.getByRole("button", { name: "Delivery" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });

  it("renders only the trigger for a blank label (R48)", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip label="  ">
        <button type="button">Dairy</button>
      </Tooltip>
    );
    await user.tab();
    expect(screen.getByRole("button", { name: "Dairy" })).toHaveFocus();
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dairy" })).not.toHaveAttribute("aria-describedby");
  });

  it("has no accessibility violations while open", async () => {
    const user = userEvent.setup();
    const { container } = renderDairy();
    await user.tab();
    const tooltip = await screen.findByRole("tooltip");
    await expectNoA11yViolations(container);
    await expectNoA11yViolations(tooltip);
  });

  it("takes sx on its content", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip label="Contains dairy" sx={{ mt: 4 }}>
        <button type="button">Dairy</button>
      </Tooltip>
    );
    await user.tab();
    expect(await screen.findByRole("tooltip")).toHaveClass("mt-4");
  });
});
