const POINTS = [10, 8, 6, 5, 4, 3, 2, 1]
const BEST = 10

const tidy = (name) => name.trim().replace(/\s+/g, ' ').toLowerCase()

/** The registered team a name on the answer sheet belongs to, by its name or one of its aliases. */
function registered(teams, name) {
  return teams.find(
    (team) =>
      tidy(team.name) === tidy(name) ||
      (team.aliases ?? []).some((alias) => tidy(alias) === tidy(name)),
  )
}

/** Each registered team's score and place on one night. A later sheet for a team replaces an earlier one. */
function nightResults(teams, night) {
  const latest = []
  for (const entry of night.entries) {
    const team = registered(teams, entry.team)
    if (!team) continue
    let score = entry.rounds.reduce((sum, points) => sum + points, 0)
    if (Number.isInteger(entry.joker) && entry.joker >= 1 && entry.joker <= entry.rounds.length)
      score += entry.rounds[entry.joker - 1]
    const earlier = latest.findIndex((result) => result.team === team.name)
    if (earlier >= 0) latest.splice(earlier, 1)
    latest.push({ team: team.name, score })
  }
  return latest.map((result) => ({
    ...result,
    place: 1 + latest.filter((other) => other.score > result.score).length,
  }))
}

/** The season's league table. */
export function standings(teams, nights) {
  const ordered = [...nights].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
  return teams
    .map((team) => {
      const results = []
      for (const night of ordered) {
        const mine = nightResults(teams, night).find((result) => result.team === team.name)
        if (mine)
          results.push({
            points: POINTS[Math.min(mine.place, POINTS.length) - 1],
            quiz: mine.score,
            won: mine.place === 1,
          })
      }
      const counted = [...results].sort((a, b) => b.points - a.points).slice(0, BEST)
      return {
        team: team.name,
        played: results.length,
        points: counted.reduce((sum, result) => sum + result.points, 0),
        quiz: counted.reduce((sum, result) => sum + result.quiz, 0),
        wins: results.filter((result) => result.won).length,
      }
    })
    .sort(
      (a, b) =>
        b.points - a.points || b.quiz - a.quiz || b.wins - a.wins || a.team.localeCompare(b.team),
    )
}
