export const CHALLENGE = { from: '2026-07-18', to: '2026-08-31' }
const MEDALS = [
  [20, 'gold'],
  [12, 'silver'],
  [6, 'bronze'],
]

const isbnKey = (isbn) => isbn.replace(/[\s-]/g, '')

/** The challenge leaderboard: one row per child with a counted book, best first. */
export function leaderboard(logs, books, { from, to } = CHALLENGE) {
  const children = [...new Set(logs.map((log) => log.child.trim()))]
  const rows = children.map((child) => {
    const mine = logs
      .filter((log) => log.child.trim() === child)
      .sort((a, b) => new Date(a.at) - new Date(b.at))
    const seen = []
    let pages = 0
    let last = null
    for (const log of mine) {
      const day = log.at.slice(0, 10)
      if (day < from || day > to) continue
      const key = isbnKey(log.isbn)
      if (seen.includes(key)) continue
      const book = books.find((entry) => isbnKey(entry.isbn) === key)
      if (!book) continue
      seen.push(key)
      pages += book.pages
      last = log.at
    }
    const medal = MEDALS.find(([least]) => seen.length >= least)?.[1] ?? null
    return { child, books: seen.length, pages, last, medal }
  })
  return rows
    .filter((row) => row.books > 0)
    .sort(
      (a, b) =>
        b.books - a.books ||
        b.pages - a.pages ||
        new Date(a.last) - new Date(b.last) ||
        a.child.localeCompare(b.child),
    )
}
