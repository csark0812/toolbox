export const LABOUR_PENCE_PER_HOUR = 4000

export const money = (pence) => `£${(pence / 100).toFixed(2)}`

/** Lines of a job's ticket, each { label, pence }, and the total. */
export function ticket(job) {
  const lines = [
    {
      label: `Labour ${job.labourHours} h`,
      pence: Math.round(job.labourHours * LABOUR_PENCE_PER_HOUR),
    },
    ...job.parts.map((part) => ({
      label: part.qty > 1 ? `${part.name} x${part.qty}` : part.name,
      pence: part.pence,
    })),
  ]
  return { lines, total: lines.reduce((sum, line) => sum + line.pence, 0) }
}

/** The job board's columns and how each is read from a job. */
export const COLUMNS = [
  { header: 'Job', width: 7, value: (job) => job.id },
  { header: 'Customer', width: 12, value: (job) => job.customer },
  { header: 'Bike', width: 19, value: (job) => job.bike },
  { header: 'Status', width: 15, value: (job) => job.status.toLowerCase() },
  { header: 'ETA', width: 10, value: (job) => job.ready },
]

export const row = (cells) =>
  COLUMNS.map((column, i) => String(cells[i]).padEnd(column.width))
    .join('')
    .trimEnd()
