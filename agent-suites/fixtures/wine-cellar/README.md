# Wine cellar

The cellar book for the Bristol wine society's members' cellar. `data/cellar.json` lists every bottle: its id, producer, wine, vintage, the society's tasting score and its drinking window (`opens` and `closes`, as `YYYY-MM-DD`). Producers are typed by different members, so `Ch. Musar`, `ch. musar ` and `CH. MUSAR` are the same producer.

`npm run next -- 2026-11-01` lists the bottles to drink next: those whose window is open on that day (from `opens` to `closes`, both inclusive), soonest to close first. Each shows its rank among the same producer's bottles of the same vintage, by score (the lower id first on a tie), counting every bottle of that vintage whether its window is open or not. Equal closing dates are listed by rank, then by id.

## Usage

```
npm run next -- 2026-11-01   # what to drink next
npm run perf                 # times the list on the society's whole cellar
npm test
```
