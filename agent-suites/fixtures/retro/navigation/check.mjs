import assert from 'node:assert/strict'
import { exportStatus, legendStatus } from './status.mjs'

for (const status of [exportStatus, legendStatus]) {
  assert.equal(status.label, 'Paused')
  assert.equal(typeof status.color, 'string')
}
