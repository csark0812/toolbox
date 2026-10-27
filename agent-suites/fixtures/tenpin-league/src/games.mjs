/** One line of the games list. */
export function gameLine(game) {
  return `${game.night}  ${game.bowler.padEnd(11)} ${game.sheet.toUpperCase()}`
}
