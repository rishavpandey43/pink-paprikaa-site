import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Soup } from "lucide-react";
import { createRef } from "react";

import { expectNoA11yViolations } from "#vitest.setup";

import { Icon } from "../../atoms/icon/icon";
import { type TabItem, Tabs } from "./tabs";

const MENU: TabItem[] = [
  { value: "all-day", label: "All Day", content: <p>The all-day menu.</p> },
  { value: "breakfast", label: "Breakfast", content: <p>The breakfast menu.</p> },
  { value: "bar", label: "Bar", content: <p>The bar menu.</p> },
];

describe("Tabs", () => {
  it("is a named tab list whose first tab is selected by default", () => {
    render(<Tabs label="Menu sections" items={MENU} />);
    expect(screen.getByRole("tablist", { name: "Menu sections" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "All Day" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel", { name: "All Day" })).toHaveTextContent(
      "The all-day menu."
    );
  });

  it("keeps every panel in the page and hides the inactive ones", () => {
    render(<Tabs label="Menu sections" items={MENU} />);
    expect(screen.getByText("The breakfast menu.")).not.toBeVisible();
    expect(screen.getByText("The all-day menu.")).toBeVisible();
  });

  it("starts at the first tab that is not disabled when no defaultValue is given", () => {
    const items = MENU.map((item) =>
      item.value === "all-day" ? { ...item, isDisabled: true } : item
    );
    render(<Tabs label="Menu sections" items={items} />);
    expect(screen.getByRole("tab", { name: "Breakfast" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("The breakfast menu.")).toBeVisible();
  });

  it("starts at defaultValue", () => {
    render(<Tabs label="Menu sections" items={MENU} defaultValue="bar" />);
    expect(screen.getByRole("tab", { name: "Bar" })).toHaveAttribute("aria-selected", "true");
  });

  it("selects a tab on click and reports it", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Tabs label="Menu sections" items={MENU} onValueChange={onValueChange} />);
    await user.click(screen.getByRole("tab", { name: "Breakfast" }));
    expect(screen.getByRole("tab", { name: "Breakfast" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("The breakfast menu.")).toBeVisible();
    expect(onValueChange).toHaveBeenCalledWith("breakfast");
  });

  it("moves and selects with the arrow keys, Home and End", async () => {
    const user = userEvent.setup();
    render(<Tabs label="Menu sections" items={MENU} />);
    await user.click(screen.getByRole("tab", { name: "All Day" }));
    await user.keyboard("{ArrowRight}");
    const breakfast = screen.getByRole("tab", { name: "Breakfast" });
    expect(breakfast).toHaveFocus();
    expect(breakfast).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "Bar" })).toHaveFocus();
    await user.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: "All Day" })).toHaveFocus();
  });

  it("reports but keeps the caller's tab when controlled", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Tabs label="Menu sections" items={MENU} value="all-day" onValueChange={onValueChange} />
    );
    await user.click(screen.getByRole("tab", { name: "Breakfast" }));
    expect(onValueChange).toHaveBeenCalledWith("breakfast");
    expect(screen.getByRole("tab", { name: "All Day" })).toHaveAttribute("aria-selected", "true");
  });

  it("draws the underline rail by default and the segmented rail as a light island of pills", () => {
    const { rerender } = render(<Tabs label="Menu sections" items={MENU} />);
    expect(screen.getByRole("tablist")).toHaveClass("border-b");
    // A 44px target (spec §5.5, dev parity) with the 3px pink underline under the active tab.
    expect(screen.getByRole("tab", { name: "All Day" })).toHaveClass(
      "min-h-hit",
      "aria-selected:after:bg-tabs-indicator"
    );
    rerender(<Tabs label="Menu sections" items={MENU} variant="segmented" />);
    const rail = screen.getByRole("tablist");
    expect(rail).toHaveAttribute("data-surface", "light");
    expect(rail).toHaveClass("rounded-pill");
    expect(screen.getByRole("tab", { name: "All Day" })).toHaveClass("min-h-hit");
  });

  it("lays a glyph passed in the label beside its text", () => {
    render(
      <Tabs
        label="Menu sections"
        items={[
          {
            value: "all-day",
            label: (
              <>
                <Icon icon={Soup} size="sm" />
                All Day
              </>
            ),
            content: <p>The all-day menu.</p>,
          },
          ...MENU.slice(1),
        ]}
      />
    );
    const tab = screen.getByRole("tab", { name: "All Day" });
    expect(tab).toHaveClass("inline-flex", "gap-2");
    expect(tab.querySelector("svg.lucide-soup")).toBeInTheDocument();
  });

  it("disables a tab it is told to, and the arrow keys skip it", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Tabs
        label="Menu sections"
        items={MENU.map((item) =>
          item.value === "breakfast" ? { ...item, isDisabled: true } : item
        )}
        onValueChange={onValueChange}
      />
    );
    const breakfast = screen.getByRole("tab", { name: "Breakfast" });
    expect(breakfast).toBeDisabled();
    await user.click(breakfast);
    expect(onValueChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole("tab", { name: "All Day" }));
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Bar" })).toHaveFocus();
  });

  it("shares the row equally between its tabs when full width", () => {
    render(<Tabs label="Menu sections" items={MENU} variant="segmented" isFullWidth />);
    for (const tab of screen.getAllByRole("tab")) {
      expect(tab).toHaveClass("flex-1", "whitespace-normal");
      expect(tab).not.toHaveClass("whitespace-nowrap");
    }
  });

  it("merges a caller className over its own gap", () => {
    const { container } = render(<Tabs label="Menu sections" items={MENU} className="gap-2" />);
    expect(container.firstElementChild).toHaveClass("gap-2");
    expect(container.firstElementChild).not.toHaveClass("gap-6");
  });

  it("has no accessibility violations in either variant", async () => {
    const { container } = render(
      <>
        <Tabs label="Menu sections" items={MENU} />
        <Tabs
          label="This week"
          variant="segmented"
          items={[
            { value: "classic", label: "Classic & Signature", content: <p>Classic.</p> },
            { value: "everyday", label: "Everyday", content: <p>Everyday.</p> },
          ]}
        />
      </>
    );
    await expectNoA11yViolations(container);
  });

  it("forwards id, data-*, aria-* and ref to its root, and takes sx", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Tabs
        ref={ref}
        label="Menu sections"
        items={MENU}
        id="menu-tabs"
        data-section="mains"
        aria-describedby="hint"
        sx={{ mt: 4 }}
      />
    );
    expect(ref.current).toHaveAttribute("id", "menu-tabs");
    expect(ref.current).toHaveAttribute("data-section", "mains");
    expect(ref.current).toHaveAttribute("aria-describedby", "hint");
    expect(ref.current).toHaveClass("mt-4");
    expect(ref.current).toContainElement(screen.getByRole("tablist"));
  });

  it("lets sx beat a default class and keeps className", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Tabs ref={ref} label="Menu sections" items={MENU} sx={{ gap: 2 }} className="italic" />
    );
    expect(ref.current).toHaveClass("gap-2", "italic");
    expect(ref.current).not.toHaveClass("gap-6");
  });
});
