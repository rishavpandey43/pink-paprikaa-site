The only correct way to place the brand mark. Never rebuild, retype or recolour it.

```jsx
<Logo width={260} />                      {/* official lockup, tagline included */}
<Logo height={60} />                      {/* site header — lockup fits too */}
<Logo variant="symbol" tone="white" width={32} />
<Logo tone="badge" width={200} />         {/* white on a pink square */}
```

**Three variants.** `lockup` is the real logo — the tagline "India's First Desi Urban Café" is part of the artwork, so never set it in live type. **It is the default almost everywhere:** the tagline tucks into the white space beside the "P" descender, so the lockup and the wordmark share the same ~1.9:1 box and swapping one for the other costs no layout at all. Reach for `wordmark` — the same artwork with the tagline removed — only below about 120px of width, where the tagline drops under ~6px and turns to mud. `symbol` is the interlocked diamond mark alone — square, so it drops straight into a 1:1 slot for avatars, favicons, loaders and tight badges.

**Three tones.** `pink` on light surfaces, `white` on pink or ink, `badge` for white-on-pink-square (app icons, profile pictures, stickers).

Set `height` in horizontal chrome so the width follows the artwork; set `width` on marketing canvases. Never apply a CSS filter, drop shadow or opacity to the mark.
