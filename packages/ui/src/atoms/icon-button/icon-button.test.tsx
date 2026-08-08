import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ArrowLeft, Heart, Plus, Search } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { IconButton } from "./icon-button";

describe("IconButton", () => {
  it("takes its accessible name from the label", () => {
    render(<IconButton icon={Heart} label="Save" />);
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute("type", "button");
  });

  it("holds a 44px minimum hit target even at the smallest size", () => {
    render(<IconButton icon={Plus} label="Add" size="sm" />);
    const node = screen.getByRole("button", { name: "Add" });
    expect(node).toHaveClass("min-h-(--layout-hit-min)");
    expect(node).toHaveClass("min-w-(--layout-hit-min)");
  });

  it("calls onClick when pressed", async () => {
    const handleClick = vi.fn();
    render(<IconButton icon={Plus} label="Add" onClick={handleClick} />);

    await userEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("does not call onClick while disabled", async () => {
    const handleClick = vi.fn();
    render(<IconButton disabled icon={Plus} label="Add" onClick={handleClick} />);

    await userEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it.each([
    ["primary", "bg-brand-primary"],
    ["secondary", "border-border-default"],
    ["ghost", "bg-transparent"],
    ["glass", "bg-surface-glass"],
  ] as const)("paints the %s variant on its circle", (variant, expected) => {
    const { container } = render(<IconButton icon={Heart} label="Save" variant={variant} />);
    expect(container.querySelector("span")).toHaveClass(expected);
  });

  it.each([
    ["sm", "size-8"],
    ["md", "size-10"],
    ["lg", "size-12"],
  ] as const)("draws the %s circle at its fixed diameter", (size, expected) => {
    const { container } = render(<IconButton icon={Plus} label="Add" size={size} />);
    expect(container.querySelector("span")).toHaveClass(expected);
  });

  it("inverts the primary fill when it sits on a brand panel", () => {
    const { container } = render(
      <IconButton icon={Heart} label="Save" on="brand" variant="primary" />
    );
    const surface = container.querySelector("span");
    expect(surface).toHaveClass("bg-surface-card");
    expect(surface).not.toHaveClass("bg-brand-primary");
  });

  it("keeps a real grey fill when disabled rather than fading out", () => {
    const { container } = render(<IconButton disabled icon={Plus} label="Add" variant="primary" />);
    const surface = container.querySelector("span");
    expect(surface).toHaveClass("group-disabled:bg-(--button-bg-disabled)");
    expect(screen.getByRole("button").className).not.toMatch(/opacity-/);
  });

  it("renders exactly one glyph, hidden from assistive tech behind the label", () => {
    const { container } = render(<IconButton icon={Search} label="Search" />);
    const glyphs = container.querySelectorAll("svg");
    expect(glyphs).toHaveLength(1);
    expect(glyphs[0]).toHaveAttribute("aria-hidden", "true");
  });

  it("merges a caller className onto the hit target", () => {
    render(<IconButton className="rounded-1" icon={ArrowLeft} label="Back" />);
    const node = screen.getByRole("button", { name: "Back" });
    expect(node).toHaveClass("rounded-1");
    expect(node).not.toHaveClass("rounded-6");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <IconButton icon={Heart} label="Save" />
        <IconButton icon={Plus} label="Add" variant="primary" />
        <IconButton icon={ArrowLeft} label="Back" variant="glass" />
        <IconButton disabled icon={Search} label="Search" variant="secondary" />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
