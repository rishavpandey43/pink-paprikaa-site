### Task 15: Combobox, Fab, SpeedDial and DatePicker

**Files:**
- Create: `packages/ui/src/molecules/combobox/combobox.{tsx,test.tsx,stories.tsx}`
- Create: `packages/ui/src/atoms/fab/fab.{tsx,test.tsx,stories.tsx}`, `packages/design-tokens/tokens/component/fab.json`
- Create: `packages/ui/src/molecules/speed-dial/speed-dial.{tsx,test.tsx,stories.tsx}`
- Create: `packages/ui/src/molecules/date-picker/{date-picker,calendar}.tsx`, `date-picker.test.tsx`, `date-picker.stories.tsx`
- Modify: `packages/ui/package.json` via `pnpm add react-day-picker --filter @pink-paprikaa-web/ui`
- Create (if missing): `packages/ui/src/lib/format-date.ts` + `.spec.ts`

**Interfaces:**
```ts
// Combobox: WAI-ARIA 1.2 combobox, hand-built, single select
export interface ComboboxOption { value: string; label: string; description?: string | undefined; disabled?: boolean | undefined }
export interface ComboboxProps extends SxProp {
  options: readonly ComboboxOption[];
  value?: string | null | undefined; defaultValue?: string | null | undefined; onValueChange?: ((value: string | null) => void) | undefined;
  inputValue?: string | undefined; onInputChange?: ((text: string) => void) | undefined;
  filter?: ((option: ComboboxOption, text: string) => boolean) | undefined; // default: case- and diacritic-insensitive includes on label
  placeholder?: string | undefined; emptyMessage?: string | undefined;  // "No matches"
  isLoading?: boolean | undefined; loadingLabel?: string | undefined;   // "Loading…"
  isClearable?: boolean | undefined; clearLabel?: string | undefined;   // "Clear"
  name?: string | undefined; disabled?: boolean | undefined; status?: FieldStatus | undefined; id?: string | undefined;
  "aria-label"?: string | undefined; "aria-describedby"?: string | undefined; // Field wiring, like Select
}
// Fab
export interface FabProps extends BaseProps<"button"> {
  icon: IconComponent; label: string; isExtended?: boolean | undefined;
  size?: "md" | "lg" | undefined; variant?: "primary" | "secondary" | undefined;
  position?: "none" | "bottom-end" | "bottom-start" | undefined; asChild?: boolean | undefined;
}
// SpeedDial
export interface SpeedDialAction { icon: IconComponent; label: string; href?: string | undefined; target?: string | undefined; onSelect?: (() => void) | undefined }
export interface SpeedDialProps extends SxProp {
  label: string; icon?: IconComponent | undefined; actions: readonly SpeedDialAction[];
  direction?: "up" | "down" | "left" | "right" | undefined;
  open?: boolean | undefined; defaultOpen?: boolean | undefined; onOpenChange?: ((open: boolean) => void) | undefined;
  position?: "none" | "bottom-end" | "bottom-start" | undefined;
}
// Calendar + DatePicker (react-day-picker inside)
export interface CalendarProps extends SxProp {
  mode?: "single" | "range" | undefined; selected?: Date | DateRange | undefined; onSelect?: ((v: Date | DateRange | undefined) => void) | undefined;
  disabled?: Matcher | Matcher[] | undefined; fromDate?: Date | undefined; toDate?: Date | undefined;
  numberOfMonths?: 1 | 2 | undefined; // weekStartsOn fixed at 1 (Monday)
}
export interface DatePickerProps extends SxProp {
  value?: Date | null | undefined; defaultValue?: Date | null | undefined; onValueChange?: ((d: Date | null) => void) | undefined;
  placeholder?: string | undefined; // "Pick a date"
  disabled?: boolean | undefined; disabledDays?: Matcher | Matcher[] | undefined;
  name?: string | undefined; status?: FieldStatus | undefined; portalContainer?: HTMLElement | null | undefined;
  id?: string | undefined; "aria-describedby"?: string | undefined;
}
export function formatDate(d: Date): string; // en-IN "Sat, 4 Oct 2026"
export function toIsoDate(d: Date): string;  // "2026-10-04" (local), for the hidden input
```

- [ ] **Step 1: Combobox tests (RED).** Fixture `DISHES` = 12 veg dishes (Paneer Tikka, Paneer Butter Masala, Dal Makhani, Chole Bhature, Masala Dosa, Pav Bhaji, Veg Biryani, Malai Kofta, Aloo Paratha, Gulab Jamun, Rasmalai, Kulfi).

