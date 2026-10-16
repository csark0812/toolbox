#!/usr/bin/env node
import { stdout } from 'node:process'
import { nominations } from '../src/members.mjs'

for (const n of nominations()) stdout.write(`${n.title} (nominated by ${n.by})\n`)
