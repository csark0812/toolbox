/** Minimal CSV reader: quoted fields with doubled quotes, no newlines inside fields. */
export function parseCsv(text) {
  return text
    .replace(/\r\n/g, '\n')
    .trim()
    .split('\n')
    .map((line) => {
      const cells = []
      let cell = ''
      let quoted = false
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (quoted) {
          if (char === '"' && line[i + 1] === '"') {
            cell += '"'
            i++
          } else if (char === '"') quoted = false
          else cell += char
        } else if (char === '"') quoted = true
        else if (char === ',') {
          cells.push(cell)
          cell = ''
        } else cell += char
      }
      cells.push(cell)
      return cells
    })
}
