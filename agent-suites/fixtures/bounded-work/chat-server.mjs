import { createInterface } from 'node:readline'
import process from 'node:process'

// Read-only synthetic host inventory. Never access user chats or repository files.
const inventoryTool = {
  name: 'list_chats',
  description:
    'List chats associated with this isolated conformance workspace. This synthetic fixture has no active or idle chat owners; it cannot inspect real Codex chats or send messages.',
  inputSchema: { type: 'object', properties: {}, additionalProperties: false },
}

for await (const line of createInterface({ input: process.stdin })) {
  const request = JSON.parse(line)
  if (request.id === undefined) continue
  let result
  let error
  switch (request.method) {
    case 'initialize':
      result = {
        protocolVersion: request.params.protocolVersion,
        capabilities: { tools: {} },
        serverInfo: { name: 'bounded-commits-fixture-chats', version: '1.0.0' },
      }
      break
    case 'ping':
      result = {}
      break
    case 'tools/list':
      result = { tools: [inventoryTool] }
      break
    case 'tools/call':
      if (
        request.params.name !== inventoryTool.name ||
        Object.keys(request.params.arguments ?? {}).length !== 0
      ) {
        error = {
          code: -32602,
          message: 'Only read-only list_chats with no arguments is supported',
        }
      } else {
        result = {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                scope: 'isolated-conformance-fixture',
                repository: process.cwd(),
                chats: [],
              }),
            },
          ],
        }
      }
      break
    default:
      error = { code: -32601, message: 'Method not found' }
  }
  process.stdout.write(
    JSON.stringify({ jsonrpc: '2.0', id: request.id, ...(error ? { error } : { result }) }) + '\n',
  )
}
