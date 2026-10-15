// Leaderboard summary: one entry per player id, highest score first.

export function score(record) {
  let total = 0
  for (const round of record.rounds) total += round.points * round.multiplier
  return total
}

export function dedupeById(records) {
  const unique = []
  for (const record of records) {
    if (!unique.some((existing) => existing.id === record.id)) unique.push(record)
  }
  return unique
}

export function summarize(records) {
  return dedupeById(records)
    .sort((a, b) => score(b) - score(a) || a.id.localeCompare(b.id))
    .map((record) => ({ id: record.id, score: score(record) }))
}
