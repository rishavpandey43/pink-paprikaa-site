Exactly-one choice — portion size, spice level, payment method.

```jsx
<Radio name="size" label="Regular" price={280} checked onChange={pick} />
<Radio name="size" label="Sharing" price={440} onChange={pick} />
```

Group with a 12px gap and always pass a shared `name`. The dot is drawn as a 6px pink ring — do not swap in a filled circle.
