import { readFileSync } from 'node:fs'

export const settings = JSON.parse(
  readFileSync(new URL('../config/settings.json', import.meta.url), 'utf8'),
)
