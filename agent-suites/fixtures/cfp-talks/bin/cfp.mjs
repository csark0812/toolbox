#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { exit, stderr, stdout } from 'node:process'
import { parseArgs } from 'node:util'
import { overLimit, speakers, toCsv, WORD_LIMIT } from '../src/talks.mjs'

let parsed
try {
  parsed = parseArgs({ allowPositionals: true, options: {} })
} catch (error) {
  stderr.write(`${error.message}\n`)
  exit(2)
}
const submissions = JSON.parse(
  readFileSync(new URL('../data/submissions.json', import.meta.url), 'utf8'),
)
const [command] = parsed.positionals
if (command === 'check') {
  const over = overLimit(submissions)
  for (const submission of over)
    stdout.write(
      `#${submission.id} ${submission.title}: ${submission.words} words (limit ${WORD_LIMIT})\n`,
    )
  if (!over.length) stdout.write('every abstract is within the limit\n')
} else if (command === 'export') stdout.write(`${toCsv(submissions)}\n`)
else if (command === 'speakers')
  for (const speaker of speakers(submissions))
    stdout.write(`${speaker.name} <${speaker.email}>: ${speaker.proposals}\n`)
else {
  stderr.write('usage: cfp <check|export|speakers>\n')
  exit(2)
}
