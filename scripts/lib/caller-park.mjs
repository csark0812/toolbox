/**
 * Generic answer-key park for null-arm direct runs.
 *
 * Cursor agents can use Shell against the IDE-open repo root, not the seeded
 * scenario worktree. Store parked file bytes in process memory (no $TMPDIR
 * plaintext), delete from the tree, then commit those deletions on a detached
 * HEAD and temporarily retarget main / origin/main so `git show` cannot recover
 * keys. Restore refs + bytes afterward.
 *
 * Also parks absolute paths (e.g. ~/.agents/skills/<slug>) and removes dangling
 * skill symlinks — otherwise `ls .agents/skills` still lists the slug and agents
 * attempt Read of SKILL.md. Successful Reads with content still fail mustNotReadPath.
 *
 * Restore must not `git checkout -f` — that discards unrelated uncommitted edits
 * on the open tree (forage-seal patches were wiped that way).
 */
import { execFileSync } from 'node:child_process'
import {
  mkdirSync,
  existsSync,
  rmSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  lstatSync,
  readlinkSync,
  symlinkSync,
} from 'node:fs'
import { dirname, isAbsolute, join } from 'node:path'
import { tmpdir } from 'node:os'

/**
 * @param {string} abs
 */
function pathExistsViaLstat(abs) {
  try {
    lstatSync(abs)
    return true
  } catch {
    return false
  }
}

/**
 * @param {string} absDir
 * @param {string} keyPrefix
 * @param {Map<string, Buffer | { type: 'symlink', target: string }>} files
 */
function collectFilesRecursive(absDir, keyPrefix, files) {
  for (const name of readdirSync(absDir)) {
    const abs = join(absDir, name)
    const key = join(keyPrefix, name)
    const st = lstatSync(abs)
    if (st.isSymbolicLink()) {
      files.set(key, { type: 'symlink', target: readlinkSync(abs) })
    } else if (st.isDirectory()) {
      collectFilesRecursive(abs, key, files)
    } else if (st.isFile()) {
      files.set(key, readFileSync(abs))
    }
  }
}

/**
 * @param {string} repoRoot
 * @param {string} entry
 */
export function resolveParkEntry(repoRoot, entry) {
  return isAbsolute(entry) ? entry : join(repoRoot, entry)
}

/**
 * @param {string} repoRoot
 * @param {string} key
 */
function absFromParkKey(repoRoot, key) {
  return isAbsolute(key) ? key : join(repoRoot, key)
}

/**
 * @param {string} repoRoot
 * @param {string[]} parkPaths  repo-relative and/or absolute paths
 * @param {{ parkId?: string }} [options]
 * @returns {{
 *   parkId: string,
 *   metaDir: string,
 *   parkRoot: string,
 *   moved: Array<{ rel: string, outsideRepo?: boolean }>,
 *   files: Map<string, Buffer | { type: 'symlink', target: string }>,
 * }}
 */
export function parkAnswerKeys(repoRoot, parkPaths, options = {}) {
  const parkId =
    options.parkId ?? `caller-park-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}`
  /** Only stores git-ref backup JSON — never answer-key bytes. */
  const metaDir = join(tmpdir(), parkId)
  mkdirSync(metaDir, { recursive: true })

  const files = new Map()
  const moved = []
  for (const entry of parkPaths) {
    const from = resolveParkEntry(repoRoot, entry)
    if (!pathExistsViaLstat(from)) continue
    const st = lstatSync(from)
    const outsideRepo = isAbsolute(entry)
    const key = outsideRepo ? from : entry

    if (st.isSymbolicLink()) {
      files.set(key, { type: 'symlink', target: readlinkSync(from) })
      rmSync(from, { force: true })
    } else if (st.isDirectory()) {
      collectFilesRecursive(from, key, files)
      rmSync(from, { recursive: true, force: true })
    } else if (st.isFile()) {
      files.set(key, readFileSync(from))
      rmSync(from, { force: true })
    } else {
      continue
    }
    moved.push({ rel: key, outsideRepo })
  }
  return { parkId, metaDir, parkRoot: metaDir, moved, files }
}

/**
 * @param {string} repoRoot
 * @param {{ files: Map<string, Buffer | { type: 'symlink', target: string }>, moved?: unknown[] }} handle
 */
