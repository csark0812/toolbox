#!/usr/bin/env node
// Stdio MCP server exposing a render tool to UI-bench agents. It runs as a harness-owned process
// outside the agent's Bash sandbox (which blocks Chromium) and only renders the agent's workspace.
// - default: `render_page` renders a workspace HTML file.
// - UI_BENCH_APP=<fixture>: `render_screen` builds the workspace's app source and renders a route.
import { mkdtemp, readFile } from 'node:fs/promises'
import { createInterface } from 'node:readline'
import { tmpdir } from 'node:os'
import { isAbsolute, join, relative, resolve } from 'node:path'
import { buildAndRender, loadFixture } from '../agent-suites/ui-bench/app-build.mjs'
import { renderPage } from '../agent-suites/ui-bench/render-core.mjs'

const workspace = resolve(process.cwd())
const RETURNED_SHOTS = ['390', '1440', '390-dark']

const appFixture = process.env.UI_BENCH_APP ? loadFixture(process.env.UI_BENCH_APP) : null

const screenTool = {
  name: 'render_screen',
  description:
    "Build this workspace's app and render one route at 320/390/768/1440px in light mode and 390/1440px in dark mode. " +
    'Returns build errors, or layout and accessibility findings plus screenshots at 390px, 1440px and 390px dark. Takes about 15 seconds.',
  inputSchema: {
    type: 'object',
    properties: { route: { type: 'string', description: 'App route, e.g. /bench/goals-overview' } },
    required: ['route'],
  },
}

const pageTool = {
  name: 'render_page',
  description:
    'Render an HTML page from this workspace at 320/390/768/1440px in light mode and 390/1440px in dark mode. ' +
    'Returns layout and accessibility findings plus screenshots at 390px, 1440px and 390px dark.',
  inputSchema: {
    type: 'object',
    properties: {
      path: { type: 'string', description: 'Workspace-relative path to the .html file' },
    },
    required: ['path'],
  },
}

const tool = appFixture ? screenTool : pageTool

async function renderScreenTool({ route }) {
  const target = String(route ?? '')
  if (!target.startsWith('/'))
    return { isError: true, content: [{ type: 'text', text: 'route must start with /' }] }
  const outDir = await mkdtemp(join(tmpdir(), 'ui-bench-screen-'))
  const result = await buildAndRender({ fixture: appFixture, workspace, route: target, outDir })
  if (result.buildFailed)
    return { isError: true, content: [{ type: 'text', text: `Build failed:\n${result.buildLog}` }] }
  return renderResult(result)
}

async function renderTool({ path }) {
  const page = resolve(workspace, String(path ?? ''))
  const rel = relative(workspace, page)
  if (!rel || rel.startsWith('..') || isAbsolute(rel) || !page.endsWith('.html'))
    return {
      isError: true,
      content: [{ type: 'text', text: 'path must be an .html file inside the workspace' }],
    }
  const outDir = await mkdtemp(join(tmpdir(), 'ui-bench-render-'))
  return renderResult(await renderPage({ page, outDir }))
}

async function renderResult({ findings, screenshots }) {
  const lines = findings.length
    ? [
        `Findings (${findings.length}):`,
        ...findings.map((f) => `[${f.view}] ${f.check}: ${f.detail}`),
      ]
    : ['Findings: none']
  const content = [{ type: 'text', text: lines.join('\n') }]
  for (const view of RETURNED_SHOTS)
    if (screenshots[view]) {
      content.push({ type: 'text', text: `Screenshot ${view}:` })
      content.push({
        type: 'image',
        mimeType: 'image/png',
        data: (await readFile(screenshots[view])).toString('base64'),
      })
    }
  return { content }
}

const send = (message) => process.stdout.write(`${JSON.stringify(message)}\n`)

createInterface({ input: process.stdin }).on('line', async (line) => {
  if (!line.trim()) return
  const message = JSON.parse(line)
  const reply = (result) => send({ jsonrpc: '2.0', id: message.id, result })
  try {
    if (message.method === 'initialize')
      reply({
        protocolVersion: message.params?.protocolVersion ?? '2025-06-18',
        capabilities: { tools: {} },
        serverInfo: { name: 'ui-bench', version: '1.0.0' },
      })
    else if (message.method === 'tools/list') reply({ tools: [tool] })
    else if (message.method === 'tools/call')
      reply(await (appFixture ? renderScreenTool : renderTool)(message.params?.arguments ?? {}))
    else if (message.method === 'ping') reply({})
    else if (message.id !== undefined)
      send({ jsonrpc: '2.0', id: message.id, error: { code: -32601, message: 'Method not found' } })
  } catch (error) {
    if (message.id !== undefined)
      reply({ isError: true, content: [{ type: 'text', text: `render failed: ${error.message}` }] })
  }
})
