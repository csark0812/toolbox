// The whole library and twelve years of loans, generated the same way every time.
export function makeLibrary() {
  let seed = 20261021
  const next = () => (seed = (seed * 48271) % 2147483647)
  const pick = (list) => list[next() % list.length]
  const COMPOSERS = [
    'Dvořák, Antonín',
    'dvorak, antonin',
    'Elgar, Edward',
    'Holst, Gustav',
    'Fauré, Gabriel',
    'Vaughan Williams, Ralph',
    'Bach, J. S.',
    'Purcell, Henry',
    'Coleridge-Taylor, Samuel',
    'Smyth, Ethel',
    '',
    ' Mozart, Wolfgang Amadeus ',
  ]
  const FORMS = ['Serenade', 'Suite No.', 'Symphony No.', 'Overture', 'Dances, set', 'Mass No.']
  const pieces = []
  for (let i = 0; i < 2600; i++) {
    const piece = {
      id: `S${String(10000 + (next() % 90000))}-${i}`,
      title: `${pick(FORMS)} ${1 + (next() % 24)}`,
      parts: 4 + (next() % 30),
    }
    const composer = pick(COMPOSERS)
    if (composer !== '' || next() % 2) piece.composer = composer
    pieces.push(piece)
  }
  const BORROWERS = [
    'Wells Orchestra',
    'Frome Choral',
    'Taunton Sinfonia',
    'Bridgwater Strings',
    'Yeovil Singers',
  ]
  const loans = []
  for (let i = 0; i < 9000; i++) {
    const year = 2014 + (next() % 13)
    const month = Math.min(1 + (next() % 12), year === 2026 ? 10 : 12)
    const out = `${year}-${String(month).padStart(2, '0')}-${String(1 + (next() % 28)).padStart(2, '0')}`
    const due = `${year + (month > 9 ? 1 : 0)}-${String(((month + 2) % 12) + 1).padStart(2, '0')}-01`
    const returned = next() % 10 === 0 ? null : due
    loans.push({ piece: pick(pieces).id, borrower: pick(BORROWERS), out, due, returned })
  }
  return { pieces, loans, today: '2026-10-21' }
}
