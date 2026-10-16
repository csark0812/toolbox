#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { stdout } from 'node:process'
import { episodeList } from '../src/episodes.mjs'

const episodes = JSON.parse(readFileSync(new URL('../data/episodes.json', import.meta.url), 'utf8'))
stdout.write(episodeList(episodes) + '\n')
