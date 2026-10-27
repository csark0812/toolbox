import { readFileSync } from 'node:fs'

export function loadJobs(path = 'data/jobs.json') {
  return JSON.parse(readFileSync(path, 'utf8'))
}

export function findJob(jobs, ref) {
  return jobs.find((job) => job.ref === ref)
}

export const pounds = (pence) => `£${(pence / 100).toFixed(2)}`
