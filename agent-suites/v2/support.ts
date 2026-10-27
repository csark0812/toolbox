import { expect, type AgentFixture, type JudgeFixture } from '@post-print/agent-test'
import type { TestInfo } from '@playwright/test'
import { readFile, writeFile, mkdir, rm, cp, readdir } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { join, resolve } from 'node:path'
import { EXPECTED_SKILLS } from '../../src/expected-skills'

export type Claim = {
  id: string
  suite: string
  name: string
  prompt: string
  seedPatch?: string
  seedStageOnly?: boolean
  seedStagedPatch?: string
  defaults: { skills?: string; profile?: string }
  rubric: {
    must?: string[]
    mustNot?: string[]
    mustNotReadPath?: string[]
    mustInvokeSkill?: string[]
    judge?: string[]
  }
  compareId?: string
  contract?: 'expiry-repair' | 'captured-repair' | 'captured-repair-preserve-wip'
  evidencePaths?: string[]
  evidencePolicy?: 'read-only'
  /** Check out this branch after the fixture baseline commit. */
  branch?: string
  /** Commit the applied seed patch on the current branch with this message. */
  seedCommit?: string
  /** After the seed commit, advance `main` with this patch and commit (a base the branch must catch up with). */
  baseSeedPatch?: string
  baseSeedCommit?: string
  /** Publish main and the current branch to a local bare `origin` inside the workspace. */
  bareRemote?: boolean
  /** Paths that must be byte-identical to the fixture source after the run. */
  frozenPaths?: string[]
  /** Fixture directory whose `node --test` suite must still pass after the run. */
  fixtureGate?: string
  /** Workspace directories whose files are added to the judge snapshot. */
  evidenceDirs?: string[]
  /** Give the judge `git log --stat` for commits made after the baseline. */
  evidenceGitLog?: boolean
  /** Workspace directory that holds the fixtures instead of `agent-suites/fixtures` (benchmark blinding). */
  fixtureRoot?: string
  /** Files copied over the workspace root after skills are installed (a pack's documented setup). */
  overlayDir?: string
}

const FIXTURES = 'agent-suites/fixtures/'

/** Where a repository fixture path lives inside this claim's workspace. */
export function fixturePath(claim: Pick<Claim, 'fixtureRoot'>, path: string) {
  return claim.fixtureRoot && path.startsWith(FIXTURES)
    ? `${claim.fixtureRoot}/${path.slice(FIXTURES.length)}`
    : path
}

