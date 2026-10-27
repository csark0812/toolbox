// Lots in the club's postal auction. Bids are written as they appear on the bid sheet, like "£12".

export function lotLine(lot) {
  return `Lot ${lot.lot}: ${lot.title} (top bid ${lot.topBid}, closes ${lot.closes})`
}
