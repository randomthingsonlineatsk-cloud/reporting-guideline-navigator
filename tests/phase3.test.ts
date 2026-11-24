import { describe, expect, test } from 'vitest'
import { orcidValid, RG4_CONTRIBUTORS, RG4_AI_QUESTION, scoreRG4, checkWritingAck, RG5_STATEMENTS, scoreRG5, RG6_COMMENTS, checkResponse, scoreRG6, ETHICS_CASES, scoreRG15, JOURNALS, journalFit, checkCover, DISCLOSURE_ITEMS, CREDIT_ROLES } from '../src/domain/phase3'
import { LESSONS } from '../src/domain/learn'
import { VERDANT1 } from '../src/domain/manuscripts'

test('ORCID check digits (ISO 7064 MOD 11-2)', () => {
  expect(orcidValid('0000-0002-1825-0097')).toBe(true)
  expect(orcidValid('https://orcid.org/0000-0002-1825-0097')).toBe(true)
  expect(orcidValid('0000-0002-1825-0098')).toBe(false)
  expect(orcidValid('0000-0002-1825-009')).toBe(false)
})
test('the ICMJE form has 13 items and CRediT 14 roles', () => { expect(DISCLOSURE_ITEMS).toHaveLength(13); expect(CREDIT_ROLES).toHaveLength(14) })

describe('RG4 authorship', () => {
  const key = () => ({ people: Object.fromEntries(RG4_CONTRIBUTORS.map((c) => [c.id, { criteria: { ...c.truth }, author: c.author, roles: { [c.keyRole]: 'lead' as const } }])), ack: 'Medical writing support was provided by Aisha Bello, PhD, of Corran Medical Communications, funded by Glyvant Pharmaceuticals in accordance with GPP 2022.', ai: RG4_AI_QUESTION.answer })
  test('the key scores 100; authors are exactly those meeting all four criteria', () => {
    expect(scoreRG4(key())).toMatchObject({ score: 100, passed: true })
    for (const c of RG4_CONTRIBUTORS) expect(c.author).toBe(Object.values(c.truth).every(Boolean))
  })
  test('making the executive an author and dropping the statistician fails', () => {
    const a = key(); a.people.p4.author = true; a.people.p3.author = false; a.people.p4.criteria = { c1: true, c2: true, c3: true, c4: true }; a.ack = 'Thanks to Aisha.'
    expect(scoreRG4(a).passed).toBe(false)
  })
  test('the writing acknowledgement check', () => {
    expect(checkWritingAck('We thank Aisha Bello for writing help.').missing).toEqual(['qualifications', 'affiliation', 'who paid for it', 'Good Publication Practice'])
  })
})

test('RG5: six of ten statements are inconsistent; flagging them all passes', () => {
  const bad = RG5_STATEMENTS.filter((s) => s.inconsistent)
  expect(bad).toHaveLength(6)
  expect(scoreRG5(Object.fromEntries(bad.map((s) => [s.id, true])))).toMatchObject({ score: 100, passed: true })
  expect(scoreRG5({ s1: true, s2: true, s3: true }).passed).toBe(false)
})

describe('RG6 reviewer responses', () => {
  test('every model answer passes its own checks', () => {
    for (const c of RG6_COMMENTS) expect(checkResponse(c, c.model).checks.filter((x) => !x.ok).map((x) => `${c.id}: ${x.label}`)).toEqual([])
    expect(scoreRG6(Object.fromEntries(RG6_COMMENTS.map((c) => [c.id, c.model])))).toMatchObject({ score: 100, passed: true })
  })
  test('dismissive or overclaiming answers fail', () => {
    const q4 = RG6_COMMENTS.find((c) => c.id === 'q4')!
    expect(checkResponse(q4, 'We agree and now state that lumiravostat is effective, because 31% beat 20%.').ok).toBe(false)
    const q1 = RG6_COMMENTS.find((c) => c.id === 'q1')!
    expect(checkResponse(q1, 'Obviously the confidence intervals are in the supplement; the reviewer misunderstood.').ok).toBe(false)
  })
  test('the model answers point to the right paragraphs', () => {
    const num = (id: string) => VERDANT1.paras.findIndex((p) => p.id === id) + 1
    expect(num('v-key2')).toBe(36); expect(num('v-reg')).toBe(8); expect(num('v-blind')).toBe(27); expect(num('v-sae')).toBe(38); expect(num('v-limits')).toBe(40); expect(num('v-stats')).toBe(28)
  })
})

test('RG15: six of eight passes', () => {
  const all = Object.fromEntries(ETHICS_CASES.map((c) => [c.id, c.answer]))
  expect(scoreRG15(all)).toMatchObject({ score: 100, passed: true })
  expect(scoreRG15({ ...all, e1: 0, e2: 0, e3: 0 }).passed).toBe(false)
})

test('the predatory journals fail the fit check and a suitable one passes', () => {
  const art = { type: 'Randomised trial', words: 2600, field: 'skin|dermat' }
  expect(journalFit(JOURNALS.find((j) => j.id === 'j5')!, art)[0].ok).toBe(false)
  expect(journalFit(JOURNALS.find((j) => j.id === 'j1')!, art).every((f) => f.ok)).toBe(true)
  expect(checkCover('Dear Editor, we submit our randomised trial (NCT99930101). It has not been published elsewhere; an abstract was presented at a congress. Competing interests are declared. All authors approved it. No AI tools were used.').every((c) => c.ok)).toBe(true)
})
test('twelve lessons, eight questions each', () => { expect(LESSONS).toHaveLength(12); for (const l of LESSONS) expect(l.quiz).toHaveLength(8) })
