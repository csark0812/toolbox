import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { test } from 'node:test'

const run = (script, ...args) =>
  execFileSync(process.execPath, [script, ...args], { encoding: 'utf8' })

test('the till prints each pumpkin and a total', () => {
  const out = run('bin/till.mjs', 'carving', '4.2', 'crown', '2.8')
  assert.match(out, /carving\s+4\.20 kg\s+£5\.00/)
  assert.match(out, /TOTAL\s+£10\.00/)
})

test('receipts treat a sale with no variety as carving', () => {
  const out = run('bin/receipts.mjs')
  assert.match(out, /Receipt S-0103/)
  assert.match(out, /pumpkin\s+5\.35 kg\s+£6\.40/)
})
