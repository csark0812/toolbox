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

/** Task sets: development tasks, then frozen held-out sets. A set is `<set>.json`, with hidden checks in `<set>-checks/`. */
export const TASK_SETS = ['tasks', 'holdout', 'holdout-v2', 'holdout-v3', 'holdout-v4']
export const HELD_OUT_SETS = TASK_SETS.filter((set) => set !== 'tasks')

/** Where a set's hidden acceptance checks live; development checks use `dev-checks/`. */
export const checksDir = (set) => `agent-suites/skill-bench/${set === 'tasks' ? 'dev' : set}-checks`

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

/** Pack and product names that identify a skill set even outside a skill name. */
const PACK_WORDS = ['pstack', 'poteto', 'toolbox']

const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Replace skill identities with `<skill>` so the judge cannot tell which skill set ran.
 * Installed-skill paths and pack words are always masked. Hyphenated names are distinctive
 * enough to mask anywhere; plain-word names (`how`, `probe`) only when the text calls them a
 * skill, playbook or mode, or quotes them in backticks, so ordinary prose survives.
 */
export function maskSkillNames(text, names = []) {
  let masked = text.replace(/((?:\.claude|\.agents|\.codex|~)\/skills)\/[^\s/'"`)]+/g, '$1/<skill>')
  const distinctive = [...PACK_WORDS, ...names.filter((name) => name.includes('-'))]
  for (const name of distinctive.sort((a, b) => b.length - a.length))
    masked = masked.replace(new RegExp(`(?<![\\w-])/?${escape(name)}(?![\\w-])`, 'gi'), '<skill>')
  for (const name of names) {
    const word = escape(name)
    masked = masked
      .replace(new RegExp(`\`/?${word}\``, 'gi'), '`<skill>`')
      .replace(
        new RegExp(`(?<![\\w-])/?${word}(?=\\s+(?:skill|skills|playbook|mode)\\b)`, 'gi'),
        '<skill>',
      )
  }
  return masked
}

/**
 * The judge's view of one run: reply, changes, actions and automatic checks.
 * It carries no arm, skill, pack or model name: skill identities are masked with `<skill>`.
 */
export function renderRun(run, label, { skillNames = [] } = {}) {
  const mask = (text) => maskSkillNames(text, skillNames)
  const checks = run.hardCheck.passed
    ? 'All automatic checks passed.'
    : `Automatic check failed: ${run.hardCheck.failure}`
  return [
    `# Version ${label}`,
    '',
    '## Final reply',
    '',
    mask(clip(run.output || '(no reply)', LIMITS.reply)),
    '',
    '## Changes since the starting state',
    '',
    '```diff',
    mask(clip(run.diff || '(no changes)', LIMITS.diff)),
    '```',
    '',
    '## Commits',
    '',
    mask(run.commits || '(none)'),
    '',
    '## Actions taken (from the tool log)',
    '',
    mask(summarizeActions(run.toolCalls)) || '(no tool calls)',
    '',
    '## Automatic checks',
    '',
    mask(checks),
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

/**
 * Cross-arm pairs within each task, as [a, b] run ids sorted for a stable pair id. Full mode pairs
 * every run with every run of the other arm; matched mode (quick signal) pairs equal repetitions only.
 */
export function planPairs(runs, arms, { matched = false } = {}) {
  const pairs = []
  const byTask = Map.groupBy(runs, (run) => run.task)
  for (const [task, list] of byTask)
    for (let i = 0; i < arms.length; i++)
      for (let j = i + 1; j < arms.length; j++)
        for (const a of list.filter((run) => run.arm === arms[i]))
          for (const b of list.filter(
            (run) => run.arm === arms[j] && (!matched || run.repetition === a.repetition),
          )) {
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

/** Every balanced, string-aware `{...}` span in the text, in order. */
function jsonObjects(text) {
  const spans = []
  for (let start = text.indexOf('{'); start !== -1; start = text.indexOf('{', start + 1)) {
    let depth = 0
    let quoted = false
    for (let end = start; end < text.length; end++) {
      const char = text[end]
      if (quoted) {
        if (char === '\\') end++
        else if (char === '"') quoted = false
      } else if (char === '"') quoted = true
      else if (char === '{') depth++
      else if (char === '}' && --depth === 0) {
        spans.push(text.slice(start, end + 1))
        break
      }
    }
  }
  return spans
}

/** The last JSON object in the judge's reply that carries a winner. Braces inside reasons are fine. */
export function parseVerdict(text) {
  const verdict = jsonObjects(text)
    .map((span) => {
      try {
        return JSON.parse(span)
      } catch {
        return null
      }
    })
    .filter((value) => value && typeof value === 'object' && 'winner' in value)
    .at(-1)
  if (!verdict) throw new Error(`no verdict JSON in judge reply: ${text.slice(0, 200)}`)
  if (!['A', 'B', 'tie'].includes(verdict.winner)) throw new Error(`bad winner ${verdict.winner}`)
  return verdict
}
