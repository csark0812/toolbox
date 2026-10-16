// Hidden acceptance for the field-service module split: haversineKm and travelMinutes live in
// src/distance.mjs, formatAddress and shortAddress in src/address.mjs, src/geo.mjs is gone with no
// re-export or reference left (including the config-driven export columns and the SMS module's
// on-demand import), and every command prints exactly what it printed before.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const load = (file) => import(pathToFileURL(join(dir, 'src', file)).href)
assert.ok(!existsSync(join(dir, 'src/geo.mjs')), 'src/geo.mjs is deleted')
const distance = await load('distance.mjs')
const address = await load('address.mjs')
assert.deepEqual(
  Object.keys(distance).sort(),
  ['haversineKm', 'travelMinutes'],
  'src/distance.mjs holds the routing maths',
)
assert.deepEqual(
  Object.keys(address).sort(),
  ['formatAddress', 'shortAddress'],
  'src/address.mjs holds the address formatting',
)
assert.equal(
  distance.haversineKm({ lat: 53.3498, lon: -6.2603 }, { lat: 51.8985, lon: -8.4756 }),
  220,
)
assert.equal(distance.travelMinutes(12.3), 25)
const home = {
  line1: 'Unit 3',
  line2: 'Riverside Business Park',
  town: 'Cork',
  county: 'Cork',
  eircode: 'T12 AB34',
}
assert.equal(
  address.formatAddress(home),
  'Unit 3\nRiverside Business Park\nCork\nCo. Cork\nT12 AB34',
)
assert.equal(address.shortAddress(home), 'Unit 3, Cork T12 AB34')
const { itinerary } = await load('itinerary.mjs')
const techs = JSON.parse(readFileSync(join(dir, 'data/technicians.json'), 'utf8'))
const callouts = JSON.parse(readFileSync(join(dir, 'data/callouts.json'), 'utf8'))
assert.deepEqual(
  itinerary(techs[0], callouts).map((leg) => [leg.callout.id, leg.km, leg.minutes, leg.address]),
  [
    ['c101', 13.6, 25, '14 Harbour Road\nHowth\nCo. Dublin\nD13 X2Y4'],
    ['c104', 44.3, 55, 'The Old Mill\nMain Street\nNaas\nCo. Kildare\nW91 E7F8'],
    ['c103', 158.9, 170, '2 Quay Street\nGalway\nCo. Galway\nH91 C5D6'],
    ['c102', 157.1, 170, 'Unit 3\nRiverside Business Park\nCork\nCo. Cork\nT12 AB34'],
  ],
)
const walk = (folder) =>
  readdirSync(folder, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(folder, entry.name)) : [join(folder, entry.name)],
  )
for (const file of ['src', 'bin', 'tests', 'config'].flatMap((sub) => walk(join(dir, sub))))
  assert.doesNotMatch(readFileSync(file, 'utf8'), /geo\.mjs|\bgeo\b\s*[.[]/, `geo left in ${file}`)
const GOLDEN = {
  assign: [
    0,
    'c101  Dara (13.6 km)\nc102  Orla (0.8 km)\nc103  Femi (0.2 km)\nc104  waiting\n',
    '',
  ],
  'route Dara': [
    0,
    '1. c101 13.6 km, 25 min\n   14 Harbour Road\n   Howth\n   Co. Dublin\n   D13 X2Y4\n',
    '',
  ],
  'route t3': [
    0,
    '1. c102 0.8 km, 15 min\n   Unit 3\n   Riverside Business Park\n   Cork\n   Co. Cork\n   T12 AB34\n',
    '',
  ],
  'route Femi': [
    0,
    '1. c103 0.2 km, 15 min\n   2 Quay Street\n   Galway\n   Co. Galway\n   H91 C5D6\n',
    '',
  ],
  export: [
    0,
    'Call-out,Customer,Address,Technician,Distance (km),Travel (min)\nc101,M. Byrne,"14 Harbour Road, Howth D13 X2Y4",Dara,13.6,25\nc102,S. Walsh,"Unit 3, Cork T12 AB34",Orla,0.8,15\nc103,P. Ní Bhriain,"2 Quay Street, Galway H91 C5D6",Femi,0.2,15\nc104,K. Doyle,"The Old Mill, Naas W91 E7F8",,,\n',
    '',
  ],
  'notify c102': [
    0,
    'Hi S. Walsh, Orla is on the way to Unit 3, Cork T12 AB34 and should arrive in about 15 minutes.\n',
    '',
  ],
  'notify c101': [
    0,
    'Hi M. Byrne, Dara is on the way to 14 Harbour Road, Howth D13 X2Y4 and should arrive in about 25 minutes.\n',
    '',
  ],
  'notify c104': [1, '', 'no technician assigned to c104\n'],
  'route Nobody': [1, '', 'no technician Nobody\n'],
}
for (const [args, [status, out, err]] of Object.entries(GOLDEN)) {
  const run = spawnSync(process.execPath, ['bin/visits.mjs', ...args.split(' ')], {
    cwd: dir,
    encoding: 'utf8',
  })
  assert.deepEqual([run.status, run.stdout, run.stderr], [status, out, err], `visits ${args}`)
}
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
