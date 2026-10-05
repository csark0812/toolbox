import { execFileSync } from 'node:child_process'
import { copyFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { reconcileIndex } from '../create-bounded-commits/scripts/reconcile-index.mjs'

const tempRoots = []

function git(cwd, args, { input, env = {} } = {}) {
  return execFileSync('git', args, {
    cwd,
    input,
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: 'Toolbox Fixture',
      GIT_AUTHOR_EMAIL: 'fixture@example.invalid',
      GIT_COMMITTER_NAME: 'Toolbox Fixture',
      GIT_COMMITTER_EMAIL: 'fixture@example.invalid',
      ...env,
    },
    encoding: 'utf8',
  }).trim()
}

function settings(mode, label) {
  return `${JSON.stringify(
    {
      mode,
      details: {
        first: 1,
        second: 2,
        third: 3,
        fourth: 4,
        fifth: 5,
        sixth: 6,
        seventh: 7,
        eighth: 8,
      },
      label,
    },
    null,
    2,
  )}\n`
}

function fixtureRepo() {
  const root = mkdtempSync(join(tmpdir(), 'bounded-commit-index-'))
  tempRoots.push(root)
  git(root, ['init', '-q', '-b', 'main'])
  writeFileSync(join(root, 'settings.json'), settings('safe', 'alpha'))
  writeFileSync(join(root, 'notes.txt'), 'baseline\n')
  git(root, ['add', '.'])
  git(root, ['commit', '-qm', 'fixture baseline'])
  return { root, oldHead: git(root, ['rev-parse', 'HEAD']) }
}

function createCandidate(root, oldHead, content) {
  const candidateIndex = join(root, '.candidate-index')
  const env = { GIT_INDEX_FILE: candidateIndex }
  git(root, ['read-tree', oldHead], { env })
  const blob = git(root, ['hash-object', '-w', '--stdin'], { input: content, env })
  git(root, ['update-index', '--add', '--cacheinfo', `100644,${blob},settings.json`], { env })
  const tree = git(root, ['write-tree'], { env })
  return git(root, ['commit-tree', tree, '-p', oldHead, '-m', 'approved candidate'], {
    env: {
      GIT_AUTHOR_NAME: 'Toolbox Fixture',
      GIT_AUTHOR_EMAIL: 'fixture@example.invalid',
      GIT_COMMITTER_NAME: 'Toolbox Fixture',
      GIT_COMMITTER_EMAIL: 'fixture@example.invalid',
    },
  })
}

afterEach(() => {
  for (const root of tempRoots.splice(0)) rmSync(root, { recursive: true, force: true })
})

describe('create-bounded-commits staged-index reconciliation', () => {
  it('carries excluded staged changes onto the candidate without changing source state', () => {
    const { root, oldHead } = fixtureRepo()
    writeFileSync(join(root, 'settings.json'), settings('safe', 'deferred'))
    git(root, ['add', 'settings.json'])
    writeFileSync(join(root, 'notes.txt'), 'unfinished work\n')

    const capturedIndex = join(root, '.captured-index')
    const outputIndex = join(root, '.reconciled-index')
    const sourceIndex = join(root, '.git/index')
    copyFileSync(sourceIndex, capturedIndex)
    const originalIndex = readFileSync(sourceIndex)
    const originalNotes = readFileSync(join(root, 'notes.txt'), 'utf8')
    const originalHead = git(root, ['rev-parse', 'HEAD'])
    const candidateHead = createCandidate(root, oldHead, settings('strict', 'alpha'))

    const result = reconcileIndex({
      repository: root,
      oldHead,
      candidateHead,
      capturedIndex,
      outputIndex,
    })

    const finalSettings = git(root, ['show', `${result.reconciledTree}:settings.json`])
    expect(finalSettings).toBe(settings('strict', 'deferred').trim())
    expect(git(root, ['show', `${result.reconciledTree}:notes.txt`])).toBe('baseline')
    expect(readFileSync(sourceIndex)).toEqual(originalIndex)
    expect(readFileSync(join(root, 'notes.txt'), 'utf8')).toBe(originalNotes)
    expect(git(root, ['rev-parse', 'HEAD'])).toBe(originalHead)
  })

  it('refuses overlapping staged changes and leaves original state untouched', () => {
    const { root, oldHead } = fixtureRepo()
    writeFileSync(join(root, 'settings.json'), settings('safe', 'deferred'))
    git(root, ['add', 'settings.json'])

    const capturedIndex = join(root, '.captured-index')
    const outputIndex = join(root, '.reconciled-index')
    const sourceIndex = join(root, '.git/index')
    copyFileSync(sourceIndex, capturedIndex)
    const originalIndex = readFileSync(sourceIndex)
    const originalHead = git(root, ['rev-parse', 'HEAD'])
    const candidateHead = createCandidate(root, oldHead, settings('safe', 'candidate'))

    expect(() =>
      reconcileIndex({ repository: root, oldHead, candidateHead, capturedIndex, outputIndex }),
    ).toThrow(/Could not reconcile staged state/)
    expect(readFileSync(sourceIndex)).toEqual(originalIndex)
    expect(() => readFileSync(outputIndex)).toThrow()
    expect(git(root, ['rev-parse', 'HEAD'])).toBe(originalHead)
  })
})
