import { readFileSync } from 'node:fs'

export const loadConfig = (path = 'config/shop.json') => JSON.parse(readFileSync(path, 'utf8'))
