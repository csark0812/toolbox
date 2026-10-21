import { EventEmitter } from 'node:events'
import { readFile } from 'node:fs'

// Reads the judges' feed. Emits 'run' for each scored run, 'skip' ({ line, reason }) for a run
// with no points, then 'end' with the number of runs. A broken line or an unreadable file emits
// 'error' instead, and nothing after it is read.
export function readRuns(path = 'data/runs.jsonl') {
  const feed = new EventEmitter()
  readFile(path, 'utf8', (error, text) => {
    if (error) {
      feed.emit('error', error)
      return
    }
    let count = 0
    const lines = text.split('\n')
    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].trim()) continue
      let run
      try {
        run = JSON.parse(lines[i])
      } catch {
        const broken = new Error(`line ${i + 1} is not valid JSON`)
        broken.line = i + 1
        feed.emit('error', broken)
        return
      }
      if (typeof run.points !== 'number') {
        feed.emit('skip', {
          line: i + 1,
          reason: `points ${JSON.stringify(run.points)} is not a number`,
        })
        continue
      }
      count++
      feed.emit('run', run)
    }
    feed.emit('end', count)
  })
  return feed
}
