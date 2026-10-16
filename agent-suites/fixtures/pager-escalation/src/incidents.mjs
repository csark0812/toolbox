let next = 1

export const SEVERITIES = ['critical', 'high', 'low']

/** A new open incident. */
export function openIncident(title, severity) {
  if (!SEVERITIES.includes(severity)) throw new RangeError(`unknown severity: ${severity}`)
  return {
    id: `INC-${next++}`,
    title,
    severity,
    status: 'open',
    openedAt: new Date().toISOString(),
  }
}
