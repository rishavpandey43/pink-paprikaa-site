The brand's action button — pill, Poppins 700, Title Case; use `primary` once per view.

```jsx
<Button icon="shopping-bag" size="lg">Order Now</Button>
<Button variant="secondary">See Full Menu</Button>
<Button variant="ghost" iconAfter="arrow-right">Find a Paprikaa</Button>
```

Variants: `primary` (flooded pink + `--shadow-brand`), `secondary` (2px pink outline on white), `ghost`, `inverse` (ink). On a flooded pink panel pass `on="brand"` — primary flips to white-on-pink, secondary to a white outline. Press = 0.97 scale + darken; disabled is a real grey fill, not opacity.
