#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { stdout } from 'node:process'
import { progressLine } from '../src/progress.mjs'

const learners = JSON.parse(readFileSync(new URL('../data/learners.json', import.meta.url), 'utf8'))
for (const learner of learners) stdout.write(`${progressLine(learner)}\n`)
