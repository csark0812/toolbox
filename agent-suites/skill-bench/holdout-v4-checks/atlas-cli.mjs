// Hidden acceptance for the atlas startup work: every command still prints exactly what it
// printed before (including errors and exit codes), and the frozen startup timing is under target.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
const dir = process.argv[2]
const GOLDEN = {
  'capital peru Chile': [0, 'Peru: Lima\nChile: Santiago\n', ''],
  'currency India Morocco': [0, 'India: INR (Rupee)\nMorocco: MAD (Dirham)\n', ''],
  'zone Japan': [0, 'Japan: Asia/Tokyo UTC+09:00\n', ''],
  'zone India': [0, 'India: Asia/Kolkata UTC+05:30\n', ''],
  'route Peru Chile': [0, 'Lima to Santiago: 2466 km\n', ''],
  'nearest 10 10': [0, 'Bardunsanne (10.2597, 10.2826), 42.3 km away\n', ''],
  'nearest -33.5 151.2': [0, 'Mior (-33.5431, 151.3147), 11.7 km away\n', ''],
  'nearest 89 179': [0, 'Loquilomi (88.9682, 179.2741), 3.6 km away\n', ''],
  help: [
    0,
    "atlas capital <country>...      capital city of each country\natlas currency <country>...     currency code and name\natlas zone <country>            UTC offset now for the country's main time zone\natlas nearest <lat> <lon>       nearest place in the gazetteer\natlas route <from> <to>         great-circle distance between two capitals\n",
    '',
  ],
  'capital Atlantis': [1, '', 'unknown country: Atlantis\n'],
  bogus: [2, '', 'unknown command: bogus (try atlas help)\n'],
}
for (const [args, [status, out, err]] of Object.entries(GOLDEN)) {
  const run = spawnSync(process.execPath, ['bin/atlas.mjs', ...args.split(' ')], {
    cwd: dir,
    encoding: 'utf8',
  })
  assert.deepEqual([run.status, run.stdout, run.stderr], [status, out, err], `atlas ${args}`)
}
const norway = spawnSync(process.execPath, ['bin/atlas.mjs', 'zone', 'norway'], {
  cwd: dir,
  encoding: 'utf8',
})
assert.match(norway.stdout, /^Norway: Europe\/Oslo UTC\+0[12]:00\n$/)
const perf = JSON.parse(
  execFileSync(process.execPath, ['perf/startup.mjs'], {
    cwd: dir,
    encoding: 'utf8',
    timeout: 110000,
  }),
)
assert.equal(perf.errors, 0)
assert.equal(perf.work, 5, 'the timed lookup still answers all five countries')
// Target is 80 ms; allow slack for a loaded machine.
assert.ok(perf.medianMs < 160, `median ${perf.medianMs} ms is far above the 80 ms target`)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
