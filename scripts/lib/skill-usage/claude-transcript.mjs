// Reads Claude Code session transcripts (~/.claude/projects/<project>/<session>.jsonl) and names
// what each record is. The format is internal to Claude Code and changes between versions, so
// anything unrecognised is counted, never fatal.
import { closeSync, openSync, readSync } from 'node:fs'

/** Bench, judge and harness sessions: synthetic work that must never count as real use. */
const BENCH_PATH =
  /agent-harness-(?:seal|claude|openai)-|skill-bench-judge-|bench-workspace-|\.agent-test\/executions\/|agent-test-executions|toolbox-bench/

export const isBenchPath = (text = '') => BENCH_PATH.test(text)

const CHUNK = 8 << 20
/** Lines this long are API request dumps, not conversation; they are skipped unparsed. */
export const MAX_LINE = 16 << 20
const KEEP = new Set(['user', 'assistant'])

/** Each line of a file as a Buffer with its 1-based number, read in chunks (files can pass 1 GB). */
function* lines(path) {
  const fd = openSync(path, 'r')
  const chunk = Buffer.alloc(CHUNK)
  let parts = []
  let size = 0
  let number = 1
  let oversized = false
  try {
    for (let read; (read = readSync(fd, chunk, 0, CHUNK, null)) > 0;) {
      let start = 0
      for (
        let end = chunk.indexOf(10, start);
        end !== -1 && end < read;
        end = chunk.indexOf(10, start)
      ) {
        if (!oversized) parts.push(Buffer.from(chunk.subarray(start, end)))
        yield { number: number++, buffer: oversized ? null : Buffer.concat(parts) }
        parts = []
        size = 0
        oversized = false
        start = end + 1
      }
      if (start < read && !oversized) {
        size += read - start
        if (size > MAX_LINE) {
          oversized = true
          parts = []
        } else parts.push(Buffer.from(chunk.subarray(start, read)))
      }
    }
    if (parts.length || oversized) yield { number, buffer: oversized ? null : Buffer.concat(parts) }
  } finally {
    closeSync(fd)
  }
}

/**
 * The user and assistant records with their 1-based line numbers. Other record types (API dumps,
 * titles, snapshots) are dropped. Unparsable lines are counted, oversized ones skipped.
 */
export function readTranscript(path) {
  const records = []
  let unparsable = 0
  let oversized = 0
  for (const { number, buffer } of lines(path)) {
    if (!buffer) {
      oversized++
      continue
    }
    if (!buffer.length || buffer.toString('utf8', 0, 1).trim() === '') continue
    try {
      const record = JSON.parse(buffer.toString('utf8'))
      if (KEEP.has(record.type)) records.push({ ...record, line: number })
    } catch {
      unparsable++
    }
  }
  return { records, unparsable, oversized }
}

/** The plain text of a message's content, whether a string or a list of blocks. */
export function textOf(content) {
  if (typeof content === 'string') return content
  if (!Array.isArray(content)) return ''
  return content
    .filter((block) => block?.type === 'text')
    .map((block) => block.text)
    .join('\n')
}

/** Text with host-added <system-reminder> blocks removed, as the person typed it. */
export const withoutReminders = (text) =>
  text.replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, '').trim()

const INTERRUPT = '[Request interrupted by user'
const SKILL_BODY = 'Base directory for this skill:'
const NOT_HUMAN = /^\s*<(task-notification|local-command-|bash-stdout|bash-input)/

/**
 * What a `user` record is:
 * - `prompt`: text the person typed
 * - `slash`: a typed `/command` (a skill, or a built-in such as /model)
 * - `relay`: a brief from another Claude session (a coordinator that started or steers this one)
 * - `skill-body`: the skill text Claude Code injects after a skill starts
 * - `tool-result`, `interrupt`, `compact`, `notification` (task, peer or plugin messages), `meta`
 */
export function userRecordKind(record) {
  const content = record.message?.content
  if (record.isCompactSummary) return 'compact'
  if (Array.isArray(content) && content.some((block) => block?.type === 'tool_result'))
    return 'tool-result'
  const text = withoutReminders(textOf(content))
  if (text.startsWith(SKILL_BODY)) return 'skill-body'
  if (text.includes(INTERRUPT)) return 'interrupt'
  // A session another Claude session started or briefed: its note is the prompt.
  if (/^<(?:relay|cross-session-message)\b/.test(text)) return 'relay'
  if (record.isMeta) return 'meta'
  const origin = record.origin?.kind
  if (origin && origin !== 'human') return 'notification'
  if (NOT_HUMAN.test(text)) return 'notification'
  if (text.includes('<command-name>')) return 'slash'
  return text.trim() ? 'prompt' : 'meta'
}

/** `{ name, args }` of a typed slash command, or null. */
export function slashCommand(record) {
  const text = textOf(record.message?.content)
  const name = text.match(/<command-name>\/?([^<]+)<\/command-name>/)?.[1]?.trim()
  if (!name) return null
  return { name, args: text.match(/<command-args>([\s\S]*?)<\/command-args>/)?.[1]?.trim() ?? '' }
}

/** The skill text without the injected header line or a trailing ARGUMENTS block. */
export function skillBodyText(record) {
  return textOf(record.message?.content)
    .replace(/^Base directory for this skill:[^\n]*\n+/, '')
    .replace(/\n+ARGUMENTS:[\s\S]*$/, '')
}

/** Content blocks of an assistant record (each record usually holds one block). */
export const blocksOf = (record) =>
  Array.isArray(record.message?.content) ? record.message.content : []
