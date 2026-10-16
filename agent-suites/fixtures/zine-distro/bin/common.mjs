import { readFileSync, writeFileSync } from 'node:fs'

const FILE = new URL('../data/orders.json', import.meta.url)
export const loadOrders = () => JSON.parse(readFileSync(FILE, 'utf8'))
export const saveOrders = (orders) => writeFileSync(FILE, `${JSON.stringify(orders, null, 2)}\n`)
export const option = (args, name) => {
  const at = args.indexOf(name)
  return at === -1 ? undefined : args[at + 1]
}
export const printPicklist = (write, lines) => {
  for (const line of lines) write(`${String(line.qty).padStart(3)} x ${line.sku}  ${line.title}\n`)
}
