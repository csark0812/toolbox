// Hidden acceptance for the captions fix: a file that starts with a UTF-8 byte order mark keeps
// its first cue when read from disk (with LF or CRLF line ends), the shifted output matches the
// file without a BOM, no BOM leaks into a cue, and uploads still work.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { loadSrt } = await import(pathToFileURL(join(dir, 'src/files.mjs')).href)
const { importUpload } = await import(pathToFileURL(join(dir, 'src/upload.mjs')).href)
const scratch = mkdtempSync(join(tmpdir(), 'captions-check-'))
try {
  const body =
    '7\n00:00:00,500 --> 00:00:01,000\nFirst line.\n\n8\n00:00:02,000 --> 00:00:03,000\nSecond.\n'
  const want = [
    { start: 500, end: 1000, text: 'First line.' },
    { start: 2000, end: 3000, text: 'Second.' },
  ]
  for (const [name, text] of [
    ['bom-lf.srt', `\uFEFF${body}`],
    ['bom-crlf.srt', `\uFEFF${body.replace(/\n/g, '\r\n')}`],
    ['plain.srt', body],
    ['crlf.srt', body.replace(/\n/g, '\r\n')],
  ]) {
    writeFileSync(join(scratch, name), text)
    const cues = loadSrt(join(scratch, name)).map(({ start, end, text }) => ({ start, end, text }))
    assert.deepEqual(cues, want, `${name}: every cue is read, first one included`)
  }
  assert.equal(importUpload(Buffer.from(`\uFEFF${body}`)).count, 2, 'uploads keep working')
  const shift = (file) =>
    execFileSync(process.execPath, ['bin/shift.mjs', file, '+500'], { cwd: dir, encoding: 'utf8' })
  const windows = shift('data/episode-05-subtitle-edit.srt')
  assert.equal(windows, shift('data/episode-04.srt'), 'the BOM file shifts like the plain one')
  assert.match(windows, /^1\n00:00:01,500 --> 00:00:03,700\nWhere were you last night\?\n/)
  assert.ok(!windows.includes('\uFEFF'), 'no byte order mark in the output text')
  execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
} finally {
  rmSync(scratch, { recursive: true, force: true })
}
