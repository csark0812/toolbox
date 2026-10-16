#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { stdout } from 'node:process'
import { programme } from '../src/casks.mjs'

const casks = JSON.parse(readFileSync(new URL('../data/casks.json', import.meta.url), 'utf8'))
stdout.write(programme(casks).join('\n') + '\n')
