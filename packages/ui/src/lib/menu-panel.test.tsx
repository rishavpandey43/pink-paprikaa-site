import { render, screen } from "@testing-library/react";

import { MenuEmpty, MenuPanel } from "./menu-panel";

describe("MenuPanel", () => {
  it("listbox marks the chosen row with a brand diamond and shows emptyText", () => {
    const onSelect = vi.fn();
    const { rerender } = render(
      <MenuPanel
        role="listbox"
        aria-label="Heat"
        items={[
          { value: "mild", label: "Mild" },
          { value: "hot", label: "Hot", disabled: true },
        ]}
        value="mild"
        onSelect={onSelect}
      />
    );
    const chosen = screen.getByRole("option", { name: "Mild" });
    expect(chosen).toHaveAttribute("aria-selected", "true");
    expect(chosen).toHaveClass("text-pink-700", "font-semibold");
    expect(chosen.querySelector("[aria-hidden='true']")).not.toBeNull();
    expect(screen.getByRole("option", { name: "Hot" })).toHaveAttribute("aria-disabled", "true");
    rerender(
      <MenuPanel role="listbox" aria-label="Heat" items={[]} emptyText="Nothing here yet." />
    );
    expect(screen.getByText("Nothing here yet.")).toBeVisible();
    expect(screen.getByText("Nothing here yet.")).toHaveClass("text-body-sm", "text-text-muted");
  });

  it("renders group labels in mono and trailing meta", () => {
    render(
      <MenuPanel
        role="listbox"
        aria-label="Mains"
        items={[{ group: "Mains" }, { value: "cp", label: "Chilli Paneer", meta: "₹280" }]}
        value="cp"
      />
    );
    expect(screen.getByText("Mains")).toHaveClass("font-mono", "uppercase");
    expect(screen.getByText("₹280")).toHaveClass("font-mono", "text-caption");
  });

  it("MenuEmpty renders the empty row recipe", () => {
    render(<MenuEmpty>No matches.</MenuEmpty>);
    expect(screen.getByText("No matches.")).toHaveClass("text-body-sm", "text-text-muted");
  });
});
