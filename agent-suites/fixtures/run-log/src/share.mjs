/** The text for a shared run card. Loaded on demand by the share command. */
export async function shareText(run, units) {
  const format = await import('./format.mjs')
  const suffix = units === 'mi' ? 'Miles' : 'Km'
  const distance = format[`format${suffix}`](run.meters)
  const pace = format[`pace${suffix}`](run.seconds, run.meters)
  return `${run.date}: ran ${distance} in ${format.formatDuration(run.seconds)} (${pace})`
}
