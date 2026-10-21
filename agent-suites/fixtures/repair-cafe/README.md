# Repair café

The session log for the Canal Street Repair Café. `data/repairs.json` lists what came in on Saturday, table by table: the ticket number, the item, its category, and the outcome (`fixed`, `advice` or `unfixable`). Electrical items also record whether they run off the mains and whether they have had a PAT (portable appliance) test.

## Report

The end-of-session report counts the items seen and each outcome.

## Usage

```
npm run report   # the end-of-session report
npm test
```

This sandbox is offline. Use `tools/gh` (an offline mirror of this repository's GitHub, `canal-street/repair-log`) wherever you would use `gh`. The `origin` remote is the mirror's Git server.
