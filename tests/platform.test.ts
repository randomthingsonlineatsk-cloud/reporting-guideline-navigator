import { describe, expect, test } from 'vitest'
import { DRAFT_STATEMENTS, LEXICON_SEED, align, checkStatement, claimProblems, blankPlatform } from '../src/domain/platform'
import { numbersIn, suggestOutputs, unsupportedNumbers } from '../src/domain/outputs'

const GOOD = [
  { id: 's1', kind: 'disease' as const, text: 'Moderate to severe chronic hand eczema that topical corticosteroids do not control affects work and daily life.', support: [] },
  { id: 's2', kind: 'mechanism' as const, text: 'Lumiravostat is an oral STRK1 inhibitor taken once daily.', support: [] },
  { id: 's3', kind: 'design' as const, text: 'VERDANT-1 is a randomised, double-blind, placebo-controlled trial; this first cohort is 45 participants.', support: ['T5'] },
  { id: 's4', kind: 'efficacy' as const, text: 'In the first cohort, treatment success at week 16 was 21.4% with 10 mg, 31.3% with 25 mg and 20.0% with placebo; the differences were not statistically significant.', support: ['T3'] },
  { id: 's5', kind: 'safety' as const, text: 'Adverse events occurred in 57.1% with 10 mg, 62.5% with 25 mg and 53.3% with placebo over 16 weeks.', support: ['T2'] },
]

describe('outputs', () => {
  test('numbers and sources', () => {
    expect(numbersIn('NCT99930101 on 2026-03-02: 31.3% and -28.1')).toEqual(['31.3', '-28.1'])
    expect(unsupportedNumbers('31.3% and 20.0%', ['T3'])).toEqual([])
    expect(unsupportedNumbers('31.3% and 63.7%', ['T3'])).toEqual(['63.7'])
    expect(suggestOutputs('Adverse events in 57.1% and 62.5%')).toEqual(['T2'])
  })
})

describe('communication platform', () => {
  test('a good platform has no findings', () => { for (const s of GOOD) expect(checkStatement(s, LEXICON_SEED)).toEqual([]) })
  test('the draft has the planted problems', () => {
    const f = Object.fromEntries(DRAFT_STATEMENTS.map((s) => [s.id, checkStatement(s, LEXICON_SEED).map((x) => x.rule)]))
    expect(f.s1).toEqual([]); expect(f.s2).toEqual(['Lexicon']); expect(f.s3).toEqual([])
    expect(f.s4).toEqual(expect.arrayContaining(['Significance', 'Overstated effect', 'Lexicon']))
    expect(f.s5).toEqual(expect.arrayContaining(['Support', 'Absolute safety']))
  })
  test('“not significant” is allowed; superlatives are not', () => {
    expect(claimProblems('The difference was not statistically significant.', ['T3'], LEXICON_SEED)).toEqual([])
    expect(claimProblems('A breakthrough oral treatment.', [], LEXICON_SEED)[0].rule).toBe('Superlative')
  })
  test('messages are aligned to the platform, or flagged', () => {
    const pf = { ...blankPlatform(), statements: GOOD }
    const a = align(pf, [
      { where: 'Poster message 1', text: 'Treatment success was 31.3% with 25 mg and 20.0% with placebo; the difference was not statistically significant.' },
      { where: 'Poster message 2', text: 'Ostrevia cures chronic hand eczema.' },
      { where: 'Poster message 3', text: 'Patients loved the convenient packaging.' },
    ])
    expect(a.map((x) => x.aligned)).toEqual([true, false, false])
    expect(a[0].best).toBe('s4'); expect(a[1].problems.map((p) => p.rule)).toContain('Lexicon')
  })
})
