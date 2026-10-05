import assert from 'node:assert/strict'
import { sessionLabel } from './src/session.mjs'

assert.equal(sessionLabel('a'), 'Session a')
