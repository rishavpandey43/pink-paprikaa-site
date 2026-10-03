import { render, screen, within } from "@testing-library/react";
import { Phone } from "lucide-react";

import type { LinkAsProps } from "../../lib/link-as";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { type FooterColumn, SiteFooter } from "./site-footer";

const COLUMNS: FooterColumn[] = [
  {
    heading: "Eat with us",
    items: [
      { label: "Homely Meals", href: "#homely-meals" },
      { label: "Catering & Bulk Orders", href: "#catering" },
    ],
  },
  {
    heading: "Talk to us",
    items: [{ label: "Call +91 90907 04001", href: "tel:+919090704001", icon: Phone }],
  },
  { heading: "Kitchen & restaurant", items: [{ label: "8am – 11:30pm, every day" }] },
];

function RouterLink({ href, className, children }: LinkAsProps) {
  return (
    <a href={href} className={className} data-router-link="">
      {children}
    </a>
  );
}

describe("SiteFooter", () => {
  it("is the page's contentinfo landmark with one labelled nav per link column", () => {
    render(<SiteFooter columns={COLUMNS} />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    const eat = screen.getByRole("navigation", { name: "Eat with us" });
    expect(within(eat).getByRole("heading", { level: 2, name: "Eat with us" })).toBeInTheDocument();
    expect(within(eat).getAllByRole("listitem")).toHaveLength(2);
    expect(within(eat).getByRole("link", { name: "Homely Meals" })).toHaveAttribute(
      "href",
      "#homely-meals"
    );
  });

  it("keeps a column with no links out of the navigation landmarks", () => {
    render(<SiteFooter columns={COLUMNS} />);
    expect(
      screen.queryByRole("navigation", { name: "Kitchen & restaurant" })
    ).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Kitchen & restaurant" })).toBeInTheDocument();
    expect(screen.getByText("8am – 11:30pm, every day").closest("a")).toBeNull();
  });

  it("skips a column with no items, heading and all", () => {
    render(<SiteFooter columns={[...COLUMNS, { heading: "Coming soon", items: [] }]} />);
    expect(screen.queryByRole("heading", { name: "Coming soon" })).not.toBeInTheDocument();
    expect(screen.getByRole("contentinfo").firstElementChild?.children).toHaveLength(
      COLUMNS.length
    );
  });

  it("renders exactly what it is given — no licence, tax, contact or social defaults", () => {
    const { container } = render(
      <SiteFooter
        columns={[{ heading: "Eat with us", items: [{ label: "Homely Meals", href: "#homely" }] }]}
      />
    );
    expect(container.textContent).toBe("Eat with usHomely Meals");
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(container.textContent).not.toMatch(/FSSAI|GSTIN|©|\+91|pinkpaprikaa\.com/);
  });

  it("renders no brand block and no legal bar for empty brand and legal slots", () => {
    render(<SiteFooter columns={COLUMNS} brand="" legal="" />);
    const footer = screen.getByRole("contentinfo");
    // The grid holds only the three columns; the footer holds only the grid.
    expect(footer.children).toHaveLength(1);
    expect(footer.firstElementChild?.children).toHaveLength(COLUMNS.length);
  });

  it("gives every list outside a nav explicit list semantics", () => {
    render(
      <SiteFooter
        columns={COLUMNS}
        social={[
          { network: "instagram", href: "https://instagram.com/pinkpaprikaa", label: "Instagram" },
        ]}
        policies={[{ label: "Privacy Policy", href: "#privacy" }]}
      />
    );
    const listOf = (element: HTMLElement) => element.closest("ul");
    expect(
      listOf(screen.getByRole("link", { name: "Instagram (Opens in a new tab)" }))
    ).toHaveAttribute("role", "list");
    expect(listOf(screen.getByRole("link", { name: "Privacy Policy" }))).toHaveAttribute(
      "role",
      "list"
    );
    expect(listOf(screen.getByText("8am – 11:30pm, every day"))).toHaveAttribute("role", "list");
    expect(listOf(screen.getByRole("link", { name: "Homely Meals" }))).not.toHaveAttribute("role");
  });

  it("names each social link and opens it in a new tab", () => {
    render(
      <SiteFooter
        columns={COLUMNS}
        social={[
          { network: "instagram", href: "https://instagram.com/pinkpaprikaa", label: "Instagram" },
          { network: "youtube", href: "https://youtube.com/@pinkpaprikaa", label: "YouTube" },
        ]}
      />
    );
    // The aria-label overrides the anchor's content, so the label itself announces the new tab (R111).
    const instagram = screen.getByRole("link", { name: "Instagram (Opens in a new tab)" });
    expect(instagram).toHaveAttribute("href", "https://instagram.com/pinkpaprikaa");
    expect(instagram).toHaveAttribute("target", "_blank");
    expect(instagram).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByRole("link", { name: "YouTube (Opens in a new tab)" })).toBeInTheDocument();
  });

  it("renders the brand block, legal lines and policy links it is given", () => {
    render(
      <SiteFooter
        columns={COLUMNS}
        brand={<p>100% Pure Veg Kitchen</p>}
        legal={<span>© 2026 Paprikaa Culinary Ventures Private Limited</span>}
        policies={[
          { label: "Privacy Policy", href: "#privacy" },
          { label: "Terms of Service", href: "#terms" },
        ]}
      />
    );
    expect(screen.getByText("100% Pure Veg Kitchen")).toBeInTheDocument();
    expect(
      screen.getByText("© 2026 Paprikaa Culinary Ventures Private Limited")
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute(
      "href",
      "#privacy"
    );
  });

  it("renders column and policy links through linkAs", () => {
    render(
      <SiteFooter
        columns={COLUMNS}
        policies={[{ label: "Privacy Policy", href: "#privacy" }]}
        linkAs={RouterLink}
      />
    );
    expect(screen.getByRole("link", { name: "Homely Meals" })).toHaveAttribute("data-router-link");
    expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute(
      "data-router-link"
    );
  });

  it.each([
    ["brand", "bg-surface-brand"],
    ["ink", "bg-surface-inverse"],
  ] as const)("sets the %s surface and paints its field", (surfaceName, background) => {
    render(<SiteFooter columns={COLUMNS} surface={surfaceName} />);
    expect(screen.getByRole("contentinfo")).toHaveAttribute("data-surface", surfaceName);
    expect(screen.getByRole("contentinfo")).toHaveClass(background);
  });

  it("merges a caller className over its own, and the diamond layer lets that ground show", () => {
    const { container } = render(
      <SiteFooter columns={COLUMNS} pattern="default" className="bg-surface-inverse" />
    );
    const layer = container.querySelector('footer > [aria-hidden="true"]');
    expect(screen.getByRole("contentinfo")).toHaveClass("bg-surface-inverse");
    expect(screen.getByRole("contentinfo")).not.toHaveClass("bg-surface-brand");
    expect(layer).toHaveClass("bg-transparent");
    expect(layer).not.toHaveClass("bg-surface-brand");
  });

  it("carries the faint diamond on ink by default and none on brand", () => {
    const { container, rerender } = render(<SiteFooter columns={COLUMNS} surface="ink" />);
    const layer = () => container.querySelector('footer > [aria-hidden="true"]');
    expect(layer()).toBeInTheDocument();
    rerender(<SiteFooter columns={COLUMNS} surface="brand" />);
    expect(layer()).not.toBeInTheDocument();
    rerender(<SiteFooter columns={COLUMNS} surface="brand" pattern="default" />);
    expect(layer()).toBeInTheDocument();
  });

  it("pads the bottom clear of an ActionDock only when asked", () => {
    const { rerender } = render(<SiteFooter columns={COLUMNS} />);
    expect(screen.getByRole("contentinfo")).toHaveClass("pb-10");
    rerender(<SiteFooter columns={COLUMNS} hasDockClearance />);
    expect(screen.getByRole("contentinfo")).toHaveClass("pb-site-footer-dock-clearance");
    expect(screen.getByRole("contentinfo")).not.toHaveClass("pb-10");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <SiteFooter
        surface="ink"
        columns={COLUMNS}
        brand={<p>100% Pure Veg Kitchen</p>}
        social={[
          { network: "instagram", href: "https://instagram.com/pinkpaprikaa", label: "Instagram" },
        ]}
        legal={<span>© 2026 Paprikaa Culinary Ventures Private Limited</span>}
        policies={[{ label: "Privacy Policy", href: "#privacy" }]}
      />
    );
    await expectNoA11yViolations(container);
  });

  it("takes sx on its root, merged with className", () => {
    const { container } = render(
      <SiteFooter columns={COLUMNS} sx={{ mt: 4 }} className="italic" />
    );
    expect(container.firstElementChild).toHaveClass("mt-4", "italic");
  });
});
