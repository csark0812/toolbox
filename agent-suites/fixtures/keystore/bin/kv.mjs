#!/usr/bin/env node
import { argv, exit, stderr, stdout } from 'node:process'
import { runHooks } from '../src/hooks.mjs'
import { createStore } from '../src/store.mjs'

// command -> [store method, number of arguments, how to print the result]
const COMMANDS = {
  get: ['get', 1, (value) => (value === undefined ? '(not set)' : JSON.stringify(value))],
  set: ['set', 2, () => 'ok'],
  del: ['del', 1, (removed) => (removed ? 'deleted' : '(not set)')],
  keys: ['keys', 0, (keys) => keys.join('\n')],
}

let args = argv.slice(2)
let file = 'data/kiosk.log'
if (args[0] === '--file') {
  file = args[1]
  args = args.slice(2)
}
const [command, ...rest] = args
const spec = COMMANDS[command]
if (!spec || rest.length !== spec[1]) {
  stderr.write('usage: kv [--file <log>] get <key> | set <key> <json> | del <key> | keys\n')
  exit(2)
}
const [method, , print] = spec
const store = createStore(file)
const values = command === 'set' ? [rest[0], JSON.parse(rest[1])] : rest
const fail = (err) => {
  stderr.write(`${err.message}\n`)
  exit(1)
}
runHooks(store, 'beforeCommand', (hookErr) => {
  if (hookErr) return fail(hookErr)
  store[method](...values, (err, result) => {
    if (err) return fail(err)
    runHooks(store, 'afterCommand', (afterErr) => {
      if (afterErr) return fail(afterErr)
      stdout.write(`${print(result)}\n`)
    })
  })
})
