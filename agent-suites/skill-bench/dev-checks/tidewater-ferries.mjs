// Development check for the ferry page: brand file untouched, all routes and fares shown.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { checkPage } from './visual-page.mjs'
const root = process.argv[2]
assert.equal(
  readFileSync(join(root, 'brand.css'), 'utf8'),
  readFileSync(new URL('../../fixtures/tidewater-ferries/brand.css', import.meta.url), 'utf8'),
  'brand.css unchanged',
)
await checkPage(root, 'index.html', {
  mustShow: [
    /St Mawes/,
    /Flushing/,
    /Place/,
    /7[.,]50/,
    /12[.,]00|£12\b/,
    /55/,
    /No winter service|April to October/i,
    /3 November/,
  ],
})
