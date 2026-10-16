import { readFileSync } from 'node:fs'

const hooks = JSON.parse(readFileSync(new URL('../config/hooks.json', import.meta.url), 'utf8'))

/** Run the store methods named for `phase` in config/hooks.json, one after another. */
export function runHooks(store, phase, cb) {
  const names = [...(hooks[phase] ?? [])]
  const step = (err) => {
    if (err) return cb(err)
    const name = names.shift()
    if (!name) return cb(null)
    store[name]((hookErr) => step(hookErr))
  }
  step(null)
}
