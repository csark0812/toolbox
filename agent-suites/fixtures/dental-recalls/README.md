# Elm Street Dental recalls

The recall list for Elm Street Dental, where Dr Okafor and Dr Shah see patients. `data/patients.json` holds each patient's dentist, the date of their last check-up, how many months until their next one, their mobile number (blank if we don't have one), whether they have agreed to reminder texts, and whether they have left the practice. `data/dentists.json` lists the dentists.

A patient is due back on the same day of the month, that many months after their last check-up. If that month is shorter, they are due on its last day: someone seen on 31 August on a three-month recall is due on 30 November.

## Usage

```
npm run recalls -- 2026-11   # everyone due a check-up in November 2026
npm test
```

The dentists' days are in `docs/rota.md`.
