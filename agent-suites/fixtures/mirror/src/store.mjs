// Local stand-in for the asset store. Uploads take a little time; paths in the outage list fail.
import { readFileSync } from 'node:fs'
import { setTimeout as sleep } from 'node:timers/promises'

const outages = new Set(
  JSON.parse(readFileSync(new URL('../data/outages.json', import.meta.url), 'utf8')),
)

export async function upload(file) {
  await sleep(5 + (file.bytes % 7))
  if (outages.has(file.path)) throw new Error(`503 from store for ${file.path}`)
  return `https://assets.example.invalid/${file.path}`
}
