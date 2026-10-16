#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'
import { checkDoor } from '../src/access.mjs'

const read = (file) => JSON.parse(readFileSync(new URL(`../data/${file}`, import.meta.url), 'utf8'))
const [badgeId, doorId] = argv.slice(2)
const badge = read('badges.json').find((entry) => entry.id === badgeId)
const door = read('doors.json').find((entry) => entry.id === doorId)
if (!badge || !door) {
  stderr.write('usage: door <badge id> <door id>\n')
  exit(2)
}
const allowed = checkDoor(badge, door)
stdout.write(`${badge.holder} at ${door.name}: ${allowed ? 'open' : 'denied'}\n`)
exit(allowed ? 0 : 1)
