import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { legacyImport } from '../src/legacy-import.mjs'

test('reads the old spreadsheet export', () => {
  const file = join(mkdtempSync(join(tmpdir(), 'pantry-')), 'old.csv')
  writeFileSync(file, '# name;amount;unit;date\nrice;2;kg;01/03/2025\n')
  assert.deepEqual(legacyImport(file), [{ name: 'rice', quantity: '2 kg', expires: '2025-03-01' }])
})
