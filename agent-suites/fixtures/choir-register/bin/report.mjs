#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { stdout } from 'node:process'
import { attendance, formatRow } from '../src/attendance.mjs'

const read = (name) => JSON.parse(readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8'))
for (const row of attendance(read('members.json'), read('rehearsals.json')))
  stdout.write(`${formatRow(row)}\n`)
