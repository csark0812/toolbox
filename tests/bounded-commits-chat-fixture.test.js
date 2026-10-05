import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

describe('bounded commits read-only chat inventory fixture', () => {
  it('exposes a scoped empty inventory and rejects messaging or argument overrides', () => {
    const requests = [
      { id: 1, method: 'initialize', params: { protocolVersion: '2024-11-05' } },
      { method: 'notifications/initialized' },
      { id: 2, method: 'tools/list' },
      { id: 3, method: 'tools/call', params: { name: 'list_chats', arguments: {} } },
      { id: 4, method: 'tools/call', params: { name: 'send_message', arguments: {} } },
      { id: 5, method: 'tools/call', params: { name: 'list_chats', arguments: { chats: [] } } },
    ]
    const responses = execFileSync(
      process.execPath,
      [
        fileURLToPath(
          new URL('../agent-suites/fixtures/bounded-work/chat-server.mjs', import.meta.url),
        ),
      ],
      {
        input: requests.map((request) => JSON.stringify(request)).join('\n') + '\n',
        encoding: 'utf8',
      },
    )
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line))
    expect(responses.map((response) => response.id)).toEqual([1, 2, 3, 4, 5])
    expect(responses[0].result.capabilities).toEqual({ tools: {} })
    expect(responses[1].result.tools.map((tool) => tool.name)).toEqual(['list_chats'])
    expect(JSON.parse(responses[2].result.content[0].text)).toEqual({
      scope: 'isolated-conformance-fixture',
      repository: process.cwd(),
      chats: [],
    })
    expect(responses[3].error.code).toBe(-32602)
    expect(responses[4].error.code).toBe(-32602)
  })
})
