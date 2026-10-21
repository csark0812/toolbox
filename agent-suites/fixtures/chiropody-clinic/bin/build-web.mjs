import { readFileSync, writeFileSync } from 'node:fs'
import { CLINIC } from '../src/clinic.mjs'

const at = (path) => new URL(`../web/${path}`, import.meta.url)
const page = readFileSync(at('contact.template.html'), 'utf8').replace(
  /\{\{(\w+)\}\}/g,
  (match, key) => CLINIC[key] ?? match,
)
writeFileSync(at('contact.html'), page)
console.log('wrote web/contact.html')
