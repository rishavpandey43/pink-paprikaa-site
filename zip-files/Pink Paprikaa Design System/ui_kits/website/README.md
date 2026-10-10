# UI kit — Pink Paprikaa website

The marketing site at 1440px, **composed entirely from the component library** —
this kit contains no layout of its own beyond two brand-specific sections.

## Composition
| Band | Component |
| --- | --- |
| Masthead | `SiteHeader` |
| Hero | `HeroBanner` |
| Menu | `MenuList` (grid variant) |
| Story | `Sections.jsx` — `Section` + `ImageSlot` + `Stat` + `SpiceLevel` |
| Proof | `StatBand` |
| Reviews | `TestimonialWall` |
| Outlets | `Sections.jsx` — `FilterBar` + `AutoGrid` + `OutletCard` |
| FAQ | `FaqSection` |
| Franchise | `CtaBand` |
| Footer | `SiteFooter` |
| Overlays | `Toast`, `Dialog`, `Select`, `DatePicker`, `SlotPicker`, `Input`, `Field` |

`Sections.jsx` holds only Story and Outlets, because those two compositions are
specific to this page rather than reusable organisms.

## Interactions
- Category filters actually filter the menu.
- Adding a dish increments the header cart and pops an `--ease-pop` `Toast`.
- The header goes translucent past 24px of scroll.
- "Book a Table" opens a `Dialog` (`<form noValidate>`): Outlet and Guests (`Select`), Date (`DatePicker`, min today), Time (`SlotPicker`), Mobile (`Input`, validated in code — empty and short-number messages), then a two-step confirm.
- Every control has hover, press, focus and disabled states; no browser-native pickers or validation bubbles appear.

## Not real yet
No Pink Paprikaa site was supplied, so this is a brand-faithful reconstruction,
not a copy. Every image is an `ImageSlot` labelled with the crop it needs.
