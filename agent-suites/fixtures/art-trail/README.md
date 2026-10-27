# Art trail

The listings API for the Wyvern Valley Open Studios trail. Each September artists open their studios to visitors; the trail website and the printed map are built from this API. `data/artists.json` holds the artists and `data/photos.json` the listing photos, keyed by path.

Rules for every endpoint:

- Anyone can read the public trail (`GET /artists`). Only artists the committee has approved (`approved: true`) appear on it; an application still being vetted does not. A public listing shows name, studio, medium, bio and photos, never email or phone.
- An artist signs in (`artistId` in the session) to change their own listing, and only its `studio`, `medium` and `bio`. A request that needs a session and has none gets 401.
- An artist's photos live under `photos/<artistId>/` and belong to that artist: nobody else can add, replace or remove them.
- Each artist has at most six photos. A photo is a JPEG or PNG (`.jpg`, `.jpeg` or `.png`) of up to 2 MB, meaning 2,097,152 bytes, each.

`src/api.mjs` routes requests to the handlers; `request.body` is the request's JSON body as parsed by `JSON.parse`. `npm test` runs the handler tests.
