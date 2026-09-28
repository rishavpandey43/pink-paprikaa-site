import { render, screen, within } from "@testing-library/react";

import type { LinkAsProps } from "../../lib/link-as";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Breadcrumb, type BreadcrumbItem } from "./breadcrumb";

const MENU_TRAIL: BreadcrumbItem[] = [
  { label: "Home", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "Small Plates" },
];

function RouterLink({ href, className, children }: LinkAsProps) {
  return (
    <a href={href} className={className} data-router="">
      {children}
    </a>
  );
}

describe("Breadcrumb", () => {
  it("is a named navigation landmark with an ordered trail", () => {
    render(<Breadcrumb items={MENU_TRAIL} />);
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(within(nav).getAllByRole("listitem")).toHaveLength(3);
  });

  it("links every crumb but the current page, which it marks", () => {
    render(<Breadcrumb items={MENU_TRAIL} />);
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Menu" })).toHaveAttribute("href", "/menu");
    expect(screen.queryByRole("link", { name: "Small Plates" })).not.toBeInTheDocument();
    expect(screen.getByText("Small Plates")).toHaveAttribute("aria-current", "page");
  });

  it("marks the last crumb current even when it has an href", () => {
    render(
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Outlets", href: "/outlets" },
        ]}
      />
    );
    expect(screen.queryByRole("link", { name: "Outlets" })).not.toBeInTheDocument();
    expect(screen.getByText("Outlets")).toHaveAttribute("aria-current", "page");
  });

  it("writes a middle crumb without an href as plain text, never a dead link", () => {
    render(
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "Company" }, { label: "Franchise" }]}
      />
    );
    expect(screen.queryByRole("link", { name: "Company" })).not.toBeInTheDocument();
    expect(screen.getByText("Company")).not.toHaveAttribute("aria-current");
  });

  it("separates crumbs with chevrons hidden from assistive tech", () => {
    const { container } = render(<Breadcrumb items={MENU_TRAIL} />);
    const chevrons = container.querySelectorAll("svg.lucide-chevron-right");
    expect(chevrons).toHaveLength(2);
    for (const chevron of chevrons) expect(chevron.closest("[aria-hidden='true']")).not.toBeNull();
  });

  it("renders links through linkAs, so an app can pass its router link", () => {
    const { container } = render(<Breadcrumb items={MENU_TRAIL} linkAs={RouterLink} />);
    expect(container.querySelectorAll("a[data-router]")).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Menu" })).toHaveClass("text-text-muted");
  });

  it("takes another name for its landmark", () => {
    render(<Breadcrumb items={MENU_TRAIL} aria-label="You are here" />);
    expect(screen.getByRole("navigation", { name: "You are here" })).toBeInTheDocument();
  });

  it("merges a caller className and keeps its own", () => {
    render(<Breadcrumb items={MENU_TRAIL} className="max-w-96" />);
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(nav).toHaveClass("max-w-96", "min-w-0");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Breadcrumb items={MENU_TRAIL} />);
    await expectNoA11yViolations(container);
  });
});