/** A seed patch with its fixture paths moved to the claim's fixture root. */
async function readSeed(claim: Claim, path: string) {
  const seed = await readFile(resolve(path), 'utf8')
  return claim.fixtureRoot ? seed.replaceAll(FIXTURES, `${claim.fixtureRoot}/`) : seed
}
export async function executeClaim(
  coder: AgentFixture,
  reviewer: JudgeFixture<{ passed: boolean; reason: string }>,
  claim: Claim,
  info: TestInfo,
) {
  const prepared = prepareClaim(coder, claim)
  const artifacts = info.outputPath('normalized.json')
  let run: Awaited<ReturnType<AgentFixture['run']>> | undefined
  let outcome = 'infrastructure-failed'
  let failure: string | undefined
  let judgment: unknown
  const diagnosticReceipts: Record<string, string> = {}
  try {
    run = await prepared.run({
      prompt: framePrompt(claim),
      includeGlobalSkills: false,
    })
    outcome = 'task-failed'
    for (const filename of await readdir(join(run.workspace.root, '_evidence')).catch(() => [])) {
      const relative = `_evidence/${filename}`
      if (RECEIPT_PATH.test(relative))
        diagnosticReceipts[relative] = (
          await readFile(join(run.workspace.root, relative), 'utf8')
        ).slice(0, 16000)
    }
    await runHardChecks(run, claim)
    const semanticClaims = (claim.rubric.must ?? [])
      .filter((text) => !/^[A-Z][A-Z0-9_]+$/.test(text))
      .map(
        (text) =>
          `The response satisfies the meaning of this original claim, not necessarily its literal words: ${text}. For source:staged-only, require explicit staged-only scope. For comment-only, require no runtime change. For Summary, require a brief behavioral explanation rather than a label.`,
      )
    const questions = [
      ...semanticClaims,
      ...(claim.rubric.judge ?? []),
      ...(claim.rubric.mustInvokeSkill ?? []).map(
        (slug) => `Tool evidence establishes reading/using ${slug}, not only its availability.`,
      ),
    ]
    if (questions.length) {
      const selectedSnapshot: Record<string, string> = {}
      for (const path of [
        'agent-suites/fixtures/debug-app/src/sessionGuard.ts',
        'agent-suites/fixtures/debug-app/src/sessionCookie.ts',
        'agent-suites/fixtures/sample-app/src/redirect.ts',
        'agent-suites/fixtures/debugging-lab/src/captured-session.mjs',
        'agent-suites/fixtures/debugging-lab/src/refresh.mjs',
        'agent-suites/fixtures/debugging-lab/src/server.mjs',
        'agent-suites/fixtures/debugging-lab/notes.txt',
        ...(claim.evidencePaths ?? []),
      ]) {
        try {
          selectedSnapshot[path] = await readFile(join(run.workspace.root, path), 'utf8')
        } catch {
          /* absent inputs remain explicitly absent */
        }
      }
      for (const directory of claim.evidenceDirs ?? []) {
        const files = await readdir(join(run.workspace.root, directory), {
          recursive: true,
        }).catch(() => [])
        for (const file of files) {
          const path = `${directory}/${file}`
          try {
            selectedSnapshot[path] = (await readFile(join(run.workspace.root, path), 'utf8')).slice(
              0,
              16000,
            )
          } catch {
            /* directories are listed but not read */
          }
        }
      }
      const commits = claim.evidenceGitLog ? commitsAfterBaseline(run.workspace.root) : undefined
      outcome = 'judge-failed'
      const evaluation = await reviewer.run({
        input: {
          questions,
          output: run.output,
          // Claude traces carry each image the agent opened as base64, which the judge cannot
          // read as JSON and which overflows its input limit; keep only the image's type and size.
          toolCalls: JSON.parse(
            JSON.stringify(
              run.toolCalls.map(({ images, ...call }) =>
                images
                  ? { ...call, images: images.map(({ data: _data, ...image }) => image) }
                  : call,
              ),
            ),
          ),
          selectedSnapshot,
          changedPaths: run.workspace.changedPaths,
          diagnosticReceipts,
          ...(commits === undefined ? {} : { commits }),
        },
      })
      judgment = {
        output: evaluation.output,
        artifact: evaluation.artifact,
        usage: evaluation.usage,
      }
      outcome = 'task-failed'
      expect(evaluation.output.passed, evaluation.output.reason).toBe(true)
    }
    outcome = 'passed'
  } catch (error) {
    failure = String(error)
    throw error
  } finally {
    await mkdir(info.outputDir, { recursive: true })
    await writeFile(
      artifacts,
      JSON.stringify(
        {
          schemaVersion: 1,
          scenario: claim.id,
          suite: claim.suite,
          compareId: claim.compareId ?? claim.name,
          variant: claim.defaults.skills ?? 'full',
          repetition: info.repeatEachIndex,
          outcome,
          failure,
          source: run?.startingContext ?? null,
          assertions: { ...claim.rubric, contract: claim.contract ?? null },
          evidence: run
            ? {
                artifact: run.artifact,
                output: run.output,
                toolCalls: run.toolCalls,
                changedPaths: run.workspace.changedPaths,
                diagnosticReceipts,
              }
            : null,
          judge: judgment ?? null,
          measurements: {
            durationMs: run
              ? { value: run.durationMs, unit: 'ms' }
              : { unavailable: 'run not completed' },
            tokens:
              run?.usage.tokens.total !== undefined
                ? { value: run.usage.tokens.total, unit: 'provider-token' }
                : { unavailable: 'usage not supplied' },
          },
        },
        null,
        2,
      ),
    )
    await info.attach('Toolbox normalized evidence', {
      path: artifacts,
      contentType: 'application/json',
    })
  }
}

