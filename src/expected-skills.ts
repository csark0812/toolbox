/** Canonical skill slugs shipped by this toolbox hub. */
export const EXPECTED_SKILLS = [
  'council',
  'code-review',
  'review-walkthrough',
  'grill',
  'second-opinion',
  'probe',
  'tdd',
  'prototype',
  'domain-model',
  'handoff',
  'refactor-companion',
  'refine-agent-work',
] as const

export type SkillSlug = (typeof EXPECTED_SKILLS)[number]
