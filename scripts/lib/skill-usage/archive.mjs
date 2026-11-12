// Copies skill episodes and missed-trigger candidates out of Claude Code transcripts into a private
// archive, so they survive Claude Code's transcript cleanup. Rerunning adds only what is new.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { isBenchPath, readTranscript } from './claude-transcript.mjs'
import { buildEpisodes, normalizeSkillBody, sha } from './episodes.mjs'
import { candidateSkills } from './fingerprints.mjs'
import { episodeSignals } from './signals.mjs'

export const analyticsDir = () =>
  process.env.TOOLBOX_ANALYTICS_DIR ?? join(homedir(), '.toolbox', 'skill-analytics')

export const claudeProjectsDir = () =>
  join(process.env.CLAUDE_CONFIG_DIR ?? join(homedir(), '.claude'), 'projects')

/** Toolbox skills are the top-level folders of this repository that hold a SKILL.md. */
export const toolboxSkills = (root) =>
  new Set(
    readdirSync(root, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && existsSync(join(root, entry.name, 'SKILL.md')))
      .map((entry) => entry.name),
  )

/** Main-session transcripts outside bench and harness project folders. */
export function listTranscripts(projectsDir) {
  if (!existsSync(projectsDir)) return []
  return readdirSync(projectsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !isBenchPath(entry.name))
    .flatMap((entry) =>
      readdirSync(join(projectsDir, entry.name))
        .filter((file) => file.endsWith('.jsonl'))
        .map((file) => join(projectsDir, entry.name, file)),
    )
}

const ensure = (dir) => (mkdirSync(dir, { recursive: true }), dir)
const safeName = (id) => id.replace(/[^\w.-]/g, '_')
const readJson = (path, fallback) =>
  existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : fallback

/**
 * Archive one transcript. Existing episode files are kept unless `refresh` is set.
 * @returns {{ episodes: number, candidates: number, skipped: string | null, unparsable: number, oversized: number }}
 */
export function archiveTranscript(path, { dir, skills, refresh = false }) {
  const { records, unparsable, oversized } = readTranscript(path)
  // Judge by where the session started: a real session may later cd into a bench folder.
  if (isBenchPath(records.find((record) => record.cwd)?.cwd))
    return { episodes: 0, candidates: 0, skipped: 'bench', unparsable, oversized }
  const { episodes, tasks, bodies } = buildEpisodes(records, {
    toolboxSkills: skills,
    transcript: path,
  })
  let written = 0
  let candidates = 0
  for (const episode of episodes) {
    const file = join(ensure(join(dir, 'episodes')), `${safeName(episode.id)}.json`)
    if (existsSync(file) && !refresh) continue
    episode.signals = episodeSignals(episode, skills)
    writeFileSync(file, `${JSON.stringify(episode, null, 2)}\n`)
    written++
  }
  for (const task of tasks) {
    const matched = candidateSkills(task)
    const competitor = task.otherSkills.length > 0
    if (!matched.length) continue
    const file = join(ensure(join(dir, 'candidates')), `${safeName(task.id)}.json`)
    if (existsSync(file) && !refresh) continue
    writeFileSync(
      file,
      `${JSON.stringify({ ...task, candidates: matched, competitor }, null, 2)}\n`,
    )
    candidates++
  }
  for (const [bodySha, text] of bodies) {
    const file = join(ensure(join(dir, 'bodies')), `${bodySha}.md`)
    if (!existsSync(file)) writeFileSync(file, text)
  }
  return { episodes: written, candidates, skipped: null, unparsable, oversized }
}

/** Archive every transcript changed since the last run (or all of them with `refresh`). */
export function archiveAll({
  projectsDir,
  dir,
  skills,
  refresh = false,
  only = null,
  log = () => {},
}) {
  const statePath = join(ensure(dir), 'archive-state.json')
  const state = refresh ? {} : readJson(statePath, {})
  const totals = {
    transcripts: 0,
    unchanged: 0,
    bench: 0,
    episodes: 0,
    candidates: 0,
    unparsable: 0,
    oversized: 0,
  }
  for (const path of only ? [only] : listTranscripts(projectsDir)) {
    const mtime = statSync(path).mtimeMs
    if (state[path] === mtime) {
      totals.unchanged++
      continue
    }
    const result = archiveTranscript(path, { dir, skills, refresh })
    totals.transcripts++
    totals.episodes += result.episodes
    totals.candidates += result.candidates
    totals.unparsable += result.unparsable
    totals.oversized += result.oversized
    if (result.skipped === 'bench') totals.bench++
    state[path] = mtime
    if (result.episodes) log(`${result.episodes} episode(s) from ${path}`)
  }
  writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`)
  return totals
}

/** Every archived episode (or candidate) file, parsed. */
export const loadArchived = (dir, kind = 'episodes') =>
  existsSync(join(dir, kind))
    ? readdirSync(join(dir, kind))
        .filter((file) => file.endsWith('.json'))
        .map((file) => JSON.parse(readFileSync(join(dir, kind, file), 'utf8')))
    : []

/**
 * Map normalized SKILL.md body hashes to the commit that introduced that text, for every toolbox
 * skill in git history, plus the working-tree text.
 * @returns {Map<string, { skill: string, commit: string, date: string }>}
 */
export function skillVersions(root, skills) {
  const versions = new Map()
  const git = (...args) =>
    execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 1 << 26 })
  for (const skill of skills) {
    const file = `${skill}/SKILL.md`
    const history = git('log', '--format=%H %cI', '--', file).trim().split('\n').filter(Boolean)
    // Oldest first, so the first commit with a given text names that version.
    for (const line of history.reverse()) {
      const [commit, date] = line.split(' ')
      let text
      try {
        text = git('show', `${commit}:${file}`)
      } catch {
        continue
      }
      const key = sha(normalizeSkillBody(text))
      if (!versions.has(key)) versions.set(key, { skill, commit: commit.slice(0, 7), date })
    }
    const current = join(root, file)
    const key = sha(normalizeSkillBody(readFileSync(current, 'utf8')))
    if (!versions.has(key)) versions.set(key, { skill, commit: 'working-tree', date: null })
  }
  return versions
}

/**
 * One episode per skill call. A forked or resumed session copies earlier history into a new
 * transcript, so the same call can be archived twice; the copy that saw the most work is kept.
 */
export function uniqueEpisodes(episodes) {
  const byCall = new Map()
  for (const episode of episodes) {
    const call = episode.id.split('__').at(-1)
    const kept = byCall.get(call)
    if (!kept || episode.actions.length > kept.actions.length || (!kept.next && episode.next))
      byCall.set(call, episode)
  }
  return [...byCall.values()]
}
