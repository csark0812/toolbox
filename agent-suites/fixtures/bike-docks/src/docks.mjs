/** Bikes a rider can take from the dock right now. */
export function available(dock) {
  return dock.bikes.filter((bike) => bike.state !== 'broken').length
}

/** Empty spaces where a rider can return a bike. */
export const freeSpaces = (dock) => dock.capacity - dock.bikes.length

/** One status row per dock, by name. */
export function statusRows(docks) {
  return docks
    .map((dock) => ({ name: dock.name, bikes: available(dock), spaces: freeSpaces(dock) }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`

export const formatRow = (row) =>
  `${row.name.padEnd(20)}  ${plural(row.bikes, 'bike')}, ${plural(row.spaces, 'space')}`
