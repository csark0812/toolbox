#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { stdout } from 'node:process'
import { letter, overall } from '../src/grades.mjs'

const students = JSON.parse(readFileSync(new URL('../data/class.json', import.meta.url), 'utf8'))
for (const student of students) {
  const percent = overall(student)
  stdout.write(`${student.name.padEnd(10)} ${percent.toFixed(1).padStart(5)}  ${letter(percent)}\n`)
}
