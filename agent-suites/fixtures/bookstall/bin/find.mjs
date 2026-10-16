#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'
import { findBook, price } from '../src/stock.mjs'

const query = argv[2]
if (!query) {
  stderr.write('usage: find <isbn>\n')
  exit(2)
}
const stock = JSON.parse(readFileSync(new URL('../data/stock.json', import.meta.url), 'utf8'))
const book = findBook(stock, query)
if (!book) {
  stdout.write(`Not in stock: ${query}\n`)
  exit(1)
}
stdout.write(`${book.title}  shelf ${book.shelf}  ${price(book.pence)}\n`)
