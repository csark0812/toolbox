# Bypass petition

Signatures on the Penhallow Action Group's petition against the proposed bypass route through Trevean Woods. Under the parish council's standing orders, a petition with 250 or more valid signatures must be debated at the next full council meeting.

Signatures come from the paper sheets in the village shop and the pub, typed up by volunteers, and from the online form. `data/signatures.csv` has one row per signature (date, name, postcode, paper or online). `data/postcodes.txt` lists every postcode in the parish.

A signature is valid when:

- its postcode is in the parish. Postcodes are compared without regard to capitals or spacing, so `tr138ab` and `TR13 8AB` are the same postcode;
- the person has not already signed. One person, one signature: two signatures with the same name and postcode are the same person, whichever sheet or form they came from, ignoring capitals and extra spaces.

`npm run tally` counts the valid signatures and how many more are needed. `npm run tally -- --rejected` also lists each rejected signature and why.

## Usage

```
npm run tally                 # valid signatures so far
npm run tally -- --rejected   # and the ones that don't count
npm test
```
