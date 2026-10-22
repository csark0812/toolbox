import { readFileSync } from 'node:fs'

/** Every fleece entered at the fair, as rows of strings. */
export function loadFleeces() {
  const text = readFileSync(new URL('../data/fleeces.csv', import.meta.url), 'utf8')
  const [header, ...lines] = text.trim().split('\n')
  const keys = header.split(',')
  return lines.map((line) => {
    const cells = line.split(',')
    return Object.fromEntries(keys.map((key, i) => [key, cells[i] ?? '']))
  })
}
