#!/usr/bin/env node
/**
 * Autofill a skill-evolution note from an agent-test .debug bundle.
 * Does not edit SKILL.md — human Keep / Reject / Defer only.
 *
 * Usage:
 *   node scripts/propose-skill-evolution.mjs /path/to/scenario.debug
 */
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { proposeFromDebugDir } from './lib/propose-skill-evolution-core.mjs'

const root = join(fileURLToPath(import.meta.url), '..', '..')

async function main() {
  const { outPath, models } = await proposeFromDebugDir(process.argv[2], {
    repoRoot: root,
  })
  console.log(`Wrote: ${outPath}`)
  if (models) console.log('Models:', JSON.stringify(models))
}

main().catch((err) => {
  console.error(err.message ?? err)
  process.exit(1)
})
