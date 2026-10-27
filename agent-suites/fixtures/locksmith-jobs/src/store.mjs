import { readFileSync } from 'node:fs'

const read = (name) => JSON.parse(readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8'))

export const jobs = () => read('jobs.json')
export const customers = () => read('customers.json')
