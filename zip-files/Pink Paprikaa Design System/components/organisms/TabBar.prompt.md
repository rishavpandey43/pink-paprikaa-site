The app's fixed bottom navigation — 64px, 4 or 5 destinations, never more.

```jsx
<TabBar value={tab} onChange={setTab} items={[
  { value: "home", label: "Home", icon: "house" },
  { value: "menu", label: "Menu", icon: "utensils" },
  { value: "cart", label: "Cart", icon: "shopping-bag", count: 2 },
  { value: "you", label: "You", icon: "user" },
]} />
```

Active destination is pink with a Poppins 700 label. Counts render as a pink pill on the icon.
