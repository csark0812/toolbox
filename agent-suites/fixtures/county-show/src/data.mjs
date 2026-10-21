import { readFileSync } from 'node:fs'

const file = (name) => readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8')
export const read = (name) => JSON.parse(file(name))

/** The points each entry was given, one `entry,points` row per entry. */
export const points = () =>
  file('points.csv')
    .trim()
    .split('\n')
    .slice(1)
    .map((row) => {
      const [entry, value] = row.split(',')
      return { entry: Number(entry), points: value.trim() }
    })
