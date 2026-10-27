import { loadPlayers } from '../src/players.mjs'

const players = loadPlayers()
const columns = Object.keys(players[0])
console.log(columns.join(','))
for (const player of players) console.log(columns.map((column) => player[column]).join(','))
