# Stage crew

Crew rota for the Lyceum and its two studio stages. `data/rota.json` holds every crew shift: who, which stage, and when it starts and ends (local `YYYY-MM-DDTHH:MM`). Names are typed by different stage managers, so `Kim Ade`, `kim ade ` and `KIM ADE` are the same person.

`npm run clashes` lists everyone booked on two shifts at once. Shifts that touch (one ends at 18:00, the next starts at 18:00) are fine. Each clash names the person (lower case, trimmed), then the shift that starts first (the lower id on a tie) and the other one. Clashes are listed by person, then by the first shift's start, then the second shift's start, then the ids.

## Usage

```
npm run clashes   # clashes in data/rota.json
npm run perf      # times clash finding on a full season's rota
npm test
```
