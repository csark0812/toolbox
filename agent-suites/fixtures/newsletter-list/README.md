# Newsletter list

The mailing list for the Stonebridge Village Society newsletter. `data/subscribers.json` is the combined export: sign-ups from the website plus the old branch spreadsheets, so the same person often appears several times, spelt differently.

`mergeSubscribers(rows)` in `src/merge.mjs` turns those rows into one entry per mailbox:

- Addresses are compared ignoring case and surrounding spaces. For Gmail (and googlemail.com, which is the same thing) dots and anything after a `+` in the part before the `@` are ignored too, because Gmail delivers those to the same inbox. Other providers treat them as different mailboxes, so we do too.
- The entry keeps the address as it was first written, the first name anyone gave, every tag (matched ignoring case, first spelling kept) and the earliest join date. Rows from the old spreadsheets often have no join date.
- If any row for a mailbox says unsubscribed, the entry is unsubscribed. That's a legal requirement, not a preference.
- Rows without a usable address are kept as separate entries marked invalid so the membership secretary can chase them; they are never merged with each other.
- Entries come out in the order their mailbox first appears.

`mailOut(list)` gives the entries that get the next issue.

## Usage

```
npm run merge   # the merged list from data/subscribers.json
npm run perf    # times the merge on the whole imported history
npm test
```
