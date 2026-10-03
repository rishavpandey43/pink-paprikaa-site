import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ArrowRight, ShoppingBag } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Button } from "./button";

describe("Button", () => {
  it("is a native button of type button, named by its label", () => {
    render(<Button>Order Now</Button>);
    expect(screen.getByRole("button", { name: "Order Now" })).toHaveAttribute("type", "button");
  });

  it("keeps a submit type when asked", () => {
    render(<Button type="submit">Pay ₹1,240</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("fires from the pointer and from Enter and Space", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Order Now</Button>);
    await user.click(screen.getByRole("button", { name: "Order Now" }));
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it.each([
    ["primary", "bg-button-primary-bg", "text-button-primary-fg"],
    ["secondary", "bg-button-secondary-bg", "text-text-link"],
    ["ghost", "bg-transparent", "text-text-link"],
    ["inverse", "bg-ink-900", "text-ink-000"],
  ] as const)("paints the %s variant with %s and %s", (variant, fill, text) => {
    render(<Button variant={variant}>Order</Button>);
    expect(screen.getByRole("button")).toHaveClass(fill, text);
  });

  it("paints every skin that must flip on a pink or ink field with a surface-following token", () => {
    render(
      <>
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
      </>
    );
    expect(screen.getByRole("button", { name: "Primary" })).toHaveClass(
      "shadow-button-primary",
      "hover:bg-button-primary-bg-hover",
      "active:bg-button-primary-bg-active"
    );
    expect(screen.getByRole("button", { name: "Secondary" })).toHaveClass(
      "border-2",
      "border-button-secondary-border",
      "hover:bg-button-hover-tint"
    );
    expect(screen.getByRole("button", { name: "Ghost" })).toHaveClass("hover:bg-button-hover-tint");
  });

  it("keeps inverse solid ink on every surface (spec C9)", () => {
    render(<Button variant="inverse">Book</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-ink-900", "text-ink-000", "shadow-2");
    expect(button.className).not.toMatch(/(bg|shadow|border)-button-/);
  });

  it.each([
    ["sm", "h-button-h-sm", "min-w-button-h-sm", "px-3.5", "text-button-sm"],
    ["md", "h-button-h-md", "min-w-button-h-md", "px-5", "text-button-md"],
    ["lg", "h-button-h-lg", "min-w-button-h-lg", "px-7", "text-button-lg"],
  ] as const)("sizes %s with %s, %s, %s and %s", (size, height, minWidth, padding, label) => {
    render(<Button size={size}>Order</Button>);
    expect(screen.getByRole("button")).toHaveClass(
      height,
      minWidth,
      padding,
      label,
      "font-display"
    );
  });

  it.each([
    ["sm", "size-icon-sm"],
    ["md", "size-icon-md"],
    ["lg", "size-icon-md"],
  ] as const)("draws %s glyphs at %s, leading and trailing the label", (size, glyph) => {
    render(
      <Button size={size} icon={ShoppingBag} iconAfter={ArrowRight}>
        Order
      </Button>
    );
    const [leading, label, trailing] = [...screen.getByRole("button").children];
    expect(leading).toHaveClass(glyph);
    expect(label).toHaveTextContent("Order");
    expect(trailing).toHaveClass(glyph);
  });

  it("keeps its glyphs decorative, so the label alone names it", () => {
    render(
      <Button icon={ShoppingBag} iconAfter={ArrowRight}>
        Order Now
      </Button>
    );
    const button = screen.getByRole("button", { name: "Order Now" });
    for (const glyph of button.querySelectorAll("svg")) {
      expect(glyph).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("while loading, swaps the leading glyph for a spinning loader, reports busy and blocks presses", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button icon={ShoppingBag} isLoading onClick={onClick}>
        Placing order
      </Button>
    );
    const button = screen.getByRole("button", { name: "Placing order" });
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toBeDisabled();
    expect(button.querySelector(".lucide-loader-circle")).not.toBeNull();
    expect(button.querySelector(".lucide-shopping-bag")).toBeNull();
    expect(button.firstElementChild).toHaveClass("animate-rotate");
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it.each([
    ["sm", "size-icon-md"],
    ["md", "size-icon-md"],
    ["lg", "size-icon-lg"],
  ] as const)("sizes the %s loader at %s", (size, glyph) => {
    render(
      <Button size={size} isLoading>
        Checking code
      </Button>
    );
    expect(screen.getByRole("button").firstElementChild).toHaveClass(glyph);
  });

  it("uses a real grey fill when disabled, never an opacity fade", () => {
    render(<Button disabled>Sold Out</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveClass(
      "disabled:bg-ink-200",
      "disabled:text-ink-400",
      "disabled:shadow-none",
      "disabled:cursor-not-allowed"
    );
    expect(button.className).not.toMatch(/opacity/);
  });

  it("does not fire while disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Sold Out
      </Button>
    );
    await user.click(screen.getByRole("button", { name: "Sold Out" }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("presses with the brand scale and the control transition", () => {
    render(<Button>Order</Button>);
    expect(screen.getByRole("button")).toHaveClass("active:press-scale", "transition-control");
  });

  it("fills its container when isFullWidth", () => {
    render(<Button isFullWidth>Pay ₹1,240</Button>);
    expect(screen.getByRole("button")).toHaveClass("flex", "w-full");
    expect(screen.getByRole("button")).not.toHaveClass("inline-flex");
  });

  it("never wraps or overflows its container — a long label truncates inside the pill (Review Focus 1)", () => {
    const label = "Order the full Sunday thali for the whole family";
    render(<Button icon={ShoppingBag}>{label}</Button>);
    const button = screen.getByRole("button", { name: label });
    expect(button).toHaveClass("whitespace-nowrap", "max-w-full", "shrink-0");
    expect(screen.getByText(label)).toHaveClass("min-w-0", "truncate");
    expect(button.firstElementChild).toHaveClass("shrink-0");
  });

  describe("asChild (Review Focus 3)", () => {
    it("renders the child anchor with Button styling, glyphs and label — and no button-only attributes", () => {
      render(
        <Button asChild variant="secondary" icon={ShoppingBag} className="mt-2">
          <a href="https://wa.me/919090704001">Order on WhatsApp</a>
        </Button>
      );
      const link = screen.getByRole("link", { name: "Order on WhatsApp" });
      expect(link).toHaveAttribute("href", "https://wa.me/919090704001");
      expect(link).not.toHaveAttribute("type");
      expect(link).not.toHaveAttribute("disabled");
      expect(link).toHaveClass("bg-button-secondary-bg", "mt-2");
      expect(link.querySelector(".lucide-shopping-bag")).not.toBeNull();
      expect(screen.getByText("Order on WhatsApp")).toHaveClass("truncate");
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("marks a loading link busy and disabled for assistive tech, and stops the pointer", () => {
      render(
        <Button asChild isLoading>
          <a href="/order">Placing order</a>
        </Button>
      );
      const link = screen.getByRole("link", { name: "Placing order" });
      expect(link).toHaveAttribute("aria-busy", "true");
      expect(link).toHaveAttribute("aria-disabled", "true");
      expect(link).toHaveClass("aria-disabled:pointer-events-none");
    });
  });

  it("lets a consumer className override its own", () => {
    render(<Button className="px-9">Order</Button>);
    expect(screen.getByRole("button")).toHaveClass("px-9");
    expect(screen.getByRole("button")).not.toHaveClass("px-5");
  });

  it("sx lands on the button and replaces its own padding rather than stacking", () => {
    render(<Button sx={{ px: 8, mt: 4 }}>Order now</Button>);
    const button = screen.getByRole("button", { name: "Order now" });
    expect(button).toHaveClass("px-8", "mt-4");
    expect(button).not.toHaveClass("px-5");
  });

  it("sx lands on an asChild link", () => {
    render(
      <Button asChild sx={{ w: "full" }}>
        <a href="/menu">Menu</a>
      </Button>
    );
    expect(screen.getByRole("link", { name: "Menu" })).toHaveClass("w-full");
  });

  it("does not leak sx onto the DOM", () => {
    render(<Button sx={{ mt: 4 }}>Order now</Button>);
    expect(screen.getByRole("button")).not.toHaveAttribute("sx");
  });

  it("has no accessibility violations in its default, loading, disabled and link forms", async () => {
    const { container } = render(
      <>
        <Button icon={ShoppingBag}>Order Now</Button>
        <Button isLoading>Placing order</Button>
        <Button disabled>Sold Out</Button>
        <Button asChild iconAfter={ArrowRight}>
          <a href="/menu">Full Menu</a>
        </Button>
      </>
    );
    await expectNoA11yViolations(container);
  });
});
