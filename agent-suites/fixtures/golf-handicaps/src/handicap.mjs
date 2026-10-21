const playerKey = (name) => name.trim().toLowerCase()
const byText = (a, b) => (a < b ? -1 : a > b ? 1 : 0)

/** A round's score differential in tenths of a stroke. */
export function differential(round, courses) {
  const course = courses.find((entry) => entry.name === round.course)
  if (!course) throw new Error(`Unknown course ${round.course} in round ${round.id}`)
  return Math.round(((round.gross * 10 - course.rating) * 113) / course.slope)
}

/** Each round's player index (in tenths) after that round, in the order the rounds are given. */
export function handicapHistory(rounds, courses) {
  return rounds.map((round) => {
    const upTo = rounds
      .filter(
        (other) =>
          playerKey(other.player) === playerKey(round.player) &&
          (new Date(other.date) < new Date(round.date) ||
            (other.date === round.date && byText(other.id, round.id) <= 0)),
      )
      .sort((a, b) => new Date(a.date) - new Date(b.date) || byText(a.id, b.id))
      .slice(-20)
    if (upTo.length < 3) return { round: round.id, index: null }
    const best = upTo
      .map((other) => differential(other, courses))
      .sort((a, b) => a - b)
      .slice(0, Math.max(1, Math.floor(upTo.length * 0.4)))
    return {
      round: round.id,
      index: Math.round(best.reduce((sum, value) => sum + value, 0) / best.length),
    }
  })
}
