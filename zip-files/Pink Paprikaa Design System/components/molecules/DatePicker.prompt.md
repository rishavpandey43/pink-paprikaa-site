Date field with our own calendar. Never use Input type="date".

    <DatePicker label="Date" min={todayISO} value={date} onChange={setDate} />

ISO strings in and out. Selected day sits in a pink brand diamond; today carries a small diamond under the number; past/blocked days are struck through. Weeks start Monday. Keys: arrows, PageUp/PageDown for months, Home/End for the week, Esc closes. Bottom sheet on phones. For times, use SlotPicker.
