Dropdown for short, known lists - outlet, table size, pickup slot. Our own trigger and list panel; the browser's popup never appears.

    <Select label="Pick your outlet" options={["Sector 57, Gurgaon"]} />
    <Select label="Guests" placeholder="Choose a size" error="Pick a table size." options={[...]} onValueChange={setGuests} />

Matches Input exactly - same heights, radius, status colours and messages (error / success / warning / disabled / readOnly). The status glyph replaces the chevron. onChange stays event-shaped (e.target.value) so old call sites keep working; onValueChange gives the bare value. Bottom sheet on phones. Over ~12 options, use Combobox.
