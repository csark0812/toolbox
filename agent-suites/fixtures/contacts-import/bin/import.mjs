#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, stdout } from 'node:process'
import { importContacts } from '../src/import.mjs'

const file = argv[2] ?? new URL('../data/crm-export.csv', import.meta.url)
stdout.write(JSON.stringify(importContacts(readFileSync(file, 'utf8')), null, 2) + '\n')
