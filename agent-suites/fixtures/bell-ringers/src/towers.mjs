const byText = (a, b) => (a < b ? -1 : a > b ? 1 : 0)
const DEFAULT_RING = 6

/** The tenor weight in pounds, from hundredweight-quarters-pounds. */
export function tenorPounds(tenor) {
  const [cwt, quarters, pounds] = tenor.split('-').map(Number)
  return cwt * 112 + quarters * 28 + pounds
}

/** One line of the tower list. */
export function describe({ name, bells = DEFAULT_RING, tenor, practice }) {
  return `${name.padEnd(28)}${String(bells).padStart(2)} bells  tenor ${tenor.padEnd(8)} practice ${practice}`
}

/** Whether a band can ring every bell in the tower. */
export function ringable({ bells = DEFAULT_RING }, ringers) {
  return ringers >= bells
}

/** Towers sorted by one of their fields, largest first for numbers, then by name. */
export function sortTowers(towers, key = 'name') {
  const value = (tower) =>
    key === 'tenor'
      ? tenorPounds(tower.tenor)
      : (tower[key] ?? (key === 'bells' ? DEFAULT_RING : ''))
  return [...towers].sort((a, b) => {
    const [x, y] = [value(a), value(b)]
    const order = typeof x === 'number' ? y - x : byText(x, y)
    return order || byText(a.name, b.name)
  })
}
