import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

async function readJson(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'))
  } catch {
    return null
  }
}

function inferSkill(scenarioJson, failures) {
  const prompt = scenarioJson?.prompt ?? ''
  if (/investigate/i.test(prompt) || /probe-evidence-outcomes|probe-evidence-transfer/.test(prompt))
    return 'investigate'
  if (/diagnose/i.test(prompt) || /probe-fix-outcomes/.test(prompt)) return 'diagnose'
  if (/code-review/i.test(prompt)) return 'code-review'
  if (/multi/i.test(prompt)) return 'multi'
  if (/second-opinion/i.test(prompt)) return 'second-opinion'
  const cat = failures?.[0]?.category ?? ''
  if (cat === 'agent_runtime') return '(infra — likely fixture/seed, not skill)'
  return '(infer from suite)'
}

function formatFailures(failures) {
  if (!Array.isArray(failures) || failures.length === 0) return '- (none parsed)'
  return failures
    .map((f) => {
      const kind = f.category ?? f.type ?? 'failure'
      const detail = f.evidence ?? f.message ?? f.criterion ?? JSON.stringify(f)
      return `- **${kind}:** ${String(detail).slice(0, 500)}`
    })
    .join('\n')
}

function triageHint(failures) {
  const cat = failures?.[0]?.category ?? ''
  if (cat === 'agent_runtime') {
    return 'Likely **infra/fixture** (seed patch, worktree, timeout) — defer skill claims until runtime is green.'
  }
  if (cat === 'rubric_miss') {
    const ev = String(failures?.[0]?.evidence ?? failures?.[0]?.message ?? '')
    if (/mustNotInclude|forbidden text/i.test(ev)) {
      return 'Likely **rubric brittleness** — substring `mustNot` fired on discussion, not endorsement. Patch scenario before skill.'
    }
    if (/fix|diff|change .* to/i.test(ev)) {
      return 'Likely **skill/process** — find≠fix violation. Sharpen investigate completion gate.'
    }
    return 'Likely **skill or judge** — read transcript; map to research-basis claim.'
  }
  return 'Read `transcript.md` in the debug bundle and map failure to a research-basis section.'
}

export function parseDebugDir(arg) {
  const path = arg?.replace(/\/$/, '')
  if (!path) throw new Error('Provide path to a .debug directory')
  if (!path.endsWith('.debug')) {
    throw new Error('Path must end with .debug (agent-test debug bundle)')
  }
  return path
}

/**
 * @param {string} debugDir
 * @param {{ repoRoot: string, outDir?: string, ts?: string }} options
 * @returns {Promise<{ outPath: string, suite: string, scenarioName: string, skill: string }>}
 */
export async function proposeFromDebugDir(debugDir, options) {
  const parsed = parseDebugDir(debugDir)
  const repoRoot = options.repoRoot
  const parent = basename(join(parsed, '..'))
  const suite = basename(join(parsed, '../..'))
  const scenarioName = basename(parsed).replace(/\.debug$/, '') || parent

  const [scenarioJson, failuresRaw, summary, environment] = await Promise.all([
    readJson(join(parsed, 'scenario.json')),
    readJson(join(parsed, 'failures.json')),
    readFile(join(parsed, 'summary.md'), 'utf8').catch(() => ''),
    readJson(join(parsed, 'environment.json')),
  ])

  const failures = Array.isArray(failuresRaw) ? failuresRaw : (failuresRaw?.failures ?? [])

  const failedRubric =
    failures
      .map((f) => f.criterion ?? f.evidence ?? f.message)
      .filter(Boolean)
      .join('; ') || '(see failures.json)'

  const skill = inferSkill(scenarioJson, failures)
  const sessionId = basename(join(parsed, '../../..'))
  const ts = options.ts ?? new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const outName = `${ts}-${slugify(suite)}-${slugify(scenarioName)}.md`
  const outDir = options.outDir ?? join(repoRoot, '_agent', 'skill-evolution')
  await mkdir(outDir, { recursive: true })
  const outPath = join(outDir, outName)

  const body = `# Skill evolution note

Copy into PR description after human review. Do not commit into skill bodies.

## Failure

- **Suite:** ${suite}
- **Scenario:** ${scenarioName}
- **Run:** \`npm run agent:test:evidence-parity\` — session \`${sessionId}\`
- **Debug bundle:** \`${parsed}\`
- **Failed rubric:** ${failedRubric}

## Claim under test

- **Skill:** ${skill}
- **research-basis section:** (fill after triage)
- **Confidence before:** (fill)

## Triage

${triageHint(failures)}

${formatFailures(failures)}

${summary ? `\n### summary.md excerpt\n\n${summary.split('\n').slice(0, 24).join('\n')}\n` : ''}

## Proposed patch

- [ ] \`SKILL.md\` —
- [ ] \`references/research-basis.md\` —
- [ ] New contract scenario + replay fixture —
- [ ] vitest string lock —

## Decision

- [ ] **Keep** — apply patch and lock
- [ ] **Reject** — failure is model noise / prompt issue
- [ ] **Defer** — needs more outcome runs

## Follow-up scenario

- **Name:**
- **Band:** contract | outcome

---

_Auto-generated by \`scripts/propose-skill-evolution.mjs\` / evidence-parity orchestrator. Optional LLM patch draft: paste this note + \`transcript.md\` into a fresh chat; see [skill-evolution.md](../../docs/skill-evolution.md)._
`

  await writeFile(outPath, body, 'utf8')
  return {
    outPath,
    suite,
    scenarioName,
    skill,
    models: environment?.models,
  }
}
