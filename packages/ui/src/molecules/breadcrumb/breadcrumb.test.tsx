import { render, screen, within } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Breadcrumb, type BreadcrumbItem } from "./breadcrumb";

const TRAIL: BreadcrumbItem[] = [
  { label: "Home", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "Small Plates" },
];

describe("Breadcrumb", () => {
  it("renders a named landmark holding an ordered list", () => {
    render(<Breadcrumb items={TRAIL} />);

    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(within(nav).getByRole("list")).toBeInTheDocument();
    expect(within(nav).getAllByRole("listitem")).toHaveLength(3);
  });

  it("links every crumb except the current page", () => {
    render(<Breadcrumb items={TRAIL} />);

    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Menu" })).toHaveAttribute("href", "/menu");
    expect(screen.queryByRole("link", { name: "Small Plates" })).not.toBeInTheDocument();
  });

  it("marks the last crumb as the current page", () => {
    render(<Breadcrumb items={TRAIL} />);

    expect(screen.getByText("Small Plates")).toHaveAttribute("aria-current", "page");
  });

  it("keeps the last crumb as text even when it carries an href", () => {
    render(
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Outlets", href: "/o" },
        ]}
      />
    );

    expect(screen.queryByRole("link", { name: "Outlets" })).not.toBeInTheDocument();
    expect(screen.getByText("Outlets")).toHaveAttribute("aria-current", "page");
  });

  it("renders a crumb without an href as plain text mid-trail", () => {
    render(
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "Company" }, { label: "Press" }]}
      />
    );

    expect(screen.queryByRole("link", { name: "Company" })).not.toBeInTheDocument();
    expect(screen.getByText("Company")).not.toHaveAttribute("aria-current");
  });

  it("draws a separator between crumbs but not after the last", () => {
    const { container } = render(<Breadcrumb items={TRAIL} />);

    expect(container.querySelectorAll("svg")).toHaveLength(2);
  });

  it("flips to the on-brand colourway", () => {
    render(<Breadcrumb items={TRAIL} tone="inverse" />);

    expect(screen.getByText("Small Plates")).toHaveClass("text-text-on-brand");
  });

  it("takes a different accessible name", () => {
    render(<Breadcrumb items={TRAIL} label="Menu trail" />);

    expect(screen.getByRole("navigation", { name: "Menu trail" })).toBeInTheDocument();
  });

  it("merges a caller className", () => {
    render(<Breadcrumb className="max-w-96" items={TRAIL} />);

    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(nav).toHaveClass("max-w-96");
    expect(nav).toHaveClass("w-full");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Breadcrumb items={TRAIL} />);
    await expectNoA11yViolations(container);
  });
});
