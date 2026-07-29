#!/usr/bin/env node
/**
 * Ephemeral install mirrors for local dogfood / agent-test live.
 * Flat `<slug>/` remains SSOT; `.claude/skills/` and `.agents/skills/` are gitignored.
 *
 * Cursor + Codex project path: `.agents/skills/`
 * Claude Code project path: `.claude/skills/`
 */
import { mkdir, rm, symlink } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

/** Keep in sync with src/expected-skills.ts */
const SKILL_SLUGS = [
  'multi',
  'code-review',
  'crystallize',
  'grill',
  'second-opinion',
  'investigate',
  'diagnose',
  'tdd',
  'prototype',
  'domain-model',
  'handoff',
  'writing-great-skills',
]

/** Relative from `<mirror>/skills/<slug>` → repo-root `<slug>/` */
const RELATIVE_TARGET = join('..', '..')

const MIRRORS = [
  join(root, '.claude', 'skills'),
  join(root, '.agents', 'skills'),
]

for (const skillsRoot of MIRRORS) {
  await mkdir(skillsRoot, { recursive: true })

  for (const slug of SKILL_SLUGS) {
    const linkPath = join(skillsRoot, slug)
    const target = join(RELATIVE_TARGET, slug)

    await rm(linkPath, { recursive: true, force: true })
    await symlink(target, linkPath)
  }
}

console.log(
  `sync-claude-skills: linked ${SKILL_SLUGS.length} skills under .claude/skills/ and .agents/skills/`,
)
