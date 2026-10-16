/** Edit distance between two strings: insertions, deletions and substitutions cost 1. */
export function editDistance(a, b) {
  const rows = []
  for (let i = 0; i <= a.length; i++) {
    rows.push([])
    for (let j = 0; j <= b.length; j++) {
      if (i === 0) rows[i].push(j)
      else if (j === 0) rows[i].push(i)
      else {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1
        rows[i].push(Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + cost))
      }
    }
  }
  return rows[a.length][b.length]
}
