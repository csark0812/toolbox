import { readFileSync } from 'node:fs'

const towers = JSON.parse(readFileSync(new URL('../data/towers.json', import.meta.url), 'utf8'))
const columns = Object.keys(towers[0])
const cell = (value) =>
  /[",]/.test(String(value)) ? `"${String(value).replaceAll('"', '""')}"` : value
console.log(columns.join(','))
for (const tower of towers)
  console.log(columns.map((column) => cell(tower[column] ?? '')).join(','))
