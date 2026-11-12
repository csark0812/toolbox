// Turns archived episodes, candidates and judgments into report.json and report.md. Advisory: it
// lists what to look at; skill changes still go through docs/skill-evolution.md and the bench.
/** Median of the finite numbers, or null (as in skill-bench-report, without loading the bench). */
function median(values) {
  const sorted = values.filter((value) => Number.isFinite(value)).sort((a, b) => a - b)
  if (!sorted.length) return null
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

/** Rates with fewer than this many cases are shown as counts only. */
export const MIN_RATE_N = 5

const count = (list, test) => list.filter(test).length
const excerpt = (text = '', limit = 140) => {
  const flat = String(text).replace(/\s+/g, ' ').trim()
  return flat.length > limit ? `${flat.slice(0, limit - 1)}…` : flat
}
const cell = (text) => excerpt(text, 160).replaceAll('|', '\\|')
const where = (item) => `${item.transcript}:${item.line}`

/** `k/n`, plus a percentage once n is large enough to mean something. */
export function rate(k, n) {
  if (!n) return '–'
  return n < MIN_RATE_N ? `${k}/${n}` : `${k}/${n} (${Math.round((100 * k) / n)}%)`
}

function versionLabel(sha, versions) {
  const version = sha && versions.get(sha)
  if (!version) return sha ? `unmatched ${sha.slice(0, 7)}` : 'unknown'
  return version.commit === 'working-tree'
    ? 'working tree'
    : `${version.commit} (${version.date?.slice(0, 10)})`
}

/**
 * @param {object} input
 * @param {object[]} input.episodes unique archived episodes
 * @param {object[]} input.candidates archived missed-trigger candidates
 * @param {Map<string, object>} input.judgments episode id → judgment
 * @param {Map<string, object>} input.misses candidate id → miss verdicts
 * @param {Map<string, object>} input.versions body sha → { commit, date }
 */
export function buildReport({ episodes, candidates, judgments, misses, versions }) {
  const skills = [
    ...new Set([...episodes.map((e) => e.skill), ...candidates.flatMap((t) => t.candidates)]),
  ].sort()
  const rows = skills.map((skill) => {
    const mine = episodes.filter((episode) => episode.skill === skill)
    const signal = (key, value) => count(mine, (episode) => episode.signals?.[key] === value)
    const judged = mine.map((episode) => judgments.get(episode.id)).filter(Boolean)
    const decided = judged.filter((judgment) => judgment.outcome !== 'unclear')
    const mineCandidates = candidates.filter((task) => task.candidates.includes(skill))
    const verdicts = mineCandidates
      .map((task) => misses.get(task.id)?.verdicts.find((verdict) => verdict.skill === skill))
      .filter(Boolean)
    const confirmed = count(verdicts, (verdict) => verdict.shouldHaveCalled === 'yes')
    const missRate = verdicts.length ? confirmed / verdicts.length : null
    const estimatedMisses = missRate === null ? null : missRate * mineCandidates.length
    const withTests = mine.filter((episode) => episode.signals?.testsRun > 0)
    return {
      skill,
      calls: mine.length,
      triggers: {
        slash: count(mine, (e) => e.trigger === 'user-slash'),
        proactive: count(mine, (e) => e.trigger === 'model-proactive'),
        nested: count(mine, (e) => e.trigger === 'nested'),
        fromAgent: count(mine, (e) => e.promptFrom === 'agent'),
        lateSlash: count(mine, (e) => e.lateSlash),
      },
      next: {
        correction: signal('nextPrompt', 'correction'),
        repeat: signal('nextPrompt', 'repeat'),
        accept: signal('nextPrompt', 'accept'),
        newTopic: signal('nextPrompt', 'new-topic'),
        none: signal('nextPrompt', 'none'),
      },
      interrupted: count(mine, (e) => e.interrupted),
      redirected: signal('userRedirect', true),
      shipped: count(mine, (e) => e.signals?.commits > 0 || e.signals?.prCreated),
      testsPassed: {
        passed: count(withTests, (e) => e.signals.lastTestPassed),
        of: withTests.length,
      },
      medianOutputTokens: median(mine.map((e) => e.tokens?.output)),
      medianMinutes: median(mine.map((e) => (e.durationMs == null ? null : e.durationMs / 60000))),
      judged: {
        n: judged.length,
        decided: decided.length,
        success: count(decided, (j) => j.outcome === 'success'),
        partial: count(decided, (j) => j.outcome === 'partial'),
        failure: count(decided, (j) => j.outcome === 'failure'),
        meanScore: judged.some((j) => j.score)
          ? judged.reduce((sum, j) => sum + (j.score ?? 0), 0) /
            judged.filter((j) => j.score).length
          : null,
        routingOff: count(judged, (j) => j.routingFit && j.routingFit !== 'good'),
        notFollowed: count(judged, (j) => j.followedSkill === 'no' || j.followedSkill === 'partly'),
      },
      missed: {
        candidates: mineCandidates.length,
        judged: verdicts.length,
        confirmed,
        borderline: count(verdicts, (verdict) => verdict.shouldHaveCalled === 'borderline'),
        competitorRuns: count(mineCandidates, (task) => task.competitor),
        recallEstimate:
          estimatedMisses === null || mine.length + estimatedMisses === 0
            ? null
            : mine.length / (mine.length + estimatedMisses),
      },
    }
  })

  const failures = {}
  const routing = []
  for (const episode of episodes) {
    const judgment = judgments.get(episode.id)
    if (judgment && ['partial', 'failure'].includes(judgment.outcome))
      (failures[episode.skill] ??= []).push({
        mode: judgment.failureMode ?? 'other',
        outcome: judgment.outcome,
        summary: judgment.summary,
        evidence: judgment.evidence[0] ?? '',
        skillSentence: judgment.skillSentence,
        prompt: excerpt(episode.prompt),
        where: where(episode),
      })
    if (
      (judgment && judgment.routingFit && judgment.routingFit !== 'good') ||
      episode.signals?.userRedirect
    )
      routing.push({
        skill: episode.skill,
        fit: judgment?.routingFit ?? 'unjudged',
        betterSkill: judgment?.betterSkill ?? null,
        redirected: Boolean(episode.signals?.userRedirect),
        prompt: excerpt(episode.prompt),
        where: where(episode),
      })
  }

  const missed = {}
  for (const task of candidates)
    for (const verdict of misses.get(task.id)?.verdicts ?? [])
      if (verdict.shouldHaveCalled !== 'no')
        (missed[verdict.skill] ??= []).push({
          verdict: verdict.shouldHaveCalled,
          phrase: verdict.matchingPhrase,
          reason: verdict.reason,
          otherSkills: task.otherSkills,
          prompt: excerpt(task.prompt),
          where: where(task),
        })

  const versionRows = []
  for (const skill of skills) {
    const bySha = new Map()
    for (const episode of episodes.filter((e) => e.skill === skill)) {
      const key = episode.skillBodySha ?? 'unknown'
      if (!bySha.has(key)) bySha.set(key, [])
      bySha.get(key).push(episode)
    }
    const big = [...bySha.entries()].filter(([, list]) => list.length >= MIN_RATE_N)
    if (big.length < 2) continue
    for (const [sha, list] of big) {
      const judged = list
        .map((e) => judgments.get(e.id))
        .filter((j) => j && j.outcome !== 'unclear')
      versionRows.push({
        skill,
        version: versionLabel(sha, versions),
        n: list.length,
        corrections: count(list, (e) => e.signals?.nextPrompt === 'correction'),
        interrupted: count(list, (e) => e.interrupted),
        success: count(judged, (j) => j.outcome === 'success'),
        decided: judged.length,
      })
    }
  }

  const benchCandidates = Object.entries(failures).flatMap(([skill, list]) =>
    list
      .filter((failure) => failure.outcome === 'failure')
      .map((failure) => ({
        skill,
        mode: failure.mode,
        prompt: failure.prompt,
        where: failure.where,
      })),
  )

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      episodes: episodes.length,
      candidates: candidates.length,
      judged: [...judgments.values()].length,
      missJudged: [...misses.values()].length,
      sessions: new Set(episodes.map((e) => e.session)).size,
      from:
        episodes
          .map((e) => e.timestamp)
          .filter(Boolean)
          .sort()[0] ?? null,
      to:
        episodes
          .map((e) => e.timestamp)
          .filter(Boolean)
          .sort()
          .at(-1) ?? null,
    },
    rows,
    failures,
    routing,
    missed,
    versions: versionRows,
    benchCandidates,
  }
}

