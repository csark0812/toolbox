#!/bin/sh
# Fleece money per farm for one year. Usage: sh scripts/season-close.sh 2026 [visits.json]
set -e
YEAR="$1"
FILE="${2:-data/visits.json}"
node --input-type=module -e "
import { fleeceValue, loadVisits, pounds } from './src/shearing.mjs'
const totals = {}
for (const v of loadVisits('$FILE').filter((v) => v.date.startsWith('$YEAR')))
  for (const a of v.animals)
    if (a.micron !== null) totals[v.farm] = (totals[v.farm] ?? 0) + fleeceValue(a)
for (const [farm, pence] of Object.entries(totals).sort()) console.log(farm.padEnd(10) + pounds(pence))
"
echo "season $YEAR closed"
