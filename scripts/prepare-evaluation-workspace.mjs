import { cp, mkdir, rm, writeFile, readdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { EXPECTED_SKILLS } from '../src/expected-skills.ts'
const source = process.cwd()
// --bench prepares a blinded workspace: fixtures under projects/, no testing vocabulary.
const bench = process.argv.includes('--bench')
// Each bench runner gets its own folder so parallel runners never rebuild each other's source.
const target = resolve(
  bench
    ? `_agent/bench-workspace-${process.env.SKILL_BENCH_RUNNER ?? 'codex'}`
    : '_agent/public-workspace',
)
const fixtureDir = bench ? 'projects' : 'agent-suites/fixtures'
await rm(target, { recursive: true, force: true })
await mkdir(target, { recursive: true })
await cp(join(source, 'agent-suites/fixtures'), join(target, fixtureDir), {
  recursive: true,
  // A benchmark project named after a skill would tell the agent which skill is under study.
  filter: (path) =>
    !bench || !EXPECTED_SKILLS.some((slug) => path === join(source, 'agent-suites/fixtures', slug)),
})
for (const slug of EXPECTED_SKILLS)
  await cp(join(source, slug), join(target, slug), { recursive: true })
await writeFile(
  join(target, 'AGENTS.md'),
  bench
    ? '# Projects\n\nEach folder under projects/ is a small service with its own README and package.json. Keep file access and changes inside this workspace. Parent directories, parent AGENTS.md files, global installs and other repositories are out of scope. Discover commands from each project’s manifest.\n'
    : '# Isolated conformance fixture\n\nThis workspace contains all applicable fixture instructions, public sample sources and available skills. Keep file access and changes inside this workspace. Parent directories, parent AGENTS.md files, global installs and other repositories are outside the fixture boundary. Discover commands from the fixture manifests and preserve the task’s diagnosis or repair authority.\n',
)
// Claude Code's Linux sandbox blocks Unix sockets, which headless Chrome needs to start. Every arm gets
// the same allowance so visual work can be rendered and looked at; network access is unchanged.
if (bench && process.env.SKILL_BENCH_RUNNER === 'claude') {
  await mkdir(join(target, '.claude'), { recursive: true })
  await writeFile(
    join(target, '.claude', 'settings.json'),
    JSON.stringify({ sandbox: { network: { allowAllUnixSockets: true } } }, null, 2),
  )
}
await writeFile(
  join(target, 'package.json'),
  JSON.stringify(
    bench
      ? { private: true, type: 'module' }
      : {
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
