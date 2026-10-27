import { readFileSync } from 'node:fs'

export function loadHires(path = 'data/hires.json') {
  return JSON.parse(readFileSync(path, 'utf8'))
}

export function returnLine(hire) {
  return `${hire.ref}  ${hire.hirer}  ${hire.item}  due ${hire.due}  back ${hire.returned}`
}
