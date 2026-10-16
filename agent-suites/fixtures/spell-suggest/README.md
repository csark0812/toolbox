# Spell suggest

The "did you mean" helper behind the search box of our parish newsletter archive. The dictionary is every word in the archive with how often it appears.

`suggest(dictionary, word, options)` returns the dictionary words closest to `word`, matched without regard to case. Closeness is the edit distance (insertions, deletions and substitutions of one letter each). Only words within `maxDistance` edits (default 2) are suggested, at most `limit` of them (default 5): the closest first, then the more frequent, then alphabetical. A word that is in the dictionary is its own best suggestion.

`npm run suggest -- <word>` suggests from `data/words.json`. `npm run perf` times a batch of look-ups against a full-size dictionary. `npm test` runs the tests.
