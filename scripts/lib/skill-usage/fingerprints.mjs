// Cheap filters that mark a task (a turn with no toolbox skill call) as a possible missed trigger.
// Each one paraphrases the skill's own description. A match is only a candidate: the judge decides.

const UI_FILE = /\.(?:html|css|scss|tsx|jsx|vue|svelte)$/
const PAGE_FILE =
  /(?:^|\/)(?:pages|app|routes|screens)\/.+\.(?:tsx|jsx|vue|svelte|html)$|index\.html$/
const DOC_FILE = /\.(?:md|json|ya?ml|lock|txt|snap)$/
const TEST_FILE = /(?:^|\/)(?:tests?|__tests__|spec)\/|\.(?:test|spec)\.\w+$/

const edits = (task) =>
  task.actions
    .filter((action) => ['Write', 'Edit', 'MultiEdit'].includes(action.name))
    .map((action) => String(action.args?.file_path ?? ''))
const commands = (task) =>
  task.actions
    .filter((action) => action.name === 'Bash')
    .map((action) => String(action.args?.command ?? ''))
const sourceEdits = (task) =>
  edits(task).filter((file) => !DOC_FILE.test(file) && !TEST_FILE.test(file))

/** skill → (task) => boolean */
export const FINGERPRINTS = {
  taste: (task) => {
    const ui = edits(task).filter((file) => UI_FILE.test(file))
    const words =
      /\b(?:landing page|home ?page|redesign|restyle|dashboard|website|site for|new (?:page|screen)|looks? (?:generic|bland|boring|dated|like a template))\b/i.test(
        task.prompt,
      )
    return ui.length >= 3 || (words && ui.length >= 1) || ui.some((file) => PAGE_FILE.test(file))
  },
  'css-craft': (task) =>
    edits(task).some((file) => /\.(?:css|scss)$/.test(file)) &&
    /\b(?:colou?r|dark mode|contrast|focus|overflow|sideways|scroll|align|spacing|padding|margin|unreadable|hidden behind|z-index|css)\b/i.test(
      task.prompt,
    ),
  'evidence-based-debugging': (task) =>
    sourceEdits(task).length > 0 &&
    /\b(?:bug|broken|wrong|error|crash(?:es|ed)?|fail(?:s|ing|ed)?|doesn'?t work|not working|regression|exception|twice|duplicate)\b/i.test(
      task.prompt,
    ),
  probe: (task) =>
    edits(task).length === 0 &&
    task.actions.length >= 3 &&
    /\b(?:why (?:does|is|do|did)|is (?:it|this|that) (?:right|correct)|are they (?:right|correct)|explain|what'?s going on|how come)\b/i.test(
      task.prompt,
    ),
  tdd: (task) =>
    sourceEdits(task).length > 0 &&
    /\b(?:add|implement|support|introduce)\b[^.?!]{0,60}\b(?:function|flag|option|endpoint|field|parser|command|format|validation)\b/i.test(
      task.prompt,
    ),
  'refactor-companion': (task) =>
    commands(task).some((command) => /\bgit mv\b/.test(command)) ||
    (edits(task).length >= 2 &&
      /\b(?:rename|move|migrate|consolidate|merge (?:these|the two)|replace [^.?!]{0,40} with|tidy|clean ?up|extract)\b/i.test(
        task.prompt,
      )),
  'code-review': (task) =>
    /\b(?:review (?:this|the|my)|look over|check (?:this|the|my) (?:pr|diff|branch|change)|safe to (?:ship|merge))\b/i.test(
      task.prompt,
    ),
  'babysit-pr': (task) =>
    /\b(?:ci (?:is )?(?:red|failing)|fix (?:the )?ci|review comments|mergeable|ready to merge|checks? (?:are )?failing)\b/i.test(
      task.prompt,
    ),
  'create-bounded-commits': (task) =>
    /\bcommit\b/i.test(task.prompt) &&
    commands(task).filter((command) => /\bgit commit\b/.test(command)).length >= 2,
}

/** Skills whose fingerprint matches a task. */
export const candidateSkills = (task) =>
  Object.entries(FINGERPRINTS)
    .filter(([, matches]) => matches(task))
    .map(([skill]) => skill)
