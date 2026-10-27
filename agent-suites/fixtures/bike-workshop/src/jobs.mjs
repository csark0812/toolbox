import { readFileSync } from 'node:fs'

/** Every job card, in card order. */
export function loadJobs() {
  return JSON.parse(readFileSync(new URL('../data/jobs.json', import.meta.url), 'utf8'))
}

/** The mechanics who have cards, in order of their first card. */
export function mechanics(jobs) {
  return [...new Set(jobs.map((job) => job.mechanic))]
}
