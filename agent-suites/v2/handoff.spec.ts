import { describe, z } from '@post-print/agent-test'
import { executeClaim } from './support'
const test = describe('handoff', ({ agent, judge }) => ({
  coder: agent(),
  reviewer: judge({
    prompt:
      'Evaluate only the supplied claims against the supplied evidence. Skill availability or self-assertion does not prove use. Return passed only if every claim is supported. Explain missing evidence.',
    schema: z.object({ passed: z.boolean(), reason: z.string() }),
  }),
}))
test(
  'user-request: prompt only no artifact',
  {
    description:
      'Portable handoff skill conformance: user prompt-only vs model-invoked artifact path',
    criteria: [
      'Open workspace',
      'Continue this task.',
      'Goal:',
      'Start with',
      '## Current state',
      '## Files and links',
      'prompt-only',
      'The agent invoked handoff in user-request mode, gave a direct Simple English prompt with links, redacted secrets, and did not write an _agent/handoffs file',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'handoff:1',
        suite: 'handoff',
        defaults: { profile: 'cursor', skills: 'full' },
        name: 'user-request: prompt only no artifact',
        prompt:
          '/handoff this session for a fresh chat. We worked on auth refactor; plan at `.cursor/plans/auth-refactor.plan.md`, PR #42. API key was mentioned in thread \u2014 must not appear in output.\n\nRead `.claude/skills/handoff/SKILL.md` first. User-request: paste prompt only \u2014 do not write `_agent/handoffs/`.',
        rubric: {
          must: [
            'Open workspace',
            'Continue this task.',
            'Goal:',
            'Start with',
            '## Current state',
            '## Files and links',
            'prompt-only',
          ],
          mustInvokeSkill: ['handoff'],
          mustNot: ['sk-', 'BEGIN PRIVATE KEY', '_agent/handoffs/', 'paste the full plan body'],
          judge: [
            'The agent invoked handoff in user-request mode, gave a direct Simple English prompt with links, redacted secrets, and did not write an _agent/handoffs file',
          ],
        },
      },
      info,
    )
  },
)
test(
  'user-request: target workspace in prompt not current root',
  {
    description:
      'Portable handoff skill conformance: user prompt-only vs model-invoked artifact path',
    criteria: [
      'Open workspace: /tmp/personal-toolbox',
      'Continue this task.',
      'prompt-only',
      'Goal:',
      '## Current state',
      'The agent gave a direct Simple English prompt that names personal-toolbox as the next workspace and did not write a handoff file',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'handoff:2',
        suite: 'handoff',
        defaults: { profile: 'cursor', skills: 'full' },
        name: 'user-request: target workspace in prompt not current root',
        prompt:
          'Current chat is rooted in /tmp/unrelated-app. /handoff to harden voice em-dash ban \u2014 next session must edit the voice skill under /tmp/personal-toolbox.\n\nRead `.claude/skills/handoff/SKILL.md` first. Prompt-only; do not write any handoff file.',
        rubric: {
          must: [
            'Open workspace: /tmp/personal-toolbox',
            'Continue this task.',
            'prompt-only',
            'Goal:',
            '## Current state',
          ],
          mustInvokeSkill: ['handoff'],
          mustNot: ['/tmp/unrelated-app/_agent/handoffs', '_agent/handoffs/'],
          judge: [
            'The agent gave a direct Simple English prompt that names personal-toolbox as the next workspace and did not write a handoff file',
          ],
        },
      },
      info,
    )
  },
)
test(
  'client-interface: cursor prompt handoff',
  {
    description:
      'Portable handoff skill conformance: user prompt-only vs model-invoked artifact path',
    criteria: [
      'Open workspace: /tmp/personal-toolbox',
      'Continue this task.',
      'Goal:',
      'Start with:',
      '## Current state',
      '## Next actions',
      'prompt-only',
      'The agent used the cursor transfer path and prompt-only channel',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'handoff:3',
        suite: 'handoff',
        defaults: { profile: 'cursor', skills: 'full' },
        name: 'client-interface: cursor prompt handoff',
        prompt:
          '/handoff this work to a fresh Cursor chat. Use prompt mode, include `Open workspace: /tmp/personal-toolbox`, and keep next actions imperative.\n\nRead `.claude/skills/handoff/SKILL.md` first.',
        rubric: {
          must: [
            'Open workspace: /tmp/personal-toolbox',
            'Continue this task.',
            'Goal:',
            'Start with:',
            '## Current state',
            '## Next actions',
            'prompt-only',
          ],
          mustInvokeSkill: ['handoff'],
          mustNot: [
            '_agent/handoffs/',
            'artifact',
            'coordinator-primary',
            'paste the full plan body',
          ],
          judge: ['The agent used the cursor transfer path and prompt-only channel'],
        },
      },
      info,
    )
  },
)
test(
  'client-interface: claude prompt handoff',
  {
    description:
      'Portable handoff skill conformance: user prompt-only vs model-invoked artifact path',
    criteria: [
      'Open workspace: /tmp/claude-workspace',
      'Goal:',
      'Start with:',
      '## Files and links',
      'prompt-only',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'handoff:4',
        suite: 'handoff',
        defaults: { profile: 'cursor', skills: 'full' },
        name: 'client-interface: claude prompt handoff',
        prompt:
          'Prepare a handoff prompt for a fresh Claude Code chat and target `/tmp/claude-workspace`.\n\nRead `.claude/skills/handoff/SKILL.md` first.',
        rubric: {
          must: [
            'Open workspace: /tmp/claude-workspace',
            'Goal:',
            'Start with:',
            '## Files and links',
            'prompt-only',
          ],
          mustInvokeSkill: ['handoff'],
          mustNot: ['_agent/handoffs/'],
        },
      },
      info,
    )
  },
)
test(
  'client-interface: unknown-client fallback to prompt',
  {
    description:
      'Portable handoff skill conformance: user prompt-only vs model-invoked artifact path',
    criteria: [
      'Open workspace: /tmp/legacy-client',
      'Continue this task.',
      'Goal:',
      'Start with:',
      '## Current state',
      'prompt-only',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'handoff:5',
        suite: 'handoff',
        defaults: { profile: 'cursor', skills: 'full' },
        name: 'client-interface: unknown-client fallback to prompt',
        prompt:
          'The next recipient is an unsupported custom client with no artifact path. Hand off to a fresh chat in `/tmp/legacy-client` and do prompt-only only.\n\nRead `.claude/skills/handoff/SKILL.md` first.',
        rubric: {
          must: [
            'Open workspace: /tmp/legacy-client',
            'Continue this task.',
            'Goal:',
            'Start with:',
            '## Current state',
            'prompt-only',
          ],
          mustInvokeSkill: ['handoff'],
          mustNot: ['_agent/handoff', 'artifact'],
        },
      },
      info,
    )
  },
)
test(
  'client-interface: chatgpt continuation',
  {
    description:
      'Portable handoff skill conformance: user prompt-only vs model-invoked artifact path',
    criteria: [
      'Open workspace: /tmp/chatgpt-workspace',
      'Continue this task.',
      'Goal:',
      'Start with:',
      'prompt-only',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'handoff:6',
        suite: 'handoff',
        defaults: { profile: 'cursor', skills: 'full' },
        name: 'client-interface: chatgpt continuation',
        prompt:
          'Hand off this work to a fresh ChatGPT chat for `/tmp/chatgpt-workspace`. Keep the format strict and include workspace target at top.\n\nRead `.claude/skills/handoff/SKILL.md` first.',
        rubric: {
          must: [
            'Open workspace: /tmp/chatgpt-workspace',
            'Continue this task.',
            'Goal:',
            'Start with:',
            'prompt-only',
          ],
          mustInvokeSkill: ['handoff'],
          mustNot: ['_agent/handoffs/'],
        },
      },
      info,
    )
  },
)
test(
  'client-interface: copilot continuation',
  {
    description:
      'Portable handoff skill conformance: user prompt-only vs model-invoked artifact path',
    criteria: [
      'Open workspace: /tmp/copilot-workspace',
      'Continue this task.',
      'Goal:',
      'Start with:',
      'prompt-only',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'handoff:7',
        suite: 'handoff',
        defaults: { profile: 'cursor', skills: 'full' },
        name: 'client-interface: copilot continuation',
        prompt:
          'Prepare a handoff to GitHub Copilot Chat into `/tmp/copilot-workspace` using the standard handoff prompt block.\n\nRead `.claude/skills/handoff/SKILL.md` first.',
        rubric: {
          must: [
            'Open workspace: /tmp/copilot-workspace',
            'Continue this task.',
            'Goal:',
            'Start with:',
            'prompt-only',
          ],
          mustInvokeSkill: ['handoff'],
          mustNot: ['_agent/handoffs/'],
        },
      },
      info,
    )
  },
)
test(
  'model-invoked: subagent artifact path',
  {
    description:
      'Portable handoff skill conformance: user prompt-only vs model-invoked artifact path',
    criteria: [
      '_agent/handoffs',
      'Task:',
      'handoff-subagent-dispatch',
      'Open workspace',
      'The agent invoked handoff in model-invoked mode, planned subagent dispatch for artifact write, and gave a paste prompt referencing the handoff path',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'handoff:8',
        suite: 'handoff',
        defaults: { profile: 'cursor', skills: 'full' },
        name: 'model-invoked: subagent artifact path',
        prompt:
          'Context is nearly full \u2014 hand off autonomously so the next session can continue implement on the auth refactor branch.\n\nRead `.claude/skills/handoff/SKILL.md` first. Model-invoked path: spawn subagent to write _agent/handoffs/.',
        rubric: {
          must: ['_agent/handoffs', 'Task:', 'handoff-subagent-dispatch', 'Open workspace'],
          mustInvokeSkill: ['handoff'],
          mustNot: ['coordinator-primary', 'prompt-only'],
          judge: [
            'The agent invoked handoff in model-invoked mode, planned subagent dispatch for artifact write, and gave a paste prompt referencing the handoff path',
          ],
        },
      },
      info,
    )
  },
)
