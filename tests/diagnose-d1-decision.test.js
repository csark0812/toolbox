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
    expect(findDiagnoseNullArmLeaks('Keep a hypothesis labeled as a hypothesis')).toContain(
      'Keep a hypothesis labeled as a hypothesis',
    )
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
            message: 'forbidden Read tool args: evidence-based-debugging/SKILL.md',
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
          { matcher: 'toHaveNotReadPath', message: 'evidence-based-debugging/SKILL.md' },
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
        transcript:
          'Read _agent/evidence-based-debugging-null-arm-hygiene.patch then Cause only supported or unresolved',
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
        JSON.stringify([
          { matcher: 'toHaveNotReadPath', message: 'evidence-based-debugging/SKILL.md' },
        ]),
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
      mkdirSync(join(repo, 'evidence-based-debugging'), { recursive: true })
      writeFileSync(
        join(repo, 'evidence-based-debugging', 'SKILL.md'),
        '# probe\n\n## Cause only supported or unresolved\nKeep a hypothesis labeled as a hypothesis\n',
      )
      mkdirSync(join(repo, 'agent-suites', 'evidence-based-debugging-transfer'), {
        recursive: true,
      })
      writeFileSync(
        join(repo, 'agent-suites', 'evidence-based-debugging-transfer', 'claims.json'),
        JSON.stringify({
          name: 'evidence-based-debugging-transfer',
          scenarios: [
            {
              name: 'transfer: session hunch A',
              compareId: 'insufficient-evidence',
              rubric: {
                must: ['repro'],
                mustNot: ['the bug is caused by'],
                judge: ['Did not invent a diagnosis from insufficient evidence'],
              },
            },
          ],
        }),
      )

      const handle = parkDiagnoseAnswerKeys(repo, {
        parkId: `leak-${Date.now()}`,
        parkGlobalSkills: false,
      })
      const mat = materializeNullArmSuite(repo, 'evidence-based-debugging-transfer', null, {
        scenariosJson: handle.files.get(
          'agent-suites/evidence-based-debugging-transfer/claims.json',
        ),
        omitSeed: true,
        omitMustNotReadPath: true,
        extraMustNot: ['Cause only supported or unresolved'],
      })
      const scenariosText = readFileSync(join(mat.suiteDir, 'claims.json'), 'utf8')
      // Judge crib must stay out; skill-body mustNot is intentional (forbidden output).
      expect(scenariosText).not.toContain('Did not invent a diagnosis')
      expect(scenariosText).not.toContain('mustNotReadPath')
      expect(scenariosText).not.toContain('evidence-based-debugging/SKILL.md')
      expect(scenariosText).toContain('Cause only supported or unresolved')
      expect(findDiagnoseNullArmLeaks(scenariosText)).toEqual([
        'Cause only supported or unresolved',
      ])

      // Open-tree diagnose/ is parked — no SKILL crib left for Shell forage.
      const skillPath = join(repo, 'evidence-based-debugging', 'SKILL.md')
      expect(() => readFileSync(skillPath, 'utf8')).toThrow()

      restoreDiagnoseAnswerKeys(repo, handle)
    } finally {
      rmSync(repo, { recursive: true, force: true })
    }
  })
})
