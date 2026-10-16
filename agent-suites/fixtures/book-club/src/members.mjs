import { readFileSync } from 'node:fs'

const read = (name) => JSON.parse(readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8'))
export const members = () => read('members.json')
export const nominations = () =>
  read('nominations.json').sort((a, b) => a.nominatedAt.localeCompare(b.nominatedAt))
