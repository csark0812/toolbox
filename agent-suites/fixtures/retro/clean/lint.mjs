import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { URL } from 'node:url'

const source = readFileSync(new URL('src/session.mjs', import.meta.url), 'utf8')
assert.doesNotMatch(source, /\bvar\s+/, 'Use const or let declarations')
