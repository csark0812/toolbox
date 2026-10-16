# Job queue

Runs maintenance jobs (thumbnail rebuilds, search reindexing, mail digests) with a timeout.

`npm run run-job -- <job> [--timeout <seconds>] [--dry-run]` runs one job from `src/jobs.mjs`. The default timeout is 30 seconds. `npm test` runs the tests.
