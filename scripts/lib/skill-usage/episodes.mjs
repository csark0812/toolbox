// Turns one transcript into skill episodes and plain tasks.
//
// A turn is a real user prompt (typed text or a typed /command) plus everything the agent did
// until the next real prompt. Task notifications, tool results and interrupts stay inside the turn.
// An episode is one skill invocation: from its trigger to the end of its turn, plus the prompt
// that followed as feedback. A task is a turn with no toolbox skill call, kept for recall checks.
import { createHash } from 'node:crypto'
import { basename } from 'node:path'
import {
  blocksOf,
  skillBodyText,
  slashCommand,
  textOf,
  userRecordKind,
  withoutReminders,
} from './claude-transcript.mjs'

export const EPISODE_SCHEMA = 1
const CLIP = { prompt: 4000, args: 2000, rationale: 2000, reply: 4000, actionArg: 240, result: 400 }

const clip = (text = '', limit) =>
  text.length > limit ? `${text.slice(0, limit)} … [${text.length - limit} more]` : text

export const sha = (text) => createHash('sha256').update(text).digest('hex').slice(0, 16)

/** Split main-thread records into turns that each start at a real prompt. */
export function splitTurns(records) {
  const turns = []
  let current = null
  for (const record of records) {
    if (record.isSidechain) continue
    if (record.type === 'user') {
      const kind = userRecordKind(record)
      if (kind === 'prompt' || kind === 'slash' || kind === 'relay') {
        current = { start: record, kind, records: [] }
        turns.push(current)
        continue
      }
    }
    current?.records.push(record)
  }
  return turns
}

/** Tool calls in order, each with whether its result was an error and a short result. */
function actionsOf(records) {
  const results = new Map()
  for (const record of records)
    if (record.type === 'user')
      for (const block of blocksOf(record))
        if (block?.type === 'tool_result') results.set(block.tool_use_id, block)
  const actions = []
  for (const record of records)
    if (record.type === 'assistant')
      for (const block of blocksOf(record))
        if (block?.type === 'tool_use') {
          const result = results.get(block.id)
          const resultText = result ? textOf(result.content) || String(result.content ?? '') : ''
          actions.push({
            id: block.id,
            name: block.name,
            args: clipArgs(block.input),
            isError: Boolean(result?.is_error),
            result: clip(resultText, CLIP.result),
            line: record.line,
          })
        }
  return actions
}

/** Tool input with every value shortened; nested values become clipped JSON text. */
function clipArgs(input = {}) {
  const out = {}
  for (const [key, value] of Object.entries(input ?? {}))
    out[key] =
      typeof value === 'string'
        ? clip(value, CLIP.actionArg)
        : value && typeof value === 'object'
          ? clip(JSON.stringify(value), CLIP.actionArg)
          : value
  return out
}

/** Input, output and cache tokens, counted once per API message. */
function tokensOf(records) {
  const seen = new Set()
  const total = { input: 0, output: 0, cacheRead: 0, cacheCreate: 0 }
  for (const record of records) {
    const usage = record.type === 'assistant' && record.message?.usage
    const id = record.message?.id ?? record.requestId ?? record.uuid
    if (!usage || seen.has(id)) continue
    seen.add(id)
    total.input += usage.input_tokens ?? 0
    total.output += usage.output_tokens ?? 0
    total.cacheRead += usage.cache_read_input_tokens ?? 0
    total.cacheCreate += usage.cache_creation_input_tokens ?? 0
  }
  return total
}

/** Assistant thinking and text, joined in order. */
function assistantText(records, { thinking = false } = {}) {
  const parts = []
  for (const record of records)
    if (record.type === 'assistant')
      for (const block of blocksOf(record)) {
        if (block?.type === 'text' && block.text) parts.push(block.text)
        if (thinking && block?.type === 'thinking' && block.thinking) parts.push(block.thinking)
      }
  return parts.join('\n\n')
}

const promptText = (turn) => {
  if (turn.kind === 'slash') {
    const command = slashCommand(turn.start)
    return `/${command?.name ?? ''} ${command?.args ?? ''}`.trim()
  }
  return withoutReminders(textOf(turn.start.message?.content))
}

/** Skill calls in a turn, in order: a typed /skill first, then Skill tool calls. */
function skillCallsOf(turn) {
  const calls = []
  const bodies = turn.records.filter(
    (record) => record.type === 'user' && userRecordKind(record) === 'skill-body',
  )
  let bodyIndex = 0
  if (turn.kind === 'slash' && bodies.length) {
    const command = slashCommand(turn.start)
    const body = turn.records.findIndex((record) => record === bodies[0])
    // Only a slash command that loaded a skill body is a skill; /model or /loop are not.
    if (command && body !== -1 && body <= 3) {
      calls.push({
        skill: command.name,
        args: command.args,
        via: 'slash',
        record: turn.start,
        index: -1,
        id: turn.start.uuid,
        body: bodies[bodyIndex++],
      })
    }
  }
  turn.records.forEach((record, index) => {
    if (record.type !== 'assistant') return
    for (const block of blocksOf(record))
      if (block?.type === 'tool_use' && block.name === 'Skill' && block.input?.skill) {
        const body = turn.records
          .slice(index + 1)
          .find((later) => later.type === 'user' && userRecordKind(later) === 'skill-body')
        calls.push({
          skill: block.input.skill,
          args: block.input.args ?? '',
          via: 'tool',
          record,
          index,
          id: block.id,
          body,
        })
      }
  })
  return calls
}