export function restoreAnswerKeys(repoRoot, handle) {
  if (!handle?.files?.size) {
    if (handle) handle.moved = []
    return
  }
  // Recreate files before symlinks so relative link targets resolve.
  const entries = [...handle.files.entries()]
  const filesFirst = entries.filter(
    ([, body]) => !(body && typeof body === 'object' && 'type' in body),
  )
  const symlinks = entries.filter(
    ([, body]) => body && typeof body === 'object' && 'type' in body && body.type === 'symlink',
  )

  for (const [key, body] of filesFirst) {
    const abs = absFromParkKey(repoRoot, key)
    mkdirSync(dirname(abs), { recursive: true })
    writeFileSync(abs, /** @type {Buffer} */ (body))
  }
  for (const [key, body] of symlinks) {
    const abs = absFromParkKey(repoRoot, key)
    mkdirSync(dirname(abs), { recursive: true })
    const target = /** @type {{ type: 'symlink', target: string }} */ (body).target
    try {
      rmSync(abs, { force: true })
    } catch {
      // absent
    }
    symlinkSync(target, abs)
  }
  handle.files.clear()
  handle.moved = []
}

function git(repoRoot, args) {
  return execFileSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim()
}

function tryRevParse(repoRoot, rev) {
  try {
    return git(repoRoot, ['rev-parse', rev])
  } catch {
    return null
  }
}

/**
 * @param {string} repoRoot
 * @param {{ moved: Array<{ rel: string, outsideRepo?: boolean }>, metaDir?: string, parkRoot?: string }} parkHandle
 * @param {{ commitMessage?: string }} [options]
 */
export function commitParkToGit(repoRoot, parkHandle, options = {}) {
  const commitMessage = options.commitMessage ?? 'agent-test: temporary answer-key park'
  const metaDir = parkHandle.metaDir ?? parkHandle.parkRoot
  const branch = (() => {
    try {
      return git(repoRoot, ['symbolic-ref', '--short', 'HEAD'])
    } catch {
      return null
    }
  })()
  const previousHead = git(repoRoot, ['rev-parse', 'HEAD'])
  const previousMain = tryRevParse(repoRoot, 'refs/heads/main')
  const previousOriginMain = tryRevParse(repoRoot, 'refs/remotes/origin/main')

  const meta = {
    branch,
    previousHead,
    previousMain,
    previousOriginMain,
    parkCommit: null,
  }
  writeFileSync(join(metaDir, 'git-ref-backup.json'), `${JSON.stringify(meta, null, 2)}\n`)

  git(repoRoot, ['checkout', '--detach', 'HEAD'])
  for (const { rel, outsideRepo } of parkHandle.moved) {
    if (outsideRepo || isAbsolute(rel)) continue
    try {
      git(repoRoot, ['add', '-u', '--', rel])
    } catch {
      // untracked / already absent
    }
  }
  const status = git(repoRoot, ['status', '--porcelain'])
  if (!status.trim()) {
    throw new Error('caller park commit: expected staged deletions after park, got empty status')
  }
  // Orphan root commit (no parent) so `git show HEAD^:…` cannot recover keys.
  const tree = git(repoRoot, ['write-tree'])
  const parkCommit = git(repoRoot, [
    '-c',
    'user.email=agent-test@agent-spec.local',
    '-c',
    'user.name=agent-test',
    'commit-tree',
    tree,
    '-m',
    commitMessage,
  ])
  git(repoRoot, ['checkout', '--detach', parkCommit])
  meta.parkCommit = parkCommit
  writeFileSync(join(metaDir, 'git-ref-backup.json'), `${JSON.stringify(meta, null, 2)}\n`)

  if (previousMain) {
    git(repoRoot, ['update-ref', 'refs/heads/main', parkCommit])
  }
  if (previousOriginMain) {
    git(repoRoot, ['update-ref', 'refs/remotes/origin/main', parkCommit])
  }
  try {
    git(repoRoot, ['reflog', 'expire', '--expire=now', '--all'])
  } catch {
    // best-effort
  }

  return meta
}

/**
 * Restore branch refs without `checkout -f` (preserves unrelated working-tree edits).
 * Call after restoreAnswerKeys so parked paths are already back on disk.
 *
 * @param {string} repoRoot
 * @param {{ metaDir?: string, parkRoot?: string }} parkHandle
 */
export function restoreParkGit(repoRoot, parkHandle) {
  const metaDir = parkHandle.metaDir ?? parkHandle.parkRoot
  const backupPath = join(metaDir, 'git-ref-backup.json')
  if (!existsSync(backupPath)) return
  const meta = JSON.parse(readFileSync(backupPath, 'utf8'))

  if (meta.previousMain) {
    git(repoRoot, ['update-ref', 'refs/heads/main', meta.previousMain])
  }
  if (meta.previousOriginMain) {
    git(repoRoot, ['update-ref', 'refs/remotes/origin/main', meta.previousOriginMain])
  }

  if (meta.branch) {
    git(repoRoot, ['symbolic-ref', 'HEAD', `refs/heads/${meta.branch}`])
    // Sync index to HEAD; leave working tree (incl. uncommitted forage-seal edits).
    git(repoRoot, ['reset', '--mixed', 'HEAD'])
  } else if (meta.previousHead) {
    git(repoRoot, ['checkout', '--detach', meta.previousHead])
  }
}
