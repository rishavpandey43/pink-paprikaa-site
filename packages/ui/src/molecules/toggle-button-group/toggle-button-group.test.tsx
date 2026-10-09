import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LayoutGrid, List } from "lucide-react";
import { createRef, useState } from "react";

import { expectNoA11yViolations } from "#vitest.setup";

import { ToggleButton } from "../../atoms/toggle-button/toggle-button";
import { ToggleButtonGroup } from "./toggle-button-group";

function ViewSwitcher({ onValueChange }: { onValueChange?: (value: string | null) => void }) {
  return (
    <ToggleButtonGroup
      exclusive
      aria-label="View"
      defaultValue="grid"
      onValueChange={onValueChange}
    >
      <ToggleButton value="grid" icon={LayoutGrid} aria-label="Grid view" />
      <ToggleButton value="list" icon={List} aria-label="List view" />
    </ToggleButtonGroup>
  );
}

function Diet({ onValueChange }: { onValueChange?: (value: string[]) => void }) {
  return (
    <ToggleButtonGroup aria-label="Diet" onValueChange={onValueChange}>
      <ToggleButton value="jain">Jain</ToggleButton>
      <ToggleButton value="no-onion-garlic">No onion-garlic</ToggleButton>
      <ToggleButton value="gluten-free">Gluten-free</ToggleButton>
    </ToggleButtonGroup>
  );
}

