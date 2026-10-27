// The lending catalogue for the county music library's sets of parts.

/** Composers are written "Surname, Forenames"; a set with none is traditional. */
export function composerOf(piece) {
  const name = (piece.composer ?? '').trim()
  return name === '' ? 'Trad.' : name
}

/** Catalogue order: composer, then title, ignoring case and accents and reading numbers as numbers. */
function byCatalogue(a, b) {
  const options = { sensitivity: 'base', numeric: true }
  return (
    composerOf(a).localeCompare(composerOf(b), 'en', options) ||
    a.title.localeCompare(b.title, 'en', options) ||
    (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
  )
}

/** Where a set is now. A loan with no return date is still out; if two are open, the later one counts. */
function statusOf(piece, loans, today) {
  const mine = loans.filter((loan) => loan.piece === piece.id)
  let current = null
  let lastLent = null
  for (const loan of mine) {
    if (lastLent === null || loan.out > lastLent) lastLent = loan.out
    if (loan.returned == null && (current === null || loan.out >= current.out)) current = loan
  }
  if (current === null)
    return { status: 'in', borrower: null, due: null, timesLent: mine.length, lastLent }
  return {
    status: current.due < today ? 'overdue' : 'out',
    borrower: current.borrower,
    due: current.due,
    timesLent: mine.length,
    lastLent,
  }
}

/** Every set in catalogue order with where it is on `today` ("YYYY-MM-DD"). */
export function catalogue(pieces, loans, today) {
  return [...pieces].sort(byCatalogue).map((piece) => ({
    id: piece.id,
    title: piece.title,
    composer: composerOf(piece),
    ...statusOf(piece, loans, today),
  }))
}
