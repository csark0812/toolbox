#!/usr/bin/env node
/**
 * Rebuild probe-evidence null-arm hygiene seed under `_agent/` (gitignored).
 *
 * Run automatically by `npm run agent:test:evidence-parity`.
 * Manual:
 *   node scripts/regenerate-investigate-null-arm-hygiene.mjs
 */
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

/** Must stay outside HEAD worktrees (see .gitignore `_agent/`). */
export const INVESTIGATE_NULL_ARM_HYGIENE_SEED = '_agent/probe-evidence-null-arm-hygiene.patch'

const pathArgs = [
  'probe/**',
  'agent-suites/probe-evidence/**',
  'agent-suites/probe-evidence-outcomes/**',
  'agent-suites/probe-evidence-transfer/**',
  'agent-suites/probe-evidence-prompt/**',
  'docs/evidence-parity.md',
  'tests/investigate-transfer-prompts.test.js',
  'tests/investigate-prompt-baseline.test.js',
  'tests/investigate-fixture-seeds.test.js',
  'tests/investigate-caller-park.test.js',
  'tests/investigate-fixture-hygiene.test.js',
]

function listHeadPaths() {
  return execFileSync('git', ['ls-files', ...pathArgs], {
    cwd: root,
    encoding: 'utf8',
  })
    .trim()
    .split('\n')
    .filter(Boolean)
    .filter((p) => !p.endsWith('null-arm-hygiene.patch'))
}

function readBlob(rel) {
  try {
    const body = execFileSync('git', ['show', `HEAD:${rel}`], {
      cwd: root,
      encoding: 'utf8',
    })
    const hash = execFileSync('git', ['rev-parse', `HEAD:${rel}`], {
      cwd: root,
      encoding: 'utf8',
    }).trim()
    return { body, hash }
  } catch {
    const body = readFileSync(join(root, rel), 'utf8')
    const hash = createHash('sha1').update(body).digest('hex')
    return { body, hash }
  }
}

/**
 * @param {{ outPath?: string }} [options]
 */
export function regenerateInvestigateNullArmHygieneSeed(options = {}) {
  const out = options.outPath ? options.outPath : join(root, INVESTIGATE_NULL_ARM_HYGIENE_SEED)
  const paths = listHeadPaths()
  if (paths.length === 0) {
    throw new Error('No HEAD paths matched for probe-evidence null-arm hygiene seed')
  }

  const chunks = []
  for (const rel of paths) {
    const { body, hash } = readBlob(rel)
    const hunkLines = body.endsWith('\n') ? body.slice(0, -1).split('\n') : body.split('\n')
    chunks.push(`diff --git a/${rel} b/${rel}`)
    chunks.push('deleted file mode 100644')
    chunks.push(`index ${hash}..0000000`)
    chunks.push(`--- a/${rel}`)
    chunks.push('+++ /dev/null')
    chunks.push(`@@ -1,${hunkLines.length} +0,0 @@`)
    for (const line of hunkLines) chunks.push(`-${line}`)
    chunks.push('')
  }

  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, chunks.join('\n'))
  return { out, pathCount: paths.length, bytes: Buffer.byteLength(readFileSync(out)) }
}

const isDirectRun =
  Boolean(process.argv[1]) && fileURLToPath(import.meta.url) === join(process.argv[1])
if (isDirectRun) {
  const { out, pathCount, bytes } = regenerateInvestigateNullArmHygieneSeed()
  console.log(`Wrote ${out} (${pathCount} file(s), ${bytes} bytes)`)
}
