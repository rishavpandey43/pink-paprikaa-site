/**
 * The stretched-link card (MenuItemCard, OutletCard). The name's link covers the card with its
 * `::after`, so the card clicks through; its keyboard ring goes round the whole card and the link
 * drops its own. Put `card` on the card root (`relative` anchors the overlay) and `link` plus
 * `data-stretched-link` on the link: the card rings only for that link, never for an action link
 * that sits above it (OutletCard's Directions).
 */
export const STRETCHED_LINK = {
  card: "relative has-[[data-stretched-link]:focus-visible]:outline-2 has-[[data-stretched-link]:focus-visible]:outline-offset-2 has-[[data-stretched-link]:focus-visible]:outline-focus",
  link: "text-inherit no-underline after:absolute after:inset-0 focus-visible:outline-none",
} as const;
