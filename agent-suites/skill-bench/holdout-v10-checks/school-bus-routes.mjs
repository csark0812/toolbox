// Hidden acceptance for the refused bus passes: every application gets its real outcome, age is
// taken on 1 September (a birthday that day counts), "more than" the walking limit stays strict,
// a seat is only used by a pupil who got a pass, and the tests pass.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
assert.equal(
  execFileSync(process.execPath, ['bin/passes.mjs'], { cwd: dir, encoding: 'utf8' }),
  [
    'P01  Ruby Allen    A  4.1 mi  pass',
    'P02  Amira Khan    A  2.4 mi  pass',
    'P03  Ollie Grant   A  3.0 mi  no pass: walking distance',
    'P04  Sam Price     B  5.2 mi  pass',
    'P05  Lily Shaw     A  2.3 mi  pass',
    'P06  Joe Mercer    B  2.8 mi  pass',
    'P07  Isla Dunn     A  1.2 mi  no pass: walking distance',
    'P08  Ben Ford      A  3.5 mi  pass',
    'P09  Maya Cole     B  2.6 mi  no pass: walking distance',
    'P10  Theo Marsh    A  3.6 mi  pass',
    'P11  Erin Holt     B  4.4 mi  pass',
    'P12  Noah Pike     A  2.5 mi  pass',
    'P13  Kai Lowe      B  6.0 mi  pass',
    'P14  Hana Reid     B  3.9 mi  no pass: route B full',
    'P15  Finn Wood     A  4.8 mi  no pass: route A full',
    'route A: 6 of 6 seats',
    'route B: 4 of 4 seats',
    '',
  ].join('\n'),
  'every application gets its real outcome',
)
const { allocate } = await import(pathToFileURL(join(dir, 'src/passes.mjs')).href)
const pupil = (id, dob, miles, route = 'A') => ({ id, name: id, dob, route, miles })
const outcome = (pupils, seats = 10) =>
  allocate(pupils, { A: { seats }, B: { seats } }).map(({ pass, reason }) =>
    pass ? 'pass' : reason,
  )
assert.deepEqual(
  outcome([
    pupil('Y1', '2018-09-01', 2.9),
    pupil('Y2', '2018-09-02', 2.1),
    pupil('Y3', '2018-08-31', 2.9),
    pupil('Y4', '2019-12-31', 2.0),
    pupil('Y5', '2016-02-29', 3.0),
    pupil('Y6', '2016-02-29', 3.1),
    pupil('Y7', '2018-12-31', 2.01),
    pupil('Y8', '2018-01-01', 2.9),
  ]),
  [
    'walking distance',
    'pass',
    'walking distance',
    'walking distance',
    'walking distance',
    'pass',
    'pass',
    'walking distance',
  ],
  'age on 1 September decides the limit, and the limit itself does not qualify',
)
assert.deepEqual(
  outcome(
    [
      pupil('Z1', '2015-01-01', 1.0),
      pupil('Z2', '2015-01-01', 0.5),
      pupil('Z3', '2015-01-01', 4.0, 'B'),
      pupil('Z4', '2015-01-01', 4.0),
      pupil('Z5', '2015-01-01', 1.5),
      pupil('Z6', '2015-01-01', 4.0),
      pupil('Z7', '2015-01-01', 4.0),
      pupil('Z8', '2015-01-01', 4.0, 'B'),
      pupil('Z9', '2015-01-01', 4.0, 'B'),
    ],
    2,
  ),
  [
    'walking distance',
    'walking distance',
    'pass',
    'pass',
    'walking distance',
    'pass',
    'route A full',
    'pass',
    'route B full',
  ],
  'only pupils with a pass take a seat',
)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
