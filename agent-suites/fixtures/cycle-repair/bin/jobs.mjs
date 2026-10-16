#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { stdout } from 'node:process'
import { COLUMNS, row } from '../src/jobs.mjs'

const jobs = JSON.parse(readFileSync(new URL('../data/jobs.json', import.meta.url), 'utf8'))
stdout.write(row(COLUMNS.map((column) => column.header)) + '\n')
for (const job of jobs) stdout.write(row(COLUMNS.map((column) => column.value(job))) + '\n')
