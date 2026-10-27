/** One line of the results list. */
export function legLine(leg) {
  return `${leg.night}  ${leg.winner.padEnd(11)} beat ${leg.loser.padEnd(11)} ${leg.checkout.toUpperCase()}`
}
