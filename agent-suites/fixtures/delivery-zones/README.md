# Delivery zones

Which van round an address belongs to, for the grocery co-op's home deliveries. A zone is a polygon drawn by the depot manager on the city grid (metres east and north of the depot), stored as a string of `x,y` corners. Zones may overlap; the list is in priority order and the first zone that contains an address wins. An address outside every zone gets `null`.

Containment uses the even-odd rule with a ray cast towards the east, exactly as the route planner has always done, including its treatment of points that sit on a zone's edge. Drivers have learnt those edge cases, so they must not change.

`npm run zone -- <x> <y>` prints the zone for one address. `npm run perf` times assigning a day's addresses on the full city map. `npm test` runs the tests.
