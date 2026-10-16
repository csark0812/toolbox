#!/usr/bin/env node
import { argv, exit, stderr, stdout } from 'node:process'
import { COMMANDS } from '../src/commands/index.mjs'

const [name, ...args] = argv.slice(2)
if (!name || name === 'help') {
  stdout.write(
    Object.values(COMMANDS)
      .map((command) => `atlas ${command.summary}\n`)
      .join(''),
  )
  exit(name ? 0 : 2)
}
const command = COMMANDS[name]
if (!command) {
  stderr.write(`unknown command: ${name} (try atlas help)\n`)
  exit(2)
}
try {
  stdout.write(command.run(args).join('\n') + '\n')
} catch (error) {
  stderr.write(`${error.message}\n`)
  exit(1)
}
