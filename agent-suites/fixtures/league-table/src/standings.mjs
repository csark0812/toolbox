const played = (fixture) => fixture.homeGoals !== null && fixture.awayGoals !== null

/** One team's record over a list of fixtures. */
function recordFor(team, fixtures) {
  const row = { team, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 }
  for (const fixture of fixtures.filter((f) => f.home === team || f.away === team)) {
    if (!played(fixture)) continue
    const home = fixture.home === team
    const ours = home ? fixture.homeGoals : fixture.awayGoals
    const conceded = home ? fixture.awayGoals : fixture.homeGoals
    row.played++
    row.goalsFor += ours
    row.goalsAgainst += conceded
    if (ours > conceded) row.won++
    else if (ours === conceded) row.drawn++
    else row.lost++
  }
  row.goalDifference = row.goalsFor - row.goalsAgainst
  row.points = row.won * 3 + row.drawn
  return row
}

/** The table counting every played fixture up to and including `round`. */
export function standingsAfter(season, round) {
  const fixtures = JSON.parse(JSON.stringify(season.fixtures)).filter((f) => f.round <= round)
  const rows = season.teams.map((team) => recordFor(team, fixtures))
  rows.sort((a, b) => {
    const x = recordFor(a.team, fixtures)
    const y = recordFor(b.team, fixtures)
    return (
      y.points - x.points ||
      y.goalDifference - x.goalDifference ||
      y.goalsFor - x.goalsFor ||
      a.team.localeCompare(b.team)
    )
  })
  return rows.map((row, i) => ({ position: i + 1, ...row }))
}

/** The table after each round, from round 1 to the last. */
export function progression(season) {
  const last = Math.max(0, ...season.fixtures.map((f) => f.round))
  const tables = []
  for (let round = 1; round <= last; round++) tables.push(standingsAfter(season, round))
  return tables
}
