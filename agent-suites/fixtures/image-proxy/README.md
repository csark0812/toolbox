# Image proxy

Serves product photos for the storefront through our own domain: `GET /img?url=<image url>`. Only images on our CDN hosts (`src/hosts.mjs`) are fetched, so the proxy cannot be used to reach anything else from inside our network. Handlers take `{ url }` and return `{ status, headers, body }`; fetching and resizing are injected (`fetchImage(url)` returns a Buffer, `resize(buffer, width)` returns a Buffer).

`npm test` runs the tests.
