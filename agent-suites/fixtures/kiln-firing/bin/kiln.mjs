#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'

const COMMANDS = {
  plan: '../src/commands/plan.mjs',
  log: '../src/commands/log.mjs',
  total: '../src/commands/total.mjs',
}
const [command, ...args] = argv.slice(2)
if (!COMMANDS[command]) {
  stderr.write(`usage: kiln <${Object.keys(COMMANDS).join('|')}> [args]\n`)
  exit(2)
}
const read = (name) => JSON.parse(readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8'))
const { default: run } = await import(new URL(COMMANDS[command], import.meta.url))
try {
  stdout.write(run(read('programs.json'), args, read('firings.json')).join('\n') + '\n')
} catch (error) {
  stderr.write(`kiln: ${error.message}\n`)
  exit(1)
}
