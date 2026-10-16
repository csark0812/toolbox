import { parseSrt } from './srt.mjs'

/** Handle an uploaded .srt body (bytes from the browser). */
export function importUpload(bytes) {
  const cues = parseSrt(new TextDecoder('utf-8').decode(bytes))
  if (!cues.length) throw new Error('no cues found in upload')
  return { cues, count: cues.length }
}
