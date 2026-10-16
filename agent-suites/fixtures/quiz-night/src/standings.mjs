import { promisify } from 'node:util'
import { loadPoints, loadTeams } from './teams.mjs'

const readTeams = promisify(loadTeams)
const readPoints = promisify(loadPoints)

/** Names and points sorted best first, with shared places for ties. */
export function placed(entries) {
  const sorted = [...entries].sort((a, b) => b.points - a.points || a.name.localeCompare(b.name))
  return sorted.map((entry, i) => ({
    ...entry,
    place: sorted.findIndex((other) => other.points === entry.points) + 1 || i + 1,
  }))
}

/** Running totals across every round. */
export async function totals(teamsPath, pointsPath) {
  const [teams, sheet] = await Promise.all([readTeams(teamsPath), readPoints(pointsPath)])
  return placed(
    teams.map((team) => ({
      name: team.name,
      points: Object.values(sheet.rounds).reduce((sum, round) => sum + (round[team.id] ?? 0), 0),
    })),
  )
}

/** One round's points. */
export async function roundResults(teamsPath, pointsPath, round) {
  const [teams, sheet] = await Promise.all([readTeams(teamsPath), readPoints(pointsPath)])
  const entries = sheet.rounds[round]
  if (!entries) throw new RangeError(`no points for round ${round}`)
  return placed(teams.map((team) => ({ name: team.name, points: entries[team.id] ?? 0 })))
}
