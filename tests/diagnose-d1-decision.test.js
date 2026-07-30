import { mkdirSync, mkdtempSync, writeFileSync, rmSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  DIAGNOSE_NULL_ARM_LEAK_PHRASES,
  classifyD1NullArmResult,
  decideDiagnoseD1Disposition,
  findDiagnoseNullArmLeaks,
  summarizeD1NoneForensics,
} from '../scripts/lib/diagnose-d1-decision.mjs'
import {
  parkDiagnoseAnswerKeys,
  restoreDiagnoseAnswerKeys,
} from '../scripts/lib/diagnose-caller-park.mjs'
import { materializeNullArmSuite } from '../scripts/lib/diagnose-null-arm-suites.mjs'

describe('findDiagnoseNullArmLeaks', () => {
  it('flags crib phrases from the D1 entry gate', () => {
    expect(findDiagnoseNullArmLeaks('plain text')).toEqual([])
    expect(
      findDiagnoseNullArmLeaks('I will **not hypothesize** without a failing signal'),
    ).toContain('I will **not hypothesize**')
    expect(DIAGNOSE_NULL_ARM_LEAK_PHRASES.length).toBeGreaterThan(3)
  })
})

describe('classifyD1NullArmResult', () => {
  it('classifies pass as refuse', () => {
    expect(classifyD1NullArmResult({ pass: true })).toBe('refuse')
  })

  it('classifies mustNotReadPath-only as forage', () => {
    expect(
      classifyD1NullArmResult({
        pass: false,
        failures: [
          {
            matcher: 'toHaveNotReadPath',
            message: 'forbidden Read tool args: diagnose/SKILL.md',
          },
        ],
      }),
    ).toBe('forage')
  })

  it('classifies mustNot invent phrases as invent', () => {
    expect(
      classifyD1NullArmResult({
        pass: false,
        failures: [
          {
            matcher: 'toNotInclude',
            message: 'mustNot matched: the bug is caused by',
          },
        ],
      }),
    ).toBe('invent')
  })

  it('prefers invent when both forage and invent matchers fire', () => {
    expect(
      classifyD1NullArmResult({
        pass: false,
        failures: [
          { matcher: 'toHaveNotReadPath', message: 'diagnose/SKILL.md' },
          {
            matcher: 'toNotInclude',
            message: 'mustNot matched: root cause is',
          },
        ],
      }),
    ).toBe('invent')
  })

  it('classifies agent_runtime as infra', () => {
    expect(
      classifyD1NullArmResult({
        pass: false,
        failures: [{ category: 'agent_runtime', message: 'timeout' }],
      }),
    ).toBe('infra')
  })

  it('treats transcript forage of hygiene patch as forage when no invent', () => {
    expect(
      classifyD1NullArmResult({
        pass: false,
        failures: [{ matcher: 'judge', message: 'did not refuse' }],
        transcript: 'Read _agent/diagnose-null-arm-hygiene.patch then Entry gate — no loop',
      }),
    ).toBe('forage')
  })
})

describe('decideDiagnoseD1Disposition', () => {
  const cleanWin = {
    d1FullWins: 3,
    d1NoneWins: 0,
    d1FullBeatsPrompt: 3,
    d1PromptBeatsFull: 0,
    runs: 3,
    promptMatchesFull: false,
    noneForensics: { cleanNoneFail: true, forageConfound: false, inventFails: 3 },
  }

  it('Keep only when full beats none+prompt AND invent-side none fails', () => {
    const d = decideDiagnoseD1Disposition(cleanWin)
    expect(d.decisionHint).toBe('keep-narrow-candidate')
    expect(d.claimReady).toBe(true)
  })

  it('blocks Keep when forage confound (prior false Keep)', () => {
    const d = decideDiagnoseD1Disposition({
      ...cleanWin,
      noneForensics: { cleanNoneFail: false, forageConfound: true, inventFails: 0 },
    })
    expect(d.decisionHint).toBe('invest-more-hygiene')
    expect(d.claimReady).toBe(false)
  })

  it('Demote when prompt matches full', () => {
    const d = decideDiagnoseD1Disposition({
      ...cleanWin,
      promptMatchesFull: true,
      d1FullBeatsPrompt: 0,
      d1PromptBeatsFull: 0,
    })
    expect(d.decisionHint).toBe('demote-candidate')
    expect(d.claimReady).toBe(true)
  })

  it('demote-or-remove when none ties or beats full', () => {
    const d = decideDiagnoseD1Disposition({
      d1FullWins: 1,
      d1NoneWins: 2,
      d1FullBeatsPrompt: 0,
      d1PromptBeatsFull: 0,
      runs: 3,
      promptMatchesFull: true,
      noneForensics: { cleanNoneFail: true, forageConfound: false, inventFails: 0 },
    })
    expect(d.decisionHint).toBe('demote-or-remove-candidate')
    expect(d.claimReady).toBe(true)
  })
})

