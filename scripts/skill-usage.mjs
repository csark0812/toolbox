#!/usr/bin/env node
// Skill usage analytics from Claude Code transcripts. Advisory only: the report points at
// episodes worth a human look; it never edits a skill (see docs/skill-evolution.md).
//
//   node scripts/skill-usage.mjs archive [--refresh] [--session <transcript.jsonl> | --hook]
//   node scripts/skill-usage.mjs judge [--limit 20] [--missed 10]
//   node scripts/skill-usage.mjs report
//   node scripts/skill-usage.mjs all
//
// Data lives in ~/.toolbox/skill-analytics (TOOLBOX_ANALYTICS_DIR overrides it), never in the repo.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  analyticsDir,
  archiveAll,
  claudeProjectsDir,
  loadArchived,
  skillVersions,
  toolboxSkills,
  uniqueEpisodes,
} from './lib/skill-usage/archive.mjs'
import { judgeSample, loadJudgments, sealedAsk } from './lib/skill-usage/judge.mjs'
import { buildReport, renderReport } from './lib/skill-usage/report.mjs'

const root = join(import.meta.dirname, '..')

function option(args, name, fallback) {
  const index = args.indexOf(`--${name}`)
  return index === -1 ? fallback : args[index + 1]
}

/**
 * The transcript to archive: `--session <path>`, or with `--hook` the `transcript_path` of the
 * Claude Code hook input on stdin (a SessionEnd hook). Null means every transcript.
 */
export function sessionToArchive(args, stdin = () => readFileSync(0, 'utf8')) {
  if (args.includes('--hook')) return JSON.parse(stdin() || '{}').transcript_path ?? null
  return option(args, 'session', null)
}

export function runArchive(args, { dir = analyticsDir(), projectsDir = claudeProjectsDir() } = {}) {
  const only = sessionToArchive(args)
  if (args.includes('--hook') && (!only || !existsSync(only))) return null
  const totals = archiveAll({
    projectsDir,
    dir,
    skills: toolboxSkills(root),
    refresh: args.includes('--refresh'),
    only,
  })
  console.log(
    `archive: ${totals.episodes} new episode(s), ${totals.candidates} new candidate task(s) from ${totals.transcripts} transcript(s); ${totals.unchanged} unchanged, ${totals.bench} bench skipped, ${totals.unparsable} unparsable and ${totals.oversized} oversized line(s) skipped. Data: ${dir}`,
  )
  return totals
}

const archived = (dir) => ({
  episodes: uniqueEpisodes(loadArchived(dir)),
  candidates: loadArchived(dir, 'candidates'),
})

export async function runJudge(args, { dir = analyticsDir(), judge } = {}) {
  mkdirSync(dir, { recursive: true })
  const { name, ask } = judge ?? (await sealedAsk())
  const result = await judgeSample({
    dir,
    root,
    ...archived(dir),
    limit: Number(option(args, 'limit', 20)),
    missed: Number(option(args, 'missed', 10)),
    ask,
    judgeName: name,
    log: (line) => console.log(line),
  })
  console.log(
    `judge: ${result.episodes} episode(s) and ${result.misses} candidate(s) judged by ${name}, ${result.errors} error(s) (see judge-errors.jsonl).`,
  )
  return result
}

export function runReport(args, { dir = analyticsDir() } = {}) {
  mkdirSync(dir, { recursive: true })
  const skills = toolboxSkills(root)
  const report = buildReport({
    ...archived(dir),
    judgments: loadJudgments(dir, 'judgments.jsonl'),
    misses: loadJudgments(dir, 'misses.jsonl'),
    versions: skillVersions(root, skills),
  })
  writeFileSync(join(dir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`)
  writeFileSync(join(dir, 'report.md'), renderReport(report))
  console.log(`report: ${join(dir, 'report.md')}`)
  return report
}

const COMMANDS = { archive: runArchive, judge: runJudge, report: runReport }

if (import.meta.url === `file://${process.argv[1]}`) {
  const [command = 'all', ...args] = process.argv.slice(2)
  const steps = command === 'all' ? Object.keys(COMMANDS) : [command]
  for (const step of steps) {
    if (!COMMANDS[step]) {
      console.error(
        `Unknown command "${step}". Use one of: ${Object.keys(COMMANDS).join(', ')}, all`,
      )
      process.exit(2)
    }
    await COMMANDS[step](args)
  }
}
