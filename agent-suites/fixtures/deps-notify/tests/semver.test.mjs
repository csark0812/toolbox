import assert from 'node:assert/strict'
import { test } from 'node:test'
import { compare, parse } from '../src/semver.mjs'

test('parses versions', () => {
  assert.deepEqual(parse('1.2.3'), { major: 1, minor: 2, patch: 3, prerelease: null })
  assert.deepEqual(parse('2.0.0-rc.1'), { major: 2, minor: 0, patch: 0, prerelease: 'rc.1' })
  assert.throws(() => parse('1.2'), TypeError)
})

test('compares versions', () => {
  assert.ok(compare('1.10.0', '1.9.9') > 0)
  assert.ok(compare('2.0.0-rc.1', '2.0.0') < 0)
  assert.equal(compare('1.2.3', '1.2.3'), 0)
})
