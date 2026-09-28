/**
 * Stories only — never exported from the barrel. The value a token paints, in the browser's own
 * format, read off a probe placed next to `element` so it resolves under the same surface.
 */
export function paint(
  element: HTMLElement,
  property: "color" | "borderColor" | "backgroundColor",
  token: string
) {
  const probe = document.createElement("span");
  probe.style[property] = `var(${token})`;
  element.parentElement?.append(probe);
  const expected = getComputedStyle(probe)[property];
  probe.remove();
  return expected;
}
