#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'
import { fastestRoute } from '../src/planner.mjs'

const network = JSON.parse(readFileSync(new URL('../data/network.json', import.meta.url), 'utf8'))
const byName = (name) =>
  network.stops.find((stop) => stop.name.toLowerCase() === name?.toLowerCase())
const [from, to] = argv.slice(2).map(byName)
if (!from || !to) {
  stderr.write('usage: route <from stop name> <to stop name>\n')
  exit(2)
}
const route = fastestRoute(network, from.id, to.id)
if (!route) {
  stdout.write(`No route from ${from.name} to ${to.name}.\n`)
  exit(1)
}
const names = route.stops.map((id) => network.stops.find((stop) => stop.id === id).name)
stdout.write(`${names.join(' -> ')} (${route.minutes} min)\n`)
