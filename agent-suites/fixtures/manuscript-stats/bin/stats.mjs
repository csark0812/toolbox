#!/usr/bin/env node
import { argv, exit, stderr, stdout } from 'node:process'
import { chapterStats, readingMinutes } from '../src/count.mjs'
import { readChapters } from '../src/files.mjs'

const folder = argv[2]
if (!folder) {
  stderr.write('usage: stats <folder>\n')
  exit(2)
}
let total = 0
for (const { name, text } of readChapters(folder)) {
  const { words, sentences, minutes } = chapterStats(text)
  total += words
  stdout.write(
    `${name.padEnd(16)} ${String(words).padStart(6)} words  ${String(sentences).padStart(3)} sentences  ${minutes} min\n`,
  )
}
stdout.write(
  `${'total'.padEnd(16)} ${String(total).padStart(6)} words  ${readingMinutes(total)} min\n`,
)
