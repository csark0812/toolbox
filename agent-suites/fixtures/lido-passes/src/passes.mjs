import { readFileSync, writeFileSync } from 'node:fs'

const FILE = new URL('../data/passes.json', import.meta.url)

export const loadPasses = () => JSON.parse(readFileSync(FILE, 'utf8'))
export const savePasses = (passes) => writeFileSync(FILE, `${JSON.stringify(passes, null, 2)}\n`)

/** Whether `pass` lets its swimmer in on `date`. */
export function isValid(pass, date) {
  return pass.status === 'active' && pass.start <= date && date <= pass.end
}
