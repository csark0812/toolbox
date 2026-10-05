import { expect, type AgentFixture, type JudgeFixture } from '@post-print/agent-test'
import type { TestInfo } from '@playwright/test'
import { readFile, writeFile, mkdir, rm, cp, readdir } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { join, resolve } from 'node:path'
import { EXPECTED_SKILLS } from '../../src/expected-skills'

type Claim = {
  id: string
  suite: string
  name: string
  prompt: string
  seedPatch?: string
  seedStageOnly?: boolean
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
}
export async function executeClaim(
  coder: AgentFixture,
  reviewer: JudgeFixture<{ passed: boolean; reason: string }>,
  claim: Claim,
  info: TestInfo,
) {
  const prepared = coder.setup(async (workspace) => {
    for (const mirror of ['.claude/skills', '.agents/skills']) {
      await rm(join(workspace.path, mirror), { recursive: true, force: true })
      if (claim.defaults.skills !== 'none') {
        for (const slug of EXPECTED_SKILLS)
          await cp(join(workspace.path, slug), join(workspace.path, mirror, slug), {
            recursive: true,
          })
      }
    }
    if (claim.defaults.skills === 'none')
      for (const slug of EXPECTED_SKILLS)
        await rm(join(workspace.path, slug), { recursive: true, force: true })
    execFileSync('git', ['init', '-q'], { cwd: workspace.path })
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
    if (claim.seedPatch) {
      const seed = await readFile(resolve(claim.seedPatch), 'utf8')
      execFileSync(
        'git',
        [
          'apply',
          '--include=agent-suites/fixtures/**',
          ...(claim.seedStageOnly ? ['--index'] : []),
        ],
        { cwd: workspace.path, input: seed },
      )
    }
  })
  const artifacts = info.outputPath('normalized.json')
  let run: Awaited<ReturnType<AgentFixture['run']>> | undefined
  let outcome = 'infrastructure-failed'
  let failure: string | undefined
  let judgment: unknown
  const diagnosticReceipts: Record<string, string> = {}
  try {
    run = await prepared.run({
      prompt:
        'This is an isolated conformance fixture. Use only files within the current workspace; its root AGENTS.md contains the applicable fixture instructions. Parent AGENTS.md files and other paths outside this workspace are outside the task scope.\n\n' +
        'For execution results or environment blockers you report, capture the command, stdout/stderr and exit status in bounded text receipts under _evidence/ (use .log, .txt or .json files directly in that folder). Capture actual command output rather than manually writing inferred results. Inspect the receipt before reporting. These diagnostic artifacts are allowed even when the task keeps source files read-only.\n\n' +
        claim.prompt,
      includeGlobalSkills: false,
    })
    outcome = 'task-failed'
    const receiptPath = /^_evidence\/[^/]+\.(log|txt|json)$/
    for (const filename of await readdir(join(run.workspace.root, '_evidence')).catch(() => [])) {
      const relative = `_evidence/${filename}`
      if (receiptPath.test(relative))
        diagnosticReceipts[relative] = (
          await readFile(join(run.workspace.root, relative), 'utf8')
        ).slice(0, 16000)
    }
    for (const text of claim.rubric.must ?? []) {
      if (/^[A-Z][A-Z0-9_]+$/.test(text))
        expect(run.output, `Exact protocol marker: ${text}`).toContain(text)
    }
    if (/read.only|stay read-only|do not edit/i.test(claim.prompt))
      expect(
        run.workspace.changedPaths.filter((path) => !receiptPath.test(path)),
        'Read-only source preserved; only diagnostic receipts may be added',
      ).toEqual([])
    if (claim.contract) {
      const fixture =
        claim.contract === 'expiry-repair'
          ? 'agent-suites/fixtures/debug-app'
          : 'agent-suites/fixtures/debugging-lab'
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
          await readFile(resolve(fixture, 'src/refresh.mjs'), 'utf8'),
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
    for (const text of claim.rubric.mustNot ?? [])
      expect(run.output, `Forbidden: ${text}`).not.toContain(text)
    for (const path of claim.rubric.mustNotReadPath ?? [])
      expect(run, `Forbidden read: ${path}`).not.toHaveReadPath(path)
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
      outcome = 'judge-failed'
      const evaluation = await reviewer.run({
        input: {
          questions,
          output: run.output,
          toolCalls: JSON.parse(JSON.stringify(run.toolCalls)),
          selectedSnapshot,
          changedPaths: run.workspace.changedPaths,
          diagnosticReceipts,
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
