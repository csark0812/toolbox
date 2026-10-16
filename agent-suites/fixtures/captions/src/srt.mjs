const TIMING = /^(\d{2}):(\d{2}):(\d{2})[,.](\d{3}) --> (\d{2}):(\d{2}):(\d{2})[,.](\d{3})/

const toMs = (h, m, s, ms) => ((Number(h) * 60 + Number(m)) * 60 + Number(s)) * 1000 + Number(ms)

/** `00:01:02,345` */
export function formatTime(ms) {
  const pad = (n, width = 2) => String(n).padStart(width, '0')
  const total = Math.max(0, Math.round(ms))
  const h = Math.floor(total / 3600000)
  const m = Math.floor((total % 3600000) / 60000)
  const s = Math.floor((total % 60000) / 1000)
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(total % 1000, 3)}`
}

/** Parse SRT text into cues. Blocks without a numeric index and a timing line are skipped. */
export function parseSrt(text) {
  const blocks = text.replace(/\r\n?/g, '\n').split(/\n[ \t]*\n/)
  const cues = []
  for (const block of blocks) {
    const lines = block.replace(/^\n+|\n+$/g, '').split('\n')
    if (lines.length < 2 || !/^\d+$/.test(lines[0])) continue
    const timing = TIMING.exec(lines[1])
    if (!timing) continue
    cues.push({
      start: toMs(...timing.slice(1, 5)),
      end: toMs(...timing.slice(5, 9)),
      text: lines.slice(2).join('\n'),
    })
  }
  return cues
}

/** Cues back to SRT text, renumbered from 1. */
export function formatSrt(cues) {
  return cues
    .map((cue, i) => `${i + 1}\n${formatTime(cue.start)} --> ${formatTime(cue.end)}\n${cue.text}\n`)
    .join('\n')
}

/** Move every cue by `offsetMs`; cues pushed before zero start at zero. */
export function shift(cues, offsetMs) {
  return cues.map((cue) => ({
    ...cue,
    start: Math.max(0, cue.start + offsetMs),
    end: Math.max(0, cue.end + offsetMs),
  }))
}
