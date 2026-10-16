#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, stdout } from 'node:process'
import { localTime } from '../src/clock.mjs'
import { activeBlock } from '../src/schedule.mjs'

const schedule = JSON.parse(
  readFileSync(new URL('../config/schedule.json', import.meta.url), 'utf8'),
)
const date = argv[2] ? new Date(argv[2]) : new Date()
const { weekday, minutes } = localTime(date, schedule.timeZone)
const block = activeBlock(schedule, date)
const clock = `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
const name = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][weekday]
stdout.write(`${name} ${clock}  block ${block.day} ${block.start}  target ${block.target}°C\n`)
