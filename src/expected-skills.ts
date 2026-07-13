/** Canonical skill slugs shipped by this toolbox hub. */
export const EXPECTED_SKILLS = [
  'multi',
  'code-review',
  'crystallize',
  'grill',
  'second-opinion',
  'investigate',
  'handoff',
] as const

export type SkillSlug = (typeof EXPECTED_SKILLS)[number]
