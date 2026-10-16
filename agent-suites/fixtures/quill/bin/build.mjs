#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, stdout } from 'node:process'
import { buildSite, writeSite } from '../src/build.mjs'

const args = argv.slice(2)
const option = (name, fallback) => {
  const index = args.indexOf(name)
  return index === -1 ? fallback : args[index + 1]
}
const dataPath = option('--data', new URL('../data/posts.json', import.meta.url))
const outDir = option('--out', 'dist')
const files = buildSite(JSON.parse(readFileSync(dataPath, 'utf8')))
if (args.includes('--dry-run')) for (const [path] of files) stdout.write(`${path}\n`)
else {
  writeSite(files, outDir)
  stdout.write(`wrote ${files.length} files to ${outDir}\n`)
}
