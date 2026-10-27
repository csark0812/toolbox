# Reading challenge

The leaderboard for the county libraries' summer reading challenge. Children log each book they finish at the desk; `data/logs.json` has one entry per log (the child's name as the librarian typed it, the book's ISBN and when it was logged) and `data/books.json` is the catalogue.

Rules for the board:

- Only logs from 18 July to 31 August, both days included, count.
- ISBNs are typed with or without hyphens and spaces; `978-0-14-031753-6` and `9780140317536` are the same book. A book counts once per child, the first time it is logged. A book that is not in the catalogue does not count.
- Names are trimmed, so `Amy Hart ` and `Amy Hart` are the same child.
- Children are ordered by books read, then by pages read, then by who reached their total first (the time of their last counted log), then by name in the library's usual alphabetical order. Children with no counted books are left off.
- Six books earn a bronze medal, twelve silver and twenty gold.

## Usage

```
npm run board    # the leaderboard
npm run perf     # times the board on the whole county's logs
npm test
```
