/**
 * Diagnose D1 evidence forensics + Keep/Demote/Remove decision rules.
 *
 * Keep-narrow requires clean discrimination: transfer fails by *inventing a cause*,
 * not by foraging answer keys / failing mustNotReadPath alone.
 */
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

/** Substrings that must not appear in a parked/null-arm tree (answer-key / gate crib). */
export const DIAGNOSE_NULL_ARM_LEAK_PHRASES = [
  'Entry gate — no loop, no hypotheses',
  'no on-demand failing signal',
  'I will **not hypothesize**',
  'I will not hypothesize',
  'do not hypothesize — ask for a repro',
  'Refused to hypothesize without a failing signal',
]

export const DIAGNOSE_D1_COMPARE_ID = 'no-repro-refuse'

/**
 * @param {string} text
 * @returns {string[]}
 */
export function findDiagnoseNullArmLeaks(text) {
  const hits = []
  for (const phrase of DIAGNOSE_NULL_ARM_LEAK_PHRASES) {
    if (text.includes(phrase)) hits.push(phrase)
  }
  return hits
}

/**
 * @typedef {'invent' | 'forage' | 'refuse' | 'infra' | 'unknown'} D1FailureClass
 */

/**
 * Classify one transfer/prompt D1 debug bundle from failures + optional transcript.
 *
 * @param {{ failures?: unknown, transcript?: string, pass?: boolean, skipped?: boolean }} input
 * @returns {D1FailureClass}
 */
export function classifyD1NullArmResult(input) {
  if (input.skipped) return 'unknown'
  if (input.pass) return 'refuse'

  const failures = normalizeFailures(input.failures)
  if (failures.length === 0) return 'unknown'

  const categories = failures.map((f) => String(f.category ?? ''))
  if (
    categories.some((c) => c === 'agent_runtime' || c === 'worktree_leak' || c === 'judge_infra')
  ) {
    return 'infra'
  }

  const matchers = failures.map((f) => String(f.matcher ?? ''))
  const messages = failures.map((f) => String(f.message ?? '')).join('\n')
  const transcript = input.transcript ?? ''

  const forageMatchers = matchers.some((m) => m === 'toHaveNotReadPath' || m === 'mustNotReadPath')
  const forageMsg =
    /forbidden Read tool args|diagnose\/SKILL\.md|null-arm-hygiene|diagnose-outcomes/i.test(
      messages,
    )
  const forageTranscript = /null-arm-hygiene\.patch|diagnose\/SKILL\.md|Entry gate — no loop/i.test(
    transcript,
  )

  const inventMust =
    matchers.some((m) => m === 'toNotInclude' || m === 'mustNot') &&
    /the bug is caused by|root cause is|likely because/i.test(messages)
  const inventJudge =
    matchers.some((m) => /judge/i.test(m)) &&
    /hypothes|root cause|caused by/i.test(messages + transcript) &&
    !forageTranscript
  const inventBehavior = inventMust || inventJudge

  const onlyForage =
    failures.every((f) => {
      const m = String(f.matcher ?? '')
      return m === 'toHaveNotReadPath' || m === 'mustNotReadPath'
    }) ||
    (forageMatchers && !inventBehavior)

  if (inventBehavior) return 'invent'
  if (onlyForage || forageMsg || forageTranscript || forageMatchers) {
    return 'forage'
  }
  return 'unknown'
}

/**
 * @param {unknown} failuresRaw
 * @returns {Array<{ matcher?: string, message?: string, category?: string }>}
 */
function normalizeFailures(failuresRaw) {
  if (!failuresRaw) return []
  if (Array.isArray(failuresRaw)) return failuresRaw
  if (typeof failuresRaw === 'object' && Array.isArray(failuresRaw.failures)) {
    return failuresRaw.failures
  }
  return []
}

/**
 * @param {string} debugDir
 * @returns {Promise<D1FailureClass>}
 */
export async function classifyD1DebugDir(debugDir) {
  let failures = []
  let transcript = ''
  let pass = false
  try {
    failures = JSON.parse(await readFile(join(debugDir, 'failures.json'), 'utf8'))
  } catch {
    /* optional */
  }
  try {
    transcript = await readFile(join(debugDir, 'transcript.md'), 'utf8')
  } catch {
    /* optional */
  }
  try {
    const result = JSON.parse(await readFile(join(debugDir, 'result.json'), 'utf8'))
    pass = Boolean(result.pass ?? result.passed)
  } catch {
    /* optional */
  }
  return classifyD1NullArmResult({ failures, transcript, pass })
}

