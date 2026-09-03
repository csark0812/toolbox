#!/usr/bin/env node
/**
 * Ephemeral install mirrors for local direct agent tests.
 * Flat `<slug>/` remains SSOT; `.claude/skills/` and `.agents/skills/` are gitignored.
 *
 * Cursor + Codex project path: `.agents/skills/`
 * Claude Code project path: `.claude/skills/`
 *
 * Run via `npm run sync:skills` (Node strip-types for the shared slug list).
 */
import { mkdir, rm, symlink } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { EXPECTED_SKILLS } from '../src/expected-skills.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const SKILL_SLUGS = [...EXPECTED_SKILLS]

/** Relative from `<mirror>/skills/<slug>` → repo-root `<slug>/` */
const RELATIVE_TARGET = join('..', '..')

const MIRRORS = [join(root, '.claude', 'skills'), join(root, '.agents', 'skills')]

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
  `sync-skills: linked ${SKILL_SLUGS.length} skills under .claude/skills/ and .agents/skills/`,
)
