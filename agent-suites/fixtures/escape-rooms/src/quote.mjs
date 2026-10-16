export const MIN_PLAYERS = 2
export const MAX_PLAYERS = 10

export const money = (pence) => `${pence < 0 ? '-' : ''}£${(Math.abs(pence) / 100).toFixed(2)}`

/** A booking's charges as lines ({ label, pence }) and the total in pence. */
export function quote(room, players) {
  if (!Number.isInteger(players) || players < MIN_PLAYERS || players > MAX_PLAYERS)
    throw new RangeError(`rooms take ${MIN_PLAYERS} to ${MAX_PLAYERS} players, not ${players}`)
  const lines = [
    { label: `${players} players x ${money(room.pence)}`, pence: players * room.pence },
  ]
  return { lines, total: lines.reduce((sum, line) => sum + line.pence, 0) }
}
