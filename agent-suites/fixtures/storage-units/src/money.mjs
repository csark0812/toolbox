/** Pence as pounds for anything the office reads: 4500 → `£45.00`. */
export function pounds(pence) {
  return `£${Math.floor(pence / 100)}.${String(pence % 100).padStart(2, '0')}`
}
