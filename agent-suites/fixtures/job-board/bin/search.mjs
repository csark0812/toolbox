#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { exit, stderr, stdout } from 'node:process'
import { parseArgs } from 'node:util'
import { search } from '../src/search.mjs'

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { near: { type: 'string' } },
})
const read = (path) => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'))
const config = read('config.json')
if (!positionals.length) {
  stderr.write('usage: search <words> [--near <city>]\n')
  exit(2)
}
try {
  const results = search(read('data/jobs.json'), positionals.join(' '), {
    near: values.near ?? config.homeCity,
    cities: config.cities,
  })
  if (!results.length) stdout.write('no jobs found\n')
  for (const job of results) {
    const where = job.remote ? 'remote' : `${job.city}, ${Math.round(job.distance)} km`
    stdout.write(`${job.id}  ${job.title} at ${job.company} (${where})\n`)
  }
} catch (error) {
  stderr.write(`${error.message}\n`)
  exit(2)
}
