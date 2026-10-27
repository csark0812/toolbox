#!/bin/sh
# 6am cron on the tack-room Pi: what hay to put out today. Usage: sh ops/morning.sh 2026-10-22 [horses.json]
set -e
DAY="$1"
FILE="${2:-}"
echo "Hay for $DAY"
node --input-type=module -e "
import { feedPlan } from './src/feeds.mjs'
import { loadHorses } from './src/horses.mjs'
const plan = feedPlan(loadHorses('$FILE' || undefined))
for (const row of plan) console.log('  box ' + String(row.box).padStart(2) + '  ' + row.name.padEnd(10) + row.nets + ' net(s)  ' + row.hardFeed)
console.log('  total ' + plan.reduce((sum, row) => sum + row.hayKg, 0) + 'kg')
"
