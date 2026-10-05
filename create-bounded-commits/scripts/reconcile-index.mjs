#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

function git(args, cwd, env = {}) {
  return execFileSync('git', args, {
    cwd,
    env: { ...process.env, ...env },
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim()
}

function usage() {
  throw new Error(
    'Usage: reconcile-index.mjs <repository> <old-head> <candidate-head> <captured-index> <output-index>',
  )
}

export function reconcileIndex({ repository, oldHead, candidateHead, capturedIndex, outputIndex }) {
  if (![repository, oldHead, candidateHead, capturedIndex, outputIndex].every(Boolean)) usage()

  const repo = git(['rev-parse', '--show-toplevel'], resolve(repository))
  const oldCommit = git(['rev-parse', '--verify', `${oldHead}^{commit}`], repo)
  const candidateCommit = git(['rev-parse', '--verify', `${candidateHead}^{commit}`], repo)
  try {
    git(['merge-base', '--is-ancestor', oldCommit, candidateCommit], repo)
  } catch {
    throw new Error('Candidate HEAD must descend from the captured current-branch HEAD')
  }
  const source = resolve(capturedIndex)
  const output = resolve(outputIndex)

  if (!existsSync(source)) throw new Error(`Captured index does not exist: ${source}`)
  if (source === output) throw new Error('Output index must differ from the captured source index')
  if (existsSync(output)) throw new Error(`Refusing to overwrite output index: ${output}`)

  mkdirSync(dirname(output), { recursive: true })
  try {
    const capturedTree = git(['write-tree'], repo, { GIT_INDEX_FILE: source })
    const capturedCommit = git(
      ['commit-tree', capturedTree, '-p', oldCommit, '-m', 'Captured index for reconciliation'],
      repo,
      {
        GIT_AUTHOR_NAME: 'Bounded commit reconciliation',
        GIT_AUTHOR_EMAIL: 'bounded-commits@example.invalid',
        GIT_COMMITTER_NAME: 'Bounded commit reconciliation',
        GIT_COMMITTER_EMAIL: 'bounded-commits@example.invalid',
      },
    )
    const mergeOutput = git(['merge-tree', '--write-tree', candidateCommit, capturedCommit], repo)
    const mergedTree = mergeOutput.split(/\s+/)[0]
    if (!/^[0-9a-f]{40,64}$/.test(mergedTree))
      throw new Error(`Git returned an invalid merged tree id: ${mergedTree}`)
    git(['read-tree', mergedTree], repo, { GIT_INDEX_FILE: output })
    const reconciledTree = git(['write-tree'], repo, { GIT_INDEX_FILE: output })
    if (reconciledTree !== mergedTree)
      throw new Error(
        `Reconciled index tree ${reconciledTree} differs from merge tree ${mergedTree}`,
      )
    return { outputIndex: output, capturedTree, reconciledTree }
  } catch (error) {
    rmSync(output, { force: true })
    const diagnostic = [error.stderr ?? error.output?.[2], error.stdout ?? error.output?.[1]]
      .map((part) => part?.toString().trim())
      .filter(Boolean)
      .join('\n')
    throw new Error(
      `Could not reconcile staged state; original index was not changed. ${diagnostic || error.message}`,
    )
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [, , repository, oldHead, candidateHead, capturedIndex, outputIndex] = process.argv
  try {
    console.log(
      JSON.stringify(
        reconcileIndex({ repository, oldHead, candidateHead, capturedIndex, outputIndex }),
      ),
    )
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
