import { readFileSync } from 'node:fs'
import { longDate, show } from './show.mjs'

export function renderWeb() {
  const template = readFileSync(new URL('../web/index.template.html', import.meta.url), 'utf8')
  return template
    .replaceAll('{{name}}', show.name)
    .replaceAll('{{venue}}', show.venue)
    .replaceAll('{{dateLong}}', longDate(show.date))
    .replaceAll('{{doors}}', show.doors)
    .replaceAll('{{close}}', show.close)
}
