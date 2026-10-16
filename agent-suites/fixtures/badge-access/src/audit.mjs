import { EventEmitter } from 'node:events'

/** The audit trail: every decision is emitted as `granted` or `denied` and kept in `entries`. */
export const audit = new EventEmitter()
export const entries = []

audit.on('granted', (event) => entries.push({ ...event, result: 'granted' }))
audit.on('denied', (event) => entries.push({ ...event, result: 'denied' }))
