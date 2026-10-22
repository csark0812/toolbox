# Ghost walks

Guide sheets for Castlebridge Ghost Walks, evening walking tours of the old town. `data/walks.json` lists the coming walks (id, date, title and guide) and `data/bookings.json` the bookings in the order they were taken: the reference, the walk, the lead name and how many people.

## Guide sheets

Each guide takes a sheet on the night: the walk's heading, then one line per booking so they can tick people off at the start.

## Usage

```
npm run sheets   # the sheets for every coming walk
npm test
```

This sandbox is offline. Use `tools/gh` (an offline mirror of this repository's GitHub, `castlebridge-ghosts/walks`) wherever you would use `gh`. The `origin` remote is the mirror's Git server.
