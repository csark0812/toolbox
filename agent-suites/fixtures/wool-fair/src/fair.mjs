/** Breed totals across the whole fair: how many fleeces, their weight and the mean weight. */
export function fairTotals(rows) {
  const totals = new Map()
  for (const row of rows) {
    const kg = Number(row.kg)
    if (!kg) continue
    const total = totals.get(row.breed) ?? { breed: row.breed, fleeces: 0, kg: 0 }
    total.fleeces++
    total.kg += kg
    totals.set(row.breed, total)
  }
  return [...totals.values()]
    .sort((a, b) => a.breed.localeCompare(b.breed))
    .map((t) => ({ ...t, mean: t.fleeces ? t.kg / t.fleeces : 0 }))
}

export function formatFair(totals) {
  return totals
    .map(
      (t) =>
        `${t.breed.padEnd(11)}${String(t.fleeces).padStart(3)} fleeces ${t.kg.toFixed(1).padStart(6)} kg  mean ${t.mean.toFixed(2)}`,
    )
    .join('\n')
}
