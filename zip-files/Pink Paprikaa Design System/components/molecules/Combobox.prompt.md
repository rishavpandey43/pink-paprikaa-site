Type-to-filter dropdown for long lists - dishes, localities, corporate accounts.

    <Combobox label="Add a dish" options={DISHES} value={dish} onChange={setDish} />

Same field shell as Input/Select. Matches are bolded in --pink-700; empty results show emptyText in our voice. onChange receives the value, not an event. Always a popover (never a sheet) so the keyboard stays up on phones.
