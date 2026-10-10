/** The one element a specimen test inspects, or a failure naming the selector. */
export function requireElement(root: HTMLElement, selector: string): HTMLElement {
  const found = root.querySelector(selector);
  if (!(found instanceof HTMLElement)) {
    throw new Error(`docs-kit test: nothing matches ${selector}`);
  }
  return found;
}
