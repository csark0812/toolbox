// Hidden acceptance for the mobile library split: src/library.mjs is gone with nothing importing it,
// its code lives in several smaller modules, every module loads on its own as an entry point (the
// circular imports included), the on-demand loads (formats, holds, command dispatch) still work,
// and every command prints exactly what it did.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const VAN = [
  [[], '', 'Unknown command:\nCommands: run, stop, holds, week\n', 1],
  [['describe'], '', 'Unknown command: describe\nCommands: run, stop, holds, week\n', 1],
  [['toString'], '', 'Unknown command: toString\nCommands: run, stop, holds, week\n', 1],
  [['constructor', 'x'], '', 'Unknown command: constructor\nCommands: run, stop, holds, week\n', 1],
  [
    ['hasOwnProperty'],
    '',
    'Unknown command: hasOwnProperty\nCommands: run, stop, holds, week\n',
    1,
  ],
  [['__proto__'], '', 'Unknown command: __proto__\nCommands: run, stop, holds, week\n', 1],
  [['Run', 'Tue', 'A'], '', 'Unknown command: Run\nCommands: run, stop, holds, week\n', 1],
  [
    ['run', 'Mon', 'A'],
    'Mon run, week A\n09:30-10:10  Manea, Village hall\n10:35-11:00  Coates, The Green                   2 holds  (25 min drive)\n13:15-13:45  Benwick, Church car park            (135 min drive)\n',
    '',
    0,
  ],
  [
    ['run', 'Mon', 'A', '--format', 'csv'],
    'stop,village,name,arrive,leave,drive,holds\nST01,Manea,Village hall,09:30,10:10,,0\nST02,Coates,The Green,10:35,11:00,25,2\nST04,Benwick,Church car park,13:15,13:45,135,0\n',
    '',
    0,
  ],
  [
    ['run', 'Mon', 'A', '--format', 'text'],
    'Mon run, week A\n09:30-10:10  Manea, Village hall\n10:35-11:00  Coates, The Green                   2 holds  (25 min drive)\n13:15-13:45  Benwick, Church car park            (135 min drive)\n',
    '',
    0,
  ],
  [
    ['run', 'Mon', 'B'],
    'Mon run, week B\n09:30-10:10  Manea, Village hall\n10:35-11:20  Eastrea, Primary school             1 hold  (25 min drive)\n13:15-13:45  Benwick, Church car park            (115 min drive)\n',
    '',
    0,
  ],
  [
    ['run', 'Mon', 'B', '--format', 'csv'],
    'stop,village,name,arrive,leave,drive,holds\nST01,Manea,Village hall,09:30,10:10,,0\nST03,Eastrea,Primary school,10:35,11:20,25,1\nST04,Benwick,Church car park,13:15,13:45,115,0\n',
    '',
    0,
  ],
  [
    ['run', 'Mon', 'B', '--format', 'text'],
    'Mon run, week B\n09:30-10:10  Manea, Village hall\n10:35-11:20  Eastrea, Primary school             1 hold  (25 min drive)\n13:15-13:45  Benwick, Church car park            (115 min drive)\n',
    '',
    0,
  ],
  [
    ['run', 'Tue', 'A'],
    'Tue run, week A\n09:15-10:05  Doddington, Post office\n10:30-10:50  Wimblington, Rose Court             (25 min drive)\n11:05-11:40  Wimblington, Playing field          2 holds  (15 min drive)\n',
    '',
    0,
  ],
  [
    ['run', 'Tue', 'A', '--format', 'csv'],
    'stop,village,name,arrive,leave,drive,holds\nST05,Doddington,Post office,09:15,10:05,,0\nST06,Wimblington,Rose Court,10:30,10:50,25,0\nST07,Wimblington,Playing field,11:05,11:40,15,2\n',
    '',
    0,
  ],
  [
    ['run', 'Tue', 'A', '--format', 'text'],
    'Tue run, week A\n09:15-10:05  Doddington, Post office\n10:30-10:50  Wimblington, Rose Court             (25 min drive)\n11:05-11:40  Wimblington, Playing field          2 holds  (15 min drive)\n',
    '',
    0,
  ],
  [
    ['run', 'Tue', 'B'],
    'Tue run, week B\n09:15-10:05  Doddington, Post office\n11:05-11:40  Wimblington, Playing field          2 holds  (60 min drive)\n13:40-14:05  Christchurch, Fen Lane              1 hold  (120 min drive)\n',
    '',
    0,
  ],
  [
    ['run', 'Tue', 'B', '--format', 'csv'],
    'stop,village,name,arrive,leave,drive,holds\nST05,Doddington,Post office,09:15,10:05,,0\nST07,Wimblington,Playing field,11:05,11:40,60,2\nST08,Christchurch,Fen Lane,13:40,14:05,120,1\n',
    '',
    0,
  ],
  [
    ['run', 'Tue', 'B', '--format', 'text'],
    'Tue run, week B\n09:15-10:05  Doddington, Post office\n11:05-11:40  Wimblington, Playing field          2 holds  (60 min drive)\n13:40-14:05  Christchurch, Fen Lane              1 hold  (120 min drive)\n',
    '',
    0,
  ],
  [['run', 'Wed', 'A'], 'Wed run, week A\nNo stops\n', '', 0],
  [['run', 'Wed', 'A', '--format', 'csv'], 'stop,village,name,arrive,leave,drive,holds\n', '', 0],
  [['run', 'Wed', 'A', '--format', 'text'], 'Wed run, week A\nNo stops\n', '', 0],
  [['run', 'Wed', 'B'], 'Wed run, week B\nNo stops\n', '', 0],
  [['run', 'Wed', 'B', '--format', 'csv'], 'stop,village,name,arrive,leave,drive,holds\n', '', 0],
  [['run', 'Wed', 'B', '--format', 'text'], 'Wed run, week B\nNo stops\n', '', 0],
  [
    ['run', 'Thu', 'A'],
    'Thu run, week A\n09:45-10:15  Tydd St Giles, Social club\n10:40-11:20  Leverington, Almshouses             1 hold  (25 min drive)\n',
    '',
    0,
  ],
  [
    ['run', 'Thu', 'A', '--format', 'csv'],
    'stop,village,name,arrive,leave,drive,holds\nST09,Tydd St Giles,Social club,09:45,10:15,,0\nST10,Leverington,Almshouses,10:40,11:20,25,1\n',
    '',
    0,
  ],
  [
    ['run', 'Thu', 'A', '--format', 'text'],
    'Thu run, week A\n09:45-10:15  Tydd St Giles, Social club\n10:40-11:20  Leverington, Almshouses             1 hold  (25 min drive)\n',
    '',
    0,
  ],
  [
    ['run', 'Thu', 'B'],
    'Thu run, week B\n09:45-10:15  Gorefield, Garage forecourt         1 hold\n10:40-11:20  Leverington, Almshouses             1 hold  (25 min drive)\n',
    '',
    0,
  ],
  [
    ['run', 'Thu', 'B', '--format', 'csv'],
    'stop,village,name,arrive,leave,drive,holds\nST11,Gorefield,Garage forecourt,09:45,10:15,,1\nST10,Leverington,Almshouses,10:40,11:20,25,1\n',
    '',
    0,
  ],
  [
    ['run', 'Thu', 'B', '--format', 'text'],
    'Thu run, week B\n09:45-10:15  Gorefield, Garage forecourt         1 hold\n10:40-11:20  Leverington, Almshouses             1 hold  (25 min drive)\n',
    '',
    0,
  ],
  [
    ['run', 'Fri', 'A'],
    'Fri run, week A\n14:00-15:00  Elm, Sheltered housing              1 hold\n',
    '',
    0,
  ],
  [
    ['run', 'Fri', 'A', '--format', 'csv'],
    'stop,village,name,arrive,leave,drive,holds\nST12,Elm,Sheltered housing,14:00,15:00,,1\n',
    '',
    0,
  ],
  [
    ['run', 'Fri', 'A', '--format', 'text'],
    'Fri run, week A\n14:00-15:00  Elm, Sheltered housing              1 hold\n',
    '',
    0,
  ],
  [
    ['run', 'Fri', 'B'],
    'Fri run, week B\n14:00-15:00  Elm, Sheltered housing              1 hold\n',
    '',
    0,
  ],
  [
    ['run', 'Fri', 'B', '--format', 'csv'],
    'stop,village,name,arrive,leave,drive,holds\nST12,Elm,Sheltered housing,14:00,15:00,,1\n',
    '',
    0,
  ],
  [
    ['run', 'Fri', 'B', '--format', 'text'],
    'Fri run, week B\n14:00-15:00  Elm, Sheltered housing              1 hold\n',
    '',
    0,
  ],
  [['run', 'Sat', 'A'], '', 'The van does not run on Sat\n', 1],
  [['run', 'Sat', 'A', '--format', 'csv'], '', 'The van does not run on Sat\n', 1],
  [['run', 'Sat', 'A', '--format', 'text'], '', 'The van does not run on Sat\n', 1],
  [['run', 'Sat', 'B'], '', 'The van does not run on Sat\n', 1],
  [['run', 'Sat', 'B', '--format', 'csv'], '', 'The van does not run on Sat\n', 1],
  [['run', 'Sat', 'B', '--format', 'text'], '', 'The van does not run on Sat\n', 1],
  [
    ['run', 'Tue'],
    'Tue run, week A\n09:15-10:05  Doddington, Post office\n10:30-10:50  Wimblington, Rose Court             (25 min drive)\n11:05-11:40  Wimblington, Playing field          2 holds  (15 min drive)\n',
    '',
    0,
  ],
  [['run', 'Tue', 'C'], '', 'Week must be A or B, not C\n', 1],
  [['run', 'Tue', 'A', '--format', 'pdf'], '', 'No format pdf\n', 1],
  [['run', 'Tue', 'A', '--format', '../library'], '', 'No format ../library\n', 1],
  [['run'], '', 'The van does not run on undefined\n', 1],
  [
    ['stop', 'ST01', '2026-10-19'],
    'ST01  Manea, Village hall\n  Mon every week, 09:30-10:10\n  Next visit Mon 2026-10-19 at 09:30\n  Nothing waiting\n',
    '',
    0,
  ],
  [
    ['stop', 'ST01', '2026-10-21'],
    'ST01  Manea, Village hall\n  Mon every week, 09:30-10:10\n  Next visit Mon 2026-10-26 at 09:30\n  Nothing waiting\n',
    '',
    0,
  ],
  [
    ['stop', 'ST01', '2026-10-25'],
    'ST01  Manea, Village hall\n  Mon every week, 09:30-10:10\n  Next visit Mon 2026-10-26 at 09:30\n  Nothing waiting\n',
    '',
    0,
  ],
  [
    ['stop', 'ST01', '2026-12-24'],
    'ST01  Manea, Village hall\n  Mon every week, 09:30-10:10\n  Next visit Mon 2026-12-28 at 09:30\n  Nothing waiting\n',
    '',
    0,
  ],
  [
    ['stop', 'ST01', '2026-12-31'],
    'ST01  Manea, Village hall\n  Mon every week, 09:30-10:10\n  Next visit Mon 2027-01-04 at 09:30\n  Nothing waiting\n',
    '',
    0,
  ],
  [
    ['stop', 'ST01', '2027-01-04'],
    'ST01  Manea, Village hall\n  Mon every week, 09:30-10:10\n  Next visit Mon 2027-01-04 at 09:30\n  Nothing waiting\n',
    '',
    0,
  ],
  [
    ['stop', 'ST01', '2026-02-28'],
    'ST01  Manea, Village hall\n  Mon every week, 09:30-10:10\n  Next visit Mon 2026-03-02 at 09:30\n  Nothing waiting\n',
    '',
    0,
  ],
  [
    ['stop', 'ST02', '2026-10-19'],
    'ST02  Coates, The Green\n  Mon week A, 10:35-11:00\n  Next visit Mon 2026-10-26 at 10:35\n  2 waiting: Wolf Hall; Bring Up the Bodies\n',
    '',
    0,
  ],
  [
    ['stop', 'ST02', '2026-10-21'],
    'ST02  Coates, The Green\n  Mon week A, 10:35-11:00\n  Next visit Mon 2026-10-26 at 10:35\n  2 waiting: Wolf Hall; Bring Up the Bodies\n',
    '',
    0,
  ],
  [
    ['stop', 'ST02', '2026-10-25'],
    'ST02  Coates, The Green\n  Mon week A, 10:35-11:00\n  Next visit Mon 2026-10-26 at 10:35\n  2 waiting: Wolf Hall; Bring Up the Bodies\n',
    '',
    0,
  ],
  [['stop', 'ST02', '2026-12-24'], '', 'ST02 is never visited\n', 1],
  [
    ['stop', 'ST02', '2026-12-31'],
    'ST02  Coates, The Green\n  Mon week A, 10:35-11:00\n  Next visit Mon 2027-01-11 at 10:35\n  2 waiting: Wolf Hall; Bring Up the Bodies\n',
    '',
    0,
  ],
  [
    ['stop', 'ST02', '2027-01-04'],
    'ST02  Coates, The Green\n  Mon week A, 10:35-11:00\n  Next visit Mon 2027-01-11 at 10:35\n  2 waiting: Wolf Hall; Bring Up the Bodies\n',
    '',
    0,
  ],
  [
    ['stop', 'ST02', '2026-02-28'],
    'ST02  Coates, The Green\n  Mon week A, 10:35-11:00\n  Next visit Mon 2026-03-02 at 10:35\n  2 waiting: Wolf Hall; Bring Up the Bodies\n',
    '',
    0,
  ],
  [
    ['stop', 'ST03', '2026-10-19'],
    'ST03  Eastrea, Primary school\n  Mon week B, 10:35-11:20\n  Next visit Mon 2026-10-19 at 10:35\n  1 waiting: Gardening for Wildlife\n',
    '',
    0,
  ],
  [
    ['stop', 'ST03', '2026-10-21'],
    'ST03  Eastrea, Primary school\n  Mon week B, 10:35-11:20\n  Next visit Mon 2026-11-02 at 10:35\n  1 waiting: Gardening for Wildlife\n',
    '',
    0,
  ],
  [
    ['stop', 'ST03', '2026-10-25'],
    'ST03  Eastrea, Primary school\n  Mon week B, 10:35-11:20\n  Next visit Mon 2026-11-02 at 10:35\n  1 waiting: Gardening for Wildlife\n',
    '',
    0,
  ],
  [
    ['stop', 'ST03', '2026-12-24'],
    'ST03  Eastrea, Primary school\n  Mon week B, 10:35-11:20\n  Next visit Mon 2026-12-28 at 10:35\n  1 waiting: Gardening for Wildlife\n',
    '',
    0,
  ],
  [
    ['stop', 'ST03', '2026-12-31'],
    'ST03  Eastrea, Primary school\n  Mon week B, 10:35-11:20\n  Next visit Mon 2027-01-04 at 10:35\n  1 waiting: Gardening for Wildlife\n',
    '',
    0,
  ],
  [
    ['stop', 'ST03', '2027-01-04'],
    'ST03  Eastrea, Primary school\n  Mon week B, 10:35-11:20\n  Next visit Mon 2027-01-04 at 10:35\n  1 waiting: Gardening for Wildlife\n',
    '',
    0,
  ],
  [
    ['stop', 'ST03', '2026-02-28'],
    'ST03  Eastrea, Primary school\n  Mon week B, 10:35-11:20\n  Next visit Mon 2026-03-09 at 10:35\n  1 waiting: Gardening for Wildlife\n',
    '',
    0,
  ],
  [
    ['stop', 'ST04', '2026-10-19'],
    'ST04  Benwick, Church car park\n  Mon every week, 13:15-13:45\n  Next visit Mon 2026-10-19 at 13:15\n  Nothing waiting\n',
    '',
    0,
  ],
  [
    ['stop', 'ST04', '2026-10-21'],
    'ST04  Benwick, Church car park\n  Mon every week, 13:15-13:45\n  Next visit Mon 2026-10-26 at 13:15\n  Nothing waiting\n',
    '',
    0,
  ],
  [
    ['stop', 'ST04', '2026-10-25'],
    'ST04  Benwick, Church car park\n  Mon every week, 13:15-13:45\n  Next visit Mon 2026-10-26 at 13:15\n  Nothing waiting\n',
    '',
    0,
  ],
  [
    ['stop', 'ST04', '2026-12-24'],
    'ST04  Benwick, Church car park\n  Mon every week, 13:15-13:45\n  Next visit Mon 2026-12-28 at 13:15\n  Nothing waiting\n',
    '',
    0,
  ],
  [
    ['stop', 'ST04', '2026-12-31'],
    'ST04  Benwick, Church car park\n  Mon every week, 13:15-13:45\n  Next visit Mon 2027-01-04 at 13:15\n  Nothing waiting\n',
    '',
    0,
  ],
  [
    ['stop', 'ST04', '2027-01-04'],
    'ST04  Benwick, Church car park\n  Mon every week, 13:15-13:45\n  Next visit Mon 2027-01-04 at 13:15\n  Nothing waiting\n',
    '',
    0,
  ],
  [
    ['stop', 'ST04', '2026-02-28'],
    'ST04  Benwick, Church car park\n  Mon every week, 13:15-13:45\n  Next visit Mon 2026-03-02 at 13:15\n  Nothing waiting\n',
    '',
    0,
  ],
  [
    ['stop', 'ST05', '2026-10-19'],
    'ST05  Doddington, Post office\n  Tue every week, 09:15-10:05\n  Next visit Tue 2026-10-20 at 09:15\n  Nothing waiting\n',
    '',
    0,
  ],
  [
    ['stop', 'ST05', '2026-10-21'],
    'ST05  Doddington, Post office\n  Tue every week, 09:15-10:05\n  Next visit Tue 2026-10-27 at 09:15\n  Nothing waiting\n',
    '',
    0,
  ],
  [
    ['stop', 'ST05', '2026-10-25'],
    'ST05  Doddington, Post office\n  Tue every week, 09:15-10:05\n  Next visit Tue 2026-10-27 at 09:15\n  Nothing waiting\n',
    '',
    0,
  ],
  [
    ['stop', 'ST05', '2026-12-24'],
    'ST05  Doddington, Post office\n  Tue every week, 09:15-10:05\n  Next visit Tue 2026-12-29 at 09:15\n  Nothing waiting\n',
    '',
    0,
  ],
  [
    ['stop', 'ST05', '2026-12-31'],
    'ST05  Doddington, Post office\n  Tue every week, 09:15-10:05\n  Next visit Tue 2027-01-05 at 09:15\n  Nothing waiting\n',
    '',
    0,
  ],
  [
    ['stop', 'ST05', '2027-01-04'],
    'ST05  Doddington, Post office\n  Tue every week, 09:15-10:05\n  Next visit Tue 2027-01-05 at 09:15\n  Nothing waiting\n',
    '',
    0,
  ],
  [
    ['stop', 'ST05', '2026-02-28'],
    'ST05  Doddington, Post office\n  Tue every week, 09:15-10:05\n  Next visit Tue 2026-03-03 at 09:15\n  Nothing waiting\n',
    '',
    0,
  ],
  [
    ['stop', 'ST06', '2026-10-19'],
    'ST06  Wimblington, Rose Court\n  Tue week A, 10:30-10:50\n  Next visit Tue 2026-10-27 at 10:30\n  Nothing waiting\n',
    '',
    0,
  ],
  [
    ['stop', 'ST06', '2026-10-21'],
    'ST06  Wimblington, Rose Court\n  Tue week A, 10:30-10:50\n  Next visit Tue 2026-10-27 at 10:30\n  Nothing waiting\n',
    '',
    0,
  ],
  [
    ['stop', 'ST06', '2026-10-25'],
    'ST06  Wimblington, Rose Court\n  Tue week A, 10:30-10:50\n  Next visit Tue 2026-10-27 at 10:30\n  Nothing waiting\n',
    '',
    0,
  ],
  [['stop', 'ST06', '2026-12-24'], '', 'ST06 is never visited\n', 1],
  [
    ['stop', 'ST06', '2026-12-31'],
    'ST06  Wimblington, Rose Court\n  Tue week A, 10:30-10:50\n  Next visit Tue 2027-01-12 at 10:30\n  Nothing waiting\n',
    '',
    0,
  ],
  [
    ['stop', 'ST06', '2027-01-04'],
    'ST06  Wimblington, Rose Court\n  Tue week A, 10:30-10:50\n  Next visit Tue 2027-01-12 at 10:30\n  Nothing waiting\n',
    '',
    0,
  ],
  [
    ['stop', 'ST06', '2026-02-28'],
    'ST06  Wimblington, Rose Court\n  Tue week A, 10:30-10:50\n  Next visit Tue 2026-03-03 at 10:30\n  Nothing waiting\n',
    '',
    0,
  ],
  [
    ['stop', 'ST07', '2026-10-19'],
    "ST07  Wimblington, Playing field\n  Tue every week, 11:05-11:40\n  Next visit Tue 2026-10-20 at 11:05\n  2 waiting: The Fens: Discovering England's Ancient Depths; Waterland\n",
    '',
    0,
  ],
  [
    ['stop', 'ST07', '2026-10-21'],
    "ST07  Wimblington, Playing field\n  Tue every week, 11:05-11:40\n  Next visit Tue 2026-10-27 at 11:05\n  2 waiting: The Fens: Discovering England's Ancient Depths; Waterland\n",
    '',
    0,
  ],
  [
    ['stop', 'ST07', '2026-10-25'],
    "ST07  Wimblington, Playing field\n  Tue every week, 11:05-11:40\n  Next visit Tue 2026-10-27 at 11:05\n  2 waiting: The Fens: Discovering England's Ancient Depths; Waterland\n",
    '',
    0,
  ],
  [
    ['stop', 'ST07', '2026-12-24'],
    "ST07  Wimblington, Playing field\n  Tue every week, 11:05-11:40\n  Next visit Tue 2026-12-29 at 11:05\n  2 waiting: The Fens: Discovering England's Ancient Depths; Waterland\n",
    '',
    0,
  ],
  [
    ['stop', 'ST07', '2026-12-31'],
    "ST07  Wimblington, Playing field\n  Tue every week, 11:05-11:40\n  Next visit Tue 2027-01-05 at 11:05\n  2 waiting: The Fens: Discovering England's Ancient Depths; Waterland\n",
    '',
    0,
  ],
  [
    ['stop', 'ST07', '2027-01-04'],
    "ST07  Wimblington, Playing field\n  Tue every week, 11:05-11:40\n  Next visit Tue 2027-01-05 at 11:05\n  2 waiting: The Fens: Discovering England's Ancient Depths; Waterland\n",
    '',
    0,
  ],
  [
    ['stop', 'ST07', '2026-02-28'],
    "ST07  Wimblington, Playing field\n  Tue every week, 11:05-11:40\n  Next visit Tue 2026-03-03 at 11:05\n  2 waiting: The Fens: Discovering England's Ancient Depths; Waterland\n",
    '',
    0,
  ],
  [
    ['stop', 'ST08', '2026-10-19'],
    'ST08  Christchurch, Fen Lane\n  Tue week B, 13:40-14:05\n  Next visit Tue 2026-10-20 at 13:40\n  1 waiting: Birds of Britain\n',
    '',
    0,
  ],
  [
    ['stop', 'ST08', '2026-10-21'],
    'ST08  Christchurch, Fen Lane\n  Tue week B, 13:40-14:05\n  Next visit Tue 2026-11-03 at 13:40\n  1 waiting: Birds of Britain\n',
    '',
    0,
  ],
  [
    ['stop', 'ST08', '2026-10-25'],
    'ST08  Christchurch, Fen Lane\n  Tue week B, 13:40-14:05\n  Next visit Tue 2026-11-03 at 13:40\n  1 waiting: Birds of Britain\n',
    '',
    0,
  ],
  [
    ['stop', 'ST08', '2026-12-24'],
    'ST08  Christchurch, Fen Lane\n  Tue week B, 13:40-14:05\n  Next visit Tue 2026-12-29 at 13:40\n  1 waiting: Birds of Britain\n',
    '',
    0,
  ],
  [
    ['stop', 'ST08', '2026-12-31'],
    'ST08  Christchurch, Fen Lane\n  Tue week B, 13:40-14:05\n  Next visit Tue 2027-01-05 at 13:40\n  1 waiting: Birds of Britain\n',
    '',
    0,
  ],
  [
    ['stop', 'ST08', '2027-01-04'],
    'ST08  Christchurch, Fen Lane\n  Tue week B, 13:40-14:05\n  Next visit Tue 2027-01-05 at 13:40\n  1 waiting: Birds of Britain\n',
    '',
    0,
  ],
  [
    ['stop', 'ST08', '2026-02-28'],
    'ST08  Christchurch, Fen Lane\n  Tue week B, 13:40-14:05\n  Next visit Tue 2026-03-10 at 13:40\n  1 waiting: Birds of Britain\n',
    '',
    0,
  ],
  [
    ['stop', 'ST09', '2026-10-19'],
    'ST09  Tydd St Giles, Social club\n  Thu week A, 09:45-10:15\n  Next visit Thu 2026-10-29 at 09:45\n  Nothing waiting\n',
    '',
    0,
  ],
  [
    ['stop', 'ST09', '2026-10-21'],
    'ST09  Tydd St Giles, Social club\n  Thu week A, 09:45-10:15\n  Next visit Thu 2026-10-29 at 09:45\n  Nothing waiting\n',
    '',
    0,
  ],
  [
    ['stop', 'ST09', '2026-10-25'],
    'ST09  Tydd St Giles, Social club\n  Thu week A, 09:45-10:15\n  Next visit Thu 2026-10-29 at 09:45\n  Nothing waiting\n',
    '',
    0,
  ],
  [
    ['stop', 'ST09', '2026-12-24'],
    'ST09  Tydd St Giles, Social club\n  Thu week A, 09:45-10:15\n  Next visit Thu 2026-12-24 at 09:45\n  Nothing waiting\n',
    '',
    0,
  ],
  [['stop', 'ST09', '2026-12-31'], '', 'ST09 is never visited\n', 1],
  [
    ['stop', 'ST09', '2027-01-04'],
    'ST09  Tydd St Giles, Social club\n  Thu week A, 09:45-10:15\n  Next visit Thu 2027-01-14 at 09:45\n  Nothing waiting\n',
    '',
    0,
  ],
  [
    ['stop', 'ST09', '2026-02-28'],
    'ST09  Tydd St Giles, Social club\n  Thu week A, 09:45-10:15\n  Next visit Thu 2026-03-05 at 09:45\n  Nothing waiting\n',
    '',
    0,
  ],
  [
    ['stop', 'ST10', '2026-10-19'],
    'ST10  Leverington, Almshouses\n  Thu every week, 10:40-11:20\n  Next visit Thu 2026-10-22 at 10:40\n  1 waiting: Large print: The Thursday Murder Club\n',
    '',
    0,
  ],
  [
    ['stop', 'ST10', '2026-10-21'],
    'ST10  Leverington, Almshouses\n  Thu every week, 10:40-11:20\n  Next visit Thu 2026-10-22 at 10:40\n  1 waiting: Large print: The Thursday Murder Club\n',
    '',
    0,
  ],
  [
    ['stop', 'ST10', '2026-10-25'],
    'ST10  Leverington, Almshouses\n  Thu every week, 10:40-11:20\n  Next visit Thu 2026-10-29 at 10:40\n  1 waiting: Large print: The Thursday Murder Club\n',
    '',
    0,
  ],
  [
    ['stop', 'ST10', '2026-12-24'],
    'ST10  Leverington, Almshouses\n  Thu every week, 10:40-11:20\n  Next visit Thu 2026-12-24 at 10:40\n  1 waiting: Large print: The Thursday Murder Club\n',
    '',
    0,
  ],
  [
    ['stop', 'ST10', '2026-12-31'],
    'ST10  Leverington, Almshouses\n  Thu every week, 10:40-11:20\n  Next visit Thu 2026-12-31 at 10:40\n  1 waiting: Large print: The Thursday Murder Club\n',
    '',
    0,
  ],
  [
    ['stop', 'ST10', '2027-01-04'],
    'ST10  Leverington, Almshouses\n  Thu every week, 10:40-11:20\n  Next visit Thu 2027-01-07 at 10:40\n  1 waiting: Large print: The Thursday Murder Club\n',
    '',
    0,
  ],
  [
    ['stop', 'ST10', '2026-02-28'],
    'ST10  Leverington, Almshouses\n  Thu every week, 10:40-11:20\n  Next visit Thu 2026-03-05 at 10:40\n  1 waiting: Large print: The Thursday Murder Club\n',
    '',
    0,
  ],
  [
    ['stop', 'ST11', '2026-10-19'],
    'ST11  Gorefield, Garage forecourt\n  Thu week B, 09:45-10:15\n  Next visit Thu 2026-10-22 at 09:45\n  1 waiting: A Year in the Fens\n',
    '',
    0,
  ],
  [
    ['stop', 'ST11', '2026-10-21'],
    'ST11  Gorefield, Garage forecourt\n  Thu week B, 09:45-10:15\n  Next visit Thu 2026-10-22 at 09:45\n  1 waiting: A Year in the Fens\n',
    '',
    0,
  ],
  [
    ['stop', 'ST11', '2026-10-25'],
    'ST11  Gorefield, Garage forecourt\n  Thu week B, 09:45-10:15\n  Next visit Thu 2026-11-05 at 09:45\n  1 waiting: A Year in the Fens\n',
    '',
    0,
  ],
  [
    ['stop', 'ST11', '2026-12-24'],
    'ST11  Gorefield, Garage forecourt\n  Thu week B, 09:45-10:15\n  Next visit Thu 2026-12-31 at 09:45\n  1 waiting: A Year in the Fens\n',
    '',
    0,
  ],
  [
    ['stop', 'ST11', '2026-12-31'],
    'ST11  Gorefield, Garage forecourt\n  Thu week B, 09:45-10:15\n  Next visit Thu 2026-12-31 at 09:45\n  1 waiting: A Year in the Fens\n',
    '',
    0,
  ],
  [
    ['stop', 'ST11', '2027-01-04'],
    'ST11  Gorefield, Garage forecourt\n  Thu week B, 09:45-10:15\n  Next visit Thu 2027-01-07 at 09:45\n  1 waiting: A Year in the Fens\n',
    '',
    0,
  ],
  [
    ['stop', 'ST11', '2026-02-28'],
    'ST11  Gorefield, Garage forecourt\n  Thu week B, 09:45-10:15\n  Next visit Thu 2026-03-12 at 09:45\n  1 waiting: A Year in the Fens\n',
    '',
    0,
  ],
  [
    ['stop', 'ST12', '2026-10-19'],
    'ST12  Elm, Sheltered housing\n  Fri every week, 14:00-15:00\n  Next visit Fri 2026-10-23 at 14:00\n  1 waiting: The Gruffalo\n',
    '',
    0,
  ],
  [
    ['stop', 'ST12', '2026-10-21'],
    'ST12  Elm, Sheltered housing\n  Fri every week, 14:00-15:00\n  Next visit Fri 2026-10-23 at 14:00\n  1 waiting: The Gruffalo\n',
    '',
    0,
  ],
  [
    ['stop', 'ST12', '2026-10-25'],
    'ST12  Elm, Sheltered housing\n  Fri every week, 14:00-15:00\n  Next visit Fri 2026-10-30 at 14:00\n  1 waiting: The Gruffalo\n',
    '',
    0,
  ],
  [
    ['stop', 'ST12', '2026-12-24'],
    'ST12  Elm, Sheltered housing\n  Fri every week, 14:00-15:00\n  Next visit Fri 2026-12-25 at 14:00\n  1 waiting: The Gruffalo\n',
    '',
    0,
  ],
  [
    ['stop', 'ST12', '2026-12-31'],
    'ST12  Elm, Sheltered housing\n  Fri every week, 14:00-15:00\n  Next visit Fri 2027-01-01 at 14:00\n  1 waiting: The Gruffalo\n',
    '',
    0,
  ],
  [
    ['stop', 'ST12', '2027-01-04'],
    'ST12  Elm, Sheltered housing\n  Fri every week, 14:00-15:00\n  Next visit Fri 2027-01-08 at 14:00\n  1 waiting: The Gruffalo\n',
    '',
    0,
  ],
  [
    ['stop', 'ST12', '2026-02-28'],
    'ST12  Elm, Sheltered housing\n  Fri every week, 14:00-15:00\n  Next visit Fri 2026-03-06 at 14:00\n  1 waiting: The Gruffalo\n',
    '',
    0,
  ],
  [['stop', 'ST99', '2026-10-21'], '', 'No stop ST99\n', 1],
  [['stop', 'ST01', '21/10/2026'], '', 'Not a date: 21/10/2026\n', 1],
  [['stop', 'ST01'], '', 'Not a date: undefined\n', 1],
  [
    ['holds', '2026-10-19'],
    "Mon 2026-10-19 at 10:35  Eastrea, Primary school\n  H305  B0918  Gardening for Wildlife\nTue 2026-10-20 at 11:05  Wimblington, Playing field\n  H301  B1187  The Fens: Discovering England's Ancient Depths\n  H304  B1187  Waterland\nTue 2026-10-20 at 13:40  Christchurch, Fen Lane\n  H308  B2675  Birds of Britain\nThu 2026-10-22 at 09:45  Gorefield, Garage forecourt\n  H309  B1450  A Year in the Fens\nThu 2026-10-22 at 10:40  Leverington, Almshouses\n  H303  B2031  Large print: The Thursday Murder Club\nFri 2026-10-23 at 14:00  Elm, Sheltered housing\n  H306  B3310  The Gruffalo\nMon 2026-10-26 at 10:35  Coates, The Green\n  H302  B0442  Wolf Hall\n  H307  B0442  Bring Up the Bodies\n",
    '',
    0,
  ],
  [
    ['week', '2026-10-19'],
    'Week B\nMon   3 stops  09:30-13:45\nTue   3 stops  09:15-14:05\nWed  no run\nThu   2 stops  09:45-11:20\nFri   1 stops  14:00-15:00\n',
    '',
    0,
  ],
  [
    ['holds', '2026-10-21'],
    "Thu 2026-10-22 at 09:45  Gorefield, Garage forecourt\n  H309  B1450  A Year in the Fens\nThu 2026-10-22 at 10:40  Leverington, Almshouses\n  H303  B2031  Large print: The Thursday Murder Club\nFri 2026-10-23 at 14:00  Elm, Sheltered housing\n  H306  B3310  The Gruffalo\nMon 2026-10-26 at 10:35  Coates, The Green\n  H302  B0442  Wolf Hall\n  H307  B0442  Bring Up the Bodies\nTue 2026-10-27 at 11:05  Wimblington, Playing field\n  H301  B1187  The Fens: Discovering England's Ancient Depths\n  H304  B1187  Waterland\nMon 2026-11-02 at 10:35  Eastrea, Primary school\n  H305  B0918  Gardening for Wildlife\nTue 2026-11-03 at 13:40  Christchurch, Fen Lane\n  H308  B2675  Birds of Britain\n",
    '',
    0,
  ],
  [
    ['week', '2026-10-21'],
    'Week B\nMon   3 stops  09:30-13:45\nTue   3 stops  09:15-14:05\nWed  no run\nThu   2 stops  09:45-11:20\nFri   1 stops  14:00-15:00\n',
    '',
    0,
  ],
  [
    ['holds', '2026-10-25'],
    "Mon 2026-10-26 at 10:35  Coates, The Green\n  H302  B0442  Wolf Hall\n  H307  B0442  Bring Up the Bodies\nTue 2026-10-27 at 11:05  Wimblington, Playing field\n  H301  B1187  The Fens: Discovering England's Ancient Depths\n  H304  B1187  Waterland\nThu 2026-10-29 at 10:40  Leverington, Almshouses\n  H303  B2031  Large print: The Thursday Murder Club\nFri 2026-10-30 at 14:00  Elm, Sheltered housing\n  H306  B3310  The Gruffalo\nMon 2026-11-02 at 10:35  Eastrea, Primary school\n  H305  B0918  Gardening for Wildlife\nTue 2026-11-03 at 13:40  Christchurch, Fen Lane\n  H308  B2675  Birds of Britain\nThu 2026-11-05 at 09:45  Gorefield, Garage forecourt\n  H309  B1450  A Year in the Fens\n",
    '',
    0,
  ],
  [
    ['week', '2026-10-25'],
    'Week B\nMon   3 stops  09:30-13:45\nTue   3 stops  09:15-14:05\nWed  no run\nThu   2 stops  09:45-11:20\nFri   1 stops  14:00-15:00\n',
    '',
    0,
  ],
  [['holds', '2026-12-24'], '', 'ST02 is never visited\n', 1],
  [
    ['week', '2026-12-24'],
    'Week A\nMon   3 stops  09:30-13:45\nTue   3 stops  09:15-11:40\nWed  no run\nThu   2 stops  09:45-11:20\nFri   1 stops  14:00-15:00\n',
    '',
    0,
  ],
  [
    ['holds', '2026-12-31'],
    "Thu 2026-12-31 at 09:45  Gorefield, Garage forecourt\n  H309  B1450  A Year in the Fens\nThu 2026-12-31 at 10:40  Leverington, Almshouses\n  H303  B2031  Large print: The Thursday Murder Club\nFri 2027-01-01 at 14:00  Elm, Sheltered housing\n  H306  B3310  The Gruffalo\nMon 2027-01-04 at 10:35  Eastrea, Primary school\n  H305  B0918  Gardening for Wildlife\nTue 2027-01-05 at 11:05  Wimblington, Playing field\n  H301  B1187  The Fens: Discovering England's Ancient Depths\n  H304  B1187  Waterland\nTue 2027-01-05 at 13:40  Christchurch, Fen Lane\n  H308  B2675  Birds of Britain\nMon 2027-01-11 at 10:35  Coates, The Green\n  H302  B0442  Wolf Hall\n  H307  B0442  Bring Up the Bodies\n",
    '',
    0,
  ],
  [
    ['week', '2026-12-31'],
    'Week B\nMon   3 stops  09:30-13:45\nTue   3 stops  09:15-14:05\nWed  no run\nThu   2 stops  09:45-11:20\nFri   1 stops  14:00-15:00\n',
    '',
    0,
  ],
  [
    ['holds', '2027-01-04'],
    "Mon 2027-01-04 at 10:35  Eastrea, Primary school\n  H305  B0918  Gardening for Wildlife\nTue 2027-01-05 at 11:05  Wimblington, Playing field\n  H301  B1187  The Fens: Discovering England's Ancient Depths\n  H304  B1187  Waterland\nTue 2027-01-05 at 13:40  Christchurch, Fen Lane\n  H308  B2675  Birds of Britain\nThu 2027-01-07 at 09:45  Gorefield, Garage forecourt\n  H309  B1450  A Year in the Fens\nThu 2027-01-07 at 10:40  Leverington, Almshouses\n  H303  B2031  Large print: The Thursday Murder Club\nFri 2027-01-08 at 14:00  Elm, Sheltered housing\n  H306  B3310  The Gruffalo\nMon 2027-01-11 at 10:35  Coates, The Green\n  H302  B0442  Wolf Hall\n  H307  B0442  Bring Up the Bodies\n",
    '',
    0,
  ],
  [
    ['week', '2027-01-04'],
    'Week B\nMon   3 stops  09:30-13:45\nTue   3 stops  09:15-14:05\nWed  no run\nThu   2 stops  09:45-11:20\nFri   1 stops  14:00-15:00\n',
    '',
    0,
  ],
  [
    ['holds', '2026-02-28'],
    "Mon 2026-03-02 at 10:35  Coates, The Green\n  H302  B0442  Wolf Hall\n  H307  B0442  Bring Up the Bodies\nTue 2026-03-03 at 11:05  Wimblington, Playing field\n  H301  B1187  The Fens: Discovering England's Ancient Depths\n  H304  B1187  Waterland\nThu 2026-03-05 at 10:40  Leverington, Almshouses\n  H303  B2031  Large print: The Thursday Murder Club\nFri 2026-03-06 at 14:00  Elm, Sheltered housing\n  H306  B3310  The Gruffalo\nMon 2026-03-09 at 10:35  Eastrea, Primary school\n  H305  B0918  Gardening for Wildlife\nTue 2026-03-10 at 13:40  Christchurch, Fen Lane\n  H308  B2675  Birds of Britain\nThu 2026-03-12 at 09:45  Gorefield, Garage forecourt\n  H309  B1450  A Year in the Fens\n",
    '',
    0,
  ],
  [
    ['week', '2026-02-28'],
    'Week B\nMon   3 stops  09:30-13:45\nTue   3 stops  09:15-14:05\nWed  no run\nThu   2 stops  09:45-11:20\nFri   1 stops  14:00-15:00\n',
    '',
    0,
  ],
  [['holds'], '', 'Not a date: undefined\n', 1],
  [['week', 'soon'], '', 'Not a date: soon\n', 1],
]

