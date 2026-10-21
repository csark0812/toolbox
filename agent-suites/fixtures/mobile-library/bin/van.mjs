import { argv, exit } from 'node:process'

const [name, ...args] = argv.slice(2)
const library = await import('../src/library.mjs')
const command = /^[a-z]+$/.test(name ?? '') ? library[`${name}Command`] : undefined
if (typeof command !== 'function') {
  console.error(`Unknown command: ${name ?? ''}`.trimEnd())
  console.error('Commands: run, stop, holds, week')
  exit(1)
}
try {
  console.log(await command(args))
} catch (error) {
  console.error(error.message)
  exit(1)
}
