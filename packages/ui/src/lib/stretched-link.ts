/**
 * The stretched-link card (MenuItemCard, OutletCard). The name's link covers the card with its
 * `::after`, so the card clicks through; its keyboard ring goes round the whole card and the link
 * drops its own. Put `card` on the card root (`relative` anchors the overlay), `data-stretched-link`
 * on the heading the card renders round the link, and `link` on the link. The card rings only for a
 * focus inside that heading, never for an action link above it (OutletCard's Directions). The
 * marker sits on the card's own element, so a router link that drops unknown props still rings.
 */
export const STRETCHED_LINK = {
  card: "relative has-[[data-stretched-link]_:focus-visible]:outline-2 has-[[data-stretched-link]_:focus-visible]:outline-offset-2 has-[[data-stretched-link]_:focus-visible]:outline-focus",
  link: "text-inherit no-underline after:absolute after:inset-0 focus-visible:outline-none",
} as const;