/** Every commit on any branch made after the fixture baseline, with changed files. */
export function commitsAfterBaseline(root: string) {
  const baseline = execFileSync(
    'git',
    ['log', '--all', '--format=%H', '--grep=^Fixture baseline$'],
    {
      cwd: root,
    },
  )
    .toString()
    .trim()
    .split('\n')
    .at(-1)
  if (!baseline) return 'No fixture baseline commit found.'
  const log = execFileSync(
    'git',
    ['log', '--all', '--stat', '--format=%h %D %s', '--not', baseline],
    {
      cwd: root,
    },
  ).toString()
  return log.trim() || 'No commits after the fixture baseline.'
}

/** Create `.origin.git` beside the work tree, push every local branch, and track upstreams. */
function publishToBareRemote(root: string) {
  const git = (...args: string[]) => execFileSync('git', args, { cwd: root })
  execFileSync('git', ['init', '-q', '--bare', '.origin.git'], { cwd: root })
  git('remote', 'add', 'origin', join(root, '.origin.git'))
  git('push', '-q', '--all', '-u', 'origin')
  git('config', 'user.name', 'Sam Fixture')
  git('config', 'user.email', 'sam@example.invalid')
  execFileSync('sh', ['-c', 'echo .origin.git/ >> .git/info/exclude'], { cwd: root })
}

/**
 * Toolbox skills a run may see. `full` and `none` are the conformance arms; `only:<slug>` and
 * `without:<slug>` are bench ablations. `pack:<name>[@<entry>]` installs a fetched comparison pack
 * from `_agent/packs/<name>/skills` instead.
 */
/** `pack:pstack@poteto-mode` → `pstack`. */
export const packName = (arm: string) => arm.slice('pack:'.length).split('@')[0]

/** The entry skill an arm's prompt names (`pack:pstack@poteto-mode`, `full@workflow`), if any. */
export const packEntry = (arm: string) => arm.split('@')[1]

export function installedSkills(armWithEntry: string): string[] {
  const arm = armWithEntry.split('@')[0]
  if (arm === 'none' || arm.startsWith('pack:')) return []
  if (arm === 'full') return [...EXPECTED_SKILLS]
  const [mode, slug] = arm.split(':')
  if (!slug || !(EXPECTED_SKILLS as readonly string[]).includes(slug))
    throw new Error(`Unknown skill arm ${arm}`)
  if (mode === 'only') return [slug]
  if (mode === 'without') return EXPECTED_SKILLS.filter((candidate) => candidate !== slug)
  throw new Error(`Unknown skill arm ${arm}`)
}

/**
 * Build the fixture workspace for a claim: install the arm's skills, commit the baseline, then
 * apply branch, seed and remote options. `neutral` framing also removes the root skill sources
 * so a benchmark run cannot see which skills exist outside its own install.
 */
