import { describe, expect, test } from 'vitest'
import { blankPoster, posterChecks, scoreRG13, PLAN_SEED, scoreRG14, planCsv, plsSource, checkPlsReturn, scoreRG16, VERDANT1_CITATION, PLS_RETURN_FORMAT, certificate, passportRecord, sealOf, hash, journeyHandoff, HANDOFF_FORMAT, QR_TARGET } from '../src/domain/phase4'
import { MISSIONS } from '../src/domain/missions'
import { LESSONS, QUIZ_PASS } from '../src/domain/learn'
import { createProject } from '../src/domain/project'
import type { Progress } from '../src/domain/types'

const who = { userId: 'u-test', classId: '' }
export function goodPoster() {
  const p = blankPoster()
  p.title = 'Lumiravostat for chronic hand eczema: first cohort of VERDANT-1'
  p.authors = 'A. Rao, Western Coast Medical College, Mumbai; S. Iyer, Halcyon Ridge Pharmaceuticals'
  p.encore = 'Encore: first presented at the Nordbay Dermatology Meeting, March 2027'
  p.sections = {
    Background: 'Lumiravostat is an oral inhibitor of the STRK1 kinase. We tested it in adults with moderate to severe chronic hand eczema that topical corticosteroids had not controlled.',
    Methods: 'Double-blind trial at 4 sites; adults randomly assigned 1:1:1 to lumiravostat 10 mg, 25 mg or placebo once daily for 16 weeks. Registered at ClinicalTrials.gov NCT99930101.',
    Results: '45 participants were randomised. Treatment success occurred in 3 (21.4%) on 10 mg, 5 (31.3%) on 25 mg and 3 (20%) on placebo. Adverse events occurred in 8, 10 and 8 participants.',
    Conclusions: 'In this first cohort, lumiravostat did not clearly improve treatment success over placebo and the intervals were wide; the full trial will answer the question.',
  }
  p.messages = ['Lumiravostat did not clearly beat placebo in the first cohort', 'Confidence intervals were wide', 'The full trial continues recruiting']
  p.figure = 'F1'; p.qr = QR_TARGET
  p.disclosure = 'Funded by Halcyon Ridge Pharmaceuticals. S. Iyer is an employee of the sponsor; A. Rao received consulting fees.'
  p.ack = 'Medical writing support was provided by Priya Natarajan, PhD, of Halcyon Ridge Pharmaceuticals, funded by Halcyon Ridge Pharmaceuticals in accordance with GPP 2022.'
  return p
}

describe('RG13 poster', () => {
  test('a complete poster passes every check', () => {
    const c = posterChecks(goodPoster()); expect(c.filter((x) => !x.ok).map((x) => x.id)).toEqual([])
    expect(scoreRG13(goodPoster())).toMatchObject({ score: 100, passed: true })
  })
  test('small text, no encore label and an invented number fail', () => {
    const p = goodPoster(); p.bodyPt = 14; p.encore = ''; p.sections.Results += ' Itch fell by 63.7%.'
    const bad = posterChecks(p).filter((x) => !x.ok).map((x) => x.id)
    expect(bad).toEqual(expect.arrayContaining(['P6', 'P11', 'P12'])); expect(scoreRG13(p).passed).toBe(false)
  })
  test('a blank poster fails', () => { expect(scoreRG13(blankPoster()).passed).toBe(false); expect(scoreRG13(undefined).score).toBe(0) })
})

describe('RG14 publication plan', () => {
  const key = Object.fromEntries(PLAN_SEED.filter((r) => r.gap).map((r) => [r.id, r.gap!]))
  test('five planted gaps; naming them all passes', () => { expect(Object.keys(key)).toHaveLength(5); expect(scoreRG14(key)).toMatchObject({ score: 100, passed: true }) })
  test('flagging a clean row or the wrong gap fails', () => {
    const clean = PLAN_SEED.find((r) => !r.gap)!.id
    expect(scoreRG14({ ...key, [clean]: 'order' }).passed).toBe(false)
    expect(scoreRG14({ ...key, a4: 'writer' }).passed).toBe(false)
  })
  test('the tracker CSV has a header and one line per row', () => { expect(planCsv(PLAN_SEED).trim().split('\n')).toHaveLength(PLAN_SEED.length + 1) })
})

describe('RG16 plain language summary', () => {
  const good = { format: PLS_RETURN_FORMAT, schema: 1, study: 'HRP-301', citation: VERDANT1_CITATION, title: 'A medicine for hand eczema', sections: {}, panels: {}, checks: { total: 12, failed: [] }, words: 280, grade: 7 }
  test('the source file carries the article, funder and citation', () => { const s = plsSource(); expect(s.citation).toBe(VERDANT1_CITATION); expect(s.funder).toMatch(/Halcyon/); expect(s.abstract).toMatch(/NCT99930101/) })
  test('a finished summary of this article is accepted', () => { expect(checkPlsReturn(good).ok).toBe(true) })
  test('a summary of the other article, with failing checks, is refused', () => {
    expect(checkPlsReturn({ ...good, citation: 'Something else' }).ok).toBe(false)
    expect(checkPlsReturn({ ...good, checks: { total: 12, failed: ['PLS8'] } }).ok).toBe(false)
    expect(checkPlsReturn({ ...good, words: 340 }).ok).toBe(false)
    expect(checkPlsReturn({ format: 'x' }).ok).toBe(false)
  })
  test('scoreRG16 reads the project', () => { const p = createProject('verdant-1', who); expect(scoreRG16(p).passed).toBe(false); p.plsReturn = good; expect(scoreRG16(p).passed).toBe(true) })
})

describe('certificate and passport', () => {
  const g = (all: boolean): Progress => ({ id: 'me', name: 'Test Learner', userId: 'u-test', classId: '', rg1: {}, quizzes: Object.fromEntries(LESSONS.map((l) => [l.id, { score: QUIZ_PASS, utc: '' }])), missions: Object.fromEntries(MISSIONS.filter((m) => all || m.core).map((m) => [m.id, { score: 100, passed: true, utc: '', detail: [] }])) })
  test('core missions and quizzes earn it; all missions add a distinction', () => {
    const c = certificate(g(false)); expect(c.eligible).toBe(true); expect(c.distinction).toBe(false)
    expect(certificate(g(true)).distinction).toBe(true)
    expect(c.code).toMatch(/^RG-[0-9A-F]{5}-[0-9A-F]{5}$/)
    expect(c.basis.startsWith('test learner|')).toBe(true); expect(c.basis.endsWith('|u-test')).toBe(true)
  })
  test('the code is cyrb53 of the basis and the record is sealed', () => {
    const c = certificate(g(true)), h = hash(c.basis).slice(-10).toUpperCase()
    expect(c.code).toBe(`RG-${h.slice(0, 5)}-${h.slice(5)}`)
    const r = passportRecord(c, g(true), '2026-11-24'); expect(r.seal).toBe(sealOf(r)); expect(r.app).toBe('reporting-guideline-navigator')
  })
  test('missing a quiz withholds it', () => { const x = g(false); delete x.quizzes[LESSONS[12].id]; expect(certificate(x).eligible).toBe(false) })
})

test('journey hand-off for step 13', () => {
  const p = createProject('verdant-1', who)
  const h = journeyHandoff(p)
  expect(h.format).toBe(HANDOFF_FORMAT); expect(h.study.id).toBe('HRP-301'); expect(h.study.kind).toBe('own')
  expect(h.registration.expected).toBe('NCT99930101'); expect(h.consort.untagged.length).toBe(h.consort.items)
})
