Low-level floating surface. Reach for Select, Combobox, DatePicker or ActionMenu first; use Popover directly only for a custom panel (a filter sheet, a share card).

    <div style={{ position: "relative" }}>
      <Button onClick={() => setOpen(true)}>Share</Button>
      <Popover open={open} onClose={() => setOpen(false)} title="Share">...</Popover>
    </div>

Anchors to its parent element, flips above when there is no room, closes on outside press and Esc. sheet="auto" turns it into a bottom sheet at 640px and below. Floats with position: fixed, so it escapes overflow: hidden (Dialog) but not a transformed ancestor.
