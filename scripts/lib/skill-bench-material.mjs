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
export const TASK_SETS = [
  'tasks',
  'holdout',
  'holdout-v2',
  'holdout-v3',
  'holdout-v4',
  'holdout-v5',
  'holdout-v6',
  'holdout-v7',
  'holdout-v8',
  'holdout-design-v1',
]
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
const PACK_WORDS = [
  'pstack',
  'poteto',
  'toolbox',
  'tasteskill',
  'taste-skill',
  'design-taste-frontend',
]

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
export function renderRun(
  run,
  label,
  { skillNames = [], screenshotNames = [], frameNames = [] } = {},
) {
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
    ...(run.screenshots ? renderedSection(run, screenshotNames) : []),
    ...(run.frames ? framesSection(run, frameNames) : []),
  ].join('\n')
}

/** The screenshot files the judge is given for a visual task, in screen order. */
function renderedSection(run, names) {
  if (!names.length) return ['## Rendered page', '', 'No screenshots: the page did not render.', '']
  const cut = run.screenshotsTruncated?.length
    ? ` The page is longer than the screens shown at ${run.screenshotsTruncated.join(' and ')} width.`
    : ''
  return [
    '## Rendered page',
    '',
    `Screenshots of the final page, one screen at a time, top to bottom.${cut}`,
    '',
    ...names.map((name) => `- ${name}`),
    '',
  ]
}

/** What each group of motion and interaction frames shows, in the order the judge reads them. */
export const FRAME_GROUPS = {
  entrance:
    'Entrance: the first screen at desktop width 0ms, 300ms and 1200ms after the page loaded.',
  action:
    "The first screen's primary action (its first button, or link styled as one), cropped: at rest, with the pointer over it, and reached with the Tab key.",
  scroll:
    'Scrolling: each of the next two sections just as it comes into view, then after it has settled.',
  'reduced-motion':
    'The first screen just after load with the visitor’s reduced-motion setting on: content should be there and still.',
}

/** The motion and interaction frames for one version, grouped and labelled. */
function framesSection(run, names) {
  const notes = (run.frameNotes ?? []).map((note) => `Note: ${note}`)
  if (!names.length)
    return ['## Motion and interaction', '', ...(notes.length ? notes : ['No frames.']), '']
  const lines = ['## Motion and interaction', '']
  for (const [group, caption] of Object.entries(FRAME_GROUPS)) {
    const files = run.frames
      .map((frame, index) => ({ frame, name: names[index] }))
      .filter(({ frame, name }) => frame.group === group && name)
    if (!files.length) continue
    lines.push(`### ${caption}`, '', ...files.map(({ name }) => `- ${name}`), '')
  }
  return [...lines, ...notes, ...(notes.length ? [''] : [])]
}

/** A frame's file name as the judge sees it: `A-frame-load-300ms.jpg` and so on. */
export const frameName = (label, frame) => `${label}-frame-${frame.step}.jpg`

/** Screenshot file names for one version as the judge sees them: `A-phone-1.jpg` and so on. */
export const screenshotName = (label, shot) => `${label}-${shot.viewport}-${shot.screen}.jpg`

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
    ...(run.screenshots ? { screenshots: [], screenshotsTruncated: [] } : {}),
    ...(run.frames ? { frames: [], frameNotes: [] } : {}),
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

/**
 * Added to the rubric when the versions carry screenshots: the task is visual, so the page as a
 * visitor sees it is the main evidence, ahead of what the reply says about it.
 */
export const VISUAL_RUBRIC = `This task is visual. Each version comes with screenshots of its final page at a phone and a desktop
width. Open and look at every screenshot before scoring. Judge the page a visitor would see: whether it
looks deliberately designed for this subject rather than like a generic template, the hierarchy and
first-screen clarity, typography, colour, spacing and composition, whether the requested content is all
there and readable, and whether the phone layout holds up. Something broken or missing in a screenshot
counts even if the reply says otherwise. Code quality and process still count, but after the result.

A version may also list motion and interaction frames, taken the same way for every version. Use them
to judge how the page behaves, not only how it rests:
- Entrance: content that is missing, blank or half-faded at 1200ms, or a first screen that is empty at
  0ms and only appears later, costs the visitor time; a quick, ordered settle is fine, and so is none.
- Feedback: the primary action should visibly respond to the pointer and show a clear focus indicator
  from the keyboard. No visible change on hover or focus is a defect; so is a focus ring that is hard to see.
- Scrolling: a section that is still hidden or faded once settled is broken. Motion should guide the eye
  to the section's content, not delay it.
- Reduced motion: the content must be present and readable. Hidden content there is a defect.
More motion is not better in itself; judge whether it helps the visitor read and act.`

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
