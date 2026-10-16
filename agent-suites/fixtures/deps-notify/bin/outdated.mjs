#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, stdout } from 'node:process'
import { outdated } from '../src/outdated.mjs'

const [manifestPath = 'data/manifest.json', registryPath = 'data/registry.json'] = argv.slice(2)
const read = (path) => JSON.parse(readFileSync(path, 'utf8'))
for (const row of outdated(read(manifestPath), read(registryPath)))
  stdout.write(
    `${row.name.padEnd(12)} ${row.range.padEnd(18)} latest ${String(row.latest).padEnd(11)} ${row.status}\n`,
  )
