// Pure helpers for the skill bench: blinding checks, the judge's view of one run, degraded
// controls, pair planning and verdict parsing. No I/O, so every rule is unit-testable.

/** Words that tell an agent it is being measured. None may appear in a run's prompt or workspace framing. */
export const BANNED_WORDS = [
  'eval',
  'evals',
  'evaluation',
  'judge',
  'judged',
  'rubric',
  'grader',
  'graded',
  'candidate',
  'arena',
  'conformance',
  'skill-on',
  'skill-off',
]

/** Banned words found in `text`, as whole words, case-insensitive. */
export function blindingLeaks(text) {
  return BANNED_WORDS.filter((word) => new RegExp(`\\b${word}\\b`, 'i').test(text))
}

export const LIMITS = { reply: 12000, diff: 40000, actions: 150, actionText: 240 }

const clip = (text, limit) =>
  text.length > limit ? `${text.slice(0, limit)}\n… [${text.length - limit} more characters]` : text

/** One line per tool call: what was actually run, read or written. Results are left out. */
export function summarizeActions(toolCalls = []) {
  const lines = toolCalls.map((call) => {
    const args = call.args ?? {}
    const detail =
      args.command ?? args.cmd ?? args.file_path ?? args.path ?? args.pattern ?? args.url ?? ''
    return `- ${call.name}${detail ? `: ${String(detail).replace(/\s+/g, ' ')}` : ''}`.slice(
      0,
      LIMITS.actionText,
    )
  })
  if (lines.length <= LIMITS.actions) return lines.join('\n')
  return [
    ...lines.slice(0, LIMITS.actions),
    `- … ${lines.length - LIMITS.actions} more actions`,
  ].join('\n')
}

/**
 * The judge's view of one run: reply, changes, actions and automatic checks.
 * It carries no arm, skill or model name. Installed-skill paths are masked so a read of a
 * skill file shows as an action without naming the skill.
 */
export function renderRun(run, label) {
  const mask = (text) =>
    text.replace(/\.(claude|agents)\/skills\/[^\s/'"`]+/g, '.$1/skills/<skill>')
  const checks = run.hardCheck.passed
    ? 'All automatic checks passed.'
    : `Automatic check failed: ${run.hardCheck.failure}`
  return [
    `# Version ${label}`,
    '',
    '## Final reply',
    '',
    clip(run.output || '(no reply)', LIMITS.reply),
    '',
    '## Changes since the starting state',
    '',
    '```diff',
    clip(run.diff || '(no changes)', LIMITS.diff),
    '```',
    '',
    '## Commits',
    '',
    run.commits || '(none)',
    '',
    '## Actions taken (from the tool log)',
    '',
    mask(summarizeActions(run.toolCalls)) || '(no tool calls)',
    '',
    '## Automatic checks',
    '',
    checks,
    '',
  ].join('\n')
}

/** A known-worse twin of a run for the known-gap control: no changes, no actions, a non-answer. */
export function degrade(run) {
  return {
    ...run,
    id: `${run.id}|degraded`,
    output: 'I was not able to complete this task.',
    diff: '',
    commits: '',
    toolCalls: [],
    hardCheck: { passed: false, failure: 'no work was done' },
  }
}

export const runId = (run) => `${run.task}|${run.arm}|${run.repetition}`

/** Every cross-arm pair within each task, as [a, b] run ids sorted for a stable pair id. */
export function planPairs(runs, arms) {
  const pairs = []
  const byTask = Map.groupBy(runs, (run) => run.task)
  for (const [task, list] of byTask)
    for (let i = 0; i < arms.length; i++)
      for (let j = i + 1; j < arms.length; j++)
        for (const a of list.filter((run) => run.arm === arms[i]))
          for (const b of list.filter((run) => run.arm === arms[j])) {
            const [first, second] = [runId(a), runId(b)].sort()
            pairs.push({ pairId: `${first}~${second}`, task, a: first, b: second })
          }
  return pairs
}

export const JUDGE_RUBRIC = `You compare two versions of an AI coding assistant's work on the same task. Judge the work a
careful senior engineer would want to merge and the reply they would want to read.

Grade from the evidence shown: the changes, commits, actions taken and automatic checks. A claim in the
reply that the actions do not support counts against that version. Prefer root-cause fixes, correct
scope, verified results and honest reporting over volume. Ignore formatting and length unless they hide
or misstate results. Do not assume either version is better because of its label or order.

Score each version 1-5 on whether you would ship it as-is: 1 harmful or wrong, 2 not shippable,
3 shippable with real fixes, 4 shippable with nits, 5 ship as-is.`

export function parseVerdict(text) {
  const match = [...text.matchAll(/\{[^{}]*"winner"[^{}]*\}/g)].at(-1)
  if (!match) throw new Error(`no verdict JSON in judge reply: ${text.slice(0, 200)}`)
  const parsed = JSON.parse(match[0])
  if (!['A', 'B', 'tie'].includes(parsed.winner)) throw new Error(`bad winner ${parsed.winner}`)
  return parsed
}
