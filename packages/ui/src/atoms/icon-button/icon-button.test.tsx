import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Heart, ShoppingBag } from "lucide-react";
import type { ComponentProps } from "react";

import { expectNoA11yViolations } from "#vitest.setup";

import { IconButton } from "./icon-button";

function RouterLink({ children, ...props }: ComponentProps<"a">) {
  return (
    <a data-router="" {...props}>
      {children}
    </a>
  );
}

describe("IconButton", () => {
  it("is a button of type button named by its label; the glyph is decorative", () => {
    render(<IconButton icon={Heart} label="Save" />);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toHaveAttribute("type", "button");
    expect(button.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("cannot be written without a name (Review Focus 2)", () => {
    // @ts-expect-error — an icon-only control without `label` must not compile (spec §5.5)
    render(<IconButton icon={Heart} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("reads the cart count out with its label and draws the bubble (Review Focus 2)", () => {
    render(<IconButton icon={ShoppingBag} label="Your order" count={3} />);
    const button = screen.getByRole("button", { name: "Your order (3)" });
    const bubble = within(button).getByText("3");
    expect(bubble).toHaveAttribute("aria-hidden", "true");
    expect(bubble).toHaveClass(
      "absolute",
      "h-icon-button-count",
      "min-w-icon-button-count",
      "text-icon-button-count"
    );
  });

  it.each([0, undefined])("draws no bubble for a count of %s", (count) => {
    render(
      <IconButton
        icon={ShoppingBag}
        label="Your order"
        {...(count === undefined ? {} : { count })}
      />
    );
    const button = screen.getByRole("button", { name: "Your order" });
    expect(button.querySelector(".absolute")).toBeNull();
  });

  it.each([
    ["ghost", "bg-transparent", "text-icon-button-ghost-fg"],
    ["primary", "bg-button-primary-bg", "text-button-primary-fg"],
    ["secondary", "bg-ink-000", "text-pink-600"],
    ["glass", "bg-surface-glass", "backdrop-blur-glass"],
  ] as const)("paints the %s variant with %s and %s", (variant, fill, detail) => {
    render(<IconButton icon={Heart} label="Save" variant={variant} />);
    expect(screen.getByRole("button")).toHaveClass(fill, detail);
  });

  it("is ghost by default and tints on hover with state-hover + pink glyph", () => {
    render(<IconButton icon={Heart} label="Save" />);
    expect(screen.getByRole("button")).toHaveClass(
      "bg-transparent",
      "hover:bg-state-hover",
      "hover:text-pink-600",
      "active:press-scale-icon"
    );
  });

  it("adds tint (inherit parent colour) and xs for Alert dismiss", () => {
    render(<IconButton icon={Heart} label="Dismiss" variant="tint" size="xs" />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass(
      "text-current",
      "hover:bg-state-hover-tint",
      "active:bg-state-press-tint",
      "size-icon-button-xs",
      "before:-inset-2"
    );
    expect(button.firstElementChild).toHaveClass("size-icon-sm");
  });

  it("paints secondary hover border and press fill from the state tokens", () => {
    render(<IconButton icon={Heart} label="More" variant="secondary" />);
    expect(screen.getByRole("button")).toHaveClass(
      "hover:border-pink-300",
      "hover:bg-state-hover",
      "active:bg-state-press"
    );
  });

  it("paints glass hover white and press pink-50", () => {
    render(<IconButton icon={Heart} label="Close" variant="glass" />);
    expect(screen.getByRole("button")).toHaveClass("hover:bg-ink-000", "active:bg-pink-50");
  });

  it.each([
    ["xs", "size-icon-button-xs", "size-icon-sm", "before:-inset-2"],
    ["sm", "size-icon-button-sm", "size-icon-sm", "before:-inset-1.5"],
    ["md", "size-icon-button-md", "size-icon-md", "before:-inset-0.5"],
  ] as const)(
    "draws %s at %s with a %s glyph and pads the hit area to 44px (%s)",
    (size, box, glyph, hitArea) => {
      render(<IconButton icon={Heart} label="Save" size={size} />);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("relative", box, "before:absolute", hitArea);
      expect(button.firstElementChild).toHaveClass(glyph);
    }
  );

  it("draws lg at 48px with a 24px glyph and needs no hit-area pad", () => {
    render(<IconButton icon={Heart} label="Save" size="lg" />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("size-icon-button-lg");
    expect(button.className).not.toMatch(/before:/);
    expect(button.firstElementChild).toHaveClass("size-icon-lg");
  });

  it("keeps primary disabled fill; secondary/ghost stay clear", () => {
    render(
      <>
        <IconButton icon={Heart} label="Primary" variant="primary" disabled />
        <IconButton icon={Heart} label="Secondary" variant="secondary" disabled />
        <IconButton icon={Heart} label="Ghost" variant="ghost" disabled />
      </>
    );
    expect(screen.getByRole("button", { name: "Primary" })).toHaveClass("disabled:bg-ink-200");
    expect(screen.getByRole("button", { name: "Secondary" })).toHaveClass(
      "disabled:bg-transparent",
      "disabled:border-ink-200"
    );
    expect(screen.getByRole("button", { name: "Ghost" }).className).not.toMatch(
      /disabled:bg-ink-200/
    );
  });

  it("fires from the pointer and the keyboard", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<IconButton icon={Heart} label="Save" onClick={onClick} />);
    await user.click(screen.getByRole("button"));
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("uses the grey disabled fill and blocks presses", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<IconButton icon={Heart} label="Save" variant="primary" disabled onClick={onClick} />);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveClass("disabled:bg-ink-200", "disabled:text-ink-400");
    expect(button.className).not.toMatch(/opacity/);
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders a router link through asChild with the glyph and the name, never a button type (Review Focus 3)", () => {
    render(
      <IconButton asChild icon={ShoppingBag} label="Your order" count={2}>
        <RouterLink href="/cart" />
      </IconButton>
    );
    const link = screen.getByRole("link", { name: "Your order (2)" });
    expect(link).toHaveAttribute("href", "/cart");
    expect(link).toHaveAttribute("data-router");
    expect(link).not.toHaveAttribute("type");
    expect(link.querySelector(".lucide-shopping-bag")).not.toBeNull();
  });

  it("lets a consumer className replace its radius", () => {
    render(<IconButton icon={Heart} label="Save" className="rounded-md" />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("rounded-md");
    expect(button).not.toHaveClass("rounded-pill");
  });

  it("sx lands on the button and beats its own position", () => {
    render(<IconButton icon={Heart} label="Save" sx={{ position: "absolute", mt: 2 }} />);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toHaveClass("absolute", "mt-2");
    expect(button).not.toHaveClass("relative");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <IconButton icon={Heart} label="Save" />
        <IconButton icon={ShoppingBag} label="Your order" count={3} variant="primary" />
        <IconButton icon={Heart} label="Save" disabled />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
