import { existsSync, readdirSync, readFileSync } from 'node:fs'

const data = (path) => new URL(`../data/${path}`, import.meta.url)

export const amountOf = (record) => Number(record.amount)

export function loadMonth(month) {
  return JSON.parse(readFileSync(data(`takings/${month}.json`), 'utf8'))
}

export function loadYear(year) {
  if (existsSync(data(`archive/${year}.json`)))
    return JSON.parse(readFileSync(data(`archive/${year}.json`), 'utf8'))
  return readdirSync(data('takings'))
    .filter((name) => name.startsWith(`${year}-`))
    .sort()
    .flatMap((name) => loadMonth(name.replace('.json', '')))
}

export function summary(records) {
  const total = (list) => list.reduce((sum, record) => sum + amountOf(record), 0)
  const sales = records.filter((record) => record.kind === 'sale')
  const refunds = records.filter((record) => record.kind === 'refund')
  return {
    slips: records.length,
    front: total(records.filter((record) => record.till === 'front')),
    back: total(records.filter((record) => record.till === 'back')),
    sales: total(sales),
    refunds: total(refunds),
    net: total(records),
  }
}

export const pounds = (amount) => `£${amount.toFixed(2)}`
