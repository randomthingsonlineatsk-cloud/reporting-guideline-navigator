import { describe, expect, test } from 'vitest'
import { VERDANT1_REFS, checkClaim, checkRefs, extractClaims, packHtml, packSummary, parseRefs } from '../src/domain/claims'
import { createProject } from '../src/domain/project'

const p = createProject('verdant-1', { userId: 'u', classId: '' })
const claims = extractClaims(p)
describe('claim-to-source pack', () => {
  test('claims come from the abstract, introduction, results and discussion', () => {
    expect(claims.length).toBeGreaterThan(10)
    expect(new Set(claims.map((c) => c.section))).toEqual(new Set(['Abstract', 'Introduction', 'Results', 'Discussion']))
  })
  const numeric = claims.find((c) => /31\.3/.test(c.text))!
  test('a number is checked against the output it is linked to', () => {
    expect(checkClaim(numeric, undefined, []).suggest).toContain('T3')
    expect(checkClaim(numeric, { kind: 'output', output: 'T2', location: 'row 1' }, []).ok).toBe(false)
    const ok = checkClaim(numeric, { kind: 'output', output: 'T3', location: 'row: treatment success' }, [])
    expect(ok.problems.filter((x) => !/not in/.test(x))).toEqual([])
  })
  test('a retracted reference is flagged on the claim and in the pack', () => {
    const c = claims.find((x) => x.section === 'Introduction')!
    const links = { [c.id]: { kind: 'reference' as const, ref: '1', location: 'page 203' } }
    expect(checkClaim(c, links[c.id], VERDANT1_REFS).problems.join(' ')).toMatch(/retracted on 2026-05-04/)
    expect(packSummary([c], links, VERDANT1_REFS)).toMatchObject({ retracted: ['1'], ready: false })
    const r = checkRefs(VERDANT1_REFS, links); expect(r.find((x) => x.ref.id === '6')!.problems.join(' ')).toMatch(/Expression of concern/)
    expect(packHtml('VERDANT-1', [c], links, VERDANT1_REFS)).toMatch(/retraction \(2026-05-04\)/)
  })
  test('documents need a section; references parse from a pasted list', () => {
    const c = claims[0]
    expect(checkClaim(c, { kind: 'document', document: 'SAP', location: 'somewhere' }, []).ok).toBe(false)
    expect(checkClaim(c, { kind: 'document', document: 'SAP', location: 'section 9.3' }, []).problems.some((x) => /section/.test(x))).toBe(false)
    expect(parseRefs('1. Holm T. Burden. Pell J Dermatol 2024. doi:10.0000/pjd.2024.118\n[2] No DOI here')).toEqual([{ id: '1', text: 'Holm T. Burden. Pell J Dermatol 2024.', doi: '10.0000/pjd.2024.118' }, { id: '2', text: 'No DOI here', doi: '' }])
  })
})
