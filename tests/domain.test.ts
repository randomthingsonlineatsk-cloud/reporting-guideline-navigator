import { describe, expect, test } from 'vitest'
import { CONSORT_2025, SPIRIT_2025, CONSORT_ABSTRACTS, allItems } from '../src/domain/guidelines'
import { VERDANT1, GLYDE3, HRP301_PROTOCOL, VERDANT1_PLANTED, PROTOCOL_GAPS, planted } from '../src/domain/manuscripts'
import { checkRule } from '../src/domain/rules'
import { createProject, flagOf, manuscriptOf, setTag } from '../src/domain/project'
import { recommend, RG1_CASES, scoreRG1, QUESTIONS, nextQuestion } from '../src/domain/picker'
import { checkAbstract, unknownNumbers, venue, count } from '../src/domain/abstract'
import { scoreRG2, scoreRG3, scoreRG12 } from '../src/domain/missions'
import { LESSONS } from '../src/domain/learn'
import type { Project } from '../src/domain/types'

const who = { userId: 'L-test', classId: '' }
const textOf = (m: typeof VERDANT1, ids: string[]) => ids.map((id) => m.paras.find((p) => p.id === id)!.text).join(' ')

describe('guidelines', () => {
  test('CONSORT 2025 has 30 items (42 rows with sub-items) and SPIRIT 2025 34 (51 rows)', () => {
    const top = (g: typeof CONSORT_2025) => new Set(g.items.map((i) => i.id.replace(/[a-z]$/, ''))).size
    expect(top(CONSORT_2025)).toBe(30); expect(CONSORT_2025.items).toHaveLength(42)
    expect(top(SPIRIT_2025)).toBe(34); expect(SPIRIT_2025.items).toHaveLength(53)
    expect(CONSORT_ABSTRACTS.items).toHaveLength(17)
    expect(CONSORT_2025.items.filter((i) => i.change === 'new').map((i) => i.id)).toEqual(['4', '5b', '8', '12b', '15', '21b', '21c', '24a', '24b'])
  })
})

describe('the clean manuscripts', () => {
  for (const m of [VERDANT1, HRP301_PROTOCOL]) {
    test(`${m.id}: every item is reported or accepted as not applicable, and every rule passes on its key`, () => {
      const items = allItems(m.guidelines)
      const missing = items.filter((x) => !m.key[x.key]?.length && !m.na.includes(x.key)).map((x) => x.key)
      const expected = m.id === 'hrp-301-protocol' ? ['spirit-2025:3a', 'spirit-2025:20'] : []
      expect(missing.sort()).toEqual(expected.sort())
      const weak = items.filter((x) => m.key[x.key]?.length).map((x) => ({ k: x.key, r: checkRule(x.key, textOf(m, m.key[x.key])) })).filter((x) => x.r && !x.r.ok)
      const allowed = m.id === 'hrp-301-protocol' ? ['spirit-2025:4'] : []
      expect(weak.filter((w) => !allowed.includes(w.k)).map((w) => `${w.k}: ${w.r!.why}`)).toEqual([])
    })
  }
  test('GLYDE-3 reports every CONSORT item it claims to', () => {
    for (const [k, ids] of Object.entries(GLYDE3.key)) for (const id of ids) expect(GLYDE3.paras.some((p) => p.id === id), k).toBe(true)
  })
  test('the numbers come from the outputs', () => {
    const t = VERDANT1.paras.map((p) => p.text).join(' ')
    expect(t).toContain('5 of 16 (31.3%)'); expect(t).toContain('11.3 percentage points (95% CI -19.2, 41.7)'); expect(t).toContain('relative risks were 1.07 and 1.56')
  })
})

function tagFromKey(p: Project, m: typeof VERDANT1, only?: (k: string) => boolean) {
  for (const x of allItems(m.guidelines)) {
    if (only && !only(x.key)) continue
    const ids = (m.key[x.key] ?? []).filter((id) => manuscriptOf(p).paras.some((q) => q.id === id))
    setTag(p, x.key, (t) => { t.paras = ids; t.status = m.na.includes(x.key) ? 'na' : ids.length ? 'reported' : 'missing'; if (t.status === 'na') t.reason = 'Did not stop' })
  }
}

