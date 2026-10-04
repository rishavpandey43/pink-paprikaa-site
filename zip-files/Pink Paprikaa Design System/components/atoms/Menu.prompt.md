The one option panel. Select, Combobox and ActionMenu all render it, so every list in the product looks the same.

    <Menu inline role="listbox" value="paneer" items={[{ group: "Mains" }, { value: "paneer", label: "Chilli Paneer", meta: "₹280" }, { divider: true }, { value: "x", label: "Remove", icon: "trash-2", danger: true }]} />

Rows are 44px (52px in a sheet), --pink-50 on hover/keyboard focus, chosen row in --pink-700 with the brand diamond. Supports groups, dividers, icons, descriptions, trailing meta, disabled and danger rows. Keys: arrows, Home/End, Enter/Space, Tab closes, typing jumps.
