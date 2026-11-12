// Sampled LLM judging of archived episodes and missed-trigger candidates. The judge reads each case
// in an empty sealed workspace and answers in strict JSON. Results are cached by case id and rubric
// version, so a rerun judges only new cases. A failed or unreadable reply is logged and retried
// next run, never cached.
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse as parseYaml } from 'yaml'
import { jsonObjects } from '../skill-bench-material.mjs'

export const RUBRIC_VERSION = 1
export const OUTCOMES = ['success', 'partial', 'failure', 'unclear']
export const FAILURE_MODES = [
  'misrouted',
  'skipped-step',
  'wrong-assumption',
  'over-scoped',
  'under-delivered',
  'asked-too-much',
  'tool-friction',
  'host-limit',
  'other',
]
const ROUTING = ['good', 'partial', 'wrong']
const FOLLOWED = ['yes', 'partly', 'no', 'n/a']
const SHOULD = ['yes', 'no', 'borderline']

/** `{ description, when_to_use }` from a skill's SKILL.md frontmatter. */
export function skillCard(root, skill) {
  const path = join(root, skill, 'SKILL.md')
  if (!existsSync(path)) return { skill, description: '(not a toolbox skill)' }
  const front = parseYaml(readFileSync(path, 'utf8').split('---')[1] ?? '') ?? {}
  return { skill, description: front.description ?? '', whenToUse: front.when_to_use ?? '' }
}

const quote = (text = '') => `> ${String(text).trim().replaceAll('\n', '\n> ')}`

function renderActions(actions) {
  if (!actions.length) return '(no tool calls)'
  return actions
    .slice(0, 150)
    .map((action) => {
      const args = action.args ?? {}
      const detail = args.command ?? args.file_path ?? args.skill ?? args.pattern ?? args.url ?? ''
      const mark = action.isError ? ` — ERROR: ${String(action.result).replace(/\s+/g, ' ')}` : ''
      return `- ${action.name}${detail ? `: ${String(detail).replace(/\s+/g, ' ')}` : ''}${mark}`
    })
    .join('\n')
}

/** The episode as the judge reads it. */
export function renderEpisode(episode) {
  return `# Skill episode

Skill: \`${episode.skill}\` — ${episode.trigger === 'user-slash' ? 'the user typed it as a /command' : episode.trigger === 'nested' ? 'started by the agent inside another skill' : 'the agent chose it on its own'}.
The request came from ${episode.promptFrom === 'agent' ? 'another agent session' : 'the user'}.

## Earlier prompts (context only)

${episode.earlier.length ? episode.earlier.map(quote).join('\n\n') : '(none)'}

## The request

${quote(episode.prompt)}

## Arguments the skill was given

${quote(episode.args || '(none)')}

## The agent's reasoning just before it called the skill

${quote(episode.rationale || '(not recorded)')}

## What the agent did after the skill started

${renderActions(episode.actions)}

## The agent's last words to the user

${quote(episode.reply || '(nothing)')}

## What the user said next

${episode.next ? quote(episode.next.text) : '(nothing: the session ended here)'}
${episode.interrupted ? '\nThe user interrupted the agent during this episode.\n' : ''}`
}

export const EPISODE_RUBRIC = `You review how an AI coding assistant used one of its skills (a written playbook it loads for a
kind of task) during real work. Read episode.md (what happened) and skill.md (the skill's description
and the exact text the assistant loaded). Judge only from what the files show.

- intent: what the user wanted, in a few words.
- routing_fit: was this skill the right one for the request, by its description and its "Not ..." limits?
  good, partial (it fits part of the request), or wrong. If another skill would fit better, name it in
  better_skill, else "none".
- followed_skill: did the assistant do what the skill text says? yes, partly, no, or n/a (too little
  happened to tell).
- outcome: did the user get what they asked for? success, partial, failure, or unclear (not enough
  evidence). The user's next message is the strongest evidence: a correction or a repeated request
  counts against; moving on or thanks counts for. A session that simply ends is unclear unless the work
  itself shows the result.
- score: 1 (harmful or useless) to 5 (exactly what was needed).
- failure_mode: when the outcome is not success, the main cause, one of: ${FAILURE_MODES.join(', ')}. Else "none".
- evidence: 1-3 short exact quotes from episode.md that support your outcome.
- skill_sentence: the sentence of the skill text most responsible for what went wrong or right, quoted
  exactly, or "" if none applies.
- summary: one sentence.`

