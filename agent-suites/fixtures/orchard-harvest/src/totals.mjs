export const PENCE_PER_KG = 30

/** Each picker's kg for one day, heaviest first, with their pay in pence. */
export function dayTotals(rows, day) {
  const kgByPicker = new Map()
  for (const row of rows) {
    if (!row.time.startsWith(day)) continue
    // Tare readings have no weight.
    const kg = Number(row.kg) || 0
    kgByPicker.set(row.picker, (kgByPicker.get(row.picker) ?? 0) + kg)
  }
  return [...kgByPicker]
    .map(([picker, kg]) => ({ picker, kg, pence: Math.round(kg * PENCE_PER_KG) }))
    .sort((a, b) => b.kg - a.kg || (a.picker < b.picker ? -1 : 1))
}
