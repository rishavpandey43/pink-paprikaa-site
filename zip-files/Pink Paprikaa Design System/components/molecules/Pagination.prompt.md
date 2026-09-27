Paging for press, blog and careers listings. Wraps rather than overflowing on mobile.

```jsx
<Pagination page={2} pages={9} onChange={setPage} />
```

Current page is a flooded pink pill; the rest are white with a 1px `--border-default`. Ellipses appear past ±1 of the current page.
