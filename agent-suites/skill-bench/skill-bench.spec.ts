import { mkdir, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe } from '@post-print/agent-test'
import {
  commitsAfterBaseline,
  diffSinceBaseline,
  framePrompt,
  packEntry,
  packName,
  prepareClaim,
  runHardChecks,
  type Claim,
} from '../v2/support'
import { blindingLeaks, checksDir, TASK_SETS } from '../../scripts/lib/skill-bench-material.mjs'

const BENCH_ROOT = 'projects'
// --taskset picks a frozen held-out set (holdout, holdout-v2); the default is the development tasks.
const TASKSET = process.env.SKILL_BENCH_TASKSET ?? 'tasks'
if (!TASK_SETS.includes(TASKSET)) throw new Error(`Unknown task set ${TASKSET}`)
const { tasks } = JSON.parse(readFileSync(`agent-suites/skill-bench/${TASKSET}.json`, 'utf8'))
const arms = (process.env.SKILL_BENCH_ARMS ?? 'none,full').split(',')
const selected = process.env.SKILL_BENCH_TASKS?.split(',')
// Top-up runs for missing cells start their repetition numbers after the existing ones.
const REP_OFFSET = Number(process.env.SKILL_BENCH_REP_OFFSET ?? 0)
const RUNNER = process.env.SKILL_BENCH_RUNNER === 'claude' ? 'claude' : 'codex'
const benchDir = join('.agent-test/skill-bench', process.env.SKILL_BENCH_ID ?? 'adhoc', 'runs')

/** A pack's per-runner setup (model settings, subagents) and the note its entry prompt adds. */
function packSetup(arm: string) {
  if (!arm.startsWith('pack:')) return { overlayDir: undefined, note: '' }
  const dir = join('_agent/packs', packName(arm))
  const overlay = join(dir, `workspace-${RUNNER}`)
  const notePath = join(dir, 'entry-note.txt')
  return {
    overlayDir: existsSync(overlay) ? overlay : undefined,
    note: existsSync(notePath) ? readFileSync(notePath, 'utf8').trim() : '',
  }
}

/** A suite scenario as a blinded bench claim: fixtures under projects/, no routing assertions. */
type BenchTask = {
  id: string
  suite?: string
  scenario?: number
  prompt?: string
  check?: string
  claim?: Partial<Claim> & { prompt: string }
}

/** The task's claim: inline for held-out tasks, or a claim-suite scenario for development tasks. */
function taskScenario(task: BenchTask) {
  if (task.claim) return { defaults: { profile: 'cursor' }, scenario: task.claim }
  const suite = JSON.parse(readFileSync(`agent-suites/${task.suite}/claims.json`, 'utf8'))
  return { defaults: suite.defaults, scenario: suite.scenarios[(task.scenario ?? 1) - 1] }
}

export function benchClaim(task: BenchTask, arm: string) {
  const { defaults, scenario } = taskScenario(task)
  const claim: Claim = {
    ...scenario,
    id: `bench:${task.id}`,
    suite: 'skill-bench',
    defaults: { ...defaults, skills: arm },
    // A pack whose skills are explicit-only is run the way it documents: through its entry skill.
    overlayDir: packSetup(arm).overlayDir,
    // On Claude the entry skill is started as a slash command (see entryPrompt); elsewhere the prompt names it.
    prompt:
      (packEntry(arm)
        ? (RUNNER === 'claude'
            ? packSetup(arm).note
            : `Use the ${packEntry(arm)} skill for this task. ${packSetup(arm).note}`
          ).trim() + '\n\n'
        : '') +
      (task.prompt ?? scenario.prompt).replaceAll('agent-suites/fixtures/', `${BENCH_ROOT}/`),
    rubric: {},
    fixtureRoot: BENCH_ROOT,
  }
  const leaks = blindingLeaks(framePrompt(claim, 'neutral'))
  if (leaks.length) throw new Error(`Bench prompt for ${task.id} reveals measurement: ${leaks}`)
  return claim
}

