# P6-D — Combobox (MUI Autocomplete)

**Files:** `packages/ui/src/molecules/combobox/combobox.{tsx,test.tsx,stories.tsx}`. No new dependency: build the WAI-ARIA 1.2 combobox pattern (input `role="combobox"` + `aria-expanded` + `aria-controls` + `aria-activedescendant`; popup `role="listbox"` of `role="option"`). Reuse the Input atom's look via `lib/field-control` and position the listbox with the Popover panel styles (P6-C tokens) or a simple absolute panel under the input.

Props: `options: { value: string; label: string; description?: string; disabled?: boolean }[]`, `value?/defaultValue?/onValueChange?` (single), `inputValue?/onInputChange?`, `filter?` (default case-insensitive "includes", diacritic-insensitive), `placeholder?`, `emptyMessage?` (chrome label "No matches"), `isLoading?` (Spinner + "Loading…"), `isClearable?` (clear IconButton "Clear"), `disabled`, `name` (hidden input for forms), `status?`/`message?` like Select. Works inside `Field` (label/description/error wiring like Select).

Keyboard: ArrowDown opens/moves, ArrowUp moves, Enter selects, Escape closes (second Escape clears), Home/End inside list, Tab commits. Mouse select. Matching text highlighted with `<mark>` (token colour).

Stories: Playground (dish search over 12 veg dishes), WithDescriptions, Loading, Empty, Disabled options, InField with error, Controlled, Mobile360. Plays: type "pan" → options filter → ArrowDown + Enter selects "Paneer Tikka"; Escape behaviour.
Tests: ARIA attributes, filtering, keyboard paths, onValueChange, the clear button, the hidden input value, empty + loading states, axe.
