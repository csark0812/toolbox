import { FIELDS, loadPlayers, principals, sortPlayers } from '../src/players.mjs'

const args = process.argv.slice(2)
const by = args.includes('--by') ? args[args.indexOf('--by') + 1] : 'name'
const players = args.includes('--principals') ? principals(loadPlayers()) : loadPlayers()
const seat = FIELDS[2]
const label = seat[0].toUpperCase() + seat.slice(1)
try {
  for (const player of sortPlayers(players, by))
    console.log(`${player.name.padEnd(12)}${player.section.padEnd(8)}${label} ${player[seat]}`)
} catch (error) {
  console.error(error.message)
  process.exit(2)
}
