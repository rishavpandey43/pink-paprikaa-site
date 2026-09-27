Every card grid in the system.

    <AutoGrid min={240}>{items.map(i => <MenuItemCard key={i.name} {...i} />)}</AutoGrid>

Tracks are always minmax(0,1fr) so a long label wraps instead of widening the column - the single most common layout bug this prevents.
