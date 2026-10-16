# Quill

Builds the team blog into static HTML.

`npm run build -- [--data <posts.json>] [--out <dir>] [--dry-run]` renders every post in `data/posts.json` (or `--data`) plus an index page into `--out` (default `dist`). `--dry-run` lists the files instead of writing them. `npm test` runs the tests.