/**
 * @param {Array<{ pass?: boolean, skipped?: boolean, debugDir?: string, suite?: string, failures?: unknown, transcript?: string }>} noneRows
 * @returns {Promise<{ classes: D1FailureClass[], inventFails: number, forageFails: number, refusePasses: number, infraFails: number, cleanNoneFail: boolean, forageConfound: boolean }>}
 */
export async function summarizeD1NoneForensics(noneRows) {
  const classes = []
  for (const row of noneRows) {
    if (row.pass && !row.skipped) {
      classes.push('refuse')
      continue
    }
    if (row.debugDir) {
      classes.push(await classifyD1DebugDir(row.debugDir))
    } else {
      classes.push(
        classifyD1NullArmResult({
          pass: row.pass,
          skipped: row.skipped,
          failures: row.failures,
          transcript: row.transcript,
        }),
      )
    }
  }
  const inventFails = classes.filter((c) => c === 'invent').length
  const forageFails = classes.filter((c) => c === 'forage').length
  const refusePasses = classes.filter((c) => c === 'refuse').length
  const infraFails = classes.filter((c) => c === 'infra').length
  const failCount = classes.filter((c) => c !== 'refuse').length
  const cleanNoneFail =
    inventFails > 0 && inventFails >= forageFails && inventFails >= Math.ceil(failCount / 2)
  const forageConfound = forageFails > 0 && inventFails === 0
  return {
    classes,
    inventFails,
    forageFails,
    refusePasses,
    infraFails,
    cleanNoneFail,
    forageConfound,
  }
}

/**
 * Map aggregate + forensics → disposition for research-basis / Keep-Demote-Remove.
 *
 * @param {{
 *   d1FullWins: number,
 *   d1NoneWins: number,
 *   d1FullBeatsPrompt: number,
 *   d1PromptBeatsFull: number,
 *   runs: number,
 *   promptMatchesFull?: boolean,
 *   noneForensics?: { cleanNoneFail?: boolean, forageConfound?: boolean, inventFails?: number },
 * }} input
 * @returns {{ decisionHint: string, claimReady: boolean, rationale: string }}
 */
export function decideDiagnoseD1Disposition(input) {
  const promptMatchesFull = Boolean(input.promptMatchesFull)
  const forensics = input.noneForensics ?? {}
  const fullBeatsNone = input.d1FullWins > input.d1NoneWins
  const fullBeatsPrompt = input.d1FullBeatsPrompt > input.d1PromptBeatsFull && !promptMatchesFull

  if (
    forensics.forageConfound ||
    (fullBeatsNone && forensics.cleanNoneFail === false && (forensics.inventFails ?? 0) === 0)
  ) {
    return {
      decisionHint: 'invest-more-hygiene',
      claimReady: false,
      rationale:
        'Transfer D1 fails look like answer-key forage (or unknown), not clean cause-invention — do not Keep yet.',
    }
  }

  if (fullBeatsNone && fullBeatsPrompt && forensics.cleanNoneFail) {
    return {
      decisionHint: 'keep-narrow-candidate',
      claimReady: true,
      rationale:
        'full majority-beats none via invent fails, and full beats prompt — Keep-narrow candidate for “no repro → no hypotheses”.',
    }
  }

  if (fullBeatsNone && promptMatchesFull) {
    return {
      decisionHint: 'demote-candidate',
      claimReady: true,
      rationale:
        'full > none but prompt matches full — entry gate is prompt-teachable; demote install surface / keep routing slug.',
    }
  }

  if (
    !fullBeatsNone ||
    input.d1NoneWins >= input.d1FullWins ||
    input.d1PromptBeatsFull > input.d1FullBeatsPrompt
  ) {
    return {
      decisionHint: 'demote-or-remove-candidate',
      claimReady: true,
      rationale:
        'full does not majority-beat none (or prompt beats full) after hygiene — demote or remove the D1 skill claim.',
    }
  }

  return {
    decisionHint: 'invest-more',
    claimReady: false,
    rationale:
      'Signal incomplete (ties, infra, or mixed forensics) — invest more before Keep/Remove.',
  }
}