```tsx
it("filters as you type and selects with ArrowDown + Enter", async () => {
  const user = userEvent.setup(); const onValueChange = vi.fn();
  render(<Combobox aria-label="Search dishes" options={DISHES} onValueChange={onValueChange} />);
  const input = screen.getByRole("combobox", { name: "Search dishes" });
  await user.type(input, "pan");
  expect(input).toHaveAttribute("aria-expanded", "true");
  expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Paneer Tikka", "Paneer Butter Masala"]);
  await user.keyboard("{ArrowDown}");
  expect(input).toHaveAttribute("aria-activedescendant", screen.getAllByRole("option")[0]!.id);
  await user.keyboard("{Enter}");
  expect(onValueChange).toHaveBeenCalledWith("paneer-tikka");
  expect(input).toHaveValue("Paneer Tikka");
  expect(input).toHaveAttribute("aria-expanded", "false");
});
it("matches without case or accents", async () => { /* type "DAL" → Dal Makhani */ });
it("Escape closes, a second Escape clears the text", async () => {});
it("shows the empty message and the loading state", () => {});
it("clear button resets value and text, and refocuses the input", async () => {});
it("disabled options are skipped by arrows and cannot be clicked", async () => {});
it("submits the value through a hidden input", () => { /* name="dish" → input[type=hidden][name=dish] value */ });
it("is accessible open and closed", async () => {});
```
Write every stub out fully in the same style. Run → FAIL.

- [ ] **Step 2: Implement Combobox.** An input with `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded`, `aria-controls` → the listbox id, and `aria-activedescendant` → the active option id. The listbox is a `ul role="listbox"` of `li role="option" aria-selected id=…`, positioned absolutely under the input with the Popover panel classes. The input look comes from `lib/field-control` (same as Input/Select). Matches are highlighted with `<mark className="bg-transparent font-semibold text-text-heading">`. The diacritic-insensitive match is `s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()`. Keyboard: ArrowDown (open/next, skip disabled), ArrowUp, Home/End (in the list), Enter (commit), Escape (close, then clear), Tab (commit the active option, close). Clicking an option commits it, and pointerdown on the list doesn't blur the input. → PASS. Stories: `Playground`, `WithDescriptions`, `Loading`, `Empty`, `DisabledOptions`, `InFieldWithError` (inside `Field`, label "Dish", error message), `Controlled`, `Mobile360`. Play: type "pan" → ArrowDown → Enter → value shown. Commit `feat(ui): add the combobox molecule`.

- [ ] **Step 3: Fab tests (RED):**

```tsx
it("is named by its label; the label shows only when extended", () => {
  const { rerender } = render(<Fab icon={Phone} label="Call us" />);
  expect(screen.getByRole("button", { name: "Call us" })).toBeInTheDocument();
  expect(screen.queryByText("Call us", { selector: "span:not(.sr-only)" })).toBeNull();
  rerender(<Fab icon={Phone} label="Call us" isExtended />);
  expect(screen.getByText("Call us", { selector: "span:not(.sr-only)" })).toBeVisible();
});
it.each([["bottom-end", "end-4"], ["bottom-start", "start-4"]] as const)("position %s is fixed on that corner", (position, cls) => {
  render(<Fab icon={Phone} label="Call us" position={position} />);
  expect(screen.getByRole("button")).toHaveClass("fixed", cls);
});
it("asChild renders a link", () => {
  render(<Fab icon={Phone} label="Call us" asChild><a href="tel:+911244000000" /></Fab>);
  expect(screen.getByRole("link", { name: "Call us" })).toHaveAttribute("href", "tel:+911244000000");
});
```
Run → FAIL. Implement: round (`rounded-pill`), size tokens `fab-md` = 48px and `fab-lg` = 56px (`fab.json`, spacing namespace, utility marker), `shadow-4`, primary = brand fill + `text-ink-000`, secondary = `bg-surface-card text-text-brand`. Fixed positions: `fixed bottom-4 end-4` (bottom-end) or `fixed bottom-4 start-4` (bottom-start), `z-dock`. No arbitrary values: if a `dock-clearance` spacing token exists in `lib/component-variants.ts` SPACING, add `mb-dock-clearance` so the Fab clears ActionDock/TabBar. Otherwise ledger a Ruling and keep `bottom-4`. Stories: `Playground`, `Variants`, `Extended`, `Positions` (in a framed `relative` box with `position="none"` + a fixed demo in its own story with `layout: "fullscreen"`), `AsLink`. Commit `feat(ui): add the fab atom`.

- [ ] **Step 4: SpeedDial tests (RED):**