describe('mission RG2 (planted VERDANT-1)', () => {
  test('the planted edits remove or weaken exactly the 15 items', () => {
    const m = planted(VERDANT1, VERDANT1_PLANTED.edits)
    const p = createProject('verdant-1', who, { mission: { id: 'RG2', startedUtc: '', variant: 0 } })
    tagFromKey(p, VERDANT1, (k) => k.startsWith('consort-2025:'))
    const bad = allItems(['consort-2025']).filter((x) => { const f = flagOf(p, m, x.key); return f.kind !== 'ok' }).map((x) => x.i.id)
    // Items whose paragraph was deleted are untagged-missing; weakened ones fail their rule, except
    // those only a reader can judge (26: one outcome without its interval; 30: no limitations).
    expect(bad.sort()).toEqual(['10', '2', '21c', '23a', '3', '4', '5b', '8', '16a', '17a', '19', '20b', '15', '30'].sort())
    expect(VERDANT1_PLANTED.items).toHaveLength(15)
  })
  test('a learner who finds every planted item passes; one who marks all reported fails', () => {
    const p = createProject('verdant-1', who, { mission: { id: 'RG2', startedUtc: '', variant: 0 } })
    for (const i of VERDANT1_PLANTED.items) setTag(p, `consort-2025:${i}`, (t) => { t.status = 'missing' })
    expect(scoreRG2(p)).toMatchObject({ score: 100, passed: true })
    const q = createProject('verdant-1', who, { mission: { id: 'RG2', startedUtc: '', variant: 0 } })
    for (const i of VERDANT1_PLANTED.items) setTag(q, `consort-2025:${i}`, (t) => { t.status = 'reported' })
    expect(scoreRG2(q).passed).toBe(false)
  })
})

describe('mission RG12 (the protocol)', () => {
  test('the five gaps are found by marking them; false alarms cost points', () => {
    const p = createProject('hrp-301-protocol', who, { mission: { id: 'RG12', startedUtc: '', variant: 0 } })
    for (const i of Object.keys(PROTOCOL_GAPS)) setTag(p, `spirit-2025:${i}`, (t) => { t.status = i === '4' || i === '7b' ? 'partly' : 'missing' })
    expect(scoreRG12(p)).toMatchObject({ score: 100, passed: true })
    setTag(p, 'spirit-2025:19', (t) => { t.status = 'missing' })
    expect(scoreRG12(p).score).toBe(95)
  })
})

describe('the picker', () => {
  test('every question path ends in a recommendation', () => {
    const walk = (a: Record<string, string>): number => {
      const q = nextQuestion(a)
      if (!q) { expect(recommend(a), JSON.stringify(a)).not.toBeNull(); return 1 }
      return q.options.reduce((n, o) => n + walk({ ...a, [q.id]: o.value }), 0)
    }
    expect(walk({})).toBeGreaterThan(20)
    expect(QUESTIONS[0].options.length).toBe(13)
  })
  test('the RG1 answer key agrees with the picker', () => {
    const paths: Record<string, Record<string, string>> = {
      c1: { kind: 'trial-results', randomised: 'yes', unit: 'individual', framework: 'superiority', harms: 'no', complex: 'no' },
      c2: { kind: 'trial-results', randomised: 'yes', unit: 'cluster', framework: 'superiority', harms: 'no', complex: 'no' },
      c3: { kind: 'trial-results', randomised: 'yes', unit: 'individual', framework: 'ni', harms: 'no', complex: 'no' },
      c4: { kind: 'trial-protocol', randomised: 'yes', unit: 'individual', framework: 'superiority', complex: 'no' },
      c5: { kind: 'trial-results', randomised: 'no', complex: 'no' },
      c6: { kind: 'observational', design: 'cohort' },
      c7: { kind: 'review', review: 'systematic' },
      c8: { kind: 'review', review: 'scoping' },
      c9: { kind: 'diagnostic', ai: 'no' },
      c10: { kind: 'diagnostic', ai: 'yes' },
      c11: { kind: 'case' },
      c12: { kind: 'economic' },
    }
    for (const c of RG1_CASES) {
      const r = recommend(paths[c.id])!
      expect(r.main, c.id).toBe(c.main)
      expect(r.also.map((x) => x.id).sort(), c.id).toEqual([...c.also].sort())
    }
    const all = Object.fromEntries(RG1_CASES.map((c) => [c.id, { main: c.main ?? 'none', also: [...c.also] }]))
    expect(scoreRG1(all)).toMatchObject({ right: 12, passed: true })
  })
})

