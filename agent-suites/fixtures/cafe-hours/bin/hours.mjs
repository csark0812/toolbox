#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { stdout } from 'node:process'
import { weekTable } from '../src/hours.mjs'

const hours = JSON.parse(readFileSync(new URL('../data/hours.json', import.meta.url), 'utf8'))
for (const line of weekTable(hours)) stdout.write(`${line}\n`)
