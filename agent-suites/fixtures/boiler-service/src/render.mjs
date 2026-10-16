import { readFileSync } from 'node:fs'
import { fmtDate, money } from './util.mjs'

const helpers = { fmtDate }

/** Fills `{{field}}` and `{{helper field}}` placeholders in a template. */
export function render(name, values) {
  const template = readFileSync(new URL(`../templates/${name}.txt`, import.meta.url), 'utf8')
  return template.replace(/\{\{(\w+)(?: (\w+))?\}\}/g, (_, first, second) => {
    if (second) return helpers[first](values[second])
    if (first === 'cover')
      return values.cover
        ? `Your service is covered by your ${money(values.cover)} care plan.\n`
        : ''
    return values[first]
  })
}
