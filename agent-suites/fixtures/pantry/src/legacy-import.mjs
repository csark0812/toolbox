// Importer for the spreadsheet we used before data/pantry.json. Kept for the migration in 2025.
import { readFileSync } from 'node:fs'

/** Rows of `name;amount;unit;dd/mm/yyyy` as pantry items. */
export function legacyImport(path) {
  return readFileSync(path, 'utf8')
    .split('\n')
    .filter((line) => line.trim() && !line.startsWith('#'))
    .map((line) => {
      const [name, amount, unit, date] = line.split(';')
      const [day, month, year] = date.trim().split('/')
      return {
        name: name.trim(),
        quantity: `${amount} ${unit}`,
        expires: `${year}-${month}-${day}`,
      }
    })
}
