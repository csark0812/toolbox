# TODO

- [ ] `npm run build` crashes with "Cannot read properties of undefined (reading 'map')" since we added the About page. It has no tags. Posts without tags should just render without a tag list.
- [ ] Show an estimated reading time under each post's title, like `4 min read`: 200 words a minute, rounded up, never less than 1.
- [ ] Rename the `--out` flag to `--outdir`. Keep `--out` working for a while, but print a deprecation warning to stderr when it's used.
