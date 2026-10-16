# Account recovery

Sign-in for the Tidewater member portal. Route handlers take a plain request object (`{ body, headers }`) and return `{ status, body }`; `src/server.mjs` wires them to HTTP. Users live in `src/users.mjs` with scrypt password hashes, and outgoing mail goes through `src/mailer.mjs`. The portal is served only at `https://members.tidewater.example`.

`npm test` runs the tests.
