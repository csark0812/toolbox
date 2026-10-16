/** Rows of the inspection log: `hive,date,inspector,queen_seen`, dates as DD/MM/YYYY. */
export function parseLog(text) {
  const [header, ...lines] = text.split(/\r?\n/).filter((line) => line.trim() !== '')
  const columns = header.split(',').map((name) => name.trim())
  return lines.map((line) => {
    const cells = line.split(',').map((cell) => cell.trim())
    const row = Object.fromEntries(columns.map((name, i) => [name, cells[i]]))
    return {
      hive: row.hive,
      date: row.date,
      inspector: row.inspector,
      queenSeen: row.queen_seen === 'yes',
    }
  })
}
