import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { test } from 'node:test'
import { describePair, loadPalette } from '../src/palette.mjs'

test('loads a palette', () => {
  const palette = loadPalette(new URL('../palettes/night.json', import.meta.url))
  assert.equal(palette.pairs.length, 3)
  assert.equal(describePair(palette.pairs[0]), 'body text: #e6e9ee on #12161c')
})

test('lists the pairs', () => {
  const run = spawnSync(process.execPath, ['bin/audit.mjs', 'palettes/night.json'], {
    cwd: new URL('..', import.meta.url),
    encoding: 'utf8',
  })
  assert.equal(run.status, 0)
  assert.match(run.stdout, /^Night\n {2}body text: #e6e9ee on #12161c\n/)
})
