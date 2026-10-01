/** Canonical installation and composition contract. */
export const SKILLS = [
  { slug: 'council', kind: 'process', invocation: 'automatic', required: [], optional: [] },
  { slug: 'code-review', kind: 'process', invocation: 'automatic', required: [], optional: [] },
  {
    slug: 'review-walkthrough',
    kind: 'process',
    invocation: 'automatic',
    required: [],
    optional: [],
  },
  { slug: 'grill', kind: 'process', invocation: 'automatic', required: [], optional: [] },
  { slug: 'second-opinion', kind: 'process', invocation: 'automatic', required: [], optional: [] },
  { slug: 'probe', kind: 'process', invocation: 'automatic', required: [], optional: [] },
  { slug: 'tdd', kind: 'process', invocation: 'automatic', required: [], optional: [] },
  { slug: 'prototype', kind: 'process', invocation: 'automatic', required: [], optional: [] },
  { slug: 'domain-model', kind: 'process', invocation: 'automatic', required: [], optional: [] },
  { slug: 'handoff', kind: 'process', invocation: 'automatic', required: [], optional: [] },
  {
    slug: 'refactor-companion',
    kind: 'process',
    invocation: 'automatic',
    required: [],
    optional: [],
  },
  { slug: 'branch-status', kind: 'process', invocation: 'automatic', required: [], optional: [] },
  {
    slug: 'workflow',
    kind: 'orchestrator',
    invocation: 'automatic',
    required: [
      'review-walkthrough',
      'refactor-companion',
      'code-review',
      'probe',
      'grill',
      'prototype',
    ],
    optional: ['council', 'orchestrate', 'verification', 'tdd'],
  },
  {
    slug: 'orchestrate',
    kind: 'orchestrator',
    invocation: 'explicit',
    required: ['code-review'],
    optional: ['verification', 'council'],
  },
  { slug: 'verification', kind: 'process', invocation: 'automatic', required: [], optional: [] },
  {
    slug: 'technical-writing',
    kind: 'process',
    invocation: 'automatic',
    required: [],
    optional: [],
  },
  { slug: 'strict-english', kind: 'process', invocation: 'explicit', required: [], optional: [] },
] as const
export const EXPECTED_SKILLS = SKILLS.map((skill) => skill.slug)
export type SkillSlug = (typeof SKILLS)[number]['slug']
