import { readFileSync } from 'node:fs'

export const loadShows = () =>
  JSON.parse(readFileSync(new URL('../data/shows.json', import.meta.url), 'utf8'))
