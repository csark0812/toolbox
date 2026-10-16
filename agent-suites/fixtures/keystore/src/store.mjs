import { appendFile, readFile, writeFile } from 'node:fs'

/** Replay a log into a Map of live keys. */
function replay(text) {
  const live = new Map()
  for (const line of text.split('\n')) {
    if (!line.trim()) continue
    const entry = JSON.parse(line)
    if (entry.op === 'set') live.set(entry.key, entry.value)
    else if (entry.op === 'del') live.delete(entry.key)
  }
  return live
}

/** An append-only key-value store backed by `file`. Every method takes a Node-style callback. */
export function createStore(file) {
  function load(cb) {
    readFile(file, 'utf8', (err, text) => {
      if (err && err.code === 'ENOENT') return cb(null, new Map())
      if (err) return cb(err)
      let live
      try {
        live = replay(text)
      } catch (parseError) {
        return cb(parseError)
      }
      cb(null, live)
    })
  }
  const append = (entry, cb) => appendFile(file, JSON.stringify(entry) + '\n', cb)
  return {
    get(key, cb) {
      load((err, live) => (err ? cb(err) : cb(null, live.get(key))))
    },
    set(key, value, cb) {
      if (value === undefined) return cb(new TypeError(`no value for ${key}`))
      append({ op: 'set', key, value }, cb)
    },
    del(key, cb) {
      load((err, live) => {
        if (err) return cb(err)
        if (!live.has(key)) return cb(null, false)
        append({ op: 'del', key }, (appendErr) => cb(appendErr ?? null, !appendErr))
      })
    },
    keys(cb) {
      load((err, live) => (err ? cb(err) : cb(null, [...live.keys()].sort())))
    },
    compact(cb) {
      load((err, live) => {
        if (err) return cb(err)
        const lines = [...live.keys()]
          .sort()
          .map((key) => JSON.stringify({ op: 'set', key, value: live.get(key) }) + '\n')
        writeFile(file, lines.join(''), (writeErr) => cb(writeErr ?? null, live.size))
      })
    },
  }
}
