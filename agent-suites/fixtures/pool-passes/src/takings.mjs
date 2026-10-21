/** Monthly pass prices in pounds. */
export const PRICES = { adult: 48, junior: 30, senior: 36 }

/** Parse the passes CSV into records. */
export function parsePasses(text) {
  const [header, ...rows] = text.trim().split('\n')
  const keys = header.split(',')
  return rows.map((row) => Object.fromEntries(row.split(',').map((v, i) => [keys[i], v.trim()])))
}

/** Money kept from passes for one month, in pounds. */
export function takings(passes, month) {
  return passes
    .filter((pass) => pass.month === month && pass.status !== 'cancelled')
    .reduce((sum, pass) => sum + PRICES[pass.type], 0)
}
