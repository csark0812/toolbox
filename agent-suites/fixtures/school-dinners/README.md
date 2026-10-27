# School dinners

Dinner orders and dinner money for Hollins Lane Primary. `data/pupils.json` lists each pupil with their class, whether they have school dinners or a packed lunch, whether they get free school meals, and any allergies. `data/absences.json` is the register's absences: a single `date`, or `from` and `to` for an absence over several days (both days included). `data/days.json` lists this half term's school days.

School dinners cost £2.60 a day. Pupils on free school meals are not charged, and nobody pays for a day they were absent.

Orders for the next day close at 9:30.

## Usage

```
npm run kitchen -- 2026-10-14   # the kitchen's numbers for a day
npm run bill                    # dinner money for the half term
npm test
```
