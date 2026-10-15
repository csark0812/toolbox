import { POPULAR } from './popular.mjs'
// Preloads popular SKUs at startup. The upstream config gives the warm-up TTL in seconds.
export async function warmUp(cache, fetchPrice, config) {
  for (const sku of POPULAR) cache.set(sku, await fetchPrice(sku), config.warmupTtl)
}
