import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Combobox, type ComboboxOption } from "./combobox";

const DISHES: ComboboxOption[] = [
  { value: "paneer-tikka", label: "Paneer Tikka" },
  { value: "paneer-butter-masala", label: "Paneer Butter Masala" },
  { value: "dal-makhani", label: "Dal Makhani" },
  { value: "chole-bhature", label: "Chole Bhature" },
  { value: "masala-dosa", label: "Masala Dosa" },
  { value: "pav-bhaji", label: "Pav Bhaji" },
  { value: "veg-biryani", label: "Veg Biryani" },
  { value: "malai-kofta", label: "Malai Kofta" },
  { value: "aloo-paratha", label: "Aloo Paratha" },
  { value: "gulab-jamun", label: "Gulab Jamun" },
  { value: "rasmalai", label: "Rasmalai" },
  { value: "kulfi", label: "Kulfi" },
];

function optionLabels(): (string | null)[] {
  return screen.getAllByRole("option").map((option) => option.textContent);
}

function nthOption(index: number): HTMLElement {
  const option = screen.getAllByRole("option")[index];
  if (option === undefined) throw new Error(`no option at ${String(index)}`);
  return option;
}

describe("Combobox", () => {
  it("filters as you type and selects with ArrowDown + Enter", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Combobox aria-label="Search dishes" options={DISHES} onValueChange={onValueChange} />);
    const input = screen.getByRole("combobox", { name: "Search dishes" });
    await user.type(input, "pan");
    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(optionLabels()).toEqual(["Paneer Tikka", "Paneer Butter Masala"]);
    await user.keyboard("{ArrowDown}");
    expect(input).toHaveAttribute("aria-activedescendant", nthOption(0).id);
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("paneer-tikka");
    expect(input).toHaveValue("Paneer Tikka");
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("wires the combobox to its listbox", async () => {
    const user = userEvent.setup();
    render(<Combobox aria-label="Search dishes" options={DISHES} />);
    const input = screen.getByRole("combobox");
    expect(input).toHaveAttribute("aria-autocomplete", "list");
    await user.click(input);
    const listbox = screen.getByRole("listbox");
    expect(input).toHaveAttribute("aria-controls", listbox.id);
    expect(screen.getAllByRole("option")).toHaveLength(12);
  });

  it("matches without case or accents", async () => {
    const user = userEvent.setup();
    render(
      <Combobox
        aria-label="Search dishes"
        options={[...DISHES, { value: "creme", label: "Crème Brûlée Kulfi" }]}
      />
    );
    const input = screen.getByRole("combobox");
    await user.type(input, "DAL");
    expect(optionLabels()).toEqual(["Dal Makhani"]);
    await user.clear(input);
    await user.type(input, "creme brulee");
    expect(optionLabels()).toEqual(["Crème Brûlée Kulfi"]);
  });

  it("highlights the matched text", async () => {
    const user = userEvent.setup();
    render(<Combobox aria-label="Search dishes" options={DISHES} />);
    await user.type(screen.getByRole("combobox"), "pan");
    const marks = document.querySelectorAll("mark");
    expect(marks).toHaveLength(2);
    expect(marks[0]).toHaveTextContent("Pan");
  });

  it("uses a custom filter", async () => {
    const user = userEvent.setup();
    render(
      <Combobox
        aria-label="Search dishes"
        options={DISHES}
        filter={(option, text) => option.value.startsWith(text)}
      />
    );
    await user.type(screen.getByRole("combobox"), "kul");
    expect(optionLabels()).toEqual(["Kulfi"]);
  });

  it("Escape closes, a second Escape clears the text", async () => {
    const user = userEvent.setup();
    render(<Combobox aria-label="Search dishes" options={DISHES} />);
    const input = screen.getByRole("combobox");
    await user.type(input, "pan");
    await user.keyboard("{Escape}");
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(input).toHaveValue("pan");
    await user.keyboard("{Escape}");
    expect(input).toHaveValue("");
  });

  it("ArrowDown opens the closed list, ArrowUp and Home/End move through it", async () => {
    const user = userEvent.setup();
    render(<Combobox aria-label="Search dishes" options={DISHES} />);
    const input = screen.getByRole("combobox");
    input.focus();
    await user.keyboard("{ArrowDown}");
    expect(input).toHaveAttribute("aria-expanded", "true");
    const options = screen.getAllByRole("option");
    expect(input).toHaveAttribute("aria-activedescendant", options[0]?.id);
    await user.keyboard("{End}");
    expect(input).toHaveAttribute("aria-activedescendant", options[11]?.id);
    await user.keyboard("{ArrowUp}");
    expect(input).toHaveAttribute("aria-activedescendant", options[10]?.id);
    await user.keyboard("{Home}");
    expect(input).toHaveAttribute("aria-activedescendant", options[0]?.id);
  });

  it("Tab commits the active option", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Combobox aria-label="Search dishes" options={DISHES} onValueChange={onValueChange} />);
    await user.type(screen.getByRole("combobox"), "kul");
    await user.keyboard("{ArrowDown}{Tab}");
    expect(onValueChange).toHaveBeenCalledWith("kulfi");
    expect(screen.getByRole("combobox")).toHaveValue("Kulfi");
  });

  it("selects an option with a click", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Combobox aria-label="Search dishes" options={DISHES} onValueChange={onValueChange} />);
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "Rasmalai" }));
    expect(onValueChange).toHaveBeenCalledWith("rasmalai");
    expect(screen.getByRole("combobox")).toHaveValue("Rasmalai");
  });

  it("restores the chosen label when focus leaves with other text typed", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Combobox aria-label="Search dishes" options={DISHES} defaultValue="kulfi" />
        <button type="button">Elsewhere</button>
      </>
    );
    const input = screen.getByRole("combobox");
    expect(input).toHaveValue("Kulfi");
    await user.type(input, "xyz");
    await user.click(screen.getByRole("button", { name: "Elsewhere" }));
    expect(input).toHaveValue("Kulfi");
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("shows the empty message and the loading state", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Combobox aria-label="Search dishes" options={DISHES} />);
    await user.type(screen.getByRole("combobox"), "zzz");
    expect(screen.getByText("No matches")).toBeVisible();
    rerender(<Combobox aria-label="Search dishes" options={DISHES} emptyMessage="Nothing found" />);
    expect(screen.getByText("Nothing found")).toBeVisible();
    rerender(<Combobox aria-label="Search dishes" options={[]} isLoading />);
    expect(screen.getByText("Loading…")).toBeVisible();
    expect(screen.queryByText("Nothing found")).toBeNull();
    rerender(
      <Combobox aria-label="Search dishes" options={[]} isLoading loadingLabel="Fetching" />
    );
    expect(screen.getByText("Fetching")).toBeVisible();
  });

  it("clear button resets value and text, and refocuses the input", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Combobox
        aria-label="Search dishes"
        options={DISHES}
        defaultValue="kulfi"
        isClearable
        onValueChange={onValueChange}
      />
    );
    const input = screen.getByRole("combobox");
    expect(input).toHaveValue("Kulfi");
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(onValueChange).toHaveBeenCalledWith(null);
    expect(input).toHaveValue("");
    expect(input).toHaveFocus();
    expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
  });

  it("disabled options are skipped by arrows and cannot be clicked", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const options: ComboboxOption[] = [
      { value: "a", label: "Aloo Paratha" },
      { value: "b", label: "Baingan Bharta", disabled: true },
      { value: "c", label: "Chole Bhature" },
    ];
    render(<Combobox aria-label="Search dishes" options={options} onValueChange={onValueChange} />);
    const input = screen.getByRole("combobox");
    input.focus();
    await user.keyboard("{ArrowDown}{ArrowDown}");
    const items = screen.getAllByRole("option");
    expect(items[1]).toHaveAttribute("aria-disabled", "true");
    expect(input).toHaveAttribute("aria-activedescendant", items[2]?.id);
    await user.click(nthOption(1));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(input).toHaveAttribute("aria-expanded", "true");
  });

  it("submits the value through a hidden input", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Combobox aria-label="Search dishes" name="dish" options={DISHES} />
    );
    const hidden = container.querySelector<HTMLInputElement>('input[type="hidden"][name="dish"]');
    expect(hidden).toHaveValue("");
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "Gulab Jamun" }));
    expect(hidden).toHaveValue("gulab-jamun");
  });

  it("does not submit when disabled and cannot be opened", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Combobox
        aria-label="Search dishes"
        name="dish"
        options={DISHES}
        defaultValue="kulfi"
        disabled
      />
    );
    expect(container.querySelector('input[type="hidden"]')).toBeNull();
    const input = screen.getByRole("combobox");
    expect(input).toBeDisabled();
    await user.click(input);
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("is controlled by value and inputValue", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onInputChange = vi.fn();
    const { rerender } = render(
      <Combobox
        aria-label="Search dishes"
        options={DISHES}
        value="kulfi"
        inputValue="Kulfi"
        onValueChange={onValueChange}
        onInputChange={onInputChange}
      />
    );
    const input = screen.getByRole("combobox");
    await user.type(input, "s");
    expect(onInputChange).toHaveBeenLastCalledWith("Kulfis");
    expect(input).toHaveValue("Kulfi");
    rerender(
      <Combobox
        aria-label="Search dishes"
        options={DISHES}
        value="rasmalai"
        inputValue="Rasmalai"
      />
    );
    expect(input).toHaveValue("Rasmalai");
  });

  it("follows a controlled value change when the text is uncontrolled", () => {
    const { rerender } = render(
      <Combobox aria-label="Search dishes" options={DISHES} value="kulfi" />
    );
    expect(screen.getByRole("combobox")).toHaveValue("Kulfi");
    rerender(<Combobox aria-label="Search dishes" options={DISHES} value="pav-bhaji" />);
    expect(screen.getByRole("combobox")).toHaveValue("Pav Bhaji");
  });

  it("wires field attributes, the placeholder, status and ref", () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <Combobox
        ref={ref}
        id="dish"
        aria-label="Dish"
        aria-describedby="dish-message"
        placeholder="Search dishes"
        status="error"
        options={DISHES}
      />
    );
    const input = screen.getByRole("combobox");
    expect(input).toHaveAttribute("id", "dish");
    expect(input).toHaveAttribute("aria-describedby", "dish-message");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("placeholder", "Search dishes");
    expect(ref.current).toBe(input);
  });

  it("is accessible closed and open", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Combobox aria-label="Search dishes" options={DISHES} isClearable defaultValue="kulfi" />
    );
    await expectNoA11yViolations(container);
    await user.click(screen.getByRole("combobox"));
    await user.keyboard("{ArrowDown}");
    await expectNoA11yViolations(container);
  });

  it("is accessible with no matches and while loading", async () => {
    const user = userEvent.setup();
    const { container, rerender } = render(
      <Combobox aria-label="Search dishes" options={DISHES} />
    );
    await user.type(screen.getByRole("combobox"), "zzz");
    await expectNoA11yViolations(container);
    rerender(<Combobox aria-label="Search dishes" options={[]} isLoading />);
    await expectNoA11yViolations(container);
  });
});
