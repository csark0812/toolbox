import { readFileSync } from 'node:fs'
import { parseSrt } from './srt.mjs'

/** Read and parse an .srt file from disk. */
export function loadSrt(path) {
  return parseSrt(readFileSync(path, 'utf8'))
}