export function prepareClaim(
  coder: AgentFixture,
  claim: Claim,
  framing: 'conformance' | 'neutral' = 'conformance',
) {
  return coder.setup(async (workspace) => {
    const arm = claim.defaults.skills ?? 'full'
    const installed = installedSkills(arm)
    for (const mirror of ['.claude/skills', '.agents/skills']) {
      await rm(join(workspace.path, mirror), { recursive: true, force: true })
      if (arm.startsWith('pack:')) {
        const packDir = resolve('_agent/packs', packName(arm), 'skills')
        for (const slug of await readdir(packDir))
          await cp(join(packDir, slug), join(workspace.path, mirror, slug), { recursive: true })
      } else
        for (const slug of installed)
          await cp(join(workspace.path, slug), join(workspace.path, mirror, slug), {
            recursive: true,
          })
    }
    if (claim.overlayDir) await cp(claim.overlayDir, workspace.path, { recursive: true })
    for (const slug of EXPECTED_SKILLS)
      if (framing === 'neutral' || !installed.includes(slug))
        await rm(join(workspace.path, slug), { recursive: true, force: true })
    execFileSync('git', ['init', '-q'], { cwd: workspace.path })
    // A host may sign commits through a program the agent's sandbox cannot reach; fixture repos
    // never sign, so every arm can commit.
    for (const key of ['commit.gpgsign', 'tag.gpgsign'])
      execFileSync('git', ['config', key, 'false'], { cwd: workspace.path })
    // The workspace may already be a repository; name its first branch main either way.
    execFileSync('git', ['symbolic-ref', 'HEAD', 'refs/heads/main'], { cwd: workspace.path })
    execFileSync('git', ['add', '.'], { cwd: workspace.path })
    execFileSync(
      'git',
      [
        '-c',
        'user.name=Toolbox Fixture',
        '-c',
        'user.email=fixture@example.invalid',
        'commit',
        '-qm',
        'Fixture baseline',
      ],
      { cwd: workspace.path },
    )
    if (claim.branch)
      execFileSync('git', ['checkout', '-qb', claim.branch], { cwd: workspace.path })
    if (claim.seedStagedPatch) {
      const seed = await readSeed(claim, claim.seedStagedPatch)
      execFileSync('git', ['apply', `--include=${fixturePath(claim, FIXTURES)}**`, '--index'], {
        cwd: workspace.path,
        input: seed,
      })
    }
    if (claim.seedPatch) {
      const seed = await readSeed(claim, claim.seedPatch)
      execFileSync(
        'git',
        [
          'apply',
          `--include=${fixturePath(claim, FIXTURES)}**`,
          ...(claim.seedStageOnly ? ['--index'] : []),
        ],
        { cwd: workspace.path, input: seed },
      )
    }
    if (claim.seedCommit) {
      execFileSync('git', ['add', '-A'], { cwd: workspace.path })
      execFileSync(
        'git',
        [
          '-c',
          'user.name=Sam Fixture',
          '-c',
          'user.email=sam@example.invalid',
          'commit',
          '-qm',
          claim.seedCommit,
        ],
        { cwd: workspace.path },
      )
    }
    if (claim.baseSeedPatch) {
      const branch = execFileSync('git', ['branch', '--show-current'], { cwd: workspace.path })
        .toString()
        .trim()
      execFileSync('git', ['checkout', '-q', 'main'], { cwd: workspace.path })
      execFileSync('git', ['apply', `--include=${fixturePath(claim, FIXTURES)}**`], {
        cwd: workspace.path,
        input: await readSeed(claim, claim.baseSeedPatch),
      })
      execFileSync('git', ['add', '-A'], { cwd: workspace.path })
      execFileSync(
        'git',
        [
          '-c',
          'user.name=Lee Fixture',
          '-c',
          'user.email=lee@example.invalid',
          'commit',
          '-qm',
          claim.baseSeedCommit ?? 'Advance main',
        ],
        { cwd: workspace.path },
      )
      execFileSync('git', ['checkout', '-q', branch], { cwd: workspace.path })
    }
    if (claim.bareRemote) publishToBareRemote(workspace.path)
  })
}

/** The task prompt with its workspace framing. Neutral framing carries no testing vocabulary. */
export function framePrompt(claim: Claim, framing: 'conformance' | 'neutral' = 'conformance') {
  if (framing === 'neutral')
    return (
      'Work only inside the current workspace; its root AGENTS.md has the project instructions.\n\n' +
      claim.prompt
    )
  return (
    'This is an isolated conformance fixture. Use only files within the current workspace; its root AGENTS.md contains the applicable fixture instructions. Parent AGENTS.md files and other paths outside this workspace are outside the task scope.\n\n' +
    (claim.evidencePolicy === 'read-only'
      ? 'Keep the inspected workspace read-only, including diagnostic artifacts. Report execution results and environment blockers from actual tool output; use captured tool output as evidence without writing receipt files.\n\n'
      : 'For execution results or environment blockers you report, capture the command, stdout/stderr and exit status in bounded text receipts under _evidence/ (use .log, .txt or .json files directly in that folder). Capture actual command output rather than manually writing inferred results. Inspect the receipt before reporting. These diagnostic artifacts are allowed even when the task keeps source files read-only.\n\n') +
    claim.prompt
  )
}

const RECEIPT_PATH = /^_evidence\/[^/]+\.(log|txt|json)$/
type CompletedRun = Awaited<ReturnType<AgentFixture['run']>>

