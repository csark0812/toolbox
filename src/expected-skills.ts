/** Canonical skill slugs shipped by this toolbox hub. */
export const EXPECTED_SKILLS = [
  'subagents',
  'code-review',
  'crystallize',
  'grill',
  'second-opinion',
  'investigate',
  'iterative-review',
  'diagnose',
  'tdd',
  'prototype',
  'domain-model',
  'handoff',
  'writing-great-skills',
] as const

export type SkillSlug = (typeof EXPECTED_SKILLS)[number]
