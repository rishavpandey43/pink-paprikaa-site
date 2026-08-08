import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Button } from "../../atoms/button/button";
import { type CartLine, CartPanel } from "./cart-panel";

const LINES: CartLine[] = [
  { name: "Paprikaa Chilli Paneer", price: 280, quantity: 2, note: "Sharing · Hot" },
  { name: "Masala Cold Brew", price: 220, quantity: 1, note: "Regular" },
  { name: "Gulkand Kulfi", price: 180, quantity: 1, diet: "egg", note: "Regular" },
];

describe("CartPanel", () => {
  it("stays closed until the trigger is used", async () => {
    render(<CartPanel lines={LINES} trigger={<Button>Cart</Button>} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Cart" }));

    expect(screen.getByRole("dialog", { name: "Your order" })).toBeInTheDocument();
  });

  it("lists every line with its dish and options", () => {
    render(<CartPanel isDefaultOpen lines={LINES} />);

    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByText("Paprikaa Chilli Paneer")).toBeInTheDocument();
    expect(screen.getByText("Sharing · Hot")).toBeInTheDocument();
  });

  it("prices each line at its quantity", () => {
    render(<CartPanel isDefaultOpen lines={LINES} />);
    expect(screen.getByText("₹560")).toBeInTheDocument();
  });

  it("adds GST to the subtotal and pays the total", () => {
    render(<CartPanel isDefaultOpen lines={LINES} />);

    // 560 + 220 + 180 = 960, plus 5% GST (48) = 1,008.
    expect(screen.getByText("₹960")).toBeInTheDocument();
    expect(screen.getByText("GST (5%)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pay ₹1,008" })).toBeInTheDocument();
  });

  it("takes a different GST rate and says so", () => {
    render(<CartPanel gstRate={0.18} isDefaultOpen lines={LINES} />);
    expect(screen.getByText("GST (18%)")).toBeInTheDocument();
  });

  it("reports a new quantity for the line it belongs to", async () => {
    const handleQuantityChange = vi.fn();
    render(<CartPanel isDefaultOpen lines={LINES} onQuantityChange={handleQuantityChange} />);

    await userEvent.click(screen.getByRole("button", { name: "Add one Masala Cold Brew" }));

    expect(handleQuantityChange).toHaveBeenCalledWith("Masala Cold Brew", 2);
  });

  it("lets a line step down to zero, which is how it is removed", async () => {
    const handleQuantityChange = vi.fn();
    render(<CartPanel isDefaultOpen lines={LINES} onQuantityChange={handleQuantityChange} />);

    await userEvent.click(screen.getByRole("button", { name: "Remove one Masala Cold Brew" }));

    expect(handleQuantityChange).toHaveBeenCalledWith("Masala Cold Brew", 0);
  });

  it("places the order from the pay bar", async () => {
    const handlePlaceOrder = vi.fn();
    render(<CartPanel isDefaultOpen lines={LINES} onPlaceOrder={handlePlaceOrder} />);

    await userEvent.click(screen.getByRole("button", { name: "Pay ₹1,008" }));

    expect(handlePlaceOrder).toHaveBeenCalledOnce();
  });

  it("renders its own empty state instead of an empty list", async () => {
    const handleBrowse = vi.fn();
    render(<CartPanel isDefaultOpen onBrowse={handleBrowse} />);

    expect(screen.getByText("Nothing here yet.")).toBeInTheDocument();
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Pay/ })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Browse the Menu" }));

    expect(handleBrowse).toHaveBeenCalledOnce();
  });

  it("shows the fulfilment line under the title, and drops it when blank", () => {
    const { unmount } = render(<CartPanel isDefaultOpen lines={LINES} />);
    expect(screen.getByText("Pickup · Sector 57 · 12 min")).toBeInTheDocument();
    unmount();

    render(<CartPanel isDefaultOpen lines={LINES} meta="" />);
    expect(screen.queryByText("Pickup · Sector 57 · 12 min")).not.toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const handleOpenChange = vi.fn();
    render(<CartPanel isDefaultOpen lines={LINES} onOpenChange={handleOpenChange} />);

    await userEvent.keyboard("{Escape}");

    expect(handleOpenChange).toHaveBeenCalledWith(false);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes from the close glyph", async () => {
    render(<CartPanel isDefaultOpen lines={LINES} />);

    await userEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("anchors to a positioned ancestor rather than the viewport when asked", () => {
    render(<CartPanel isDefaultOpen lines={LINES} position="container" />);

    const node = screen.getByRole("dialog");
    expect(node).toHaveClass("absolute");
    expect(node).not.toHaveClass("fixed");
  });

  it("merges a caller className", () => {
    render(<CartPanel className="max-w-60" isDefaultOpen lines={LINES} />);

    const node = screen.getByRole("dialog");
    expect(node).toHaveClass("max-w-60");
    expect(node).not.toHaveClass("max-w-100");
  });

  it("has no accessibility violations", async () => {
    render(<CartPanel isDefaultOpen lines={LINES} />);
    await expectNoA11yViolations(document.body);
  });
});
