#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'
import { createRouter } from '../src/router.mjs'

const [method, url] = argv.slice(2)
if (!method || !url) {
  stderr.write('usage: match <METHOD> <url>\n')
  exit(2)
}
const routes = JSON.parse(readFileSync(new URL('../routes.json', import.meta.url), 'utf8'))
const found = createRouter(routes).match(method.toUpperCase(), url)
stdout.write(found ? `${found.name} ${JSON.stringify(found.params)}\n` : 'no route\n')
if (!found) exit(1)
