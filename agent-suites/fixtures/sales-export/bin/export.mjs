#!/usr/bin/env node
import { argv, stdout } from 'node:process'
import { makeSales } from '../perf/data.mjs'
import { exportCsv } from '../src/export.mjs'

exportCsv(makeSales(Number(argv[2] ?? 10)), { write: (text) => stdout.write(text) })
