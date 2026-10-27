/** The day and time an outing starts, as shown on the board. */
const when = (outing) => outing.start.replace('T', '  ')

/** Lines of the boathouse board, in start order. */
export function board(outings) {
  return [...outings]
    .sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0))
    .map((outing) => `${when(outing)}  ${outing.boat.padEnd(8)}${outing.class}`)
}
