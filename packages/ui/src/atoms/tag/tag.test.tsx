import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Clock, Leaf } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Tag } from "./tag";

describe("Tag", () => {
  it("renders an unpressed toggle by default", () => {
    render(<Tag>Small Plates</Tag>);
    const node = screen.getByRole("button", { name: "Small Plates", pressed: false });
    expect(node).toHaveAttribute("type", "button");
  });

  it("reports itself as pressed when selected", () => {
    render(<Tag isSelected>All</Tag>);
    expect(screen.getByRole("button", { name: "All", pressed: true })).toBeInTheDocument();
  });

  it("floods the brand pink when selected and stays white when not", () => {
    const { rerender } = render(<Tag>All</Tag>);
    expect(screen.getByRole("button")).toHaveClass("bg-surface-card");

    rerender(<Tag isSelected>All</Tag>);
    const node = screen.getByRole("button");
    expect(node).toHaveClass("bg-brand-primary");
    expect(node).not.toHaveClass("bg-surface-card");
  });

  it("holds the system's 38px tag height", () => {
    render(<Tag>Sweets</Tag>);
    expect(screen.getByRole("button")).toHaveClass("h-9.5");
  });

  it("calls onClick when picked", async () => {
    const handleClick = vi.fn();
    render(<Tag onClick={handleClick}>Veg Only</Tag>);

    await userEvent.click(screen.getByRole("button", { name: "Veg Only" }));

    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("does not call onClick while disabled", async () => {
    const handleClick = vi.fn();
    render(
      <Tag disabled onClick={handleClick}>
        Breakfast
      </Tag>
    );

    await userEvent.click(screen.getByRole("button", { name: "Breakfast" }));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it("keeps a real grey fill when disabled rather than fading out", () => {
    render(<Tag disabled>Breakfast</Tag>);
    const node = screen.getByRole("button");
    expect(node).toHaveClass("disabled:bg-(--button-bg-disabled)");
    expect(node.className).not.toMatch(/opacity-/);
  });

  it("renders a leading glyph without announcing it twice", () => {
    const { container } = render(<Tag icon={Leaf}>Jain</Tag>);
    expect(screen.getByRole("button", { name: "Jain" })).toBeInTheDocument();
    expect(container.querySelectorAll("svg")).toHaveLength(1);
  });

  it("merges a caller className", () => {
    render(<Tag className="rounded-1">Sweets</Tag>);
    const node = screen.getByRole("button");
    expect(node).toHaveClass("rounded-1");
    expect(node).not.toHaveClass("rounded-6");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <Tag isSelected>All</Tag>
        <Tag icon={Leaf}>Jain</Tag>
        <Tag icon={Clock}>Under 15 min</Tag>
        <Tag disabled>Breakfast</Tag>
      </>
    );
    await expectNoA11yViolations(container);
  });
});
