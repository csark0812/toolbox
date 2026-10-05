import { cp, mkdir, rm, writeFile, readdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { EXPECTED_SKILLS } from '../src/expected-skills.ts'
const source = process.cwd()
const target = resolve('_agent/public-workspace')
await rm(target, { recursive: true, force: true })
await mkdir(target, { recursive: true })
await cp(join(source, 'agent-suites/fixtures'), join(target, 'agent-suites/fixtures'), {
  recursive: true,
})
for (const slug of EXPECTED_SKILLS)
  await cp(join(source, slug), join(target, slug), { recursive: true })
await writeFile(
  join(target, 'AGENTS.md'),
  '# Isolated conformance fixture\n\nThis workspace contains all applicable fixture instructions, public sample sources and available skills. Keep file access and changes inside this workspace. Parent directories, parent AGENTS.md files, global installs and other repositories are outside the fixture boundary. Discover commands from the fixture manifests and preserve the task’s diagnosis or repair authority.\n',
)
await writeFile(
  join(target, 'package.json'),
  JSON.stringify(
    {
      private: true,
      type: 'module',
      scripts: { test: 'bun test agent-suites/fixtures/debug-app/tests' },
    },
    null,
    2,
  ),
)
const inventory = await readdir(target, { recursive: true })
if (
  inventory.some((path) =>
    /(^|\/)(\.env[^/]*|node_modules|\.git|claims\.json|migration-index\.json)$/.test(path),
  )
)
  throw new Error('Unexpected confidential or answer-key surface in public fixture')
console.log(
  `Prepared ${inventory.length} paths: allowlisted public sample fixtures and Toolbox skill sources only. No user repository state, credentials, claims, judges or history copied.`,
)
