/** Rows of a CSV export as objects keyed by the header line. */
export function parseCsv(text) {
  const [header, ...lines] = text.trim().split('\n')
  const names = header.split(',')
  return lines.map((line) => {
    const fields = line.split(',')
    return Object.fromEntries(names.map((name, index) => [name, fields[index]]))
  })
}
