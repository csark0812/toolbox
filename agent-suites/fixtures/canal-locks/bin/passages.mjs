#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { stdout } from 'node:process'
import { passageLine } from '../src/passages.mjs'

const passages = JSON.parse(readFileSync(new URL('../data/passages.json', import.meta.url), 'utf8'))
for (const passage of passages) stdout.write(`${passageLine(passage)}\n`)
