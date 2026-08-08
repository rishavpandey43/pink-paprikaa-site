import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ArrowRight, ShoppingBag } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Button } from "./button";

describe("Button", () => {
  it("renders a non-submitting button by default", () => {
    render(<Button>Order Now</Button>);
    expect(screen.getByRole("button", { name: "Order Now" })).toHaveAttribute("type", "button");
  });

  it("calls onClick when pressed", async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Order Now</Button>);

    await userEvent.click(screen.getByRole("button", { name: "Order Now" }));

    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("does not call onClick while disabled", async () => {
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Order Now
      </Button>
    );

    await userEvent.click(screen.getByRole("button", { name: "Order Now" }));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it.each([
    ["primary", "bg-brand-primary"],
    ["secondary", "border-brand-primary"],
    ["ghost", "bg-transparent"],
    ["inverse", "bg-surface-inverse"],
  ] as const)("renders the %s variant", (variant, expected) => {
    render(<Button variant={variant}>Order Now</Button>);
    expect(screen.getByRole("button")).toHaveClass(expected);
  });

  it.each([
    ["sm", "h-(--button-h-sm)"],
    ["md", "h-(--button-h-md)"],
    ["lg", "h-(--button-h-lg)"],
  ] as const)("renders the %s size at its fixed height", (size, expected) => {
    render(<Button size={size}>Order Now</Button>);
    expect(screen.getByRole("button")).toHaveClass(expected);
  });

  it("flips primary to a white pill when it sits on a brand panel", () => {
    render(
      <Button on="brand" variant="primary">
        Order Now
      </Button>
    );
    const node = screen.getByRole("button");
    expect(node).toHaveClass("bg-surface-card");
    expect(node).not.toHaveClass("bg-brand-primary");
  });

  it("renders a leading and a trailing glyph", () => {
    const { container } = render(
      <Button icon={ShoppingBag} iconAfter={ArrowRight}>
        Order Now
      </Button>
    );
    expect(container.querySelectorAll("svg")).toHaveLength(2);
  });

  it("disables itself while loading and keeps the label in place", () => {
    render(
      <Button icon={ShoppingBag} isLoading>
        Order Now
      </Button>
    );
    const node = screen.getByRole("button", { name: "Order Now" });
    expect(node).toBeDisabled();
    expect(node.querySelector(".animate-pp-pulse")).toBeInTheDocument();
  });

  it("keeps a real grey fill when disabled rather than fading out", () => {
    render(<Button disabled>Order Now</Button>);
    const node = screen.getByRole("button");
    expect(node).toHaveClass("disabled:bg-(--button-bg-disabled)");
    expect(node.className).not.toMatch(/opacity-/);
  });

  it("merges a caller className", () => {
    render(<Button className="rounded-1">Order Now</Button>);
    const node = screen.getByRole("button");
    expect(node).toHaveClass("rounded-1");
    expect(node).not.toHaveClass("rounded-6");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <Button icon={ShoppingBag}>Order Now</Button>
        <Button variant="secondary">See Full Menu</Button>
        <Button disabled>Sold Out</Button>
      </>
    );
    await expectNoA11yViolations(container);
  });
});
