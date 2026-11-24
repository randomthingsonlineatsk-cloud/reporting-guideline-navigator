import { describe, expect, test } from 'vitest'
import { allItems, guideline, CATALOGUE } from '../src/domain/guidelines'
import { PHASE2_MANUSCRIPTS, PLANTED_BY_MISSION, plantedKeys, COHORT, REVIEW, DIAG, CASE, ECONOMIC, wilson, TWO } from '../src/domain/manuscripts2'
import { checkRule } from '../src/domain/rules'
import { createProject, flagOf, manuscriptOf, setTag } from '../src/domain/project'
import { scoreDesign } from '../src/domain/missions'
import { docxToText } from '../src/domain/docximport'
import { zipSync, strToU8 } from 'fflate'
import type { Manuscript } from '../src/domain/types'

const who = { userId: 'L-test', classId: '' }
const textOf = (m: Manuscript, ids: string[]) => ids.map((id) => m.paras.find((p) => p.id === id)!.text).join(' ')

describe('Phase 2 checklists', () => {
  test('item counts match the statements', () => {
    const top = (id: Parameters<typeof guideline>[0]) => new Set(guideline(id).items.map((i) => i.id.replace(/[a-z]$/, ''))).size
    expect(top('strobe')).toBe(22); expect(top('prisma-2020')).toBe(27); expect(guideline('prisma-2020').items).toHaveLength(42)
    expect(guideline('prisma-s').items).toHaveLength(16); expect(top('stard-2015')).toBe(30); expect(top('care')).toBe(13)
    expect(guideline('cheers-2022').items).toHaveLength(28); expect(top('tripod-ai')).toBe(27); expect(guideline('squire-2').items).toHaveLength(18)
    expect(guideline('coreq').items).toHaveLength(32); expect(guideline('arrive-2').items).toHaveLength(21)
    expect(CATALOGUE.filter((g) => g.built).length).toBe(16)
  })
})

describe('the clean Phase 2 manuscripts', () => {
  for (const m of [COHORT, REVIEW, DIAG, CASE, ECONOMIC]) {
    test(`${m.id}: every item reported or not applicable, and every rule passes on its key`, () => {
      const items = allItems(m.guidelines)
      expect(items.filter((x) => !m.key[x.key]?.length && !m.na.includes(x.key)).map((x) => x.key)).toEqual([])
      const weak = items.filter((x) => m.key[x.key]?.length).map((x) => ({ k: x.key, r: checkRule(x.key, textOf(m, m.key[x.key])) })).filter((x) => x.r && !x.r.ok)
      expect(weak.map((w) => `${w.k}: ${w.r!.why}`)).toEqual([])
    })
  }
  test('every excerpt\'s key points at real paragraphs', () => {
    for (const m of PHASE2_MANUSCRIPTS) for (const [k, ids] of Object.entries(m.key)) { expect(guideline(k.split(':')[0] as never), k).toBeTruthy(); for (const id of ids) expect(m.paras.some((p) => p.id === id), `${m.id} ${k}`).toBe(true) }
  })
  test('the derived numbers are right', () => {
    const t = DIAG.paras.map((p) => p.text).join(' ')
    expect(t).toContain('sensitivity of 85.0%'); expect(t).toContain('specificity of 88.3%')
    const [l, u] = wilson(TWO.tp, TWO.tp + TWO.fn); expect(l).toBeCloseTo(75.6, 0); expect(u).toBeCloseTo(91.2, 0)
    expect(REVIEW.paras.find((p) => p.id === 'r-flow')!.text).toContain('the searches identified 1,294 records'.replace('the s', 'The s'))
    expect(ECONOMIC.paras.map((p) => p.text).join(' ')).toContain('£24,270 per QALY')
    expect(COHORT.paras.map((p) => p.text).join(' ')).toContain('3.1 per 100 person-years')
  })
})

function tagAll(p: ReturnType<typeof createProject>, m: Manuscript) {
  const shown = manuscriptOf(p)
  for (const x of allItems(m.guidelines)) {
    const ids = (m.key[x.key] ?? []).filter((id) => shown.paras.some((q) => q.id === id))
    setTag(p, x.key, (t) => { t.paras = ids; t.status = m.na.includes(x.key) ? 'na' : ids.length ? 'reported' : 'missing'; t.reason = 'Not matched' })
  }
  return shown
}

describe('missions RG7 to RG11', () => {
  for (const id of ['RG7', 'RG8', 'RG9', 'RG10', 'RG11']) {
    test(`${id}: the rules flag most planted items and nothing else`, () => {
      const x = PLANTED_BY_MISSION[id], m = PHASE2_MANUSCRIPTS.find((q) => q.id === x.manuscript)!
      const p = createProject(m.id, who, { mission: { id, startedUtc: '', variant: 0 } }); p.guidelines = x.guidelines as never
      const shown = tagAll(p, m)
      const flagged = allItems(m.guidelines).filter((y) => flagOf(p, shown, y.key).kind !== 'ok').map((y) => y.key)
      // The rules flag nothing that was not planted; some planted gaps only a reader can judge.
      expect(flagged.filter((k) => !plantedKeys(id).includes(k))).toEqual([])
      expect(flagged.length / plantedKeys(id).length).toBeGreaterThanOrEqual(0.7)
    })
    test(`${id}: finding every planted item (and the wrong number) passes; marking all reported fails`, () => {
      const x = PLANTED_BY_MISSION[id]
      const p = createProject(x.manuscript, who, { mission: { id, startedUtc: '', variant: 0 } })
      for (const k of plantedKeys(id)) setTag(p, k, (t) => { t.status = 'missing' })
      p.numbers = Object.fromEntries((x.planted.numbers ?? []).map((n) => [n.id, n.wrong]))
      expect(scoreDesign(p, id)).toMatchObject({ score: 100, passed: true })
      const q = createProject(x.manuscript, who, { mission: { id, startedUtc: '', variant: 0 } })
      for (const k of plantedKeys(id)) setTag(q, k, (t) => { t.status = 'reported' })
      expect(scoreDesign(q, id).passed).toBe(false)
    })
  }
  test('RG8 and RG9 need the wrong number too', () => {
    for (const id of ['RG8', 'RG9']) {
      const x = PLANTED_BY_MISSION[id]
      const p = createProject(x.manuscript, who, { mission: { id, startedUtc: '', variant: 0 } })
      for (const k of plantedKeys(id)) setTag(p, k, (t) => { t.status = 'missing' })
      expect(scoreDesign(p, id).passed).toBe(false)
      expect(x.planted.numbers!.filter((n) => n.wrong)).toHaveLength(1)
    }
  })
})

test('a .docx becomes paragraphs with headings', () => {
  const xml = '<w:document><w:body><w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>Methods</w:t></w:r></w:p><w:p><w:r><w:t xml:space="preserve">We randomised </w:t></w:r><w:r><w:t>45 adults &amp; more.</w:t></w:r></w:p></w:body></w:document>'
  const bytes = zipSync({ 'word/document.xml': strToU8(xml) })
  expect(docxToText(bytes)).toBe('Methods\n\nWe randomised 45 adults & more.')
  expect(() => docxToText(strToU8('not a zip'))).toThrow(/not a Word document/)
})
