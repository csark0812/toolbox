import { fmtWhen, priceLabel, slug } from './util.mjs'

/** One line of the week's listing. */
export function listingLine(show) {
  const price = show.soldOut ? 'SOLD OUT' : priceLabel(show.priceCents)
  return `${fmtWhen(show.startsAt, show.timeZone)}  ${show.artist} - ${price}  /shows/${slug(show.artist)}`
}