for (const [args, stdout, stderr, status] of VAN) {
  const run = spawnSync(process.execPath, ['bin/van.mjs', ...args], { cwd: dir, encoding: 'utf8' })
  assert.deepEqual(
    [run.stdout, run.stderr, run.status],
    [stdout, stderr, status],
    `npm run van -- ${args.join(' ')}`,
  )
}

assert.ok(
  !existsSync(join(dir, 'src/library.mjs')),
  'src/library.mjs is gone, not left as a re-export',
)
const files = []
const walk = (path) => {
  for (const name of readdirSync(path)) {
    if (name === 'node_modules' || name.startsWith('.')) continue
    const full = join(path, name)
    if (statSync(full).isDirectory()) walk(full)
    else if (/\.(m?js|cjs)$/.test(name)) files.push(full)
  }
}
walk(dir)
for (const file of files)
  assert.doesNotMatch(
    readFileSync(file, 'utf8'),
    /library\.mjs/,
    `${relative(dir, file)} no longer refers to library.mjs`,
  )

const sources = files.filter((file) => relative(dir, file).startsWith('src'))
const owners = new Set()
for (const name of [
  'minutesToClock',
  'weekOf',
  'stopById',
  'nextVisit',
  'runSheet',
  'printRun',
  'weekCommand',
]) {
  const homes = sources.filter((file) =>
    new RegExp(`(function\\s+${name}\\b|(const|let)\\s+${name}\\s*=)`).test(
      readFileSync(file, 'utf8'),
    ),
  )
  assert.equal(homes.length, 1, `${name} is defined in exactly one module`)
  owners.add(homes[0])
}
assert.ok(owners.size >= 3, 'the code is split across at least three modules')
for (const file of sources)
  assert.ok(
    readFileSync(file, 'utf8').split('\n').length <= 110,
    `${relative(dir, file)} is a module of a sensible size, not the old one renamed`,
  )

// Every module must load as the first thing a process imports: a cycle that reads a binding
// before the other side has run fails only for some entry points.
for (const file of sources) {
  const run = spawnSync(
    process.execPath,
    ['--input-type=module', '-e', `await import(${JSON.stringify(pathToFileURL(file).href)})`],
    {
      cwd: dir,
      encoding: 'utf8',
    },
  )
  assert.equal(
    run.status,
    0,
    `${relative(dir, file)} loads as an entry point: ${run.stderr.split('\n').find((line) => /Error/.test(line)) ?? ''}`,
  )
}
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
