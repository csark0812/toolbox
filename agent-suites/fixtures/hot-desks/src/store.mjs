import { readFileSync } from 'node:fs'

const read = (name) => JSON.parse(readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8'))

export const bookings = () => read('bookings.json')
export const users = () => read('users.json')
