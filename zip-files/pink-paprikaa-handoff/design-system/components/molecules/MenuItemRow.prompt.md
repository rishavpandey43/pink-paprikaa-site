The menu list row — no card, just a `--border-subtle` hairline between items.

```jsx
<MenuItemRow name="Paprikaa Chilli Paneer" nameDevanagari="पनीर" price={280} spice={3}
  description="Amritsari paneer, burnt chilli mayo, potato brioche." badge="Bestseller" onAdd={add} />
```

Always pass `diet`. Omit `image` and a labelled light-pink placeholder appears — no supplied photography exists yet. Use `MenuItemCard` for grids and rails instead.
