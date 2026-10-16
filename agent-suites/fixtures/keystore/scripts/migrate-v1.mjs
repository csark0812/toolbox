#!/usr/bin/env node
// One-off import of a v1 settings export (a flat JSON object) into a store file.
import { readFileSync } from 'node:fs'
import { argv, stdout } from 'node:process'

const [source, target] = argv.slice(2)
const { createStore } = await import('../src/store.mjs')
const store = createStore(target)
const entries = Object.entries(JSON.parse(readFileSync(source, 'utf8')))
let done = 0
const next = () => {
  if (done === entries.length) {
    store.compact((err, size) => {
      if (err) throw err
      stdout.write(`imported ${entries.length} settings, ${size} keys in store\n`)
    })
    return
  }
  const [key, value] = entries[done++]
  store.set(`setting:${key}`, value, (err) => {
    if (err) throw err
    next()
  })
}
next()