/** The judge's answer, validated. Throws on a reply without a usable JSON object. */
export function parseJudgment(text) {
  const found = jsonObjects(text)
    .map((span) => {
      try {
        return JSON.parse(span)
      } catch {
        return null
      }
    })
    .filter((value) => value && typeof value === 'object' && 'outcome' in value)
    .at(-1)
  if (!found) throw new Error(`no judgment JSON in reply: ${text.slice(0, 200)}`)
  if (!OUTCOMES.includes(found.outcome)) throw new Error(`bad outcome ${found.outcome}`)
  const score = Number(found.score)
  return {
    intent: String(found.intent ?? ''),
    routingFit: ROUTING.includes(found.routing_fit) ? found.routing_fit : null,
    betterSkill:
      found.better_skill && found.better_skill !== 'none' ? String(found.better_skill) : null,
    followedSkill: FOLLOWED.includes(found.followed_skill) ? found.followed_skill : null,
    outcome: found.outcome,
    score: score >= 1 && score <= 5 ? score : null,
    failureMode: FAILURE_MODES.includes(found.failure_mode) ? found.failure_mode : null,
    evidence: Array.isArray(found.evidence) ? found.evidence.map(String).slice(0, 3) : [],
    skillSentence: String(found.skill_sentence ?? ''),
    summary: String(found.summary ?? ''),
  }
}

/** A missed-trigger candidate as the judge reads it. */
export function renderTask(task) {
  return `# Task with no toolbox skill

## Earlier prompts (context only)

${task.earlier.length ? task.earlier.map(quote).join('\n\n') : '(none)'}

## The request

${quote(task.prompt)}

## Other skills the agent loaded

${task.otherSkills.length ? task.otherSkills.map((skill) => `- ${skill}`).join('\n') : '(none)'}

## What the agent did

${renderActions(task.actions)}

## What the user said next

${task.next ? quote(task.next.text) : '(nothing: the session ended here)'}
`
}

export const MISS_RUBRIC = `An AI coding assistant handled the request in task.md without loading any of the skills described
in skills.md (written playbooks it could have loaded). For each skill in skills.md, decide whether the
request clearly called for it, judging only by that skill's description and its "Not ..." limits:
yes, no, or borderline. "no" is the usual answer: most tasks are outside most skills. A small fix is
not a whole-page design; a question is not a bug fix.

For a "yes" or "borderline", quote the phrase of the skill's description the request matches in
matching_phrase, and say in reason what in the request matches it.`

/** `{ verdicts: [{ skill, shouldHaveCalled, matchingPhrase, reason }] }`, validated. */
export function parseMiss(text) {
  const found = jsonObjects(text)
    .map((span) => {
      try {
        return JSON.parse(span)
      } catch {
        return null
      }
    })
    .filter((value) => value && Array.isArray(value.verdicts))
    .at(-1)
  if (!found) throw new Error(`no verdicts JSON in reply: ${text.slice(0, 200)}`)
  return {
    verdicts: found.verdicts
      .filter((verdict) => verdict && SHOULD.includes(verdict.should_have_called))
      .map((verdict) => ({
        skill: String(verdict.skill),
        shouldHaveCalled: verdict.should_have_called,
        matchingPhrase: String(verdict.matching_phrase ?? ''),
        reason: String(verdict.reason ?? ''),
      })),
  }
}

/** Higher first: episodes whose free signals already suggest trouble. */
export function episodePriority(episode) {
  const signals = episode.signals ?? {}
  return (
    (episode.interrupted ? 3 : 0) +
    (signals.nextPrompt === 'correction' ? 3 : 0) +
    (signals.nextPrompt === 'repeat' ? 2 : 0) +
    (signals.userRedirect ? 3 : 0) +
    (signals.toolErrors > 0 ? 1 : 0) +
    (signals.lastTestPassed === false ? 1 : 0)
  )
}

const taskPriority = (task) => (task.competitor ? 2 : 0) + task.candidates.length

/**
 * Up to `limit` unjudged cases, taken in turns across skills so each skill gets a share, the
 * highest-priority (then newest) case of each skill first.
 */
export function sampleCases(cases, { limit, judged, skillOf, priority }) {
  const bySkill = new Map()
  for (const item of cases) {
    if (judged.has(item.id)) continue
    const skill = skillOf(item)
    if (!bySkill.has(skill)) bySkill.set(skill, [])
    bySkill.get(skill).push(item)
  }
  for (const list of bySkill.values())
    list.sort(
      (a, b) => priority(b) - priority(a) || String(b.timestamp).localeCompare(String(a.timestamp)),
    )
  const picked = []
  const queues = [...bySkill.keys()].sort().map((skill) => bySkill.get(skill))
  while (picked.length < limit && queues.some((queue) => queue.length))
    for (const queue of queues)
      if (queue.length && picked.length < limit) picked.push(queue.shift())
  return picked
}

const readLines = (path) =>
  existsSync(path)
    ? readFileSync(path, 'utf8')
        .split('\n')
        .filter(Boolean)
        .map((line) => JSON.parse(line))
    : []

/** Judgments of the current rubric, keyed by case id. */
export const loadJudgments = (dir, file) =>
  new Map(
    readLines(join(dir, file))
      .filter((entry) => entry.rubric === RUBRIC_VERSION)
      .map((entry) => [entry.id, entry]),
  )

