import assert from 'node:assert/strict'
import { test } from 'node:test'
import { table } from '../src/columns.mjs'
import { rss } from '../src/feeds/rss.mjs'
import { listingLine } from '../src/listing.mjs'
import { loadShows } from '../src/shows.mjs'
import { orderSummary } from '../src/tickets.mjs'

const shows = loadShows()

test('listing line', () => {
  assert.equal(
    listingLine(shows[0]),
    'Thu, Oct 15, 8:00 PM  Night Owls & Co. - $18  /shows/night-owls-co',
  )
  assert.match(listingLine(shows[1]), /SOLD OUT/)
})

test('order summary adds fees on paid shows', () => {
  assert.deepEqual(orderSummary(shows[3], 2).lines, [
    '2 x The Late Shift @ $15.05',
    'fees $3',
    'total $33.10',
  ])
  assert.equal(orderSummary(shows[2], 3).totalCents, 0)
})

test('door table and feed render every show', () => {
  assert.equal(table(shows).split('\n').length, shows.length + 1)
  assert.equal(rss(shows).match(/<item>/g).length, shows.length)
})
