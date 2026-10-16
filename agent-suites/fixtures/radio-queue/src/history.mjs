/** Parse the playout log: one `<ISO time>,<track id>` per line; blank lines are ignored. */
export function parseHistory(text) {
  const plays = []
  for (const line of text.split('\n')) {
    if (!line.trim()) continue
    const [at, id] = line.split(',')
    const time = new Date(at)
    if (Number.isNaN(time.getTime()) || !id) throw new SyntaxError(`bad log line: ${line}`)
    plays.push({ at: time, id: id.trim() })
  }
  return plays
}
