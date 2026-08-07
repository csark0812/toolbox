/** Canonical skill slugs shipped by this toolbox hub. */
export const EXPECTED_SKILLS = [
  'subagents',
  'code-review',
  'grill',
  'second-opinion',
  'iterate',
  'probe',
  'tdd',
  'prototype',
  'domain-model',
  'handoff',
] as const

export type SkillSlug = (typeof EXPECTED_SKILLS)[number]
