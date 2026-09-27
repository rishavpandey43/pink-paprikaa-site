Pickup and table-booking time slots.

```jsx
<SlotPicker label="Pickup time" value={slot} onChange={setSlot}
  slots={[{value:"asap",label:"ASAP",note:"12 min"},"7:30pm",{value:"8pm",label:"8:00pm",disabled:true}]} />
```

Auto-fit grid at 96px minimum so it reflows on any width; sold-out slots are struck through, not hidden.
