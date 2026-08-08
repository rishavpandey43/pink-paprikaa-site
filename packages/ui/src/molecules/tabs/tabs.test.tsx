import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Croissant, Soup } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { type TabItem, Tabs } from "./tabs";

const ITEMS: TabItem[] = [
  { value: "all-day", label: "All Day", content: "Served 8am – 11:30pm." },
  { value: "breakfast", label: "Breakfast", content: "Poha, chole bhature, filter coffee." },
  { value: "sweets", label: "Sweets", content: "Gulab jamun and rasmalai, made fresh." },
];

describe("Tabs", () => {
  it("renders a named tab list with one tab per section", () => {
    render(<Tabs items={ITEMS} label="Menu sections" />);

    const list = screen.getByRole("tablist", { name: "Menu sections" });
    expect(list).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(3);
  });

  it("opens the first section when nothing is selected", () => {
    render(<Tabs items={ITEMS} label="Menu sections" />);

    expect(screen.getByRole("tab", { name: "All Day" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Served 8am – 11:30pm.");
  });

  it("honours defaultValue over the first section", () => {
    render(<Tabs defaultValue="sweets" items={ITEMS} label="Menu sections" />);

    expect(screen.getByRole("tab", { name: "Sweets" })).toHaveAttribute("aria-selected", "true");
  });

  it("swaps the panel when another tab is clicked", async () => {
    const handleValueChange = vi.fn();
    render(<Tabs items={ITEMS} label="Menu sections" onValueChange={handleValueChange} />);

    await userEvent.click(screen.getByRole("tab", { name: "Breakfast" }));

    expect(handleValueChange).toHaveBeenCalledWith("breakfast");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Poha, chole bhature, filter coffee.");
  });

  it("moves between tabs with the arrow keys", async () => {
    render(<Tabs items={ITEMS} label="Menu sections" />);

    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");

    expect(screen.getByRole("tab", { name: "Breakfast" })).toHaveAttribute("aria-selected", "true");
  });

  it("stays on the caller's value when controlled", async () => {
    const handleValueChange = vi.fn();
    render(
      <Tabs items={ITEMS} label="Menu sections" onValueChange={handleValueChange} value="all-day" />
    );

    await userEvent.click(screen.getByRole("tab", { name: "Sweets" }));

    expect(handleValueChange).toHaveBeenCalledWith("sweets");
    expect(screen.getByRole("tab", { name: "All Day" })).toHaveAttribute("aria-selected", "true");
  });

  it("does not select a disabled tab", async () => {
    const handleValueChange = vi.fn();
    render(
      <Tabs
        items={[...ITEMS.slice(0, 2), { value: "bar", label: "Bar", isDisabled: true }]}
        label="Menu sections"
        onValueChange={handleValueChange}
      />
    );

    await userEvent.click(screen.getByRole("tab", { name: "Bar" }));

    expect(handleValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole("tab", { name: "Bar" })).toBeDisabled();
  });

  it("underlines the active tab in the brand pink", () => {
    render(<Tabs items={ITEMS} label="Menu sections" />);

    expect(screen.getByRole("tab", { name: "All Day" })).toHaveClass(
      "data-[state=active]:after:bg-brand-primary"
    );
  });

  it("splits the row into equal shares when full width", () => {
    render(<Tabs isFullWidth items={ITEMS} label="Menu sections" />);

    expect(screen.getByRole("tab", { name: "All Day" })).toHaveClass("flex-1");
  });

  it("renders a leading glyph beside the label", () => {
    render(
      <Tabs
        items={[
          { value: "all-day", label: "All Day", icon: Soup, content: "Served 8am – 11:30pm." },
          { value: "breakfast", label: "Breakfast", icon: Croissant, content: "Poha and chai." },
        ]}
        label="Menu sections"
      />
    );

    expect(screen.getByRole("tab", { name: "All Day" }).querySelector("svg")).toBeInTheDocument();
  });

  it("merges a caller className", () => {
    const { container } = render(<Tabs className="gap-2" items={ITEMS} label="Menu sections" />);

    expect(container.firstElementChild).toHaveClass("gap-2");
    expect(container.firstElementChild).not.toHaveClass("gap-6");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Tabs items={ITEMS} label="Menu sections" />);
    await expectNoA11yViolations(container);
  });
});
