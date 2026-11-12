// Free, deterministic signals for each episode. Heuristics only: the judge confirms the ones that
// matter, and the report always shows counts next to rates.

const TEST_COMMAND =
  /\b(?:npm (?:run )?test|npm run check|npx vitest|vitest|jest|pytest|go test|cargo test|pnpm test|yarn test|bun test|xcodebuild test|swift test)\b/
const CORRECTION =
  /^(?:no\b|nope\b|wrong\b|that'?s (?:not|wrong)|actually\b|instead\b|you (?:didn'?t|forgot|missed|broke)|why did you|stop\b|don'?t\b|do not\b|revert\b|undo\b|still\b)|\b(?:not what i|that'?s wrong|is still (?:broken|wrong)|are still)\b/i
const ACCEPT =
  /^(?:ok(?:ay)?\b|yes\b|yep\b|yeah\b|great\b|thanks?\b|thank you|perfect\b|nice\b|good\b|lgtm\b|ship it|commit\b|merge\b|go ahead|do it|continue\b|proceed\b|looks good)/i
const DENIAL = /doesn't want to proceed|permission (?:denied|to use)|was (?:rejected|denied)/i

const words = (text = '') => new Set(text.toLowerCase().match(/[a-z0-9]{3,}/g) ?? [])

/** Share of the smaller word set found in the other: rewording the same request scores high. */
function overlap(a, b) {
  const [left, right] = [words(a), words(b)]
  if (!left.size || !right.size) return 0
  let shared = 0
  for (const word of left) if (right.has(word)) shared++
  return shared / Math.min(left.size, right.size)
}

/** What the person did next: correction, repeat, accept, new-topic, or none (session ended). */
export function classifyNextPrompt(next, prompt) {
  if (!next?.text) return 'none'
  const text = next.text.trim()
  if (CORRECTION.test(text)) return 'correction'
  if (text.length > 20 && overlap(text, prompt) >= 0.6) return 'repeat'
  if (ACCEPT.test(text)) return 'accept'
  return 'new-topic'
}

const mentions = (text, skill) =>
  new RegExp(`(?<![\\w-])/?${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w-])`, 'i').test(
    text,
  )

/** Commits, PRs and the last test run inside the episode. */
export function artifactsOf(actions) {
  const command = (action) => String(action.args?.command ?? '')
  const ok = (action) => !action.isError
  const tests = actions.filter(
    (action) => action.name === 'Bash' && TEST_COMMAND.test(command(action)),
  )
  return {
    commits: actions.filter(
      (action) => action.name === 'Bash' && /\bgit commit\b/.test(command(action)) && ok(action),
    ).length,
    prCreated: actions.some(
      (action) =>
        ok(action) &&
        ((action.name === 'Bash' && /\bgh pr create\b/.test(command(action))) ||
          /create_pull_request$/.test(action.name)),
    ),
    testsRun: tests.length,
    lastTestPassed: tests.length ? ok(tests.at(-1)) : null,
  }
}

/** Every free signal for one episode. */
export function episodeSignals(episode, toolboxSkills) {
  const others = [...toolboxSkills].filter((skill) => skill !== episode.skill)
  const next = episode.next?.text ?? ''
  return {
    namedInPrompt: mentions(episode.prompt, episode.skill),
    switchedSkill: episode.skillsAfter.some((skill) => toolboxSkills.has(skill)),
    userRedirect:
      others.some((skill) => mentions(next, skill)) ||
      /\b(?:wrong skill|don'?t use|stop using|instead of (?:the )?skill)\b/i.test(next),
    nextPrompt: classifyNextPrompt(episode.next, episode.prompt),
    toolCalls: episode.actions.length,
    toolErrors: episode.actions.filter((action) => action.isError).length,
    permissionDenials: episode.actions.filter(
      (action) => action.isError && DENIAL.test(action.result),
    ).length,
    subagents: episode.actions.filter((action) => ['Agent', 'Task'].includes(action.name)).length,
    ...artifactsOf(episode.actions),
  }
}
