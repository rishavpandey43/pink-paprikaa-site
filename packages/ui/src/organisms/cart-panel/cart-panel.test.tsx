import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { CartPanel } from "./cart-panel";
import type { CartLine } from "./cart-totals";

const LINES: CartLine[] = [
  {
    id: "chilli-paneer",
    name: "Paprikaa Chilli Paneer",
    price: 280,
    quantity: 2,
    note: "Sharing - Hot",
  },
  { id: "cold-brew", name: "Masala Cold Brew", price: 220, quantity: 1, note: "Regular" },
  { id: "kulfi", name: "Gulkand Kulfi", price: 180, quantity: 1, note: "Regular" },
];

function stepper(name: string) {
  return screen.getByRole("group", { name });
}

function LiveCart({ initial }: { initial: CartLine[] }) {
  const [lines, setLines] = useState(initial);
  return (
    <CartPanel
      lines={lines}
      title="Your order"
      onQuantityChange={(id, quantity) => {
        setLines((current) =>
          quantity <= 0
            ? current.filter((line) => line.id !== id)
            : current.map((line) => (line.id === id ? { ...line, quantity } : line))
        );
      }}
    />
  );
}

describe("CartPanel", () => {
  it("is a region named by its title, with meta under it", () => {
    render(<CartPanel lines={LINES} title="Your order" meta="Pickup · Sector 57 · 12 min" />);
    expect(screen.getByRole("region", { name: "Your order" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Your order" })).toBeInTheDocument();
    expect(screen.getByText("Pickup · Sector 57 · 12 min")).toBeInTheDocument();
  });

  it("prints each line's note, unit price and Vegetarian mark", () => {
    render(<CartPanel lines={LINES} title="Your order" />);
    expect(screen.getByText("Sharing - Hot")).toBeInTheDocument();
    expect(screen.getByText("₹280")).toBeInTheDocument();
    expect(screen.getAllByRole("img", { name: "Vegetarian" })).toHaveLength(LINES.length);
  });

  it("reports the dish id and the next quantity from the stepper", async () => {
    const user = userEvent.setup();
    const onQuantityChange = vi.fn();
    render(
      <CartPanel
        lines={[{ id: "cold-brew", name: "Masala Cold Brew", price: 220, quantity: 1 }]}
        title="Your order"
        onQuantityChange={onQuantityChange}
      />
    );
    const group = stepper("Masala Cold Brew");
    await user.click(within(group).getByRole("button", { name: "Add one" }));
    expect(onQuantityChange).toHaveBeenCalledWith("cold-brew", 2);
    await user.click(within(group).getByRole("button", { name: "Remove one" }));
    expect(onQuantityChange).toHaveBeenCalledWith("cold-brew", 0);
  });

  it("moves focus to the next stepper after quantity 0 removes a line", async () => {
    const user = userEvent.setup();
    render(
      <LiveCart
        initial={[
          { id: "chilli-paneer", name: "Paprikaa Chilli Paneer", price: 280, quantity: 1 },
          { id: "cold-brew", name: "Masala Cold Brew", price: 220, quantity: 1 },
        ]}
      />
    );
    await user.click(
      within(stepper("Paprikaa Chilli Paneer")).getByRole("button", { name: "Remove one" })
    );
    expect(
      within(stepper("Masala Cold Brew")).getByRole("button", { name: "Remove one" })
    ).toHaveFocus();
  });

  it("moves focus to the cart heading after quantity 0 empties the cart", async () => {
    const user = userEvent.setup();
    render(
      <LiveCart
        initial={[{ id: "cold-brew", name: "Masala Cold Brew", price: 220, quantity: 1 }]}
      />
    );
    await user.click(
      within(stepper("Masala Cold Brew")).getByRole("button", { name: "Remove one" })
    );
    expect(screen.getByRole("heading", { name: "Nothing here yet." })).toHaveFocus();
  });

  it("prints GST (5%) as ₹48 and the total as ₹1,008", () => {
    render(<CartPanel lines={LINES} title="Your order" />);
    expect(screen.getByText("GST (5%)")).toBeInTheDocument();
    expect(screen.getByText("₹48")).toBeInTheDocument();
    expect(screen.getByText("₹1,008")).toBeInTheDocument();
  });

  it("honours gstRate and taxLabel", () => {
    render(
      <CartPanel
        lines={LINES}
        title="Your order"
        gstRate={0}
        taxLabel="Tax"
        subtotalLabel="Items"
        totalLabel="To pay"
      />
    );
    expect(screen.getByText("Items")).toBeInTheDocument();
    expect(screen.getByText("Tax (0%)")).toBeInTheDocument();
    expect(screen.getByText("To pay")).toBeInTheDocument();
    expect(screen.getByText("₹0")).toBeInTheDocument();
  });

  it("renders the note field and the pay bar", () => {
    render(
      <CartPanel
        lines={LINES}
        title="Your order"
        noteField={<input aria-label="Notes for the kitchen" />}
        placeAction={<button type="button">Pay ₹1,008</button>}
      />
    );
    expect(screen.getByRole("textbox", { name: "Notes for the kitchen" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pay ₹1,008" })).toBeInTheDocument();
  });

  it("shows the empty state and browse action, with no list and no pay bar", () => {
    render(
      <CartPanel
        lines={[]}
        emptyTitle="Nothing here yet."
        emptyBody="Let's fix that."
        browseAction={<a href="#menu">Browse the Menu</a>}
        placeAction={<button type="button">Pay ₹0</button>}
      />
    );
    expect(screen.getByRole("heading", { name: "Nothing here yet." })).toBeInTheDocument();
    expect(screen.getByText("Let's fix that.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Browse the Menu" })).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Pay ₹0" })).not.toBeInTheDocument();
  });

  it("falls back to Nothing here yet. for a blank emptyTitle, with no empty heading", () => {
    render(<CartPanel lines={[]} emptyTitle="" />);
    expect(screen.getByRole("heading", { name: "Nothing here yet." })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "" })).not.toBeInTheDocument();
  });

  it("truncates a long name and note", () => {
    render(
      <CartPanel
        lines={[
          {
            id: "long",
            name: "A very long dish name that must not wrap the row",
            price: 100,
            quantity: 1,
            note: "A very long note about spice and sharing that would overflow",
          },
        ]}
        title="Your order"
      />
    );
    expect(screen.getByText("A very long dish name that must not wrap the row")).toHaveClass(
      "truncate"
    );
    expect(
      screen.getByText("A very long note about spice and sharing that would overflow")
    ).toHaveClass("truncate");
  });

  it("merges a caller className", () => {
    const { container } = render(
      <CartPanel lines={LINES} title="Your order" className="bg-surface-page-alt" />
    );
    expect(container.firstElementChild).toHaveClass("bg-surface-page-alt");
  });

  it("renders no wrapper for an empty title, meta, note, noteField or placeAction", () => {
    const { container, rerender } = render(
      <CartPanel
        lines={LINES}
        title=""
        meta=""
        note=""
        noteField=""
        placeAction=""
        className="bg-surface-page-alt"
      />
    );
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    expect(container.querySelector("header")).toBeNull();
    expect(container.querySelector("[data-slot=note-field]")).toBeNull();
    expect(container.querySelector("[data-slot=pay-bar]")).toBeNull();
    rerender(<CartPanel lines={LINES} title="Your order" noteField={0} placeAction={0} note={0} />);
    expect(container.querySelector("[data-slot=note-field]")).not.toBeNull();
    expect(container.querySelector("[data-slot=pay-bar]")).not.toBeNull();
  });

  it("keeps list semantics on the lines", () => {
    render(<CartPanel lines={LINES} title="Your order" />);
    const list = screen.getByRole("list");
    expect(list).toHaveAttribute("role", "list");
    expect(within(list).getAllByRole("listitem")).toHaveLength(LINES.length);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <CartPanel
        lines={LINES}
        title="Your order"
        meta="Pickup · Sector 57 · 12 min"
        noteField={<input aria-label="Notes for the kitchen" />}
        placeAction={<button type="button">Pay ₹1,008</button>}
      />
    );
    await expectNoA11yViolations(container);
  });

  it("takes sx on its root, merged with className", () => {
    const { container } = render(
      <CartPanel lines={LINES} title="Your order" sx={{ mt: 4 }} className="italic" />
    );
    expect(container.firstElementChild).toHaveClass("mt-4", "italic");
  });
});
