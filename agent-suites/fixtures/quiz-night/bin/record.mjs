#!/usr/bin/env node
import { argv, exit, stderr, stdout } from 'node:process'
import { pointsPath, TEAMS } from '../src/paths.mjs'
import { withRetry } from '../src/retry.mjs'
import { loadPoints, loadTeams, savePoints } from '../src/teams.mjs'

const [round, teamId, pointsText] = argv.slice(2)
const points = Number(pointsText)
if (!/^\d+$/.test(round ?? '') || !teamId || !Number.isInteger(points) || points < 0) {
  stderr.write('usage: record <round> <team id> <points>\n')
  exit(2)
}
const fail = (error) => {
  stderr.write(`record: ${error.message}\n`)
  exit(1)
}
loadTeams(TEAMS, (error, teams) => {
  if (error) return fail(error)
  const team = teams.find((entry) => entry.id === teamId)
  if (!team) return fail(new Error(`unknown team "${teamId}"`))
  const file = pointsPath()
  loadPoints(file, (error, sheet) => {
    if (error) return fail(error)
    sheet.rounds[round] = { ...sheet.rounds[round], [team.id]: points }
    withRetry(savePoints, [file, sheet], 3, (error) => {
      if (error) return fail(error)
      stdout.write(`Round ${round}: ${team.name} ${points}\n`)
    })
  })
})
