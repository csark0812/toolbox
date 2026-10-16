import { parseCsv } from './csv.mjs'

/** Stock lines with their numbers as numbers. */
export function readStock(text) {
  return parseCsv(text).map((row) => ({
    sku: row.sku,
    plant: row.plant,
    supplier: row.supplier,
    stock: Number(row.stock),
    reorderLevel: Number(row.reorder_level),
    target: Number(row.target),
    traySize: Number(row.tray_size),
    trayPence: Number(row.tray_pence),
    discontinued: row.discontinued === 'yes',
  }))
}

/** What a line's stock is worth at tray price, in pence. */
export const stockValue = (line) => Math.round((line.stock / line.traySize) * line.trayPence)

export const money = (pence) => `£${(pence / 100).toFixed(2)}`
