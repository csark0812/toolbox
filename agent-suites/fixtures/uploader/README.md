# Uploader

Chunked, resumable uploads for the photo library. A file is cut into chunks, up to `concurrency` chunks are in flight at once, and a chunk that fails is retried up to `retries` more times. Once every chunk has been accepted, `complete()` asks the storage server to stitch the parts together in the order they are listed; the server rejects the upload if the stitched file's SHA-256 does not match.

`src/fake-server.mjs` is an in-memory storage server with configurable latency and failures, used by the tests and by `npm run demo`, which uploads `data/sample.txt` once over a clean connection and once over a flaky one.
