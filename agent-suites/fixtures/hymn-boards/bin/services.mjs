import { readFileSync } from 'node:fs'
import { serviceLine } from '../src/services.mjs'

const services = JSON.parse(readFileSync(new URL('../data/services.json', import.meta.url), 'utf8'))
for (const service of services) console.log(serviceLine(service))