/** Deterministic checks on a finished run: protocol markers, read-only scope, repair contracts, frozen paths, fixture gate, forbidden output and reads. Throws on the first failure. */
export async function runHardChecks(run: CompletedRun, claim: Claim) {
  for (const text of claim.rubric.must ?? []) {
    if (/^[A-Z][A-Z0-9_]+$/.test(text))
      expect(run.output, `Exact protocol marker: ${text}`).toContain(text)
  }
  if (claim.evidencePolicy === 'read-only')
    expect(run.workspace.changedPaths, 'Read-only workspace preserved without receipts').toEqual([])
  else if (/read.only|stay read-only|do not edit/i.test(claim.prompt))
    expect(
      run.workspace.changedPaths.filter((path) => !RECEIPT_PATH.test(path)),
      'Read-only source preserved; only diagnostic receipts may be added',
    ).toEqual([])
  if (claim.contract) {
    const source =
      claim.contract === 'expiry-repair'
        ? 'agent-suites/fixtures/debug-app'
        : 'agent-suites/fixtures/debugging-lab'
    const fixture = fixturePath(claim, source)
    const check =
      claim.contract === 'expiry-repair'
        ? "import assert from 'node:assert/strict'; import { isSessionValid } from './src/sessionGuard.ts'; assert.equal(isSessionValid(1000, 1000), false); assert.equal(isSessionValid(1001, 1000), true); assert.equal(isSessionValid(999, 1000), false); assert.equal(isSessionValid(NaN, 1000), false)"
        : "import assert from 'node:assert/strict'; import { validateCapturedSession } from './src/captured-session.mjs'; assert.equal(validateCapturedSession('1700000001000', 1700000000000), true); assert.equal(validateCapturedSession('1700000000000', 1700000000000), false); assert.equal(validateCapturedSession('1699999999999', 1700000000000), false)"
    execFileSync('node', ['--experimental-strip-types', '--input-type=module', '-e', check], {
      cwd: join(run.workspace.root, fixture),
      timeout: 10000,
    })
    if (claim.contract === 'captured-repair-preserve-wip') {
      expect(await readFile(join(run.workspace.root, fixture, 'notes.txt'), 'utf8')).toBe(
        'Keep this unrelated note exactly as supplied.\nUser work in progress: retain this second line.\n',
      )
      expect(await readFile(join(run.workspace.root, fixture, 'src/refresh.mjs'), 'utf8')).toBe(
        await readFile(resolve(source, 'src/refresh.mjs'), 'utf8'),
      )
      const repairedSource = await readFile(
        join(run.workspace.root, fixture, 'src/captured-session.mjs'),
        'utf8',
      )
      expect(repairedSource, 'Owned temporary instrumentation removed').not.toMatch(
        /console\.(log|debug|trace)|debugger/,
      )
    }
  }
  for (const path of claim.frozenPaths ?? [])
    expect(
      await readFile(join(run.workspace.root, fixturePath(claim, path)), 'utf8'),
      `Frozen path changed: ${path}`,
    ).toBe(await readFile(resolve(path), 'utf8'))
  if (claim.fixtureGate)
    execFileSync('node', ['--test'], {
      cwd: join(run.workspace.root, fixturePath(claim, claim.fixtureGate)),
      timeout: 60000,
    })
  for (const text of claim.rubric.mustNot ?? [])
    expect(run.output, `Forbidden: ${text}`).not.toContain(text)
  for (const path of claim.rubric.mustNotReadPath ?? [])
    expect(run, `Forbidden read: ${path}`).not.toHaveReadPath(path)
}

/** Full patch from the fixture baseline to the current work tree, committed or not. */
export function diffSinceBaseline(root: string) {
  const baseline = execFileSync(
    'git',
    ['log', '--all', '--format=%H', '--grep=^Fixture baseline$'],
    {
      cwd: root,
    },
  )
    .toString()
    .trim()
    .split('\n')
    .at(-1)
  if (!baseline) return ''
  execFileSync('git', ['add', '-A', '--intent-to-add', '.'], { cwd: root })
  return execFileSync(
    'git',
    ['diff', baseline, '--', '.', ':(exclude)_evidence', ':(exclude).hillclimb'],
    {
      cwd: root,
      maxBuffer: 32 * 1024 * 1024,
    },
  ).toString()
}
