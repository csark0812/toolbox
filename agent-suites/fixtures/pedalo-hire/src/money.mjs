/** Pence as pounds for anything people read: 600 → `£6.00`. */
export function pounds(pence) {
  return `£${Math.floor(pence / 100)}.${String(pence % 100).padStart(2, '0')}`
}
