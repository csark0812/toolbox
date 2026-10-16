#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'
import { splits } from '../src/splits.mjs'
import { summary } from '../src/summary.mjs'
import { render } from '../src/template.mjs'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const runs = JSON.parse(read('data/runs.json'))
const profile = JSON.parse(read('data/profile.json'))
const args = argv.slice(2)
const unitsAt = args.indexOf('--units')
const units = unitsAt === -1 ? profile.units : args.splice(unitsAt, 2)[1]
const [command, id] = args
const find = () => runs.find((run) => run.id === id) ?? fail(`no run ${id}`)
function fail(message) {
  stderr.write(`${message}\n`)
  exit(1)
}
let lines
if (command === 'summary') lines = summary(runs, units)
else if (command === 'splits') lines = splits(find(), units)
else if (command === 'weekly')
  lines = [render(read('templates/weekly.txt'), { name: profile.name, runs }).trimEnd()]
else if (command === 'share') {
  const { shareText } = await import('../src/share.mjs')
  lines = [await shareText(find(), units)]
} else fail('usage: runlog summary|splits <id>|weekly|share <id> [--units km|mi]')
stdout.write(lines.join('\n') + '\n')
