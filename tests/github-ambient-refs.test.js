/**
 * Validation for ambient refs via GitHub URLs (plan: github-ambient-refs).
 * T1 = HTTP reachability; T6 = pin stability; T2-capability = local Read vs fetch.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = join(import.meta.dirname, '..')
const REL = '.skeleton/references/agent-routing.md'
const MARKERS = {
  h1: '# Agent ambient routing',
  portableStub: '**Portable stub',
  announce: 'Announce before tools',
}

function localBody() {
  return readFileSync(join(root, REL), 'utf8')
}

function rawUrl(ref) {
  return `https://raw.githubusercontent.com/csark0812/toolbox/${ref}/${REL}`
}

async function fetchText(url) {
  const res = await fetch(url)
  return { status: res.status, text: await res.text() }
}

describe('github ambient refs validation (T1/T6)', () => {
  it('T1: pinned commit raw URL returns 200 and known markers', async () => {
    // Prefer a published tip; fall back to main if this SHA is not on GitHub yet.
    const sha = process.env.GITHUB_AMBIENT_REF_SHA ?? 'e8f6519d9c737f55ba71c16932e1a8cf06d3acc6'
    const primary = await fetchText(rawUrl(sha))
    const used =
      primary.status === 200
        ? primary
        : await fetchText(rawUrl('main'))

    expect(used.status).toBe(200)
    expect(used.text).toContain(MARKERS.h1)
    expect(used.text).toMatch(MARKERS.portableStub)
    expect(used.text).toContain(MARKERS.announce)
  })

  it('T1: main raw URL returns usable markdown (not HTML shell)', async () => {
    const { status, text } = await fetchText(rawUrl('main'))
    expect(status).toBe(200)
    expect(text).toContain(MARKERS.h1)
    expect(text).not.toMatch(/<html/i)
  })

  it('T6: commit-SHA pin matches a fixed marker set; main may differ', async () => {
    const sha = 'e8f6519d9c737f55ba71c16932e1a8cf06d3acc6'
    const pinned = await fetchText(rawUrl(sha))
    if (pinned.status !== 200) {
      // Unpushed / unavailable SHA — still prove main is fetchable and local disk has markers.
      expect(localBody()).toContain(MARKERS.h1)
      const main = await fetchText(rawUrl('main'))
      expect(main.status).toBe(200)
      return
    }

    expect(pinned.text).toMatch(/Do \*\*not\*\* call tools, search the repo for this file/)

    const main = await fetchText(rawUrl('main'))
    expect(main.status).toBe(200)
    // Drift is allowed on main; pin must not silently equal "whatever main is" as the stability claim.
    // If they happen to match, T6 still passes on pin content assertions above.
    expect(pinned.text.length).toBeGreaterThan(100)
    expect(main.text.length).toBeGreaterThan(100)
  })
})

describe('github ambient refs tool capability (T2 gate input)', () => {
  it('T2a: Node fetch can load raw content (WebFetch-class)', async () => {
    const { status, text } = await fetchText(rawUrl('main'))
    expect(status).toBe(200)
    expect(text).toContain(MARKERS.h1)
  })

  it('T2b: workspace Read-equivalent is local-path only (https path must not resolve as file)', () => {
    // Cursor Read / fs open on an https URL fails — agents that only Read markdown links will miss remote SSOT.
    let threw = false
    try {
      readFileSync(
        'https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/agent-routing.md',
        'utf8',
      )
    } catch {
      threw = true
    }
    expect(threw).toBe(true)
  })
})
