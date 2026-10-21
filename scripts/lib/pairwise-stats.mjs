// Pure statistics for blinded pairwise benchmarks: order resolution, cluster bootstrap,
// three-way verdict and judge-health metrics. No I/O, so every rule is unit-testable.
// Ported from the UI benchmark (chris/agent/ui-bench) so the skill bench uses the same rules.

export const BAR = 0.6
export const FLOOR = 0.5
export const BOOTSTRAP_SAMPLES = 10000
/** With fewer runs per arm per task, run-level resampling cannot see run-to-run spread. */
export const MIN_REPEATS = 4
/**
 * Share of ties at which an undecided skill counts as saturated: both arms reached the same verified
 * result so often that there was nothing left to do better.
 */
export const SATURATED_TIES = 0.75
/** Fewer re-judged pairs than this cannot fail the test–retest health check. */
export const MIN_RETESTS = 5

/**
 * A raw judgment shows two runs in one order.
 * @typedef {{ pairId: string, task: string, first: string, second: string, winner: 'first'|'second'|'tie', control?: string }} RawJudgment
 * Run ids are `${task}|${arm}|${repetition}`.
 */

/**
 * Minimum gap between two runs' mean scores (both orders) for a scored judgment to count as a
 * win. Calibrated for screenshots on the UI bench. For code (skill bench, 2026-10-15, graded twins on
 * 44 development runs): 100% of evidence-stripped twins lose by at least 1 point and 0% of identical
 * pairs are called at any gap from 0.25 to 1, so 0.25 is safe for code. Finer tuning needs human grades.
 * See agent-suites/skill-bench/calibration-2026-10-15.json.
 */
export const SCORE_GAP = 0.25

/**
 * Combine both shown orders of each pair into one result.
 * Scored judgments (v3+): the run with the higher mean score wins if the gap ≥ SCORE_GAP.
 * Unscored judgments: a winner needs to win in both orders, otherwise tie.
 */
export function resolveOrders(judgments) {
  const byPair = new Map()
  for (const judgment of judgments) {
    if (judgment.control || judgment.retestOf) continue
    const list = byPair.get(judgment.pairId) ?? []
    list.push(judgment)
    byPair.set(judgment.pairId, list)
  }
  const resolved = []
  for (const [pairId, list] of byPair) {
    const winners = list.map((judgment) =>
      judgment.winner === 'tie' ? 'tie' : judgment[judgment.winner],
    )
    const complete = list.length >= 2
    const agreed = complete && winners.every((winner) => winner === winners[0])
    const [a, b] = [list[0].first, list[0].second].sort()
    const gap = complete ? scoreGap(list, a, b) : null
    const winner =
      gap === null
        ? agreed
          ? winners[0]
          : 'tie'
        : Math.abs(gap) >= SCORE_GAP
          ? gap > 0
            ? a
            : b
          : 'tie'
    resolved.push({ pairId, task: list[0].task, a, b, winner, complete })
  }
  return resolved
}

/** Mean score of run a minus run b over every order of a pair; null when any judgment is unscored. */
function scoreGap(list, a, b) {
  const totals = { [a]: [], [b]: [] }
  for (const judgment of list)
    for (const side of ['first', 'second']) {
      const score = judgment.scores?.[side]
      if (typeof score !== 'number') return null
      totals[judgment[side]].push(score)
    }
  const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length
  return mean(totals[a]) - mean(totals[b])
}

export const armOf = (runId) => runId.split('|')[1]

/**
 * Outcomes of `focus` arm against `other` arm, one row per resolved pair.
 * @returns {{ task: string, focusRun: string, otherRun: string, outcome: 'win'|'loss'|'tie' }[]}
 */
export function contrastOutcomes(resolved, focus, other) {
  const rows = []
  for (const pair of resolved) {
    const arms = [armOf(pair.a), armOf(pair.b)]
    if (!(arms.includes(focus) && arms.includes(other)) || focus === other) continue
    const focusRun = armOf(pair.a) === focus ? pair.a : pair.b
    const otherRun = focusRun === pair.a ? pair.b : pair.a
    const outcome = pair.winner === 'tie' ? 'tie' : pair.winner === focusRun ? 'win' : 'loss'
    rows.push({ task: pair.task, focusRun, otherRun, outcome })
  }
  return rows
}

export function winRate(rows) {
  const wins = rows.filter((row) => row.outcome === 'win').length
  const losses = rows.filter((row) => row.outcome === 'loss').length
  return {
    wins,
    losses,
    ties: rows.length - wins - losses,
    decisive: wins + losses,
    rate: wins + losses ? wins / (wins + losses) : null,
  }
}

/** Deterministic PRNG so a report can be regenerated exactly. */
export function mulberry32(seed) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Two-level cluster bootstrap: resample tasks, then each task's focus runs and other runs.
 * Cross-paired rows share runs, so resampling runs (not rows) keeps the interval honest.
 */
