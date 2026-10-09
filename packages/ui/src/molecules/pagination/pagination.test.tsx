import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import type { LinkAsProps } from "../../lib/link-as";
import { PageButton, Pagination } from "./pagination";

const hrefFor = (page: number) => `/press?page=${String(page)}`;

function pageNames(): string[] {
  return within(screen.getByRole("navigation"))
    .getAllByRole("link")
    .map((link) => link.textContent);
}

function RouterLink({ href, className, children, "aria-current": ariaCurrent }: LinkAsProps) {
  return (
    <a href={href} className={className} aria-current={ariaCurrent} data-router="">
      {children}
    </a>
  );
}

describe("Pagination", () => {
  it("is a navigation landmark named Pagination, holding an ordered list", () => {
    const { container } = render(<Pagination page={4} pages={12} getPageHref={hrefFor} />);
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
    expect(container.querySelector("nav > ol")).toBeInTheDocument();
  });

  it("merges a caller className and keeps its own", () => {
    render(<Pagination page={1} pages={3} getPageHref={hrefFor} className="max-w-96" />);
    expect(screen.getByRole("navigation", { name: "Pagination" })).toHaveClass(
      "max-w-96",
      "min-w-0"
    );
  });

  it("shows the first, the last and one either side of the current page, with gaps between", () => {
    const { container } = render(<Pagination page={4} pages={12} getPageHref={hrefFor} />);
    expect(pageNames()).toEqual([
      "Previous page",
      "Page 1",
      "Page 3",
      "Page 4",
      "Page 5",
      "Page 12",
      "Next page",
    ]);
    expect(container.querySelectorAll("li[aria-hidden='true']")).toHaveLength(2);
  });

  it("links each page by the href it is given and marks the current one", () => {
    render(<Pagination page={4} pages={12} getPageHref={hrefFor} />);
    expect(screen.getByRole("link", { name: "Page 5" })).toHaveAttribute("href", "/press?page=5");
    const current = screen.getByRole("link", { name: "Page 4" });
    expect(current).toHaveAttribute("aria-current", "page");
    expect(current).toHaveClass("bg-surface-brand");
    expect(screen.getByRole("link", { name: "Previous page" })).toHaveAttribute(
      "href",
      "/press?page=3"
    );
    expect(screen.getByRole("link", { name: "Next page" })).toHaveAttribute(
      "href",
      "/press?page=5"
    );
  });

  it("has no previous link on the first page and no next link on the last", () => {
    const { rerender } = render(<Pagination page={1} pages={5} getPageHref={hrefFor} />);
    expect(screen.queryByRole("link", { name: "Previous page" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Next page" })).toBeInTheDocument();
    rerender(<Pagination page={5} pages={5} getPageHref={hrefFor} />);
    expect(screen.queryByRole("link", { name: "Next page" })).not.toBeInTheDocument();
  });

  it("shows every page when there are three", () => {
    render(<Pagination page={2} pages={3} getPageHref={hrefFor} />);
    expect(pageNames()).toEqual(["Previous page", "Page 1", "Page 2", "Page 3", "Next page"]);
  });

  it("keeps an out-of-range page inside the list", () => {
    render(<Pagination page={40} pages={12} getPageHref={hrefFor} />);
    expect(screen.getByRole("link", { name: "Page 12" })).toHaveAttribute("aria-current", "page");
  });

  it("renders nothing for a single page", () => {
    const { container } = render(<Pagination page={1} pages={1} getPageHref={hrefFor} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders page links through linkAs", () => {
    const { container } = render(
      <Pagination page={2} pages={3} getPageHref={hrefFor} linkAs={RouterLink} />
    );
    expect(container.querySelectorAll("a[data-router]")).toHaveLength(5);
    expect(screen.getByRole("link", { name: "Page 2" })).toHaveAttribute("aria-current", "page");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Pagination page={4} pages={12} getPageHref={hrefFor} />);
    await expectNoA11yViolations(container);
  });

  it("takes sx on its root, merged with className", () => {
    const { container } = render(
      <Pagination
        page={1}
        pages={3}
        getPageHref={(page) => `/menu/${String(page)}`}
        sx={{ mt: 4 }}
        className="italic"
      />
    );
    expect(container.firstElementChild).toHaveClass("mt-4", "italic");
  });

  it("supports client paging via onPageChange", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination page={2} pages={5} onPageChange={onPageChange} />);
    await user.click(screen.getByRole("button", { name: "Page 3" }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("exports PageButton with idle, current and inert states", () => {
    const { rerender } = render(<PageButton state="idle">2</PageButton>);
    expect(screen.getByRole("button", { name: "2" })).toHaveClass("hover:border-pink-300");
    rerender(
      <PageButton state="current" disabled>
        2
      </PageButton>
    );
    expect(screen.getByRole("button", { name: "2" })).toHaveClass("bg-surface-brand");
  });
});
