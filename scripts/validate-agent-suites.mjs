import { readFileSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { SKILLS } from '../src/expected-skills.ts'
const prepared = spawnSync(
  'node',
  ['--experimental-strip-types', 'scripts/prepare-evaluation-workspace.mjs'],
  { stdio: 'inherit' },
)
if (prepared.status !== 0) process.exit(prepared.status ?? 1)
const index = JSON.parse(readFileSync('agent-suites/migration-index.json', 'utf8'))
const ids = new Set()
for (const claim of index.scenarios) {
  if (ids.has(claim.id)) throw new Error(`Duplicate claim ${claim.id}`)
  ids.add(claim.id)
  if (
    !existsSync(claim.claimSource) ||
    !claim.assertion ||
    !claim.consumer ||
    !claim.judgeInput.length
  )
    throw new Error(`Incomplete migration ${claim.id}`)
  if (claim.seed && !existsSync(claim.seed)) throw new Error(`Missing seed ${claim.seed}`)
  for (const slug of claim.rubric.mustInvokeSkill ?? [])
    if (!SKILLS.some((s) => s.slug === slug)) throw new Error(`Unknown skill ${slug}`)
}
const result = spawnSync(
  'node',
  [
    'node_modules/@post-print/agent-test/dist/cli.js',
    'test',
    '--config',
    'agent-test.config.ts',
    '--list',
  ],
  { encoding: 'utf8' },
)
if (result.status !== 0) {
  process.stderr.write(result.stderr)
  process.exit(1)
}
const declared = index.scenarios.filter((c) => !c.skipped).length
const reported = Number(result.stdout.match(/Total: (\d+) tests/)?.[1])
if (reported !== declared) throw new Error(`Discovery mismatch ${reported} vs ${declared}`)
console.log(
  `Validated ${index.scenarios.length} claim mappings; ${reported} executable SDK tests, ${index.scenarios.length - reported} historically skipped. No provider sessions started.`,
)
