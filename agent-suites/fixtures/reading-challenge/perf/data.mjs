// The whole county's challenge, generated the same way every time.
const FIRST = [
  'Amy',
  'amir',
  'Ben',
  'Cara',
  'dev',
  'Ella',
  'Finn',
  'Grace',
  'Hugo',
  'Isla',
  'Jay',
  'kofi',
  'Lena',
  'Milo',
  'Noor',
  'Omar',
  'Pia',
  'Rhys',
  'Sana',
  'Theo',
]
const LAST = [
  'Hart',
  'Khan',
  'Ode',
  'Lyle',
  'Shah',
  'Brook',
  'Moss',
  'Reid',
  'Vale',
  'Wynn',
  'Cole',
  'Doyle',
  'Ennis',
  'Frost',
  'Gill',
]
const hyphenate = (isbn) =>
  `${isbn.slice(0, 3)}-${isbn.slice(3, 4)}-${isbn.slice(4, 7)}-${isbn.slice(7, 12)}-${isbn.slice(12)}`

export function makeChallenge() {
  let seed = 20260718
  const next = () => (seed = (seed * 48271) % 2147483647)
  const books = Array.from({ length: 1200 }, (_, n) => {
    const isbn = `978${String(100000000 + n * 37).padStart(10, '0')}`
    return { isbn: n % 3 ? isbn : hyphenate(isbn), title: `Book ${n}`, pages: 24 + (next() % 400) }
  })
  const children = Array.from(
    { length: 900 },
    (_, n) =>
      `${FIRST[n % FIRST.length]} ${LAST[Math.floor(n / FIRST.length) % LAST.length]}${n >= 300 ? ` ${Math.floor(n / 300)}` : ''}`,
  )
  const logs = []
  for (let n = 0; n < 7000; n++) {
    let child = children[next() % children.length]
    if (next() % 9 === 0) child = `${child} `
    const book = next() % 1250
    const raw =
      book < 1200 ? books[book].isbn.replace(/-/g, '') : `9789${String(book).padStart(9, '0')}`
    const isbn =
      next() % 4 === 0
        ? hyphenate(raw)
        : next() % 5 === 0
          ? raw.replace(/(\d{3})(\d)/, '$1 $2 ')
          : raw
    const day = 12 + (next() % 56)
    const at = new Date(Date.UTC(2026, 6, day, 9 + (next() % 9), next() % 60))
    logs.push({ child, isbn, at: at.toISOString().slice(0, 16) })
  }
  return { logs, books }
}
