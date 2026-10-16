import { env } from 'node:process'
import { fileURLToPath } from 'node:url'

export const TEAMS = fileURLToPath(new URL('../data/teams.json', import.meta.url))
export const pointsPath = () =>
  env.QUIZ_POINTS ?? fileURLToPath(new URL('../data/points.json', import.meta.url))
export const line = (entry) =>
  `${String(entry.place).padStart(2)}. ${entry.name.padEnd(24)} ${String(entry.points).padStart(3)}`