/**
 * Episodes and tasks of one transcript.
 * @param {object[]} records from readTranscript
 * @param {{ toolboxSkills: Set<string>, transcript: string }} options
 */
export function buildEpisodes(records, { toolboxSkills, transcript }) {
  const turns = splitTurns(records)
  const session =
    records.find((record) => record.sessionId)?.sessionId ?? basename(transcript, '.jsonl')
  const episodes = []
  const tasks = []
  const bodies = new Map()
  turns.forEach((turn, turnIndex) => {
    const calls = skillCallsOf(turn)
    const prompt = promptText(turn)
    const earlier = turns
      .slice(Math.max(0, turnIndex - 2), turnIndex)
      .map((previous) => clip(promptText(previous), 600))
    const nextTurn = turns[turnIndex + 1]
    const next = nextTurn
      ? { text: clip(promptText(nextTurn), CLIP.prompt), timestamp: nextTurn.start.timestamp }
      : null
    const meta = turn.records.find((record) => record.type === 'assistant') ?? turn.start
    const context = {
      session,
      transcript,
      cwd: turn.start.cwd ?? meta.cwd ?? null,
      gitBranch: turn.start.gitBranch ?? null,
      version: turn.start.version ?? meta.version ?? null,
      model: meta.message?.model ?? null,
      timestamp: turn.start.timestamp ?? null,
      promptFrom: turn.kind === 'relay' ? 'agent' : 'human',
    }
    const toolboxCalls = calls.filter((call) => toolboxSkills.has(call.skill))

    if (!toolboxCalls.length) {
      // A built-in command the agent never answered (/model, /compact) is not a task.
      if (!turn.records.some((record) => record.type === 'assistant')) return
      const actions = actionsOf(turn.records)
      tasks.push({
        schema: EPISODE_SCHEMA,
        id: `${session}__${turn.start.uuid ?? turn.start.line}`,
        ...context,
        line: turn.start.line,
        prompt: clip(prompt, CLIP.prompt),
        earlier,
        otherSkills: calls.map((call) => call.skill),
        actions,
        reply: clip(assistantText(turn.records).slice(-CLIP.reply * 2), CLIP.reply),
        next,
      })
      return
    }

    // A slash command typed after the agent had already worked on the previous prompt without
    // that skill is the clearest sign the model should have called it itself.
    const previous = turns[turnIndex - 1]
    const previousWorked =
      previous && actionsOf(previous.records).filter((action) => action.name !== 'Skill').length > 0
    const previousSkills = previous ? skillCallsOf(previous).map((call) => call.skill) : []

    toolboxCalls.forEach((call, callIndex) => {
      const bodyRecords = call.index === -1 ? turn.records : turn.records.slice(call.index)
      const before = call.index === -1 ? [] : turn.records.slice(0, call.index + 1)
      const bodyText = call.body ? skillBodyText(call.body) : null
      const bodySha = bodyText ? sha(normalizeSkillBody(bodyText)) : null
      if (bodySha && !bodies.has(bodySha)) bodies.set(bodySha, bodyText)
      const timestamps = bodyRecords.map((record) => record.timestamp).filter(Boolean)
      const startedAt = call.record.timestamp ?? turn.start.timestamp
      const endedAt = timestamps.at(-1) ?? startedAt
      const actions = actionsOf(bodyRecords).filter((action) => action.id !== call.id)
      episodes.push({
        schema: EPISODE_SCHEMA,
        id: `${session}__${call.id}`,
        skill: call.skill,
        // Nested: another toolbox skill already started in this turn (e.g. under workflow).
        trigger: call.via === 'slash' ? 'user-slash' : callIndex > 0 ? 'nested' : 'model-proactive',
        ...context,
        line: call.record.line,
        prompt: clip(prompt, CLIP.prompt),
        earlier,
        args: clip(call.args, CLIP.args),
        rationale: clip(
          assistantText(before, { thinking: true }).slice(-CLIP.rationale * 2),
          CLIP.rationale,
        ),
        skillBodySha: bodySha,
        lateSlash:
          call.via === 'slash' && Boolean(previousWorked) && !previousSkills.includes(call.skill),
        startedAt,
        endedAt,
        durationMs: startedAt && endedAt ? Date.parse(endedAt) - Date.parse(startedAt) : null,
        actions,
        skillsAfter: calls.slice(calls.indexOf(call) + 1).map((later) => later.skill),
        interrupted: bodyRecords.some(
          (record) => record.type === 'user' && userRecordKind(record) === 'interrupt',
        ),
        compacted: bodyRecords.some((record) => record.isCompactSummary),
        tokens: tokensOf(bodyRecords),
        reply: clip(assistantText(bodyRecords).slice(-CLIP.reply * 2), CLIP.reply),
        next,
      })
    })
  })
  return { episodes, tasks, bodies }
}

/**
 * Skill text compared across installs. Frontmatter, the doc-meta review stamp (installs can drop
 * its date), trailing spaces and blank-line runs do not count.
 */
export const normalizeSkillBody = (text) =>
  text
    .replace(/^---\n[\s\S]*?\n---\n/, '')
    .replace(/^<!--\s*doc-meta:.*-->$/gm, '')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