/**
 * Judge a sample of new episodes and candidate tasks.
 * @param {object} options
 * @param {(files: Record<string,string>, prompt: string) => Promise<string>} options.ask
 *   runs one judge over the given files and returns its reply
 */
export async function judgeSample({
  dir,
  root,
  episodes,
  candidates,
  limit = 20,
  missed = 10,
  ask,
  judgeName = 'judge',
  log = () => {},
}) {
  const judged = loadJudgments(dir, 'judgments.jsonl')
  const missJudged = loadJudgments(dir, 'misses.jsonl')
  const record = (file, entry) => appendFileSync(join(dir, file), `${JSON.stringify(entry)}\n`)
  const fail = (kind, id, error) => {
    record('judge-errors.jsonl', {
      kind,
      id,
      error: String(error?.message ?? error),
      at: new Date().toISOString(),
    })
    log(`judge error on ${kind} ${id}: ${error?.message ?? error}`)
  }
  const result = { episodes: 0, misses: 0, errors: 0 }

  const episodeSample = sampleCases(episodes, {
    limit,
    judged,
    skillOf: (episode) => episode.skill,
    priority: episodePriority,
  })
  for (const episode of episodeSample) {
    const card = skillCard(root, episode.skill)
    const bodyPath = join(dir, 'bodies', `${episode.skillBodySha}.md`)
    const body = existsSync(bodyPath) ? readFileSync(bodyPath, 'utf8') : '(skill text not recorded)'
    const files = {
      'episode.md': renderEpisode(episode),
      'skill.md': `# Skill \`${episode.skill}\`\n\n## Description\n\n${card.description}\n\n${card.whenToUse ? `${card.whenToUse}\n\n` : ''}## The text the assistant loaded\n\n${body}\n`,
    }
    const prompt = `${EPISODE_RUBRIC}

Read episode.md and skill.md in full with whatever file-reading tool you have.

Reply with only this JSON:
{"intent": "...", "routing_fit": "good" | "partial" | "wrong", "better_skill": "slug" | "none", "followed_skill": "yes" | "partly" | "no" | "n/a", "outcome": "success" | "partial" | "failure" | "unclear", "score": 1-5, "failure_mode": "..." | "none", "evidence": ["..."], "skill_sentence": "...", "summary": "..."}`
    try {
      const judgment = parseJudgment(await ask(files, prompt))
      record('judgments.jsonl', {
        id: episode.id,
        skill: episode.skill,
        rubric: RUBRIC_VERSION,
        judge: judgeName,
        at: new Date().toISOString(),
        ...judgment,
      })
      result.episodes++
      log(`judged ${episode.skill}: ${judgment.outcome}`)
    } catch (error) {
      fail('episode', episode.id, error)
      result.errors++
    }
  }

  const missSample = sampleCases(candidates, {
    limit: missed,
    judged: missJudged,
    skillOf: (task) => task.candidates[0],
    priority: taskPriority,
  })
  for (const task of missSample) {
    const cards = task.candidates.map((skill) => skillCard(root, skill))
    const files = {
      'task.md': renderTask(task),
      'skills.md': cards
        .map((card) => `## \`${card.skill}\`\n\n${card.description}\n\n${card.whenToUse ?? ''}`)
        .join('\n\n'),
    }
    const prompt = `${MISS_RUBRIC}

Read task.md and skills.md in full with whatever file-reading tool you have.

Reply with only this JSON:
{"verdicts": [{"skill": "slug", "should_have_called": "yes" | "no" | "borderline", "matching_phrase": "...", "reason": "..."}]}`
    try {
      const { verdicts } = parseMiss(await ask(files, prompt))
      record('misses.jsonl', {
        id: task.id,
        candidates: task.candidates,
        rubric: RUBRIC_VERSION,
        judge: judgeName,
        at: new Date().toISOString(),
        verdicts,
      })
      result.misses++
      log(
        `judged candidate ${task.candidates.join('+')}: ${verdicts.map((verdict) => verdict.shouldHaveCalled).join(',')}`,
      )
    } catch (error) {
      fail('candidate', task.id, error)
      result.errors++
    }
  }
  return result
}

/** The default judge: Claude (Opus) in an empty sealed workspace, as the skill bench does. */
export async function sealedAsk(family = process.env.SKILL_USAGE_JUDGE ?? 'claude') {
  const { createEmptySealedWorkspace } = await import('@post-print/agent-harness')
  const { askJudge, judgeFor } = await import('../../skill-bench-judge.mjs')
  const judge = judgeFor('codex', family)
  return {
    name: judge.name,
    ask: async (files, prompt) => {
      const sealed = await createEmptySealedWorkspace()
      try {
        for (const [name, text] of Object.entries(files))
          writeFileSync(join(sealed.path, name), text)
        return await askJudge(judge.agent, sealed.path, prompt)
      } finally {
        await sealed.cleanup()
      }
    },
  }
}
