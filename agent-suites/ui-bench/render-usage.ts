export type ToolCall = { name: string; result?: string }

/**
 * How the agent used the render_page tool: whether it rendered at all, how often,
 * and whether it edited after a render that reported findings.
 */
export function renderUsage(toolCalls: ToolCall[]) {
  const isRender = (call: ToolCall) => /render_page$/.test(call.name)
  const isEdit = (call: ToolCall) => /^(edit|write|multiedit)$/i.test(call.name)
  const renders = toolCalls.flatMap((call, index) => (isRender(call) ? [{ call, index }] : []))
  const firstFindingRender = renders.find(({ call }) => /Findings \(\d+\)/.test(call.result ?? ''))
  return {
    rendered: renders.length > 0,
    renderCount: renders.length,
    editedAfterFindings: firstFindingRender
      ? toolCalls.slice(firstFindingRender.index + 1).some(isEdit)
      : false,
  }
}
