#!/usr/bin/env node
// Read one pull request's state through gh and print a merge-readiness verdict as JSON.
import { execFileSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'

const INCOMPLETE = new Set(['cancel', 'skipping'])

/**
 * Pure policy: PR facts in, one verdict out. Order matters: the first blocking
 * condition wins so the caller always gets the next thing to do.
 */
export function decide({ pr, checks, threads }) {
  const reasons = []
  if (pr.state !== 'OPEN') return { verdict: 'BLOCKED', reasons: [`PR is ${pr.state}`] }
  if (pr.isDraft)
    return { verdict: 'BLOCKED', reasons: ['PR is a draft; marking it ready is the user’s call'] }
  if (pr.mergeable === 'CONFLICTING' || pr.mergeStateStatus === 'DIRTY')
    return { verdict: 'ACTION:conflict', reasons: ['Merge conflicts with the base branch'] }

  const open = threads.filter((thread) => !thread.isResolved && !thread.isOutdated)
  if (open.length)
    return {
      verdict: 'ACTION:threads',
      reasons: open.map((thread) => `Unresolved thread on ${thread.path ?? 'PR'}`),
    }

  const failed = checks.filter((check) => check.bucket === 'fail')
  if (failed.length)
    return { verdict: 'ACTION:ci', reasons: failed.map((check) => `Failing check: ${check.name}`) }
  const incomplete = checks.filter((check) => INCOMPLETE.has(check.bucket))
  if (incomplete.length)
    return {
      verdict: 'ACTION:ci',
      reasons: incomplete.map((check) => `Incomplete check (${check.bucket}): ${check.name}`),
    }

  if (!checks.length) reasons.push('No checks reported yet')
  for (const check of checks.filter((check) => check.bucket === 'pending'))
    reasons.push(`Pending check: ${check.name}`)
  if (pr.mergeable === 'UNKNOWN') reasons.push('Mergeability not computed yet')
  if (pr.reviewDecision === 'CHANGES_REQUESTED')
    reasons.push('Changes requested; awaiting re-review')
  if (reasons.length) return { verdict: 'WAITING', reasons }

  return { verdict: 'READY', reasons: [] }
}

const THREADS_QUERY = `query($owner: String!, $repo: String!, $number: Int!) {
  repository(owner: $owner, name: $repo) { pullRequest(number: $number) {
    reviewThreads(first: 100) { nodes { isResolved isOutdated path } } } } }`

function gh(bin, args) {
  return execFileSync(bin, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
}

/** Collect PR facts with gh. `gh pr checks` exits non-zero when checks fail, so read its stdout anyway. */
export function collect(bin, pr) {
  const view = JSON.parse(
    gh(bin, [
      'pr',
      'view',
      pr,
      '--json',
      'number,state,isDraft,mergeable,mergeStateStatus,reviewDecision,headRefName,headRefOid,baseRefName,url',
    ]),
  )
  let checks = []
  try {
    checks = JSON.parse(gh(bin, ['pr', 'checks', pr, '--json', 'name,state,bucket']) || '[]')
  } catch (error) {
    checks = JSON.parse(error.stdout || '[]')
  }
  const [owner, repo] = new URL(view.url).pathname.split('/').filter(Boolean)
  const graph = JSON.parse(
    gh(bin, [
      'api',
      'graphql',
      '-f',
      `query=${THREADS_QUERY}`,
      '-F',
      `owner=${owner}`,
      '-F',
      `repo=${repo}`,
      '-F',
      `number=${view.number}`,
    ]),
  )
  const threads = graph.data.repository.pullRequest.reviewThreads.nodes
  return { pr: view, checks, threads }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const pr = process.argv[2]
  if (!pr || pr === '--help') {
    console.log('Usage: GH_BIN=<gh> status.mjs <pr-number|url|branch>')
    process.exit(pr ? 0 : 1)
  }
  const facts = collect(process.env.GH_BIN || 'gh', pr)
  const { verdict, reasons } = decide(facts)
  console.log(
    JSON.stringify(
      {
        verdict,
        reasons,
        head: facts.pr.headRefOid,
        branch: facts.pr.headRefName,
        base: facts.pr.baseRefName,
        checks: facts.checks,
      },
      null,
      2,
    ),
  )
}
