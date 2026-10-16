#!/usr/bin/env node
// Replays a short session: Ines (7) is promoted to analyst and opens the headcount report.
import { stdout } from 'node:process'
import { handle } from '../src/server.mjs'

const as = (userId, method, path, body) => {
  const res = handle({ method, path, headers: { 'x-user-id': String(userId) }, body })
  stdout.write(
    `${String(userId).padStart(2)} ${method.padEnd(4)}${path.padEnd(20)} ${res.status}\n`,
  )
  return res
}

as(7, 'GET', '/reports/headcount')
as(1, 'PUT', '/users/7/role', { role: 'analyst' })
as(7, 'GET', '/reports/headcount')
as(7, 'GET', '/directory')
