# Carried fixes for batch G (from review E) — FIRST, fix commits
1. Minor (verification gap) — Pagination: add a Chromium play to `Playground` asserting `getByRole("link", { name: "Page 5" })` and `getByRole("link", { name: "Previous page" })` / "Next page" (the "Page" + " " name is only proven in jsdom). If Chromium computes "Page5", fix the markup (e.g. a non-breaking or in-span space via aria-label on the link).
2. Minor — tabs.tsx:80: default value must skip disabled items: `items.find((i) => i.isDisabled !== true)?.value ?? ""`. Test.
3. Minor — pagination.tsx:78,112 comment wording ("matches the pages' sr-only name text").
4. Minor — slot-picker.test.tsx:71: restore the console.error spy in try/finally (or afterEach).
5. Minor (a11y, R82 completion) — snackbar: when the PARENT sets `open` to false while focus is inside the bar (no Radix close path), focus is not restored. Restore in the same place (effect on open→false, or wrap the controlled close) — test it.
