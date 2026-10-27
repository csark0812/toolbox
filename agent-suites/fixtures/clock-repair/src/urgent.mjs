// Rush jobs: they jump the bench queue and have a shorter turnaround.

export function isUrgent(job) {
  return job.urgent === true
}

const addDays = (iso, days) => {
  const date = new Date(`${iso}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function urgentDueDate(job, config) {
  return addDays(job.booked, isUrgent(job) ? config.urgentTurnaroundDays : config.turnaroundDays)
}

// Rush jobs first, then oldest booking first.
export function urgentQueue(jobs) {
  return [...jobs].sort(
    (a, b) => Number(isUrgent(b)) - Number(isUrgent(a)) || a.booked.localeCompare(b.booked),
  )
}
