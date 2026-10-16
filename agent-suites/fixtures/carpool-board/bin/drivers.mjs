#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { stdout } from 'node:process'

const drivers = JSON.parse(readFileSync(new URL('../data/drivers.json', import.meta.url), 'utf8'))
for (const driver of drivers)
  stdout.write(`${driver.id}  ${driver.name.split(' ')[0].padEnd(8)} ${driver.days.join(', ')}\n`)
