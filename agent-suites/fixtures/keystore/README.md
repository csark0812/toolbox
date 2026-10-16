# Keystore

A tiny append-only key-value store used by the kiosk app for sessions and settings. Every write appends one JSON line to the data file (`{"op":"set","key":...,"value":...}` or `{"op":"del","key":...}`); reads replay the log. `compact` rewrites the file with one `set` line per live key, sorted by key.

```
npm run kv -- --file data/kiosk.log get <key>
npm run kv -- --file data/kiosk.log set <key> <json>
npm run kv -- --file data/kiosk.log del <key>
npm run kv -- --file data/kiosk.log keys
```

Hooks in `config/hooks.json` name store methods to run when the CLI starts and before it exits. `npm run migrate -- <v1.json> <file>` imports a v1 settings export. `npm test` runs the tests.
