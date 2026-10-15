import { mkdir, writeFile } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe } from '@post-print/agent-test'
import {
  commitsAfterBaseline,
  diffSinceBaseline,
  framePrompt,
  packEntry,
  prepareClaim,
  runHardChecks,
  type Claim,
} from '../v2/support'
import { blindingLeaks } from '../../scripts/lib/skill-bench-material.mjs'

const BENCH_ROOT = 'projects'
const { tasks } = JSON.parse(readFileSync('agent-suites/skill-bench/tasks.json', 'utf8'))
const arms = (process.env.SKILL_BENCH_ARMS ?? 'none,full').split(',')
const selected = process.env.SKILL_BENCH_TASKS?.split(',')
const benchDir = join('.agent-test/skill-bench', process.env.SKILL_BENCH_ID ?? 'adhoc', 'runs')

/** A suite scenario as a blinded bench claim: fixtures under projects/, no routing assertions. */
export function benchClaim(
  task: { id: string; suite: string; scenario: number; prompt?: string },
  arm: string,
) {
  const suite = JSON.parse(readFileSync(`agent-suites/${task.suite}/claims.json`, 'utf8'))
  const scenario = suite.scenarios[task.scenario - 1]
  const claim: Claim = {
    ...scenario,
    id: `bench:${task.id}`,
    suite: 'skill-bench',
    defaults: { ...suite.defaults, skills: arm },
    // A pack whose skills are explicit-only is run the way it documents: through its entry skill.
    prompt:
      (packEntry(arm) ? `Use the ${packEntry(arm)} skill for this task.\n\n` : '') +
      (task.prompt ?? scenario.prompt).replaceAll('agent-suites/fixtures/', `${BENCH_ROOT}/`),
    rubric: {},
    fixtureRoot: BENCH_ROOT,
  }
  const leaks = blindingLeaks(framePrompt(claim, 'neutral'))
  if (leaks.length) throw new Error(`Bench prompt for ${task.id} reveals measurement: ${leaks}`)
  return claim
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

const test = describe('skill-bench', ({ agent }) => ({ coder: agent() }))

for (const task of tasks.filter((task: { id: string }) => !selected || selected.includes(task.id)))
  for (const arm of arms)
    test(
      `${task.id} [${arm}]`,
      { description: `Bench run for ${task.targetSkill}`, criteria: task.criteria },
      async ({ coder }, info) => {
        const claim = benchClaim(task, arm)
        const file = `${task.id}__${arm.replace(':', '-')}__${info.repeatEachIndex}.json`
        const save = async (record: object) => {
          await mkdir(benchDir, { recursive: true })
          await writeFile(join(benchDir, file), JSON.stringify(record, null, 2))
        }
        let run
        try {
          run = await prepareClaim(coder, claim, 'neutral').run({
            prompt: framePrompt(claim, 'neutral'),
            includeGlobalSkills: false,
          })
        } catch (error) {
          // The harness's lexical escape guard also fires on in-workspace paths such as `../..`
          // after a `cd`. Keep the run as an infrastructure exclusion so it never forms a pair.
          if (!isWorkspaceEscape(error)) throw error
          await save({
            task: task.id,
            arm,
            repetition: info.repeatEachIndex,
            infrastructure: String((error as Error).message).slice(0, 600),
          })
          return
        }
        let hardCheck = { passed: true, failure: null as string | null }
        try {
          await runHardChecks(run, claim)
        } catch (error) {
          hardCheck = { passed: false, failure: String(error).slice(0, 600) }
        }
        const record = {
          task: task.id,
          arm,
          repetition: info.repeatEachIndex,
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
