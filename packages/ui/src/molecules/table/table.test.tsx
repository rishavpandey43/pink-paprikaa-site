import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  type TableProps,
  TableRow,
} from "./table";

function PriceList(props: Partial<TableProps>) {
  return (
    <Table caption="Homely Meals price list" minWidth="md" {...props}>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Plate</TableHeaderCell>
          <TableHeaderCell>Trial</TableHeaderCell>
          <TableHeaderCell isHighlighted>Weekday plan</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableHeaderCell scope="row">Classic</TableHeaderCell>
          <TableCell>₹650</TableCell>
          <TableCell isHighlighted>
            <button type="button">₹3,120</button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

describe("Table", () => {
  it("is a semantic table named by its caption", () => {
    render(<PriceList />);
    expect(screen.getByRole("table", { name: "Homely Meals price list" })).toBeInTheDocument();
  });

  it("wraps a wide table in a named, focusable scroll region", () => {
    render(<PriceList />);
    const region = screen.getByRole("region", { name: "Homely Meals price list" });
    expect(region).toHaveAttribute("tabindex", "0");
    expect(region).toHaveClass("overflow-x-auto");
    expect(within(region).getByRole("table")).toHaveClass("min-w-table-md");
  });

  it("adds no scroll region or extra tab stop when the table never needs to scroll", () => {
    render(<PriceList minWidth="none" />);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
    expect(screen.getByRole("table").parentElement).not.toHaveAttribute("tabindex");
  });

  it("clips a table that never scrolls instead of making its frame a scroll container", () => {
    render(<PriceList minWidth="none" />);
    const frame = screen.getByRole("table").parentElement;
    expect(frame).toHaveClass("overflow-clip");
    expect(frame).not.toHaveClass("overflow-x-auto");
  });

  it("keeps header association: column headers and row headers", () => {
    render(<PriceList />);
    expect(screen.getAllByRole("columnheader").map((cell) => cell.getAttribute("scope"))).toEqual([
      "col",
      "col",
      "col",
    ]);
    expect(screen.getByRole("rowheader", { name: "Classic" })).toHaveAttribute("scope", "row");
  });

  it("highlights the chosen column cell by cell", () => {
    render(<PriceList />);
    expect(screen.getByRole("columnheader", { name: "Weekday plan" })).toHaveClass("text-pink-700");
    expect(screen.getByRole("button", { name: "₹3,120" }).closest("td")).toHaveClass(
      "font-semibold"
    );
    expect(screen.getByRole("cell", { name: "₹650" })).not.toHaveClass("font-semibold");
  });

  it("reaches the scroll region, then the interactive cells, by keyboard", async () => {
    const user = userEvent.setup();
    render(<PriceList />);
    await user.tab();
    expect(screen.getByRole("region")).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "₹3,120" })).toHaveFocus();
  });

  it("hides the caption visually by default and shows it on request", () => {
    const { rerender } = render(<PriceList />);
    expect(screen.getByText("Homely Meals price list")).toHaveClass("sr-only");
    rerender(<PriceList isCaptionVisible />);
    expect(screen.getByText("Homely Meals price list")).not.toHaveClass("sr-only");
  });

  it("is a light island even on dark sections", () => {
    render(<PriceList />);
    expect(screen.getByRole("region")).toHaveAttribute("data-surface", "light");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<PriceList />);
    await expectNoA11yViolations(container);
  });
});
