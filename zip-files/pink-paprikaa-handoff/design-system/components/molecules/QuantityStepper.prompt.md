Quantity control for cart rows, item detail and add-ons.

```jsx
<QuantityStepper value={qty} onChange={setQty} min={1} />
```

Pill on `--pink-50` with a `--pink-200` hairline; count is Poppins 700. Use `min={0}` where reaching zero removes the line item, `min={1}` where it shouldn't.
