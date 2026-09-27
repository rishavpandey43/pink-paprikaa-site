# UI kit — Pink Paprikaa ordering app

390×844 click-through, **composed from the component library**. Only two files
hold page-specific composition; every frame, list, cart and tracker is an
organism.

## Composition
| Screen | Component |
| --- | --- |
| Frame | `AppShell` (status bar, home indicator, overlay slot) |
| Navigation | `TabBar` |
| Home | `Screens.jsx` — `PatternField` + `SearchField` + `LoyaltyCard` + `FilterBar` + `MenuItemCard` |
| Menu | `MenuList` (list variant) |
| Item detail | `ItemSheet.jsx` — `Dialog sheet` + `Field` + `Radio` + `Checkbox` + `QuantityStepper` |
| Cart | `CartPanel` |
| Tracking | `OrderTracker` |
| Account | `Screens.jsx` — `Avatar` + `LoyaltyCard` + `ListRow` + `Switch` |
| Overlays | `Toast` |

## Flow to try
Home → tap a dish → customise in the sheet → Add to Order (`--ease-pop` toast) →
Cart tab → Pay → tracking advances "Order in → On the tandoor → Ready" → Back to Home.

## Not real yet
No Pink Paprikaa app was supplied, so this is a brand-faithful reconstruction of
the standard pickup-ordering flow. All imagery is a labelled `ImageSlot`.
