import { render, screen, within } from "@testing-library/react";
import { AtSign } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { SiteFooter } from "./site-footer";

describe("SiteFooter", () => {
  it("renders a contentinfo landmark carrying the white lockup", () => {
    render(<SiteFooter />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Pink Paprikaa" })).toBeInTheDocument();
  });

  it("floods the band with the brand pink", () => {
    render(<SiteFooter />);
    expect(screen.getByRole("contentinfo")).toHaveClass("bg-surface-brand");
  });

  it("renders the default columns and their links", () => {
    render(<SiteFooter />);
    expect(screen.getByText("Eat")).toBeInTheDocument();
    expect(screen.getByText("Visit")).toBeInTheDocument();
    expect(screen.getByText("Company")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Full Menu" })).toHaveAttribute("href", "/menu");
    expect(screen.getByRole("link", { name: "Franchise" })).toHaveAttribute("href", "/franchise");
  });

  it("renders caller columns instead of the defaults", () => {
    render(
      <SiteFooter columns={[{ heading: "Eat", links: [{ label: "Thalis", href: "/thalis" }] }]} />
    );
    expect(screen.getByRole("link", { name: "Thalis" })).toBeInTheDocument();
    expect(screen.queryByText("Company")).not.toBeInTheDocument();
  });

  it("states the kitchen's claim once, plainly", () => {
    render(<SiteFooter />);
    expect(screen.getAllByText("100% vegetarian kitchen.")).toHaveLength(1);
  });

  it("prints the FSSAI licence line, which an Indian food business must display", () => {
    render(<SiteFooter />);
    expect(screen.getByText("FSSAI Lic. 11522334455667")).toBeInTheDocument();
  });

  it("prints the registered entity in the legal band", () => {
    render(<SiteFooter />);
    expect(screen.getByText(/Paprikaa Culinary Ventures Private Limited/)).toBeInTheDocument();
  });

  it("renders each social account as a named link that opens in a new tab", () => {
    render(
      <SiteFooter social={[{ label: "Instagram", href: "https://example.com/", icon: AtSign }]} />
    );
    const account = screen.getByRole("link", { name: "Instagram" });
    expect(account).toHaveAttribute("href", "https://example.com/");
    expect(account).toHaveAttribute("target", "_blank");
    expect(account).toHaveAttribute("rel", "noreferrer noopener");
  });

  it("keeps every social link above the 44px hit-target floor", () => {
    render(<SiteFooter />);
    expect(screen.getByRole("link", { name: "Instagram" })).toHaveClass("min-h-(--layout-hit-min)");
  });

  it("renders the policy links", () => {
    render(<SiteFooter />);
    const footer = screen.getByRole("contentinfo");
    expect(within(footer).getByRole("link", { name: "Privacy" })).toHaveAttribute(
      "href",
      "/privacy"
    );
    expect(within(footer).getByRole("link", { name: "Terms" })).toHaveAttribute("href", "/terms");
  });

  it("merges a caller className", () => {
    render(<SiteFooter className="bg-surface-inverse" />);
    const footer = screen.getByRole("contentinfo");
    expect(footer).toHaveClass("bg-surface-inverse");
    expect(footer).not.toHaveClass("bg-surface-brand");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<SiteFooter />);
    await expectNoA11yViolations(container);
  });
});
