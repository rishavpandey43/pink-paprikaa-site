import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LayoutGrid } from "lucide-react";
import { createRef } from "react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { ToggleButton } from "./toggle-button";

describe("ToggleButton", () => {
  it("standalone: aria-pressed toggles and onSelectedChange fires", async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();
    render(
      <ToggleButton value="veg" onSelectedChange={onSelectedChange}>
        Veg only
      </ToggleButton>
    );
    const button = screen.getByRole("button", { name: "Veg only" });
    expect(button).toHaveAttribute("aria-pressed", "false");
    await user.click(button);
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(onSelectedChange).toHaveBeenCalledWith(true);
    await user.click(button);
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(onSelectedChange).toHaveBeenLastCalledWith(false);
  });

  it("starts selected with defaultSelected", () => {
    render(
      <ToggleButton value="veg" defaultSelected>
        Veg only
      </ToggleButton>
    );
    expect(screen.getByRole("button", { name: "Veg only" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("is controlled by selected: a press only reports", async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();
    render(
      <ToggleButton value="veg" selected={false} onSelectedChange={onSelectedChange}>
        Veg only
      </ToggleButton>
    );
    await user.click(screen.getByRole("button", { name: "Veg only" }));
    expect(onSelectedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole("button", { name: "Veg only" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });

  it("toggles with Space and Enter", async () => {
    const user = userEvent.setup();
    render(<ToggleButton value="veg">Veg only</ToggleButton>);
    await user.tab();
    await user.keyboard(" ");
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
    await user.keyboard("{Enter}");
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
  });

  it("an icon-only button is named by its aria-label and draws no label text", () => {
    render(<ToggleButton value="grid" icon={LayoutGrid} aria-label="Grid view" />);
    const button = screen.getByRole("button", { name: "Grid view" });
    expect(button.querySelector("svg")).toBeInTheDocument();
    expect(button).toHaveTextContent("");
  });

  it("puts the icon before the label", () => {
    render(
      <ToggleButton value="grid" icon={LayoutGrid}>
        Grid
      </ToggleButton>
    );
    const button = screen.getByRole("button", { name: "Grid" });
    expect(button.firstElementChild?.querySelector("svg")).toBeInTheDocument();
    expect(button.lastElementChild).toHaveTextContent("Grid");
  });

  it("maps size, color and isFullWidth to their classes", () => {
    render(
      <ToggleButton value="a" size="lg" color="neutral" isFullWidth>
        A
      </ToggleButton>
    );
    const button = screen.getByRole("button", { name: "A" });
    expect(button).toHaveClass("h-toggle-button-h-lg", "w-full");
    expect(button).toHaveClass("not-disabled:data-[state=on]:text-text-heading");
  });

  it("defaults to md and brand", () => {
    render(<ToggleButton value="a">A</ToggleButton>);
    const button = screen.getByRole("button", { name: "A" });
    expect(button).toHaveClass("h-toggle-button-h-md");
    expect(button).toHaveClass("not-disabled:data-[state=on]:text-text-brand");
  });

  it("disabled blocks presses", async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();
    render(
      <ToggleButton value="a" disabled onSelectedChange={onSelectedChange}>
        A
      </ToggleButton>
    );
    expect(screen.getByRole("button", { name: "A" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "A" }));
    expect(onSelectedChange).not.toHaveBeenCalled();
  });

  it("takes sx, className, native props and a ref on the root", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <ToggleButton
        ref={ref}
        value="a"
        sx={{ mt: 4 }}
        className="ms-2"
        data-testid="toggle"
        id="the-toggle"
      >
        A
      </ToggleButton>
    );
    const button = screen.getByTestId("toggle");
    expect(ref.current).toBe(button);
    expect(button).toHaveAttribute("id", "the-toggle");
    expect(button).toHaveClass("mt-4", "ms-2");
  });

  it("is accessible", async () => {
    const { container } = render(
      <div>
        <ToggleButton value="a">Text</ToggleButton>
        <ToggleButton value="b" icon={LayoutGrid} aria-label="Grid view" />
      </div>
    );
    await expectNoA11yViolations(container);
  });
});
