#!/usr/bin/env node
/**
 * Rebuild null-arm-hygiene.patch from HEAD blobs.
 *
 * Live agent-test worktrees are detached at HEAD. The seed must match committed
 * content, not a dirty working tree. Re-run after committing diagnose suite /
 * docs / skill changes, then retest:
 *
 *   node scripts/regenerate-diagnose-null-arm-hygiene.mjs
 *   npm test
 *   npm run agent:test:diagnose-evidence-parity -- --repeats 3
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(
  root,
  'agent-suites/diagnose-outcomes/fixtures/seeds/null-arm-hygiene.patch',
)

const pathArgs = [
  'diagnose/**',
  'agent-suites/diagnose/**',
  'agent-suites/diagnose-outcomes/**',
  'agent-suites/diagnose-transfer/**',
  'agent-suites/diagnose-prompt/**',
  'agent-suites/diagnose-outcomes-ceiling/**',
  'docs/evidence-parity.md',
]

const paths = execFileSync('git', ['ls-files', ...pathArgs], {
  cwd: root,
  encoding: 'utf8',
})
  .trim()
  .split('\n')
  .filter(Boolean)
  .filter((p) => !p.endsWith('null-arm-hygiene.patch'))

if (paths.length === 0) {
  console.error('No HEAD paths matched for null-arm hygiene seed')
  process.exit(1)
}

const chunks = []
for (const rel of paths) {
  const body = execFileSync('git', ['show', `HEAD:${rel}`], {
    cwd: root,
    encoding: 'utf8',
  })
  const hash = execFileSync('git', ['rev-parse', `HEAD:${rel}`], {
    cwd: root,
    encoding: 'utf8',
  }).trim()
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
console.log(`Wrote ${out} (${paths.length} file(s), ${Buffer.byteLength(readFileSync(out))} bytes)`)