describe('summarizeD1NoneForensics', () => {
  it('marks forageConfound when all fails are forage', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'd1-forensic-'))
    try {
      const debugDir = join(dir, 'x.debug')
      mkdirSync(debugDir)
      writeFileSync(
        join(debugDir, 'failures.json'),
        JSON.stringify([{ matcher: 'toHaveNotReadPath', message: 'diagnose/SKILL.md' }]),
      )
      writeFileSync(join(debugDir, 'result.json'), JSON.stringify({ pass: false }))
      const s = await summarizeD1NoneForensics([
        { pass: false, debugDir },
        { pass: false, debugDir },
      ])
      expect(s.forageConfound).toBe(true)
      expect(s.inventFails).toBe(0)
      expect(s.cleanNoneFail).toBe(false)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('marks cleanNoneFail when invent dominates', async () => {
    const s = await summarizeD1NoneForensics([
      {
        pass: false,
        failures: [
          {
            matcher: 'toNotInclude',
            message: 'the bug is caused by',
          },
        ],
      },
      {
        pass: false,
        failures: [
          {
            matcher: 'toNotInclude',
            message: 'root cause is',
          },
        ],
      },
    ])
    expect(s.inventFails).toBe(2)
    expect(s.cleanNoneFail).toBe(true)
    expect(s.forageConfound).toBe(false)
  })
})

describe('post-park null-arm surfaces have no leak phrases', () => {
  it('materialized transfer scenarios omit judge crib and SKILL is gone', () => {
    const repo = mkdtempSync(join(tmpdir(), 'diagnose-leak-scan-'))
    try {
      mkdirSync(join(repo, 'diagnose'), { recursive: true })
      writeFileSync(
        join(repo, 'diagnose', 'SKILL.md'),
        '# diagnose\n\n## Entry gate — no loop, no hypotheses\nI will **not hypothesize**\n',
      )
      mkdirSync(join(repo, 'agent-suites', 'diagnose-transfer'), { recursive: true })
      writeFileSync(
        join(repo, 'agent-suites', 'diagnose-transfer', 'scenarios.json'),
        JSON.stringify({
          name: 'diagnose-transfer',
          scenarios: [
            {
              name: 'transfer: session hunch A',
              compareId: 'no-repro-refuse',
              rubric: {
                must: ['repro'],
                mustNot: ['the bug is caused by'],
                judge: [
                  'Refused to hypothesize without a failing signal; asked for a repro or routed to investigate',
                ],
              },
            },
          ],
        }),
      )

      const handle = parkDiagnoseAnswerKeys(repo, { parkId: `leak-${Date.now()}` })
      const mat = materializeNullArmSuite(repo, 'diagnose-transfer', null, {
        scenariosJson: handle.files.get('agent-suites/diagnose-transfer/scenarios.json'),
        omitSeed: true,
      })
      const scenariosText = readFileSync(join(mat.suiteDir, 'scenarios.json'), 'utf8')
      expect(findDiagnoseNullArmLeaks(scenariosText)).toEqual([])
      expect(scenariosText).not.toContain('Refused to hypothesize')

      // Open-tree diagnose/ is parked — no SKILL crib left for Shell forage.
      expect(findDiagnoseNullArmLeaks('')).toEqual([])
      const skillPath = join(repo, 'diagnose', 'SKILL.md')
      expect(() => readFileSync(skillPath, 'utf8')).toThrow()

      restoreDiagnoseAnswerKeys(repo, handle)
    } finally {
      rmSync(repo, { recursive: true, force: true })
    }
  })
})
