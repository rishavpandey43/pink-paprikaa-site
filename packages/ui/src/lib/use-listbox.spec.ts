import { act, renderHook } from "@testing-library/react";

import { useListbox } from "./use-listbox";

const SPICES = [
  { value: "mild", label: "Mild" },
  { value: "medium", label: "Medium", disabled: true },
  { value: "hot", label: "Hot" },
];

describe("useListbox", () => {
  it("starts with no active row until reset", () => {
    const { result } = renderHook(() => useListbox(SPICES));
    expect(result.current.activeIndex).toBe(-1);
  });

  it("resetActive prefers a selectable index, else the first selectable", () => {
    const { result } = renderHook(() => useListbox(SPICES));
    act(() => {
      result.current.resetActive(1);
    });
    expect(result.current.activeIndex).toBe(0);
    act(() => {
      result.current.resetActive(2);
    });
    expect(result.current.activeIndex).toBe(2);
  });

  it("move skips disabled rows", () => {
    const { result } = renderHook(() => useListbox(SPICES));
    act(() => {
      result.current.resetActive(0);
    });
    act(() => {
      result.current.move(1);
    });
    expect(result.current.activeIndex).toBe(2);
  });

  it("toStart and toEnd land on the first and last selectable rows", () => {
    const { result } = renderHook(() => useListbox(SPICES));
    act(() => {
      result.current.toEnd();
    });
    expect(result.current.activeIndex).toBe(2);
    act(() => {
      result.current.toStart();
    });
    expect(result.current.activeIndex).toBe(0);
  });

  it("typeahead jumps to a matching selectable label", () => {
    const { result } = renderHook(() => useListbox(SPICES));
    act(() => {
      result.current.typeahead("h");
    });
    expect(result.current.activeIndex).toBe(2);
  });

  it("typeahead skips a disabled match and finds the next prefix", () => {
    const items = [
      { value: "m1", label: "Mango", disabled: true },
      { value: "m2", label: "Masala" },
    ];
    const { result } = renderHook(() => useListbox(items));
    act(() => {
      result.current.typeahead("m");
    });
    expect(result.current.activeIndex).toBe(1);
  });
});
