#!/usr/bin/env node
import { cp, mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'

const root = resolve(new URL('..', import.meta.url).pathname)
const destination = process.env.TOOLBOX_SKILLS_DIR ?? join(homedir(), '.agents', 'skills')
const backupRoot = join(destination, '_agent', 'install-backups', `toolbox-${Date.now()}`)
const retired = ['refine-agent-work']
const registry = JSON.parse(await readFile(join(root, 'skills-lock.json'), 'utf8'))
const managed = Object.keys(registry.skills ?? registry)
async function exists(path) {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}
async function digest(path) {
  return createHash('sha256')
    .update(await readFile(join(path, 'SKILL.md')))
    .digest('hex')
}
await mkdir(destination, { recursive: true })
for (const slug of [...managed, ...retired]) {
  const target = join(destination, slug)
  if (!(await exists(target))) continue
  const backup = join(backupRoot, slug)
  await mkdir(dirname(backup), { recursive: true })
  await rename(target, backup)
}
for (const slug of managed) {
  const source = join(root, slug)
  if (!(await exists(source))) throw new Error(`Registry skill is missing: ${slug}`)
  await cp(source, join(destination, slug), { recursive: true, errorOnExist: true })
}
const installed = {}
for (const slug of managed) installed[slug] = await digest(join(destination, slug))
await mkdir(join(destination, '_agent'), { recursive: true })
await writeFile(
  join(destination, '_agent', 'toolbox-install.json'),
  JSON.stringify(
    {
      schemaVersion: 1,
      source: root,
      installedAt: new Date().toISOString(),
      skills: installed,
      retired,
      backups: (await exists(backupRoot)) ? backupRoot : null,
    },
    null,
    2,
  ) + '\n',
)
console.log(
  JSON.stringify({
    destination,
    skills: managed.length,
    backups: (await exists(backupRoot)) ? backupRoot : null,
  }),
)
