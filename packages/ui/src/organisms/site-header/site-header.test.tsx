import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { SiteHeader } from "./site-header";

const LINKS = [
  { label: "Menu", href: "/menu" },
  { label: "Outlets", href: "/outlets" },
];

describe("SiteHeader", () => {
  it("renders a banner landmark carrying the brand lockup", () => {
    render(<SiteHeader />);
    const banner = screen.getByRole("banner");
    expect(banner).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Pink Paprikaa" })).toBeInTheDocument();
  });

  it("renders the rail links in a named navigation", () => {
    render(<SiteHeader links={LINKS} />);
    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(screen.getByRole("link", { name: "Menu" })).toHaveAttribute("href", "/menu");
    expect(nav).toContainElement(screen.getByRole("link", { name: "Outlets" }));
  });

  it("names the rail's landmark, so two mastheads on one page stay tellable apart", () => {
    render(<SiteHeader links={LINKS} navLabel="Main, cart with 12 items" />);
    expect(
      screen.getByRole("navigation", { name: "Main, cart with 12 items" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Main" })).not.toBeInTheDocument();
  });

  it("keeps its fixed 72px height", () => {
    render(<SiteHeader />);
    expect(screen.getByRole("banner")).toHaveClass("h-(--layout-header-h)");
  });

  it("calls onOrder and onBook from the two actions", async () => {
    const handleOrder = vi.fn();
    const handleBook = vi.fn();
    render(<SiteHeader onBook={handleBook} onOrder={handleOrder} />);

    await userEvent.click(screen.getByRole("button", { name: "Order Now" }));
    await userEvent.click(screen.getByRole("button", { name: "Book a Table" }));

    expect(handleOrder).toHaveBeenCalledOnce();
    expect(handleBook).toHaveBeenCalledOnce();
  });

  it("draws no search or cart button when neither handler is given", () => {
    render(<SiteHeader />);
    expect(screen.queryByRole("button", { name: /Search the Menu/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Your order/ })).not.toBeInTheDocument();
  });

  it("folds the cart count into the button's name and prints it on the glyph", async () => {
    const handleCart = vi.fn();
    render(<SiteHeader cartCount={2} onCart={handleCart} />);

    const cart = screen.getByRole("button", { name: "Your order, 2 items" });
    expect(screen.getByText("2")).toBeInTheDocument();

    await userEvent.click(cart);
    expect(handleCart).toHaveBeenCalledOnce();
  });

  it("hides the count entirely at zero", () => {
    render(<SiteHeader cartCount={0} onCart={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Your order" })).toBeInTheDocument();
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("goes translucent and gains its hairline once scrolled", () => {
    const { rerender } = render(<SiteHeader />);
    expect(screen.getByRole("banner")).toHaveClass("bg-surface-card");

    rerender(<SiteHeader isScrolled />);
    const banner = screen.getByRole("banner");
    expect(banner).toHaveClass("bg-surface-glass");
    expect(banner).toHaveClass("border-border-subtle");
  });

  it("opens the mobile sheet, lists every link and closes again", async () => {
    render(<SiteHeader links={LINKS} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Open Navigation" }));

    const sheet = screen.getByRole("dialog", { name: "Navigation" });
    const sheetNav = screen.getByRole("navigation", { name: "Site" });
    expect(sheet).toContainElement(sheetNav);
    expect(within(sheetNav).getAllByRole("link")).toHaveLength(LINKS.length);
    // While the sheet is open Radix hides the rest of the page, so the rail behind it is gone
    // from the accessibility tree rather than sitting there as a duplicate set of links.
    expect(screen.getAllByRole("link", { name: "Menu" })).toHaveLength(1);

    await userEvent.click(screen.getByRole("button", { name: "Close Navigation" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes the sheet when one of its links is followed", async () => {
    render(<SiteHeader links={LINKS} />);
    await userEvent.click(screen.getByRole("button", { name: "Open Navigation" }));

    const sheetNav = screen.getByRole("navigation", { name: "Site" });
    await userEvent.click(within(sheetNav).getByRole("link", { name: "Menu" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens the sheet from the keyboard", async () => {
    render(<SiteHeader links={LINKS} />);
    const trigger = screen.getByRole("button", { name: "Open Navigation" });
    trigger.focus();

    await userEvent.keyboard("{Enter}");

    expect(screen.getByRole("dialog", { name: "Navigation" })).toBeInTheDocument();
  });

  it("merges a caller className", () => {
    render(<SiteHeader className="border-transparent bg-surface-inverse" />);
    const banner = screen.getByRole("banner");
    expect(banner).toHaveClass("bg-surface-inverse");
    expect(banner).not.toHaveClass("bg-surface-card");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <SiteHeader cartCount={2} onBook={vi.fn()} onCart={vi.fn()} onSearch={vi.fn()} />
    );
    await expectNoA11yViolations(container);
  });
});
