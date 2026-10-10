import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "#vitest.setup";

import { KeyValueList } from "./key-value-list";

const BOX = [
  { key: "Dal", value: "1, from 8 dals incl. Rajma, Chole, Dal Makhani" },
  { key: "Rice", value: "200g · jeera rice Tue & Wed" },
  { key: "Add-on", value: "Sweet Lassi (250ml)", isEmphasised: true },
];

describe("KeyValueList", () => {
  it("is a description list of term and definition pairs", () => {
    render(<KeyValueList items={BOX} />);
    expect(screen.getAllByRole("term").map((term) => term.textContent)).toEqual([
      "Dal",
      "Rice",
      "Add-on",
    ]);
    expect(screen.getAllByRole("definition")).toHaveLength(3);
  });

  it.each([
    ["sm", "w-22"],
    ["md", "w-30"],
  ] as const)("gives the key a fixed %s column", (keyWidth, widthClass) => {
    render(<KeyValueList items={BOX} keyWidth={keyWidth} />);
    expect(screen.getAllByRole("term")[0]).toHaveClass(widthClass, "shrink-0");
    expect(screen.getAllByRole("definition")[0]).toHaveClass("flex-1");
  });

  it("sets key and value at either end of the row without a key width", () => {
    render(<KeyValueList items={BOX} />);
    const [firstValue] = screen.getAllByRole("definition");
    expect(firstValue).toHaveClass("text-end");
    expect(firstValue?.parentElement).toHaveClass("justify-between", "flex-wrap");
  });

  it("mutes the key and leads with the value by default, or leads with the key", () => {
    const { rerender } = render(<KeyValueList items={BOX} />);
    expect(screen.getAllByRole("term")[0]).toHaveClass("text-text-muted");
    expect(screen.getAllByRole("definition")[0]).toHaveClass("text-text-heading");
    rerender(<KeyValueList items={BOX} emphasis="key" />);
    expect(screen.getAllByRole("term")[0]).toHaveClass("font-bold", "text-text-heading");
    expect(screen.getAllByRole("definition")[0]).toHaveClass("text-text-muted");
  });

  it("picks out an emphasised value in the brand colour", () => {
    render(<KeyValueList items={BOX} />);
    const values = screen.getAllByRole("definition");
    expect(values[2]).toHaveClass("font-semibold", "text-text-brand");
    expect(values[0]).not.toHaveClass("text-text-brand");
  });

  it("rules every row by default and drops the rules on request", () => {
    const { rerender } = render(<KeyValueList items={BOX} />);
    expect(screen.getAllByRole("term")[0]?.parentElement).toHaveClass("border-t");
    rerender(<KeyValueList items={BOX} hasDividers={false} />);
    expect(screen.getAllByRole("term")[0]?.parentElement).not.toHaveClass("border-t");
  });

  it("tightens the rows when compact", () => {
    const { rerender } = render(<KeyValueList items={BOX} />);
    expect(screen.getAllByRole("term")[0]?.parentElement).toHaveClass("py-3");
    rerender(<KeyValueList items={BOX} density="compact" />);
    expect(screen.getAllByRole("term")[0]?.parentElement).toHaveClass("py-2");
  });

  it("takes any content as a value", () => {
    render(<KeyValueList items={[{ key: "Status", value: <strong>Confirmed</strong> }]} />);
    expect(screen.getByRole("definition")).toContainElement(screen.getByText("Confirmed"));
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<KeyValueList items={BOX} keyWidth="sm" density="compact" />);
    await expectNoA11yViolations(container);
  });

  it("takes sx on its root, merged with className", () => {
    const { container } = render(
      <KeyValueList items={[{ key: "Open", value: "11am" }]} sx={{ m: 4 }} className="italic" />
    );
    expect(container.firstElementChild).toHaveClass("m-4", "italic");
  });
});
