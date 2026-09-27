import { render } from "@testing-library/react";

import { RevealObserver } from "./reveal-observer";

type Callback = (entries: Pick<IntersectionObserverEntry, "isIntersecting" | "target">[]) => void;

let callback: Callback = () => undefined;
const observed = new Set<Element>();

class ControlledObserver {
  constructor(cb: Callback) {
    callback = cb;
  }
  observe(el: Element): void {
    observed.add(el);
  }
  unobserve(el: Element): void {
    observed.delete(el);
  }
  disconnect(): void {
    observed.clear();
  }
}

function section(top: number): HTMLElement {
  const el = document.createElement("section");
  el.getBoundingClientRect = () => ({ top }) as DOMRect;
  document.body.append(el);
  return el;
}

beforeEach(() => {
  document.body.innerHTML = "";
  observed.clear();
  vi.stubGlobal("IntersectionObserver", ControlledObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("RevealObserver", () => {
  it("never hides a section that starts above the fold", () => {
    const above = section(0);
    render(<RevealObserver />);
    expect(above).not.toHaveAttribute("data-pp-reveal");
  });

  it("hides a section below the fold until it scrolls into view, then reveals it once", () => {
    const below = section(window.innerHeight + 200);
    render(<RevealObserver />);
    expect(below).toHaveAttribute("data-pp-reveal");
    callback([{ isIntersecting: true, target: below }]);
    expect(below).toHaveAttribute("data-pp-revealed");
    expect(observed.has(below)).toBe(false);
  });

  it("does nothing at all where IntersectionObserver is unavailable", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    const below = section(window.innerHeight + 200);
    render(<RevealObserver />);
    expect(below).not.toHaveAttribute("data-pp-reveal");
  });

  it("stops observing when unmounted", () => {
    section(window.innerHeight + 200);
    const { unmount } = render(<RevealObserver />);
    unmount();
    expect(observed.size).toBe(0);
  });
});
