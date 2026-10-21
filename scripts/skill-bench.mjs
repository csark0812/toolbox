#!/usr/bin/env node
// Skill bench driver: run arms on blinded tasks, judge pairs, report verdicts.
//   node scripts/skill-bench.mjs run [--arms none,full] [--tasks a,b] [--repeats 4] [--id <id>]
//   run/quick take --runner codex|claude (default codex); judge picks the other family.
//   Any command: --workers <n> agent runs at once (default 4), --judges <n> judge calls at once (default 6)
//   node scripts/skill-bench.mjs judge|report [<id>] [<baseline>]
//   node scripts/skill-bench.mjs fill --id <id> [--taskset holdout] [--arms ...] [--repeats 4]   (top up missing cells)
//   node scripts/skill-bench.mjs preflight
//   node scripts/skill-bench.mjs quick [--arms none,full] [--tasks a,b]   (2 repeats, matched pairs, no verdict)
import { execFileSync, spawnSync } from 'node:child_process'
import {
  chmodSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { chromeCandidates, chromePath } from './lib/bench-render.mjs'

const [command = 'run', ...rest] = process.argv.slice(2)
const option = (name, fallback) => {
  const index = rest.indexOf(`--${name}`)
  return index === -1 ? fallback : rest[index + 1]
}
const concurrency = {
  ...(option('workers') ? { SKILL_BENCH_WORKERS: option('workers') } : {}),
  ...(option('judges') ? { SKILL_BENCH_JUDGES: option('judges') } : {}),
}
const step = (args, env = {}, { allowFailure = false } = {}) => {
  const result = spawnSync(process.execPath, args, {
    stdio: 'inherit',
    env: { ...process.env, ...concurrency, ...env },
  })
  if (result.status !== 0 && !allowFailure) process.exit(result.status ?? 1)
}

/**
 * The harness sandbox sets `--preserve-symlinks-main`, so `npm` started through a bin symlink cannot
 * find its own files. Shims start npm and npx from their real install path, placed where each
 * runner's sandbox can read them: Codex reads `~/.cache` and runs zsh login shells, where macOS
 * `path_helper` moves inherited PATH entries last, so a bench-owned ZDOTDIR puts them first again;
 * Claude Code reads only its own scratch folder and sources CLAUDE_ENV_FILE before each command.
 * Every arm gets the same environment, including a writable temp folder inside the run's own .git:
 * Codex denies the OS temp folder and Claude Code's sandbox denies reads there.
 */
function benchShellEnv(runner) {
  const npmPath = execFileSync('sh', ['-c', 'command -v npm'], { encoding: 'utf8' }).trim()
  const npmBin = dirname(realpathSync(npmPath))
  const shims = (root) => {
    const bin = join(root, 'bin')
    mkdirSync(bin, { recursive: true })
    for (const tool of ['npm', 'npx']) {
      writeFileSync(
        join(bin, tool),
        `#!/bin/sh\nexec node ${join(npmBin, `${tool}-cli.js`)} "$@"\n`,
      )
      chmodSync(join(bin, tool), 0o755)
    }
    return bin
  }
  const codexBin = shims(join(homedir(), '.cache', 'toolbox-bench'))
  const zdot = join(homedir(), '.cache', 'toolbox-bench', 'zdot')
  mkdirSync(zdot, { recursive: true })
  // Codex denies the OS temp folder, so tests and tools that use os.tmpdir() get a folder inside
  // the run's own .git, which the profile lets it write and Git never reports as a change.
  const gitTmp =
    'git_dir=$(git rev-parse --absolute-git-dir 2>/dev/null) && mkdir -p "$git_dir/tmp" && export TMPDIR="$git_dir/tmp"\n'
  for (const file of ['.zshenv', '.zprofile', '.zshrc'])
    writeFileSync(
      join(zdot, file),
      `export PATH="${codexBin}:$PATH"\n${file === '.zshenv' ? gitTmp : ''}`,
    )
  const claudeRoot = join(`/private/tmp/claude-${process.getuid()}`, 'toolbox-bench')
  const claudeBin = shims(claudeRoot)
  const claudeEnv = join(claudeRoot, 'claude-env.sh')
  // Every arm can open the same browser for visual work; none is told it exists. On Linux Chrome's
  // own sandbox cannot start inside the run's sandbox (and refuses to start as root), so the arms get
  // a shim that adds --no-sandbox; the run's sandbox still confines it.
  const browser = chromePath()
  let chrome = browser
  if (browser && process.platform === 'linux') {
    chrome = join(claudeRoot, 'bin', 'chrome')
    writeFileSync(chrome, `#!/bin/sh\nexec "${browser}" --no-sandbox "$@"\n`)
    chmodSync(chrome, 0o755)
  }
  writeFileSync(
    claudeEnv,
    `export PATH="${claudeBin}:$PATH"\n${gitTmp}${chrome ? `export CHROME_PATH="${chrome}"\n` : ''}`,
  )
  return {
    PATH: `${codexBin}:${process.env.PATH}`,
    ZDOTDIR: zdot,
    CLAUDE_ENV_FILE: claudeEnv,
    ...(chrome ? { CHROME_PATH: chrome } : {}),
    // Claude runs go through a wrapper that lets the sandbox open Unix sockets, so Chrome can start.
    ...(runner === 'claude'
      ? {
          TOOLBOX_REAL_CLAUDE_BIN:
            process.env.CLAUDE_CODE_BIN ??
            execFileSync('sh', ['-c', 'command -v claude'], { encoding: 'utf8' }).trim(),
          CLAUDE_CODE_BIN: join(import.meta.dirname, 'lib', 'claude-bench-bin.mjs'),
        }
      : {}),
  }
}

/** Fail before any run when the task set has visual tasks and no browser can photograph them. */
function requireBrowserFor(tasks) {
  const set = option('taskset', 'tasks')
  const wanted = tasks?.split(',')
  const visual = JSON.parse(readFileSync(`agent-suites/skill-bench/${set}.json`, 'utf8'))
    .tasks.filter((task) => task.render && (!wanted || wanted.includes(task.id)))
    .map((task) => task.id)
  if (visual.length && !chromePath()) {
    console.error(
      `No Chromium or Chrome found, and ${visual.join(', ')} ${visual.length === 1 ? 'is a visual task' : 'are visual tasks'}. Install one (npx playwright install chromium) or set CHROME_PATH. Looked in:\n  ${chromeCandidates().join('\n  ')}`,
    )
    process.exit(1)
  }
}

function run({ arms, tasks, repeats, id, runner = option('runner', 'codex'), grep, offset = 0 }) {
  requireBrowserFor(tasks)
  step(['--experimental-strip-types', 'scripts/prepare-evaluation-workspace.mjs', '--bench'], {
    SKILL_BENCH_RUNNER: runner,
  })
  step(
    [
      'node_modules/@post-print/agent-test/dist/cli.js',
      'test',
      '--config',
      'skill-bench.config.ts',
      '--repeat-each',
      String(repeats),
      ...(grep ? ['--grep', grep] : []),
    ],
    {
      ...benchShellEnv(runner),
      SKILL_BENCH_ARMS: arms,
      SKILL_BENCH_RUNNER: runner,
      SKILL_BENCH_TASKSET: option('taskset', 'tasks'),
      SKILL_BENCH_REP_OFFSET: String(offset),
      SKILL_BENCH_ID: id,
      ...(tasks ? { SKILL_BENCH_TASKS: tasks } : {}),
    },
    // A failed run is reported by the runner; the saved runs are still judged.
    { allowFailure: true },
  )
  console.log(`Bench ${id} runs saved under .agent-test/skill-bench/${id}/runs`)
}

const id = option('id', `bench-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}`)
if (command === 'run')
  run({
    arms: option('arms', 'none,full'),
    tasks: option('tasks'),
    repeats: Number(option('repeats', 4)),
    id,
  })
else if (command === 'preflight')
  run({ arms: 'none,full', tasks: 'session-expiry-fix', repeats: 1, id: `preflight-${id}` })
else if (command === 'quick') {
  const quickId = option('id', `quick-${id}`)
  run({ arms: option('arms', 'none,full'), tasks: option('tasks'), repeats: 2, id: quickId })
  step(['scripts/skill-bench-judge.mjs', quickId, '--matched'])
  step(['scripts/skill-bench-report.mjs', quickId, option('baseline', 'none')])
} else if (command === 'fill') {
  // Rerun each (task, arm) cell that has fewer usable runs than --repeats. A repetition lost to
  // infrastructure is rerun under its own number, which overwrites the exclusion record, so matched
  // pairs (equal repetitions) still form; any further runs get fresh numbers after the last one.
  const target = Number(option('repeats', 4))
  const dir = join('.agent-test/skill-bench', id, 'runs')
  const runs = existsSync(dir)
    ? readdirSync(dir)
        .filter((file) => file.endsWith('.json'))
        .map((file) => JSON.parse(readFileSync(join(dir, file), 'utf8')))
    : []
  const taskset = JSON.parse(
    readFileSync(`agent-suites/skill-bench/${option('taskset', 'tasks')}.json`, 'utf8'),
  )
  const wanted = option('tasks')?.split(',')
  for (const task of taskset.tasks.filter((task) => !wanted || wanted.includes(task.id)))
    for (const arm of option('arms', 'none,full').split(',')) {
      const cell = runs.filter((record) => record.task === task.id && record.arm === arm)
      const missing = target - cell.filter((record) => !record.infrastructure).length
      if (missing <= 0) continue
      const escaped = `${task.id} [${arm}]`.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const lost = cell.filter((record) => record.infrastructure).map((record) => record.repetition)
      for (const repetition of lost.slice(0, missing)) {
        console.log(`Refilling ${task.id} [${arm}] repetition ${repetition}`)
        run({ arms: arm, tasks: task.id, repeats: 1, id, grep: escaped, offset: repetition })
      }
      const fresh = missing - Math.min(lost.length, missing)
      if (fresh <= 0) continue
      const offset = Math.max(-1, ...cell.map((record) => record.repetition)) + 1
      console.log(`Filling ${task.id} [${arm}]: ${fresh} run(s) from repetition ${offset}`)
      run({ arms: arm, tasks: task.id, repeats: fresh, id, grep: escaped, offset })
    }
} else if (command === 'judge') step(['scripts/skill-bench-judge.mjs', ...rest])
else if (command === 'report') step(['scripts/skill-bench-report.mjs', ...rest])
else {
  console.error(`Unknown command ${command}. Use run, preflight, quick, judge or report.`)
  process.exit(1)
}