export function clusterBootstrap(rows, { samples = BOOTSTRAP_SAMPLES, seed = 1 } = {}) {
  const random = mulberry32(seed)
  const pick = (list) => list[Math.floor(random() * list.length)]
  const tasks = [...new Set(rows.map((row) => row.task))]
  const byTask = new Map(
    tasks.map((task) => {
      const taskRows = rows.filter((row) => row.task === task)
      const outcome = new Map(
        taskRows.map((row) => [`${row.focusRun}~${row.otherRun}`, row.outcome]),
      )
      return [
        task,
        {
          focus: [...new Set(taskRows.map((row) => row.focusRun))],
          other: [...new Set(taskRows.map((row) => row.otherRun))],
          outcome,
        },
      ]
    }),
  )
  const rates = []
  for (let sample = 0; sample < samples; sample++) {
    let wins = 0
    let decisive = 0
    for (let t = 0; t < tasks.length; t++) {
      const cluster = byTask.get(pick(tasks))
      const focus = cluster.focus.map(() => pick(cluster.focus))
      const other = cluster.other.map(() => pick(cluster.other))
      for (const f of focus)
        for (const o of other) {
          const outcome = cluster.outcome.get(`${f}~${o}`)
          if (outcome === 'win') {
            wins++
            decisive++
          } else if (outcome === 'loss') decisive++
        }
    }
    if (decisive) rates.push(wins / decisive)
  }
  rates.sort((x, y) => x - y)
  if (!rates.length) return { lower: null, upper: null }
  return {
    lower: rates[Math.floor(rates.length * 0.025)],
    upper: rates[Math.min(rates.length - 1, Math.ceil(rates.length * 0.975) - 1)],
  }
}

/**
 * Three-way verdict on the primary contrast (focus arm vs baseline arm).
 * Better: rate ≥ BAR, lower bound > FLOOR, and no more hard-check failures.
 * Not better: upper bound < BAR. Saturated: otherwise undecided, but at least SATURATED_TIES of
 * the pairs are ties, wins are at least losses, no more hard-check failures, and fewer median
 * tokens: when nothing could be done better, the cheaper arm is the better one. Otherwise
 * inconclusive. Never final before MIN_REPEATS runs per arm per task.
 */
export function verdict(
  { rate, lower, upper, repeats, wins = 0, losses = 0, ties = 0 },
  defects,
  tokens = {},
) {
  if (repeats < MIN_REPEATS) return 'inconclusive'
  const total = wins + losses + ties
  const cheaper = tokens.focus > 0 && tokens.other > 0 && tokens.focus < tokens.other
  const saturated =
    total > 0 &&
    ties / total >= SATURATED_TIES &&
    wins >= losses &&
    defects.focus <= defects.other &&
    cheaper
  if (rate === null || lower === null || upper === null)
    return saturated ? 'saturated' : 'inconclusive'
  if (upper < BAR) return 'not-better'
  if (rate >= BAR && lower > FLOOR && defects.focus <= defects.other) return 'better'
  return saturated ? 'saturated' : 'inconclusive'
}

/** Re-judged comparisons paired with their original, as winner run ids (or 'tie'). */
export function retestPairs(judgments) {
  const winnerRun = (judgment) => (judgment.winner === 'tie' ? 'tie' : judgment[judgment.winner])
  const originals = new Map(
    judgments
      .filter((judgment) => !judgment.control && !judgment.retestOf)
      .map((judgment) => [`${judgment.pairId}|${judgment.first}`, judgment]),
  )
  return judgments
    .filter((judgment) => judgment.retestOf && originals.has(judgment.retestOf))
    .map((judgment) => ({
      original: winnerRun(originals.get(judgment.retestOf)),
      retest: winnerRun(judgment),
    }))
}

/** Judge-health metrics; any failing check withholds the verdict. */
export function judgeHealth(
  judgments,
  retests = retestPairs(judgments),
  { requireKnownGap = true } = {},
) {
  const real = judgments.filter((judgment) => !judgment.control && !judgment.retestOf)
  const decisiveRaw = real.filter((judgment) => judgment.winner !== 'tie')
  const firstWins = decisiveRaw.filter((judgment) => judgment.winner === 'first').length
  const positionBias = decisiveRaw.length ? firstWins / decisiveRaw.length : null

  const identical = judgments.filter((judgment) => judgment.control === 'identical')
  const noiseFloor = identical.length
    ? identical.filter((judgment) => judgment.winner !== 'tie').length / identical.length
    : null

  const knownGap = judgments.filter((judgment) => judgment.control === 'known-gap')
  const knownGapAccuracy = knownGap.length
    ? knownGap.filter((judgment) => judgment[judgment.winner] === judgment.expected).length /
      knownGap.length
    : null

  const retestAgreement = retests.length
    ? retests.filter((pair) => pair.original === pair.retest).length / retests.length
    : null

  const resolved = resolveOrders(judgments)
  const decisiveRate = resolved.length
    ? resolved.filter((pair) => pair.winner !== 'tie').length / resolved.length
    : null

  const checks = [
    {
      name: 'position bias',
      value: positionBias,
      ok: positionBias === null || (positionBias >= 0.4 && positionBias <= 0.6),
      expect: 'first-shown wins 40–60% of decisive calls',
    },
    {
      name: 'identical-pair noise',
      value: noiseFloor,
      ok: noiseFloor !== null && noiseFloor <= 0.2,
      expect: '≤ 20% non-tie on identical pairs',
    },
    {
      name: 'known-gap accuracy',
      value: knownGapAccuracy,
      // Benches without a degraded twin for every task may make this control optional.
      ok: knownGapAccuracy === null ? !requireKnownGap : knownGapAccuracy >= 0.8,
      expect: '≥ 80% (4/5) intact side wins',
    },
    {
      name: 'test–retest agreement',
      value: retestAgreement,
      // One disagreement in a handful of re-tests says nothing; judge it from MIN_RETESTS up.
      ok: retestAgreement === null || retests.length < MIN_RETESTS || retestAgreement >= 0.7,
      expect: `≥ 70% same result on re-judge (from ${MIN_RETESTS} re-tests)`,
    },
    {
      name: 'decisive rate',
      value: decisiveRate,
      // Floor only catches a judge that never decides; calibrated judges tie often (people did on 63%).
      ok: decisiveRate === null || decisiveRate >= 0.25,
      expect: '≥ 25% of pairs decided',
    },
  ]
  return { checks, healthy: checks.every((check) => check.ok) }
}