const GOOD = `Lumiravostat versus placebo in chronic hand eczema: first cohort of the randomised VERDANT-1 trial
Background: We assessed whether lumiravostat, an oral STRK1 inhibitor, improves moderate to severe chronic hand eczema not controlled by topical corticosteroids.
Methods: In this double-blind, placebo-controlled, parallel-group trial at 4 sites, adults aged 18 to 75 years with an IGA-CHE score of 3 or 4 were randomised 1:1:1 through an interactive response system to lumiravostat 10 mg, lumiravostat 25 mg or placebo once daily for 16 weeks. Participants, investigators and assessors were blinded. The primary outcome was IGA-CHE treatment success at week 16.
Results: 45 participants were randomised (14 to 10 mg, 16 to 25 mg, 15 to placebo) and all were analysed; recruitment to the trial continues. Treatment success occurred in 3 of 14 (21.4%), 5 of 16 (31.3%) and 3 of 15 (20.0%); differences from placebo were 1.4 (95% CI -28.1, 31.0) and 11.3 (95% CI -19.2, 41.7) percentage points. Adverse events occurred in 57.1%, 62.5% and 53.3%; 4 participants had a serious adverse event.
Conclusions: In this first cohort, lumiravostat did not clearly improve treatment success; the full trial will answer the question.
Trial registration: ClinicalTrials.gov NCT99930101. Funding: Halcyon Ridge Pharmaceuticals.`

describe('the abstract builder and RG3', () => {
  test('a good abstract passes every check', () => {
    const checks = checkAbstract(GOOD, venue('fennick'), 'HRP-301')
    expect(checks.filter((c) => !c.ok).map((c) => `${c.label}: ${c.why}`)).toEqual([])
    expect(count(GOOD, venue('fennick'))).toBeLessThanOrEqual(250)
  })
  test('a wrong number is caught', () => {
    expect(unknownNumbers('5 of 16 (35.0%)', 'HRP-301')).toEqual(['35.0'])
    expect(unknownNumbers('5 of 16 (31.3%)', 'HRP-301')).toEqual([])
  })
  test('RG3 scores the abstract', () => {
    const p = createProject('verdant-1', who, { mission: { id: 'RG3', startedUtc: '', variant: 0 } })
    p.abstracts.push({ venue: 'fennick', text: GOOD, updatedUtc: '' })
    expect(scoreRG3(p)).toMatchObject({ score: 100, passed: true })
    p.abstracts[0].text = GOOD.replace('(31.3%)', '(35.0%)')
    expect(scoreRG3(p).passed).toBe(false)
  })
})

test('every quiz has 8 questions with a valid answer', () => {
  for (const l of LESSONS) { expect(l.quiz).toHaveLength(8); for (const q of l.quiz) expect(q.options[q.answer]).toBeTruthy() }
})

import { exportProject, importProject, checklistCsv } from '../src/domain/project'
test('a project exports and imports as one file, with the learner\'s IDs', () => {
  const p = createProject('verdant-1', who)
  setTag(p, 'consort-2025:2', (t) => { t.paras = ['v-reg']; t.status = 'reported' })
  const q = importProject(exportProject(p), { userId: 'L-other', classId: 'C1' })
  expect(q.tags['consort-2025:2'].paras).toEqual(['v-reg']); expect(q.userId).toBe('L-other'); expect(q.classId).toBe('C1'); expect(q.id).not.toBe(p.id)
  expect(() => importProject('{"format":"other"}', who)).toThrow(/not a Reporting Guideline Navigator project/)
  expect(checklistCsv(p, manuscriptOf(p)).split('\n')[1]).toContain('"Title and abstract","1a"')
})