describe("ToggleButtonGroup", () => {
  it("exclusive group: one value, re-click deselects to null (MUI default)", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ViewSwitcher onValueChange={onValueChange} />);
    expect(screen.getByRole("radio", { name: "Grid view" })).toBeChecked();
    await user.click(screen.getByRole("radio", { name: "List view" }));
    expect(onValueChange).toHaveBeenLastCalledWith("list");
    expect(screen.getByRole("radio", { name: "Grid view" })).not.toBeChecked();
    await user.click(screen.getByRole("radio", { name: "List view" }));
    expect(onValueChange).toHaveBeenLastCalledWith(null);
    expect(screen.getByRole("radio", { name: "List view" })).not.toBeChecked();
  });

  it("isValueRequired keeps one selected (MUI enforce value set)", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <ToggleButtonGroup
        exclusive
        isValueRequired
        aria-label="View"
        defaultValue="grid"
        onValueChange={onValueChange}
      >
        <ToggleButton value="grid">Grid</ToggleButton>
        <ToggleButton value="list">List</ToggleButton>
      </ToggleButtonGroup>
    );
    await user.click(screen.getByRole("radio", { name: "Grid" }));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole("radio", { name: "Grid" })).toBeChecked();
    await user.click(screen.getByRole("radio", { name: "List" }));
    expect(onValueChange).toHaveBeenLastCalledWith("list");
  });

  it("exclusive group starts empty with value null and is controlled by it", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <ToggleButtonGroup exclusive aria-label="View" value={null} onValueChange={onValueChange}>
        <ToggleButton value="grid">Grid</ToggleButton>
        <ToggleButton value="list">List</ToggleButton>
      </ToggleButtonGroup>
    );
    for (const radio of screen.getAllByRole("radio")) {
      expect(radio).toHaveAttribute("aria-checked", "false");
    }
    await user.click(screen.getByRole("radio", { name: "Grid" }));
    expect(onValueChange).toHaveBeenCalledWith("grid");
    expect(screen.getByRole("radio", { name: "Grid" })).toHaveAttribute("aria-checked", "false");
  });

  it("a controlled exclusive group follows its value", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [value, setValue] = useState<string | null>("list");
      return (
        <ToggleButtonGroup exclusive aria-label="View" value={value} onValueChange={setValue}>
          <ToggleButton value="grid">Grid</ToggleButton>
          <ToggleButton value="list">List</ToggleButton>
        </ToggleButtonGroup>
      );
    }
    render(<Controlled />);
    expect(screen.getByRole("radio", { name: "List" })).toBeChecked();
    await user.click(screen.getByRole("radio", { name: "Grid" }));
    expect(screen.getByRole("radio", { name: "Grid" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "List" })).not.toBeChecked();
  });

  it("multiple group: toggles independently and reports an array", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Diet onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: "Jain" }));
    await user.click(screen.getByRole("button", { name: "No onion-garlic" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["jain", "no-onion-garlic"]);
    expect(screen.getByRole("button", { name: "Jain" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Gluten-free" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
    await user.click(screen.getByRole("button", { name: "Jain" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["no-onion-garlic"]);
  });

  it("multiple group starts from defaultValue", () => {
    render(
      <ToggleButtonGroup aria-label="Diet" defaultValue={["jain"]}>
        <ToggleButton value="jain">Jain</ToggleButton>
        <ToggleButton value="gluten-free">Gluten-free</ToggleButton>
      </ToggleButtonGroup>
    );
    expect(screen.getByRole("button", { name: "Jain" })).toHaveAttribute("aria-pressed", "true");
  });

  it("is named by aria-label: a toolbar when multiple, a radiogroup when exclusive", () => {
    render(
      <div>
        <Diet />
        <ViewSwitcher />
      </div>
    );
    expect(screen.getByRole("toolbar", { name: "Diet" })).toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: "View" })).toBeInTheDocument();
  });

  it("one tab stop; arrows move focus; Home/End jump; Space toggles", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <div>
        <button type="button">before</button>
        <Diet onValueChange={onValueChange} />
        <button type="button">after</button>
      </div>
    );
    await user.tab();
    await user.tab();
    expect(screen.getByRole("button", { name: "Jain" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: "No onion-garlic" })).toHaveFocus();
    await user.keyboard("{End}");
    expect(screen.getByRole("button", { name: "Gluten-free" })).toHaveFocus();
    await user.keyboard("{Home}");
    expect(screen.getByRole("button", { name: "Jain" })).toHaveFocus();
    await user.keyboard(" ");
    expect(onValueChange).toHaveBeenLastCalledWith(["jain"]);
    await user.tab();
    expect(screen.getByRole("button", { name: "after" })).toHaveFocus();
  });

  it("a vertical group moves with the up and down arrows", async () => {
    const user = userEvent.setup();
    render(
      <ToggleButtonGroup aria-label="Align" orientation="vertical">
        <ToggleButton value="a">A</ToggleButton>
        <ToggleButton value="b">B</ToggleButton>
      </ToggleButtonGroup>
    );
    await user.tab();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("button", { name: "B" })).toHaveFocus();
  });

  it("orientation, size, color, isFullWidth map to their classes and attributes", () => {
    const { rerender } = render(
      <ToggleButtonGroup aria-label="G" data-testid="group">
        <ToggleButton value="a">A</ToggleButton>
      </ToggleButtonGroup>
    );
    const group = screen.getByTestId("group");
    expect(group).toHaveAttribute("data-orientation", "horizontal");
    expect(group).toHaveClass("inline-flex", "flex-row");
    expect(screen.getByRole("button", { name: "A" })).toHaveClass(
      "h-toggle-button-h-md",
      "not-disabled:data-[state=on]:text-text-brand"
    );
    rerender(
      <ToggleButtonGroup
        aria-label="G"
        data-testid="group"
        orientation="vertical"
        size="sm"
        color="neutral"
        isFullWidth
      >
        <ToggleButton value="a">A</ToggleButton>
      </ToggleButtonGroup>
    );
    expect(group).toHaveAttribute("data-orientation", "vertical");
    expect(group).toHaveClass("flex", "w-full", "flex-col");
    const button = screen.getByRole("button", { name: "A" });
    expect(button).toHaveClass(
      "h-toggle-button-h-sm",
      "not-disabled:data-[state=on]:text-text-heading"
    );
    expect(button).toHaveClass("flex-1");
  });

  it("a child's own size and color win over the group's", () => {
    render(
      <ToggleButtonGroup aria-label="G" size="sm" color="neutral">
        <ToggleButton value="a" size="lg" color="brand">
          A
        </ToggleButton>
      </ToggleButtonGroup>
    );
    expect(screen.getByRole("button", { name: "A" })).toHaveClass(
      "h-toggle-button-h-lg",
      "not-disabled:data-[state=on]:text-text-brand"
    );
  });

  it("disabled disables every button and blocks presses", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <ToggleButtonGroup aria-label="Diet" disabled onValueChange={onValueChange}>
        <ToggleButton value="jain">Jain</ToggleButton>
        <ToggleButton value="gluten-free">Gluten-free</ToggleButton>
      </ToggleButtonGroup>
    );
    expect(screen.getByRole("button", { name: "Jain" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Jain" }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("a single disabled button is skipped but the rest work", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <ToggleButtonGroup aria-label="Diet" onValueChange={onValueChange}>
        <ToggleButton value="jain" disabled>
          Jain
        </ToggleButton>
        <ToggleButton value="gluten-free">Gluten-free</ToggleButton>
      </ToggleButtonGroup>
    );
    await user.click(screen.getByRole("button", { name: "Jain" }));
    expect(onValueChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Gluten-free" }));
    expect(onValueChange).toHaveBeenCalledWith(["gluten-free"]);
  });

  it("icon-only buttons are named by aria-label", () => {
    render(<ViewSwitcher />);
    expect(screen.getByRole("radio", { name: "Grid view" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "List view" })).toBeInTheDocument();
  });

  it("takes sx, native props and ref on the group root", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <ToggleButtonGroup
        ref={ref}
        aria-label="G"
        sx={{ mt: 4 }}
        className="ms-2"
        data-testid="group"
        id="the-group"
      >
        <ToggleButton value="a">A</ToggleButton>
      </ToggleButtonGroup>
    );
    const group = screen.getByTestId("group");
    expect(ref.current).toBe(group);
    expect(group).toHaveAttribute("id", "the-group");
    expect(group).toHaveClass("mt-4", "ms-2");
  });

  it("is accessible", async () => {
    const { container } = render(
      <div>
        <ViewSwitcher />
        <Diet />
      </div>
    );
    await expectNoA11yViolations(container);
  });
});
