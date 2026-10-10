### Task 7: Select on our own panel (replaces old 15b) and the native-date sweep (replaces old 15c)

**Files:** `packages/ui/src/atoms/select/select.{tsx,test.tsx,stories.tsx}`, `apps/storybook/src/patterns/enquiry-form.tsx`, `apps/storybook/src/kits/website/website-kit.tsx` (booking dialog).
**Source:** audit-atoms §Select · audit-foundations §Global interactions (native select) · old plan Task 15b/15c intent · `DA/Select.{d.ts,jsx,card.html}`.

**API (same as today + the design's additions):** `options: { value; label; description?; isDisabled? }[]`, `value/defaultValue`, `onValueChange`, **and still** `onChange`/`register()` compatibility, via a hidden native select that our list drives: on selection, set `select.value` and dispatch a bubbling `change` event, so `{...register("x")}` keeps working unchanged. Also `open/defaultOpen/onOpenChange`, `name`, `placeholder`, `size`, `status`, `icon`, `readOnly`, `disabled`, `required` (→ aria-required), `sheet`, `portalContainer`, `sx`. The hidden select is `aria-hidden`, `tabIndex={-1}`, inside the lib (the lint gate allows `<select>` only in `lib/`): put it in `lib/hidden-native-select.tsx`.

- [ ] **Step 1: Failing tests:**
  - trigger `role="combobox"`, no visible native select;
  - opens our listbox (the Task 6 panel), selected row has the brand diamond;
  - keyboard (Enter/Space/ArrowDown open; arrows skip disabled; Home/End; type-to-jump; Enter selects; Esc closes; focus returns; Tab closes);
  - chevron rotates when open;
  - `register()` works (`useForm` test: select an option → `getValues("outlet")` = value, and `onChange` fired with `event.target.value`);
  - FormData posts the value;
  - readOnly can't open and still posts;
  - error → aria-invalid;
  - ≤640 sheet;
  - axe open/closed.
- [ ] **Step 2: Implement**: trigger in `FieldControl` (closed state identical to today + the design's chevron rotation), panel from `lib/menu-panel`, positioning from `lib/popover-shell`, keyboard via a small `lib/use-listbox.ts` (active index, typeahead buffer 500ms, skip disabled) **shared with Combobox** (Task 8). → PASS.
- [ ] **Step 3: Stories per card row** + OpenList, Keyboard, LongList, InDialog, InAppShell, Sheet360. `storybook:test` for select, field, dialog, patterns → PASS.
- [ ] **Step 4: Native-date sweep:**
  - enquiry form date → `DatePicker` (Controller, ISO string per R133);
  - the website kit booking dialog gets `<form noValidate>`, DatePicker, and phone validation (audit-foundations §Kits).

  The Task 2 lint gate must show 0 hits.
- [ ] **Step 5: Commits** `feat(ui): make select our own list instead of the native one`, `feat(storybook): use our date picker in the enquiry and booking forms`.

