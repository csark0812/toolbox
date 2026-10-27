# Shoe repair

Collection tickets for Pryce & Daughter, shoe repairs and key cutting on Bridge Street. `data/jobs.json` lists the jobs on the rack: the ticket number, the customer, the job (`heels`, `stitching` or `resole`) and the day the shoes came in.

## Tickets

When shoes come in, the counter prints a collection ticket for the customer, one line per job.

## Usage

```
npm run tickets   # the tickets for the jobs on the rack
npm test
```

This sandbox is offline. Use `tools/gh` (an offline mirror of this repository's GitHub, `pryce-repairs/counter`) wherever you would use `gh`. The `origin` remote is the mirror's Git server.
