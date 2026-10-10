Text-only action — toast/snackbar CTAs ("View Cart", "Undo"), inline card actions ("Edit", "Remove"), "View all" links that act rather than navigate.

    <Toast tone="brand" action="View Cart" onAction={openCart}>Added Chilli Paneer</Toast>
    <TextButton tone="neutral" icon="pencil">Edit</TextButton>

States: rest = just the word; hover = tinted pill + underline (not in caps); press = darker tint + scale 0.97; keyboard focus = 2px ring (white on dark/brand surfaces); disabled = dimmed, not-allowed; loading = spinner. Always set `on` to the surface: "light", "dark" (ink), or "brand" (pink or a status colour). Navigation goes to Link; a primary decision goes to Button.

The file also exports `usePress(disabled)` — the shared hover/press/focus-visible hook every pressable component in the system uses.
