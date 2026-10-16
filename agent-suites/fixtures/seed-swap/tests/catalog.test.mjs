import assert from 'node:assert/strict'
import { copyFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { beforeEach, test } from 'node:test'
import Catalog from '../src/catalog.mjs'
import { labels } from '../src/labels.mjs'
import { seasonReport } from '../src/report.mjs'

// Every test works on its own copy of the catalogue.
beforeEach(() => {
  const copy = join(mkdtempSync(join(tmpdir(), 'seeds-')), 'seeds.json')
  copyFileSync(new URL('../data/seeds.json', import.meta.url), copy)
  Catalog.file = pathToFileURL(copy)
})

test('search ignores case and spacing', () => {
  assert.deepEqual(
    Catalog.search('  tiger ').map((entry) => entry.variety),
    ['Tigerella'],
  )
})

test('lists a family', () => {
  assert.equal(Catalog.byFamily('fabaceae').length, 2)
})

test('adding the same variety and year tops up the stock line', () => {
  Catalog.add({ variety: 'tigerella', family: 'Solanaceae', donor: 'Ines', year: 2022, packets: 3 })
  assert.equal(Catalog.search('tigerella')[0].packets, 5)
  assert.throws(
    () => Catalog.add({ variety: 'X', family: 'Y', donor: 'Z', year: 2026, packets: 0 }),
    RangeError,
  )
})

test('takes the oldest seed first', () => {
  Catalog.add({ variety: 'Tigerella', family: 'Solanaceae', donor: 'Ines', year: 2025, packets: 3 })
  assert.equal(Catalog.withdraw('Tigerella', 3), 2)
  assert.deepEqual(
    Catalog.search('tigerella').map((entry) => [entry.year, entry.packets]),
    [[2025, 2]],
  )
  assert.throws(() => Catalog.withdraw('Tigerella', 9), /only 2 packets/)
})

test('report flags old seed', async () => {
  assert.ok((await seasonReport(2026)).includes('  Red Russian 2021: 1  (old seed)'))
})

test('labels', () => {
  assert.deepEqual(labels([{ variety: 'Red  Russian ' }, { variety: 'red russian' }]), [
    'RED RUSSIAN',
  ])
})
