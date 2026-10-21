#!/usr/bin/env node
// Stands in for `claude` during bench runs (the harness reads CLAUDE_CODE_BIN). Claude Code's Linux
// sandbox blocks Unix sockets, which headless Chrome needs to start, and a project settings file cannot
// loosen the sandbox settings the harness passes. This adds that one allowance to the harness's
// --settings and runs the real CLI. Every arm runs through it alike; network access is unchanged.
import { spawn } from 'node:child_process'

const real = process.env.TOOLBOX_REAL_CLAUDE_BIN
if (!real) {
  console.error('TOOLBOX_REAL_CLAUDE_BIN is not set')
  process.exit(2)
}
const args = process.argv.slice(2)
const index = args.indexOf('--settings')
if (index !== -1) {
  const settings = JSON.parse(args[index + 1])
  if (settings.sandbox)
    settings.sandbox.network = { ...settings.sandbox.network, allowAllUnixSockets: true }
  args[index + 1] = JSON.stringify(settings)
}
const child = spawn(real, args, { stdio: 'inherit' })
for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.on(signal, () => child.kill(signal))
child.on('exit', (code, signal) =>
  signal ? process.kill(process.pid, signal) : process.exit(code),
)
