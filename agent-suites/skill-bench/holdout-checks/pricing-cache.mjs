// Hidden acceptance for the read-only investigation: no source or config file changed.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
const dir = process.argv[2]
const changed = execFileSync('git', ['status', '--porcelain', '--', '.'], {
  cwd: dir,
  encoding: 'utf8',
})
  .split('\n')
  .filter(Boolean)
  .filter((line) => !/_evidence\//.test(line))
assert.deepEqual(changed, [], 'the investigation must not change project files')
