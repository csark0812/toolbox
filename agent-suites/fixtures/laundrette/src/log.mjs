/** One entry per line of the machine log: { time, machine, card, programme, event }. */
export function parseLog(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const [time, machine, card, programme, event] = line.split(',').map((field) => field.trim())
      return { time, machine, card, programme, event }
    })
}
