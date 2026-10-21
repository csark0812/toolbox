#!/usr/bin/env node
// Stands in for `claude` during bench runs (the harness reads CLAUDE_CODE_BIN). Claude Code's Linux
// sandbox blocks Unix sockets, which headless Chrome needs to start, and a project settings file cannot
// loosen the sandbox settings the harness passes. This adds that one allowance to the harness's
// --settings on Linux, denies the sockets that would let a command leave the sandbox (Docker, the
// session bus, the SSH agent), and runs the real CLI. Every arm runs through it alike; network access
// is unchanged.
import { spawn } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, realpathSync } from 'node:fs'
import { constants } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Unix sockets no bench run may open: each one reaches a process outside the sandbox. */
export function escapeSockets({
  env = process.env,
  runUser = '/run/user',
  exists = existsSync,
} = {}) {
  const users = exists(runUser)
    ? readdirSync(runUser).map((user) => join(runUser, user, 'bus'))
    : []
  // Only sockets that exist: the wrapper starts with every CLI run, so the list is current.
  return [
    '/var/run/docker.sock',
    '/run/docker.sock',
    ...users,
    ...(env.SSH_AUTH_SOCK ? [env.SSH_AUTH_SOCK] : []),
  ].filter((path) => exists(path))
}

/** The settings value as JSON: inline JSON, or the path of a settings file. */
function readSettings(value, readFile) {
  try {
    return JSON.parse(value)
  } catch {
    return JSON.parse(readFile(value, 'utf8'))
  }
}

/**
 * The CLI arguments with the bench's sandbox changes merged into `--settings <json|file>` or
 * `--settings=<json|file>`. Unix sockets are allowed only on Linux, where the sandbox cannot allow
 * them by path; the escape sockets are denied for reading and writing everywhere.
 */
export function benchArgs(
  args,
  { platform = process.platform, env = process.env, readFile = readFileSync, sockets } = {},
) {
  const out = [...args]
  const index = out.findIndex((arg) => arg === '--settings' || arg.startsWith('--settings='))
  if (index === -1) return out
  const inline = out[index].startsWith('--settings=')
  const value = inline ? out[index].slice('--settings='.length) : out[index + 1]
  if (value === undefined) return out
  const settings = readSettings(value, readFile)
  if (settings.sandbox) {
    if (platform === 'linux')
      settings.sandbox.network = { ...settings.sandbox.network, allowAllUnixSockets: true }
    const denied = sockets ?? escapeSockets({ env })
    const filesystem = settings.sandbox.filesystem ?? {}
    settings.sandbox.filesystem = {
      ...filesystem,
      denyRead: [...new Set([...(filesystem.denyRead ?? []), ...denied])],
      denyWrite: [...new Set([...(filesystem.denyWrite ?? []), ...denied])],
    }
  }
  if (inline) out[index] = `--settings=${JSON.stringify(settings)}`
  else out[index + 1] = JSON.stringify(settings)
  return out
}

/** The exit status a shell reports for a process killed by `signal`. */
export const signalStatus = (signal) => 128 + (constants.signals[signal] ?? 0)

const isMain = () => {
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))
  } catch {
    return false
  }
}

if (isMain()) {
  const real = process.env.TOOLBOX_REAL_CLAUDE_BIN
  if (!real) {
    console.error('TOOLBOX_REAL_CLAUDE_BIN is not set')
    process.exit(2)
  }
  const child = spawn(real, benchArgs(process.argv.slice(2)), { stdio: 'inherit' })
  const forwarded = ['SIGINT', 'SIGTERM', 'SIGHUP']
  for (const signal of forwarded) process.on(signal, () => child.kill(signal))
  child.on('exit', (code, signal) => {
    if (!signal) process.exit(code)
    // Die of the same signal, so the harness sees a killed CLI and not a clean exit. Our own
    // forwarding handlers would otherwise swallow it; the status is the fallback.
    for (const name of forwarded) process.removeAllListeners(name)
    process.kill(process.pid, signal)
    setTimeout(() => process.exit(signalStatus(signal)), 100)
  })
}
