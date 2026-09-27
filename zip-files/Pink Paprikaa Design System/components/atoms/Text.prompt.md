Every string of text goes through `Text` — it is the only place the type ramp is expressed.

```jsx
<Text variant="overline" tone="brand">The Menu</Text>
<Text variant="h2" fluid>Most ordered this week</Text>
<Text variant="body" tone="muted" measure="prose">We roast our own masala every morning.</Text>
```

12 variants: display-1/2, h1–h4, body-lg/body/body-sm, caption, overline, mono. Pass `fluid` in any responsive layout so headings clamp instead of overflowing. Display variants get `text-wrap: balance`, body gets `pretty`.