/**
 * A pack's documented entry on Claude Code is the user typing `/<entry>`: an explicit-only skill
 * (disable-model-invocation) cannot be loaded by the model from a prompt that only names it.
 */
function entryPrompt(arm: string, prompt: string) {
  return RUNNER === 'claude' && packEntry(arm) ? `/${packEntry(arm)} ${prompt}` : prompt
}

/** The harness's workspace guard, as an error kind (2.1+) or a plain message (2.0). */
function isWorkspaceEscape(error: unknown) {
  return (
    (error as { kind?: string }).kind === 'workspace-escape' ||
    /outside the isolated workspace/.test(String((error as Error)?.message))
  )
}

/** Keep an expensive run even when one piece of evidence cannot be collected. */
function collect(read: () => string) {
  try {
    return read()
  } catch (error) {
    return `(could not collect: ${String(error).slice(0, 300)})`
  }
}

/** The project folder a held-out task works in, inside the run's workspace. */
function holdoutDir(root: string, task: BenchTask) {
  const gate =
    task.claim?.fixtureGate ?? task.claim?.frozenPaths?.[0]?.split('/').slice(0, 3).join('/')
  const project = (gate ?? `agent-suites/fixtures/${task.check}`).replace(
    'agent-suites/fixtures/',
    `${BENCH_ROOT}/`,
  )
  return join(root, project)
}

const test = describe('skill-bench', ({ agent }) => ({ coder: agent() }))

for (const task of tasks.filter((task: { id: string }) => !selected || selected.includes(task.id)))
  for (const arm of arms)
    test(
      `${task.id} [${arm}]`,
      { description: `Bench run for ${task.targetSkill}`, criteria: task.criteria },
      async ({ coder }, info) => {
        const claim = benchClaim(task, arm)
        const file = `${task.id}__${arm.replace(':', '-')}__${info.repeatEachIndex + REP_OFFSET}.json`
        const save = async (record: object) => {
          await mkdir(benchDir, { recursive: true })
          await writeFile(join(benchDir, file), JSON.stringify(record, null, 2))
        }
        let run
        try {
          run = await prepareClaim(coder, claim, 'neutral').run({
            prompt: entryPrompt(arm, framePrompt(claim, 'neutral')),
            includeGlobalSkills: false,
          })
        } catch (error) {
          // The harness's lexical escape guard also fires on in-workspace paths such as `../..`
          // after a `cd`. Keep the run as an infrastructure exclusion so it never forms a pair.
          if (!isWorkspaceEscape(error)) throw error
          await save({
            task: task.id,
            arm,
            repetition: info.repeatEachIndex + REP_OFFSET,
            infrastructure: String((error as Error).message).slice(0, 600),
            // The calls the guard read, so a false positive can be diagnosed.
            toolCalls: (
              (error as { trace?: { toolCalls?: { name: string; args: unknown }[] } }).trace
                ?.toolCalls ?? []
            ).map(({ name, args }) => ({ name, args })),
          })
          return
        }
        let hardCheck = { passed: true, failure: null as string | null }
        try {
          await runHardChecks(run, claim)
          // The acceptance check lives outside the workspace, so the agent never sees it.
          if (task.check)
            execFileSync(
              process.execPath,
              [`${checksDir(TASKSET)}/${task.check}.mjs`, holdoutDir(run.workspace.root, task)],
              { stdio: 'pipe', timeout: 120000 },
            )
        } catch (error) {
          const detail = (error as { stderr?: Buffer }).stderr?.toString() || String(error)
          hardCheck = { passed: false, failure: detail.slice(0, 600) }
        }
        const record = {
          task: task.id,
          arm,
          runner: RUNNER,
          repetition: info.repeatEachIndex + REP_OFFSET,
          output: run.output,
          toolCalls: run.toolCalls.map(({ name, args }) => ({ name, args })),
          diff: collect(() => diffSinceBaseline(run.workspace.root)),
          commits: collect(() => commitsAfterBaseline(run.workspace.root)),
          hardCheck,
          durationMs: run.durationMs,
          tokens: run.usage.tokens.total ?? null,
        }
        await save(record)
      },
    )
