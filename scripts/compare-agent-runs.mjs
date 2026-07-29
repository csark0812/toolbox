#!/usr/bin/env node
/**
 * Compare two agent-test debug session roots (skill-on vs skill-off, ablation arms, etc.).
 *
 * Usage:
 *   node scripts/compare-agent-runs.mjs \
 *     --left  "$TMPDIR/agent-spec/sessions/<id-a>" \
 *     --right "$TMPDIR/agent-spec/sessions/<id-b>" \
 *     --left-label full \
 *     --right-label none
 */
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { writeComparisonReport } from './lib/compare-agent-runs-core.mjs'

const root = join(fileURLToPath(import.meta.url), '..', '..')

function parseArgs(argv) {
  const out = {
    left: '',
    right: '',
    leftLabel: 'left',
    rightLabel: 'right',
  }
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--left') out.left = argv[++i] ?? ''
    else if (arg === '--right') out.right = argv[++i] ?? ''
    else if (arg === '--left-label') out.leftLabel = argv[++i] ?? 'left'
    else if (arg === '--right-label') out.rightLabel = argv[++i] ?? 'right'
    else if (arg === '--align') {
      console.warn('Note: --align is ignored; pairing uses compareId then band-neutral name.')
      argv[++i]
    } else if (arg === '--help' || arg === '-h') out.help = true
    else throw new Error(`Unknown argument: ${arg}`)
  }
  return out
}

async function main() {
  const args = parseArgs(process.argv)
  if (args.help || !args.left || !args.right) {
    console.log(`Usage:
  node scripts/compare-agent-runs.mjs \\
    --left  <session-root> \\
    --right <session-root> \\
    [--left-label full] \\
    [--right-label none]`)
    process.exit(args.help ? 0 : 1)
  }

  const { reportPath, reportMdPath } = await writeComparisonReport({
    repoRoot: root,
    left: args.left,
    right: args.right,
    leftLabel: args.leftLabel,
    rightLabel: args.rightLabel,
  })

  console.log(`HTML: ${reportPath}`)
  console.log(`MD: ${reportMdPath}`)
}

main().catch((err) => {
  console.error(err.message ?? err)
  process.exit(1)
})
