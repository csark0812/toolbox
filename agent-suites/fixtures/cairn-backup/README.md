# Cairn

Notes for the product page. We are three people in Leeds; this page is what people land on from our talk at a sysadmin meetup and from the Homebrew listing.

## What it is

Cairn is a command-line backup tool for small offices. It runs on each machine, deduplicates and encrypts everything before it leaves (encryption uses age, keys never leave your machines), and sends it to storage you already own.

- Destinations: any S3-compatible bucket, an SFTP server, or a plain USB drive.
- Restores by time, in plain words: `cairn restore ~/Documents --at "yesterday 17:00"`
- Checks itself: `cairn verify` re-reads a sample of every backup each night and emails you if anything does not match.
- Current version: 3.2 (released 6 October 2026).

## Install

```sh
brew install cairn
```

or

```sh
curl -fsSL https://get.cairn.example/install.sh | sh
```

Runs on macOS 13 or newer, Linux (x86-64 and arm64) and Windows 11.

## Pricing

| Plan         | Price                  | For                                    |
| ------------ | ---------------------- | -------------------------------------- |
| Personal     | Free                   | One machine, non-commercial use        |
| Office       | £48 per machine a year | Email alerts, shared key management    |
| Site licence | £390 a year            | Up to 25 machines, priority email help |

All plans have every feature for restore and verify. 30-day refund, no questions.

## Constraints

- We have **no logo, no screenshots and no photos**, and we do not want stock images or fake screenshots. Terminal output is fine if it is real (the commands above are real).
- The install command has to be easy to find and copy.
