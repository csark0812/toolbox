#!/usr/bin/env node
import { argv, exit, stderr, stdout } from 'node:process'
import { loadSrt } from '../src/files.mjs'
import { formatSrt, shift } from '../src/srt.mjs'

const [file, offset = '0'] = argv.slice(2)
if (!file || !/^[+-]?\d+$/.test(offset)) {
  stderr.write('usage: shift <file.srt> <+/-ms>\n')
  exit(2)
}
stdout.write(formatSrt(shift(loadSrt(file), Number(offset))))
