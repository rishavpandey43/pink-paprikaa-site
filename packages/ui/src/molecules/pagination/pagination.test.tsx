import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Pagination } from "./pagination";

const getPageHref = (page: number) => `/press?page=${String(page)}`;

describe("Pagination", () => {
  it("renders a named landmark holding an ordered list", () => {
    render(<Pagination getPageHref={getPageHref} page={2} pages={3} />);

    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
    expect(screen.getByRole("list")).toBeInTheDocument();
  });

  it("renders every page as a real link with its own href", () => {
    render(<Pagination getPageHref={getPageHref} page={2} pages={3} />);

    expect(screen.getByRole("link", { name: "Page 1" })).toHaveAttribute("href", "/press?page=1");
    expect(screen.getByRole("link", { name: "Page 3" })).toHaveAttribute("href", "/press?page=3");
  });

  it("floods the current page and marks it for assistive tech", () => {
    render(<Pagination getPageHref={getPageHref} page={2} pages={3} />);

    const current = screen.getByRole("link", { name: "Page 2" });
    expect(current).toHaveAttribute("aria-current", "page");
    expect(current).toHaveClass("bg-brand-primary");
  });

  it("collapses the pages past one either side of the current one", () => {
    render(<Pagination getPageHref={getPageHref} page={6} pages={12} />);

    expect(screen.getByRole("link", { name: "Page 1" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Page 5" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Page 7" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Page 12" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Page 3" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Page 9" })).not.toBeInTheDocument();
  });

  it("offers no previous link on the first page and no next link on the last", () => {
    const { rerender } = render(<Pagination getPageHref={getPageHref} page={1} pages={5} />);
    expect(screen.queryByRole("link", { name: "Previous page" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Next page" })).toHaveAttribute(
      "href",
      "/press?page=2"
    );

    rerender(<Pagination getPageHref={getPageHref} page={5} pages={5} />);
    expect(screen.queryByRole("link", { name: "Next page" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Previous page" })).toHaveAttribute(
      "href",
      "/press?page=4"
    );
  });

  it("reports the page a guest asked for", async () => {
    const handlePageChange = vi.fn();
    render(
      <Pagination getPageHref={getPageHref} onPageChange={handlePageChange} page={2} pages={5} />
    );

    await userEvent.click(screen.getByRole("link", { name: "Page 3" }));

    expect(handlePageChange).toHaveBeenCalledOnce();
    expect(handlePageChange.mock.calls[0]?.[0]).toBe(3);
  });

  it("reaches the next page from the keyboard", async () => {
    const handlePageChange = vi.fn();
    render(
      <Pagination getPageHref={getPageHref} onPageChange={handlePageChange} page={1} pages={3} />
    );

    screen.getByRole("link", { name: "Next page" }).focus();
    await userEvent.keyboard("{Enter}");

    expect(handlePageChange.mock.calls[0]?.[0]).toBe(2);
  });

  it("keeps a single page pager inert at both ends", () => {
    render(<Pagination getPageHref={getPageHref} page={1} pages={1} />);

    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Page 1" })).toHaveAttribute("aria-current", "page");
  });

  it("clamps a page number outside the range", () => {
    render(<Pagination getPageHref={getPageHref} page={99} pages={4} />);

    expect(screen.getByRole("link", { name: "Page 4" })).toHaveAttribute("aria-current", "page");
  });

  it("merges a caller className", () => {
    render(<Pagination className="max-w-96" getPageHref={getPageHref} page={1} pages={3} />);

    const nav = screen.getByRole("navigation", { name: "Pagination" });
    expect(nav).toHaveClass("max-w-96");
    expect(nav).toHaveClass("w-full");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Pagination getPageHref={getPageHref} page={4} pages={12} />);
    await expectNoA11yViolations(container);
  });
});
