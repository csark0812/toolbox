#!/usr/bin/env node
/**
 * Ephemeral install mirror for agent-test live dogfood.
 * Flat `<slug>/` remains SSOT; `.claude/skills/` is gitignored per AGENTS.md.
 */
import { mkdir, rm, symlink } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const skillsRoot = join(root, '.claude', 'skills')

/** Keep in sync with src/expected-skills.ts */
const SKILL_SLUGS = [
  'multi',
  'code-review',
  'crystallize',
  'grill',
  'second-opinion',
  'investigate',
  'handoff',
]

await mkdir(skillsRoot, { recursive: true })

for (const slug of SKILL_SLUGS) {
  const linkPath = join(skillsRoot, slug)
  const target = join('..', '..', slug)

  await rm(linkPath, { recursive: true, force: true })
  await symlink(target, linkPath)
}

console.log(`sync-claude-skills: linked ${SKILL_SLUGS.length} skills under .claude/skills/`)
