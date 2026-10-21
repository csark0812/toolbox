# Parish council

Attendance records for Little Ashby Parish Council, kept by the clerk. `data/attendance.csv` has one row per councillor per meeting (date, body, councillor, status), where the body is the full council or one of its committees (Planning, Finance) and the status is `present`, `apologies` or `absent`.

## The six-month rule

Under section 85 of the Local Government Act 1972, a councillor who attends no meeting of the council, or of any of its committees, for six consecutive months stops being a member, unless the council approved the reason for the absence before the six months ran out. Sending apologies is not attending.

The six months run from the last meeting a councillor attended: someone who last attended on 14 April stops being a member on 14 October unless they attend a meeting before then. The clerk has no approved absences this year.

`npm run attendance` lists every councillor with the last meeting they attended and the date their six months run out. It marks them `LAPSED` when that date has passed (or is today) and `AT RISK` when it is within the next six weeks (42 days), so the clerk can warn them in time.

## Usage

```
npm run attendance -- 2026-10-21   # everyone's position on a date
npm test
```
