import { readFileSync } from 'node:fs'

/** A palette file: `{ name, pairs: [{ use, fg, bg }] }`. */
export function loadPalette(path) {
  const palette = JSON.parse(readFileSync(path, 'utf8'))
  if (typeof palette.name !== 'string' || !Array.isArray(palette.pairs))
    throw new TypeError(`${path} is not a palette`)
  return palette
}

export const describePair = (pair) => `${pair.use}: ${pair.fg} on ${pair.bg}`
