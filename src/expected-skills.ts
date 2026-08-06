/** Canonical skill slugs shipped by this toolbox hub. */
export const EXPECTED_SKILLS = [
  'subagents',
  'code-review',
  'crystallize',
  'grill',
  'second-opinion',
  'investigate',
  'iterate',
  'diagnose',
  'tdd',
  'prototype',
  'domain-model',
  'handoff',
] as const

export type SkillSlug = (typeof EXPECTED_SKILLS)[number]
