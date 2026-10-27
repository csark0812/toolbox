import { isReady } from './wheels.mjs'

export function groupBy(list, key) {
  const groups = new Map()
  for (const item of list) {
    const value = item[key]
    if (!groups.has(value)) groups.set(value, [])
    groups.get(value).push(item)
  }
  return groups
}

export function findBatch(wheels, batchId) {
  return wheels.filter((wheel) => wheel.batchId === batchId)
}

export function batchSummary(wheels, today) {
  return [...groupBy(wheels, 'batchId')].map(([batchId, members]) => ({
    batchId,
    cheese: members[0].cheese,
    wheels: members.length,
    ready: members.filter((wheel) => isReady(wheel, today)).length,
  }))
}

export function batchLabel(batchId) {
  return `Batch ${batchId}`
}
