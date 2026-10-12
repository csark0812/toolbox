// App fixtures: benchmark tasks that build screens inside a real project (kept local and
// git-ignored under agent-suites/ui-bench/local/<name>/). Agents edit a source-only copy; this
// module syncs their source into one build copy with node_modules, exports the web app, serves it
// and renders a route. Used by the render_screen MCP tool and the harness-side hard checks.
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { mkdir, readFile, rm, stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, join, resolve } from 'node:path'
import { renderPage } from './render-core.mjs'

const TOOLBOX_ROOT = resolve(import.meta.dirname, '../..')
export const LOCAL_ROOT = join(TOOLBOX_ROOT, 'agent-suites/ui-bench/local')
const BUILD_ROOT = join(TOOLBOX_ROOT, '_agent/app-build')
const LOCK_STALE_MS = 5 * 60 * 1000
const SETTLE_MS = 1500

/** Fixture definition plus the absolute path of its tasks. */
export function loadFixture(name) {
  const dir = join(LOCAL_ROOT, name)
  const fixture = JSON.parse(readFileSync(join(dir, 'fixture.json'), 'utf8'))
  return { ...fixture, dir, tasksRoot: join(dir, 'tasks') }
}

/** The build copy: the project at HEAD with its node_modules cloned in (APFS clone, no extra disk). */
export function ensureBuildDir(fixture) {
  const dir = join(BUILD_ROOT, fixture.name)
  if (!existsSync(join(dir, 'package.json'))) {
    execFileSync('mkdir', ['-p', BUILD_ROOT])
    execFileSync('git', ['clone', '-q', '--local', fixture.repo, dir])
    execFileSync('cp', ['-cR', join(fixture.repo, 'node_modules'), join(dir, 'node_modules')])
  }
  return dir
}

/** Builds share one Metro cache, so they run one at a time across workers. */
async function withLock(dir, work) {
  const lock = `${dir}.lock`
  for (;;) {
    try {
      await mkdir(lock)
      break
    } catch {
      const age = Date.now() - (await stat(lock).catch(() => ({ mtimeMs: Date.now() }))).mtimeMs
      if (age > LOCK_STALE_MS) await rm(lock, { recursive: true, force: true })
      else await new Promise((done) => setTimeout(done, 250))
    }
  }
  try {
    return await work()
  } finally {
    await rm(lock, { recursive: true, force: true })
  }
}

const CONTENT_TYPES = {
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.html': 'text/html',
  '.json': 'application/json',
  '.png': 'image/png',
  '.ttf': 'font/ttf',
  '.svg': 'image/svg+xml',
}

/** Serve a single-page export: unknown paths fall back to index.html. */
async function serveSpa(root) {
  const server = createServer(async (req, res) => {
    const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
    try {
      const body = await readFile(join(root, path))
      res.setHeader('content-type', CONTENT_TYPES[extname(path)] ?? 'application/octet-stream')
      res.end(body)
    } catch {
      res.setHeader('content-type', 'text/html')
      res.end(await readFile(join(root, 'index.html')))
    }
  })
  await new Promise((done) => server.listen(0, '127.0.0.1', done))
  return { origin: `http://127.0.0.1:${server.address().port}`, close: () => server.close() }
}

/**
 * Sync the workspace's source into the build copy, export, and render one route.
 * @returns {Promise<{ buildFailed: boolean, buildLog: string, findings: object[], screenshots: Record<string,string>, text: string }>}
 */
export async function buildAndRender({
  fixture,
  workspace,
  route,
  outDir,
  primarySelector = undefined,
  taskChecks = [],
}) {
  const buildDir = ensureBuildDir(fixture)
  return withLock(buildDir, async () => {
    for (const sync of fixture.syncDirs)
      execFileSync('rsync', [
        '-a',
        '--delete',
        `${join(workspace, sync)}/`,
        `${join(buildDir, sync)}/`,
      ])
    const [command, ...args] = fixture.build.command
    const build = spawnSync(command, args, {
      cwd: buildDir,
      env: { ...process.env, ...fixture.build.env },
      encoding: 'utf8',
      timeout: 5 * 60 * 1000,
    })
    const buildLog = `${build.stdout ?? ''}${build.stderr ?? ''}`.slice(-4000)
    if (build.status !== 0)
      return { buildFailed: true, buildLog, findings: [], screenshots: {}, text: '' }
    const server = await serveSpa(join(buildDir, fixture.build.output))
    try {
      const rendered = await renderPage({
        url: `${server.origin}${route}`,
        settleMs: SETTLE_MS,
        outDir,
        primarySelector,
        taskChecks,
      })
      return { buildFailed: false, buildLog, ...rendered }
    } finally {
      server.close()
    }
  })
}

const WORKSPACE_ROOT = join(TOOLBOX_ROOT, '_agent/app-workspaces')
/** Folder the prepared workspace keeps every task's brief and sample data in, until setup. */
export const TASK_BUNDLE_DIR = 'bench-tasks'

/**
 * The agent workspace: the project's tracked files at HEAD (no node_modules, no .git) plus every
 * task's brief and sample data. Per-test setup keeps only the current task.
 */
export function prepareAppWorkspace(fixture) {
  const target = join(WORKSPACE_ROOT, fixture.name)
  execFileSync('rm', ['-rf', target])
  execFileSync('mkdir', ['-p', target])
  execFileSync('sh', [
    '-c',
    'git -C "$1" archive HEAD | tar -x -C "$2"',
    'archive',
    fixture.repo,
    target,
  ])
  for (const agentConfig of ['.claude', '.agents', '.cursor'])
    execFileSync('rm', ['-rf', join(target, agentConfig)])
  execFileSync('cp', ['-R', fixture.tasksRoot, join(target, TASK_BUNDLE_DIR)])
  return target
}
