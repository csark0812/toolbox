#!/usr/bin/env node
// Hash every held-out input so a later edit is visible. Run with --write only to re-freeze on purpose;
// re-freezing after seeing results voids the held-out claim, so record why in the commit.
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const LOCK = 'agent-suites/skill-bench/holdout.lock.json'

function files(path) {
  if (statSync(path).isFile()) return [path]
  return readdirSync(path)
    .sort()
    .flatMap((name) => files(join(path, name)))
}

/** Every file a held-out task depends on, in a stable order. */
export function holdoutFiles() {
  const holdout = JSON.parse(readFileSync('agent-suites/skill-bench/holdout.json', 'utf8'))
  const fixtures = [
    ...new Set(holdout.tasks.map((task) => `agent-suites/fixtures/${fixtureOf(task)}`)),
  ]
  return [
    'agent-suites/skill-bench/holdout.json',
    ...files('agent-suites/skill-bench/holdout-checks'),
    ...files('agent-suites/skill-bench/holdout-seeds'),
    ...fixtures.sort().flatMap(files),
  ]
}

function fixtureOf(task) {
  const path =
    task.claim.fixtureGate ?? task.claim.frozenPaths?.[0] ?? `agent-suites/fixtures/${task.check}`
  return path.split('/')[2]
}

export function holdoutDigest() {
  const hash = createHash('sha256')
  for (const file of holdoutFiles())
    hash.update(file).update('\0').update(readFileSync(file)).update('\0')
  return hash.digest('hex')
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const digest = holdoutDigest()
  if (process.argv.includes('--write')) {
    writeFileSync(
      LOCK,
      JSON.stringify({ sha256: digest, files: holdoutFiles().length }, null, 2) + '\n',
    )
    console.log(`Froze ${holdoutFiles().length} held-out files: ${digest}`)
  } else console.log(digest)
}