```tsx
const ACTIONS = [
  { icon: Phone, label: "Call", href: "tel:+911244000000" },
  { icon: MessageCircle, label: "WhatsApp", href: "https://wa.me/911244000000", target: "_blank" },
  { icon: MapPin, label: "Directions", onSelect: vi.fn() },
];
it("toggles open with aria-expanded and shows its actions", async () => {
  const user = userEvent.setup();
  render(<SpeedDial label="Contact us" actions={ACTIONS} />);
  const trigger = screen.getByRole("button", { name: "Contact us" });
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  await user.click(trigger);
  expect(trigger).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByRole("link", { name: "Call" })).toBeVisible();
  expect(screen.getByRole("link", { name: /WhatsApp.*Opens in a new tab/ })).toBeVisible();
});
it("arrows move between actions, Escape closes and refocuses the trigger", async () => {});
it("onSelect fires and closes the dial", async () => {});
it("is accessible open", async () => {});
```
Write the stubs out. Run → FAIL. Implement: the trigger is a Fab (`aria-expanded`, `aria-controls` → the list id) whose icon rotates 45° when open (`motion-safe:`). Actions are a `ul role="list"` of small round buttons or links (Fab size md, variant secondary) each with a visible label chip (sr-only label always present), laid out by `direction` (flex-col-reverse for up, etc.). Click outside closes (pointerdown listener on document while open). Arrow keys move focus within the actions. Escape closes and focuses the trigger (`useFocusReturn`). New-tab actions append the R44 sr-only "(Opens in a new tab)". → PASS. Stories: `Playground` (Call, WhatsApp, Directions), `Directions` (up/down/left/right), `Controlled`, `Mobile360` with `position="bottom-end"`. Commit `feat(ui): add the speed dial molecule`.

- [ ] **Step 5: DatePicker.** Run `pnpm add react-day-picker --filter @pink-paprikaa-web/ui`. Write `format-date.spec.ts` first:

```ts
import { formatDate, toIsoDate } from "./format-date";
it("formats en-IN with weekday", () => expect(formatDate(new Date(2026, 9, 4))).toBe("Sat, 4 Oct 2026"));
it("iso date is local, not UTC-shifted", () => expect(toIsoDate(new Date(2026, 9, 4, 23, 30))).toBe("2026-10-04"));
```
→ FAIL → implement with `new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })` (strip any comma differences so the test string holds) and manual `yyyy-mm-dd` from the local getters → PASS.

- [ ] **Step 6: DatePicker tests (RED):**

```tsx
it("opens the calendar, picks a day with the keyboard, shows it formatted and submits ISO", async () => {
  const user = userEvent.setup(); const onValueChange = vi.fn();
  render(<DatePicker aria-label="Booking date" name="date" defaultValue={new Date(2026, 9, 4)} onValueChange={onValueChange} />);
  await user.click(screen.getByRole("button", { name: /Booking date/ }));
  expect(screen.getByRole("grid")).toBeVisible();
  await user.keyboard("{ArrowRight}{Enter}");
  expect(onValueChange).toHaveBeenCalledWith(new Date(2026, 9, 5));
  expect(screen.getByRole("button", { name: /Booking date/ })).toHaveTextContent("Sun, 5 Oct 2026");
  expect(document.querySelector('input[type=hidden][name="date"]')).toHaveValue("2026-10-05");
});
it("disabled days cannot be chosen", async () => { /* disabledDays={{ dayOfWeek: [1] }} (Mondays) → aria-disabled on a Monday cell */ });
it("Escape closes and returns focus to the trigger", async () => {});
it("Calendar range mode selects a start and an end", async () => {});
it("is accessible open", async () => {});
```
Write the stubs out. Run → FAIL.

- [ ] **Step 7: Implement Calendar + DatePicker.** `Calendar` wraps `DayPicker` with `weekStartsOn={1}` and a `classNames` map built ONLY from token classes (day = `size-10 rounded-md text-body-sm`, selected = `bg-pink-500 text-ink-000`, today = `font-bold text-text-brand`, range middle = `bg-surface-brand-soft`, disabled = `text-ink-400 line-through`, nav buttons = IconButton look). Do not import react-day-picker's CSS. `DatePicker` = a trigger button with the field-control look (CalendarDays icon, value via `formatDate` or the placeholder) + Popover (Task 14) holding the Calendar + a hidden input `toIsoDate`. Field wiring as in Select. → PASS. Stories: `CalendarSingle`, `CalendarRange`, `CalendarDisabledDays` (past + Mondays), `TwoMonths`, `DatePickerPlayground`, `InFieldWithError`, `Mobile360`. Plays: open, arrow keys, Enter, the formatted value, Escape → focus. Commit `feat(ui): add the date picker and calendar`.

- [ ] **Step 8:** Export everything from index.ts (atoms, molecules, alphabetical). Run `pnpm nx run storybook:test -- combobox fab speed-dial date-picker` → PASS.

---