const fixed = (value, digits = 0) => (value == null ? '–' : value.toFixed(digits))

export function renderReport(report) {
  const { totals, rows } = report
  const used = rows.filter((row) => row.calls > 0)
  const lines = [
    '# Skill usage report',
    '',
    `Generated ${report.generatedAt.slice(0, 16).replace('T', ' ')} UTC from ${totals.episodes} skill episodes in ${totals.sessions} Claude Code sessions (${totals.from?.slice(0, 10) ?? '–'} to ${totals.to?.slice(0, 10) ?? '–'}), ${totals.judged} judged, plus ${totals.candidates} missed-trigger candidates (${totals.missJudged} judged).`,
    '',
    `Advisory only. Counts under ${MIN_RATE_N} are shown without a percentage. Free signals are heuristics; "judged" columns come from a sampled LLM judge. Change a skill only through docs/skill-evolution.md and the bench.`,
    '',
    '## Use and outcome by skill',
    '',
    '| Skill | Calls | Slash / auto / nested | Interrupted | Next: correction | Next: repeat | Shipped (commit/PR) | Judged success | Mean score | Median out tokens |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...used.map(
      (row) =>
        `| \`${row.skill}\` | ${row.calls} | ${row.triggers.slash} / ${row.triggers.proactive} / ${row.triggers.nested} | ${rate(row.interrupted, row.calls)} | ${rate(row.next.correction, row.calls)} | ${rate(row.next.repeat, row.calls)} | ${rate(row.shipped, row.calls)} | ${rate(row.judged.success, row.judged.decided)} | ${fixed(row.judged.meanScore, 1)} | ${fixed(row.medianOutputTokens)} |`,
    ),
    '',
    '## Why it was called',
    '',
    '| Skill | Typed by user | Chosen by agent | Inside another skill | Briefed by another agent | User typed it after the agent worked without it |',
    '| --- | --- | --- | --- | --- | --- |',
    ...used.map(
      (row) =>
        `| \`${row.skill}\` | ${row.triggers.slash} | ${row.triggers.proactive} | ${row.triggers.nested} | ${row.triggers.fromAgent} | ${row.triggers.lateSlash} |`,
    ),
    '',
    '## Missed triggers (recall)',
    '',
    "Candidates are tasks with no toolbox skill call that match a skill's cheap fingerprint. The judge confirms a sample. Recall ≈ calls ÷ (calls + estimated misses).",
    '',
    '| Skill | Calls | Candidates | Judged | Should have called | Borderline | A competing skill ran | Recall ≈ |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |',
    ...rows
      .filter((row) => row.missed.candidates > 0)
      .map(
        (row) =>
          `| \`${row.skill}\` | ${row.calls} | ${row.missed.candidates} | ${row.missed.judged} | ${row.missed.confirmed} | ${row.missed.borderline} | ${row.missed.competitorRuns} | ${row.missed.judged >= MIN_RATE_N && row.missed.recallEstimate != null ? `${Math.round(100 * row.missed.recallEstimate)}%` : '–'} |`,
      ),
    '',
  ]
  for (const [skill, list] of Object.entries(report.missed).sort()) {
    lines.push(`### \`${skill}\`: requests it should have handled`, '')
    for (const miss of list.slice(0, 3))
      lines.push(
        `- **${miss.verdict}** — "${cell(miss.prompt)}" — matches "${cell(miss.phrase)}"${miss.otherSkills.length ? `; ran ${miss.otherSkills.join(', ')} instead` : ''}. \`${miss.where}\``,
      )
    lines.push('')
  }

  lines.push('## Failures by skill', '')
  const failureSkills = Object.entries(report.failures).sort()
  if (!failureSkills.length) lines.push('No judged partial or failed episodes yet.', '')
  for (const [skill, list] of failureSkills) {
    const modes = {}
    for (const failure of list) modes[failure.mode] = (modes[failure.mode] ?? 0) + 1
    lines.push(
      `### \`${skill}\` — ${Object.entries(modes)
        .sort((a, b) => b[1] - a[1])
        .map(([mode, n]) => `${mode} ×${n}`)
        .join(', ')}`,
      '',
    )
    for (const failure of list.slice(0, 3)) {
      lines.push(
        `- **${failure.outcome}, ${failure.mode}:** ${cell(failure.summary)} Request: "${cell(failure.prompt)}". \`${failure.where}\``,
      )
      if (failure.evidence) lines.push(`  - Evidence: "${cell(failure.evidence)}"`)
      if (failure.skillSentence) lines.push(`  - Skill sentence: "${cell(failure.skillSentence)}"`)
    }
    lines.push('')
  }

  lines.push('## Routing problems', '')
  if (!report.routing.length) lines.push('None found.', '')
  else {
    lines.push(
      '| Skill | Judged fit | Better skill | User redirected | Request | Where |',
      '| --- | --- | --- | --- | --- | --- |',
    )
    for (const item of report.routing)
      lines.push(
        `| \`${item.skill}\` | ${item.fit} | ${item.betterSkill ?? '–'} | ${item.redirected ? 'yes' : 'no'} | ${cell(item.prompt)} | \`${item.where}\` |`,
      )
    lines.push('')
  }

  lines.push('## Before and after skill changes', '')
  if (!report.versions.length)
    lines.push(`No skill has two versions with ${MIN_RATE_N}+ episodes each yet.`, '')
  else {
    lines.push(
      '| Skill | Version | Episodes | Corrections | Interrupted | Judged success |',
      '| --- | --- | --- | --- | --- | --- |',
    )
    for (const row of report.versions)
      lines.push(
        `| \`${row.skill}\` | ${row.version} | ${row.n} | ${rate(row.corrections, row.n)} | ${rate(row.interrupted, row.n)} | ${rate(row.success, row.decided)} |`,
      )
    lines.push('')
  }

  lines.push('## Candidate bench tasks', '')
  if (!report.benchCandidates.length) lines.push('None yet: no judged failures.', '')
  for (const item of report.benchCandidates)
    lines.push(`- \`${item.skill}\` (${item.mode}): "${cell(item.prompt)}" \`${item.where}\``)
  return `${lines.join('\n').trimEnd()}\n`
}
